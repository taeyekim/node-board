import bcrypt from "bcryptjs";
import { Router } from "express";
import { prisma } from "./db.js";
import { signToken } from "./jwt.js";
import { requireAuth } from "./authMiddleware.js";
import { validateLoginPayload, validateRegisterPayload } from "./validators.js";

export const authRouter = Router();

function toUser(user) {
  return {
    id: Number(user.id),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
  };
}

function authResponse(user) {
  return {
    user: toUser(user),
    token: signToken(user),
  };
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const validation = validateRegisterPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const exists = await prisma.user.findUnique({
      where: { email: validation.data.email },
      select: { id: true },
    });

    if (exists) {
      return res.status(409).json({ error: "이미 가입된 이메일입니다." });
    }

    const passwordHash = await bcrypt.hash(validation.data.password, 12);
    const user = await prisma.user.create({
      data: {
        email: validation.data.email,
        name: validation.data.name,
        passwordHash,
      },
    });

    return res.status(201).json(authResponse(user));
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const validation = validateLoginPayload(req.body);
    if (!validation.valid) {
      return res.status(400).json({ errors: validation.errors });
    }

    const user = await prisma.user.findUnique({
      where: { email: validation.data.email },
    });

    if (!user) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    const matches = await bcrypt.compare(validation.data.password, user.passwordHash);
    if (!matches) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." });
    }

    return res.json(authResponse(user));
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", requireAuth, async (req, res) => {
  res.json({ user: req.user });
});
