export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Board Practice API",
    version: "0.3.0",
    description: "Node.js, Express, Prisma, PostgreSQL, JWT 게시판 연습 API",
  },
  servers: [
    { url: "http://localhost:3001", description: "Express dev server" },
    { url: "http://localhost:8080", description: "Nginx reverse proxy" },
  ],
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        responses: {
          200: { description: "Server and database are reachable" },
          503: { description: "Server is running but database is unavailable" },
        },
      },
    },
    "/api/auth/register": {
      post: {
        summary: "Register",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/RegisterInput" } } },
        },
        responses: {
          201: { description: "Registered user and JWT" },
          400: { description: "Validation error" },
          409: { description: "Email already exists" },
        },
      },
    },
    "/api/auth/login": {
      post: {
        summary: "Login",
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/LoginInput" } } },
        },
        responses: {
          200: { description: "Logged in user and JWT" },
          400: { description: "Validation error" },
          401: { description: "Invalid credentials" },
        },
      },
    },
    "/api/auth/me": {
      get: {
        summary: "Current user",
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: "Current authenticated user" },
          401: { description: "Authentication required" },
        },
      },
    },
    "/api/posts": {
      get: {
        summary: "List posts",
        parameters: [
          { name: "q", in: "query", schema: { type: "string" } },
          {
            name: "category",
            in: "query",
            schema: { type: "string", enum: ["all", "notice", "free", "question", "info"] },
          },
          {
            name: "sort",
            in: "query",
            schema: { type: "string", enum: ["latest", "oldest", "title", "views"] },
          },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1 } },
          { name: "pageSize", in: "query", schema: { type: "integer", minimum: 1, maximum: 50 } },
        ],
        responses: {
          200: {
            description: "Post list",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    posts: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Post" },
                    },
                    pageInfo: { $ref: "#/components/schemas/PageInfo" },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create post",
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PostInput" } } },
        },
        responses: {
          201: { description: "Created post" },
          400: { description: "Validation error" },
          401: { description: "Authentication required" },
        },
      },
    },
    "/api/posts/{id}": {
      get: {
        summary: "Get post and increment view count",
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        responses: {
          200: { description: "Post detail" },
          404: { description: "Post not found" },
        },
      },
      put: {
        summary: "Update post",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/PostInput" } } },
        },
        responses: {
          200: { description: "Updated post" },
          400: { description: "Validation error" },
          401: { description: "Authentication required" },
          403: { description: "Forbidden" },
          404: { description: "Post not found" },
        },
      },
      delete: {
        summary: "Delete post",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        responses: {
          204: { description: "Deleted post" },
          401: { description: "Authentication required" },
          403: { description: "Forbidden" },
          404: { description: "Post not found" },
        },
      },
    },
    "/api/posts/{id}/comments": {
      get: {
        summary: "List comments",
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        responses: {
          200: { description: "Comment list" },
          404: { description: "Post not found" },
        },
      },
      post: {
        summary: "Create comment",
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { $ref: "#/components/schemas/CommentInput" } } },
        },
        responses: {
          201: { description: "Created comment" },
          400: { description: "Validation error" },
          401: { description: "Authentication required" },
          404: { description: "Post not found" },
        },
      },
    },
    "/api/posts/{postId}/comments/{commentId}": {
      delete: {
        summary: "Delete comment",
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: "postId", in: "path", required: true, schema: { type: "integer", minimum: 1 } },
          { name: "commentId", in: "path", required: true, schema: { type: "integer", minimum: 1 } },
        ],
        responses: {
          204: { description: "Deleted comment" },
          401: { description: "Authentication required" },
          403: { description: "Forbidden" },
          404: { description: "Comment not found" },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
    parameters: {
      PostId: {
        name: "id",
        in: "path",
        required: true,
        schema: { type: "integer", minimum: 1 },
      },
    },
    schemas: {
      User: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          email: { type: "string", example: "user@example.com" },
          name: { type: "string", example: "taeyeon" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      RegisterInput: {
        type: "object",
        required: ["email", "name", "password"],
        properties: {
          email: { type: "string", example: "user@example.com" },
          name: { type: "string", example: "taeyeon" },
          password: { type: "string", example: "password123" },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "user@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      PageInfo: {
        type: "object",
        properties: {
          page: { type: "integer", example: 1 },
          pageSize: { type: "integer", example: 10 },
          total: { type: "integer", example: 24 },
          totalPages: { type: "integer", example: 3 },
        },
      },
      Post: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "첫 게시글" },
          content: { type: "string", example: "내용입니다." },
          category: { type: "string", enum: ["notice", "free", "question", "info"] },
          viewCount: { type: "integer", example: 10 },
          commentCount: { type: "integer", example: 2 },
          author: { $ref: "#/components/schemas/User" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      PostInput: {
        type: "object",
        required: ["title", "content"],
        properties: {
          title: { type: "string", maxLength: 200, example: "첫 게시글" },
          content: { type: "string", example: "내용입니다." },
          category: { type: "string", enum: ["notice", "free", "question", "info"] },
        },
      },
      Comment: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          content: { type: "string", example: "댓글입니다." },
          postId: { type: "integer", example: 1 },
          author: { $ref: "#/components/schemas/User" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      CommentInput: {
        type: "object",
        required: ["content"],
        properties: {
          content: { type: "string", maxLength: 1000, example: "댓글입니다." },
        },
      },
    },
  },
};
