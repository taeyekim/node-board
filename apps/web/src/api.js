const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = data.error || "요청을 처리하지 못했습니다.";
    const error = new Error(message);
    error.details = data.errors;
    throw error;
  }

  return data;
}

export async function fetchPosts() {
  const data = await request("/api/posts");
  return data.posts;
}

export async function createPost(payload) {
  const data = await request("/api/posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.post;
}

export async function updatePost(id, payload) {
  const data = await request(`/api/posts/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
  return data.post;
}

export async function deletePost(id) {
  await request(`/api/posts/${id}`, {
    method: "DELETE",
  });
}
