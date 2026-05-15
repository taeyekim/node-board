import { Router } from "express";
import { requireAuth } from "./authMiddleware.js";
import { prisma } from "./db.js";
import { postCategories, validateCommentPayload, validatePostPayload } from "./validators.js";

export const postsRouter = Router();

const authorSelect = { id: true, name: true, email: true, createdAt: true };
const listPageSizeDefault = 10;
const listPageSizeMax = 50;

function toUser(user) {
  return user
    ? {
        id: Number(user.id),
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      }
    : null;
}

function toPost(post) {
  return {
    id: Number(post.id),
    title: post.title,
    content: post.content,
    category: post.category,
    viewCount: post.viewCount,
    commentCount: post._count?.comments ?? post.commentCount ?? 0,
    author: toUser(post.author),
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function toComment(comment) {
  return {
    id: Number(comment.id),
    content: comment.content,
    postId: Number(comment.postId),
    author: toUser(comment.author),
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parsePositiveInt(value, fallback, max) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(parsed, max);
}

function buildListWhere(query) {
  const keyword = String(query.q || "").trim();
  const category = String(query.category || "all").trim();
  const where = {};

  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: "insensitive" } },
      { content: { contains: keyword, mode: "insensitive" } },
    ];
  }

  if (category !== "all" && postCategories.includes(category)) {
    where.category = category;
  }

  return where;
}

function buildListOrderBy(sort) {
  if (sort === "oldest") {
    return [{ createdAt: "asc" }, { id: "asc" }];
  }

  if (sort === "title") {
    return [{ title: "asc" }, { id: "desc" }];
  }

  if (sort === "views") {
    return [{ viewCount: "desc" }, { id: "desc" }];
  }

  return [{ createdAt: "desc" }, { id: "desc" }];
}

postsRouter.get("/", async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.query.page, 1, Number.MAX_SAFE_INTEGER);
    const pageSize = parsePositiveInt(req.query.pageSize, listPageSizeDefault, listPageSizeMax);
    const where = buildListWhere(req.query);
    const orderBy = buildListOrderBy(req.query.sort);
    const skip = (page - 1) * pageSize;

    const [total, rows] = await prisma.$transaction([
      prisma.post.count({ where }),
      prisma.post.findMany({
        where,
        include: {
          author: { select: authorSelect },
          _count: { select: { comments: true } },
        },
        orderBy,
        skip,
        take: pageSize,
      }),
    ]);

    return res.json({
      posts: rows.map(toPost),
      pageInfo: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    });
  } catch (error) {
    return next(error);
  }
});

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "올바른 게시글 ID가 아닙니다." });
    }

    const row = await prisma.post.update({
      where: { id: BigInt(id) },
      data: { viewCount: { increment: 1 } },
      include: {
        author: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    });

    return res.json({ post: toPost(row) });
  } catch (error) {
    if (error.code === "P2025") {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    return next(error);
  }
});

postsRouter.post("/", requireAuth, async (req, res, next) => {
  try {
    const validation = validatePostPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const row = await prisma.post.create({
      data: {
        title: validation.data.title,
        content: validation.data.content,
        category: validation.data.category,
        authorId: BigInt(req.user.id),
      },
      include: {
        author: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    });

    return res.status(201).json({ post: toPost(row) });
  } catch (error) {
    return next(error);
  }
});

postsRouter.put("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "올바른 게시글 ID가 아닙니다." });
    }

    const validation = validatePostPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const exists = await prisma.post.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, authorId: true },
    });

    if (!exists) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    if (exists.authorId && Number(exists.authorId) !== req.user.id) {
      return res.status(403).json({ error: "본인이 작성한 게시글만 수정할 수 있습니다." });
    }

    const row = await prisma.post.update({
      where: { id: BigInt(id) },
      data: {
        title: validation.data.title,
        content: validation.data.content,
        category: validation.data.category,
        authorId: exists.authorId || BigInt(req.user.id),
      },
      include: {
        author: { select: authorSelect },
        _count: { select: { comments: true } },
      },
    });

    return res.json({ post: toPost(row) });
  } catch (error) {
    return next(error);
  }
});

postsRouter.delete("/:id", requireAuth, async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "올바른 게시글 ID가 아닙니다." });
    }

    const exists = await prisma.post.findUnique({
      where: { id: BigInt(id) },
      select: { id: true, authorId: true },
    });

    if (!exists) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    if (exists.authorId && Number(exists.authorId) !== req.user.id) {
      return res.status(403).json({ error: "본인이 작성한 게시글만 삭제할 수 있습니다." });
    }

    await prisma.post.delete({
      where: { id: BigInt(id) },
    });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

postsRouter.get("/:id/comments", async (req, res, next) => {
  try {
    const postId = parseId(req.params.id);
    if (!postId) {
      return res.status(400).json({ error: "올바른 게시글 ID가 아닙니다." });
    }

    const exists = await prisma.post.findUnique({
      where: { id: BigInt(postId) },
      select: { id: true },
    });

    if (!exists) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    const comments = await prisma.comment.findMany({
      where: { postId: BigInt(postId) },
      include: { author: { select: authorSelect } },
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    });

    return res.json({ comments: comments.map(toComment) });
  } catch (error) {
    return next(error);
  }
});

postsRouter.post("/:id/comments", requireAuth, async (req, res, next) => {
  try {
    const postId = parseId(req.params.id);
    if (!postId) {
      return res.status(400).json({ error: "올바른 게시글 ID가 아닙니다." });
    }

    const validation = validateCommentPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const exists = await prisma.post.findUnique({
      where: { id: BigInt(postId) },
      select: { id: true },
    });

    if (!exists) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    const comment = await prisma.comment.create({
      data: {
        content: validation.data.content,
        postId: BigInt(postId),
        authorId: BigInt(req.user.id),
      },
      include: { author: { select: authorSelect } },
    });

    return res.status(201).json({ comment: toComment(comment) });
  } catch (error) {
    return next(error);
  }
});

postsRouter.delete("/:postId/comments/:commentId", requireAuth, async (req, res, next) => {
  try {
    const postId = parseId(req.params.postId);
    const commentId = parseId(req.params.commentId);
    if (!postId || !commentId) {
      return res.status(400).json({ error: "올바른 댓글 ID가 아닙니다." });
    }

    const comment = await prisma.comment.findUnique({
      where: { id: BigInt(commentId) },
      include: { post: { select: { authorId: true } } },
    });

    if (!comment || Number(comment.postId) !== postId) {
      return res.status(404).json({ error: "댓글을 찾을 수 없습니다." });
    }

    const isCommentAuthor = comment.authorId && Number(comment.authorId) === req.user.id;
    const isPostAuthor = comment.post.authorId && Number(comment.post.authorId) === req.user.id;
    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: "댓글을 삭제할 권한이 없습니다." });
    }

    await prisma.comment.delete({ where: { id: BigInt(commentId) } });

    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
