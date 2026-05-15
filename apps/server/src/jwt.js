import jwt from "jsonwebtoken";

const fallbackSecret = "local-development-jwt-secret-change-me";

export function getJwtSecret() {
  return process.env.JWT_SECRET || fallbackSecret;
}

export function signToken(user) {
  return jwt.sign(
    {
      sub: String(user.id),
      email: user.email,
      name: user.name,
    },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
  );
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret());
}
