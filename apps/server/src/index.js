import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { authRouter } from "./auth.js";
import { initializeCache, isCacheReady } from "./cache.js";
import { prisma } from "./db.js";
import { openApiDocument } from "./openapi.js";
import { postsRouter } from "./posts.js";

const app = express();
const port = Number(process.env.PORT || 3001);
const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: corsOrigin.split(",").map((origin) => origin.trim()),
  }),
);
app.use(express.json());

app.get("/api/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: "ok",
      database: "ok",
      cache: isCacheReady() ? "ok" : "disabled",
    });
  } catch (_error) {
    res.status(503).json({
      status: "ok",
      database: "unavailable",
      cache: isCacheReady() ? "ok" : "disabled",
    });
  }
});

app.get("/api/openapi.json", (_req, res) => {
  res.json(openApiDocument);
});

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/api/auth", authRouter);
app.use("/api/posts", postsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "서버 오류가 발생했습니다." });
});

try {
  const cacheStatus = await initializeCache();
  app.listen(port, () => {
    console.log(`Board API listening on http://localhost:${port}`);
    console.log(
      cacheStatus.enabled
        ? "Redis cache enabled."
        : `Redis cache disabled: ${cacheStatus.reason}`,
    );
  });
} catch (error) {
  console.error("Failed to start server.");
  console.error(error);
  process.exit(1);
}
