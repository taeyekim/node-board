import { prisma } from "./db.js";
import { verifyToken } from "./jwt.js";

function readBearerToken(req) {
  const header = req.get("authorization") || "";
  const [type, token] = header.split(" ");

  if (type?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

export async function requireAuth(req, res, next) {
  try {
    const token = readBearerToken(req);
    if (!token) {
      return res.status(401).json({ error: "로그인이 필요합니다." });
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: BigInt(payload.sub) },
      select: { id: true, email: true, name: true, createdAt: true },
    });

    if (!user) {
      return res.status(401).json({ error: "유효하지 않은 로그인 정보입니다." });
    }

    req.user = {
      id: Number(user.id),
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
    return next();
  } catch (_error) {
    return res.status(401).json({ error: "유효하지 않은 로그인 정보입니다." });
  }
}
