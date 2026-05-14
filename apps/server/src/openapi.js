export const openApiDocument = {
  openapi: "3.0.3",
  info: {
    title: "Board Practice API",
    version: "0.1.0",
    description: "Node.js, Express, PostgreSQL 게시판 연습용 API",
  },
  servers: [
    {
      url: "http://localhost:3001",
      description: "Express dev server",
    },
    {
      url: "http://localhost:8080",
      description: "Nginx reverse proxy",
    },
  ],
  paths: {
    "/api/health": {
      get: {
        summary: "Health check",
        responses: {
          200: {
            description: "Server and database are reachable",
          },
          503: {
            description: "Server is running but database is unavailable",
          },
        },
      },
    },
    "/api/posts": {
      get: {
        summary: "List posts",
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
                    cache: {
                      type: "string",
                      enum: ["hit", "miss"],
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: "Create post",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostInput" },
            },
          },
        },
        responses: {
          201: {
            description: "Created post",
          },
          400: {
            description: "Validation error",
          },
        },
      },
    },
    "/api/posts/{id}": {
      get: {
        summary: "Get post",
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        responses: {
          200: {
            description: "Post detail",
          },
          404: {
            description: "Post not found",
          },
        },
      },
      put: {
        summary: "Update post",
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/PostInput" },
            },
          },
        },
        responses: {
          200: {
            description: "Updated post",
          },
          400: {
            description: "Validation error",
          },
          404: {
            description: "Post not found",
          },
        },
      },
      delete: {
        summary: "Delete post",
        parameters: [{ $ref: "#/components/parameters/PostId" }],
        responses: {
          204: {
            description: "Deleted post",
          },
          404: {
            description: "Post not found",
          },
        },
      },
    },
  },
  components: {
    parameters: {
      PostId: {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
      },
    },
    schemas: {
      Post: {
        type: "object",
        properties: {
          id: { type: "integer", example: 1 },
          title: { type: "string", example: "첫 게시글" },
          content: { type: "string", example: "내용입니다." },
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
        },
      },
    },
  },
};
