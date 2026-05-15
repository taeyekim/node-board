const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";
const tokenKey = "node-board-token";

export function getStoredToken() {
  return localStorage.getItem(tokenKey);
}

export function storeToken(token) {
  localStorage.setItem(tokenKey, token);
}

export function clearStoredToken() {
  localStorage.removeItem(tokenKey);
}

async function request(path, options = {}) {
  const token = getStoredToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    error.status = response.status;
    error.details = data.errors;
    throw error;
  }

  return data;
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

export async function register(payload) {
  const data = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  storeToken(data.token);
  return data.user;
}

export async function login(payload) {
  const data = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  storeToken(data.token);
  return data.user;
}

export async function fetchMe() {
  const data = await request("/api/auth/me");
  return data.user;
}

export async function fetchPosts(params) {
  return request(`/api/posts${buildQuery(params)}`);
}

export async function fetchPost(id) {
  const data = await request(`/api/posts/${id}`);
  return data.post;
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

export async function fetchComments(postId) {
  const data = await request(`/api/posts/${postId}/comments`);
  return data.comments;
}

export async function createComment(postId, payload) {
  const data = await request(`/api/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return data.comment;
}

export async function deleteComment(postId, commentId) {
  await request(`/api/posts/${postId}/comments/${commentId}`, {
    method: "DELETE",
  });
}
