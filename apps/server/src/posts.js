import { Router } from "express";
import { deleteKeys, getJson, setJson } from "./cache.js";
import { pool } from "./db.js";
import { validatePostPayload } from "./validators.js";

export const postsRouter = Router();
const listCacheKey = "posts:list";

function toPost(row) {
  return {
    id: Number(row.id),
    title: row.title,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

postsRouter.get("/", async (_req, res, next) => {
  try {
    const cached = await getJson(listCacheKey);
    if (cached) {
      return res.json({ posts: cached, cache: "hit" });
    }

    const result = await pool.query(`
      SELECT id, title, content, created_at, updated_at
      FROM posts
      ORDER BY created_at DESC, id DESC
    `);
    const posts = result.rows.map(toPost);
    await setJson(listCacheKey, posts);
    return res.json({ posts, cache: "miss" });
  } catch (error) {
    return next(error);
  }
});

postsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "유효한 게시글 ID가 아닙니다." });
    }

    const cacheKey = `posts:detail:${id}`;
    const cached = await getJson(cacheKey);
    if (cached) {
      return res.json({ post: cached, cache: "hit" });
    }

    const result = await pool.query(
      `
        SELECT id, title, content, created_at, updated_at
        FROM posts
        WHERE id = $1
      `,
      [id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    const post = toPost(result.rows[0]);
    await setJson(cacheKey, post);
    return res.json({ post, cache: "miss" });
  } catch (error) {
    return next(error);
  }
});

postsRouter.post("/", async (req, res, next) => {
  try {
    const validation = validatePostPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await pool.query(
      `
        INSERT INTO posts (title, content)
        VALUES ($1, $2)
        RETURNING id, title, content, created_at, updated_at
      `,
      [validation.data.title, validation.data.content],
    );

    await deleteKeys([listCacheKey]);
    return res.status(201).json({ post: toPost(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
});

postsRouter.put("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "유효한 게시글 ID가 아닙니다." });
    }

    const validation = validatePostPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const result = await pool.query(
      `
        UPDATE posts
        SET title = $1, content = $2, updated_at = NOW()
        WHERE id = $3
        RETURNING id, title, content, created_at, updated_at
      `,
      [validation.data.title, validation.data.content, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    await deleteKeys([listCacheKey, `posts:detail:${id}`]);
    return res.json({ post: toPost(result.rows[0]) });
  } catch (error) {
    return next(error);
  }
});

postsRouter.delete("/:id", async (req, res, next) => {
  try {
    const id = parseId(req.params.id);
    if (!id) {
      return res.status(400).json({ error: "유효한 게시글 ID가 아닙니다." });
    }

    const result = await pool.query("DELETE FROM posts WHERE id = $1", [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    await deleteKeys([listCacheKey, `posts:detail:${id}`]);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});
