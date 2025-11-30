import { API_URL } from "../constants.js";

async function fetchClient(endpoint, options = {}) {
  const headers = {
    ...options.headers,
  };

  if (options.body && !(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "API request failed");
  }

  return data;
}

export const api = {
  signup: (data) =>
    fetchClient("/signup", { method: "POST", body: JSON.stringify(data) }),
  login: (data) =>
    fetchClient("/signin", { method: "POST", body: JSON.stringify(data) }),
  logout: () => fetchClient("/logout", { method: "POST" }),
  getUsers: () => fetchClient("/users"),
  getPosts: () => fetchClient("/posts"),
  createPost: (formData) =>
    fetchClient("/posts", { method: "POST", body: formData }),
  updatePost: (id, formData) =>
    fetchClient(`/posts/${id}`, { method: "PUT", body: formData }),
  deletePost: (id) => fetchClient(`/posts/${id}`, { method: "DELETE" }),
  likePost: (id) => fetchClient(`/posts/${id}/like`, { method: "POST" }),
  getComments: (postId) => fetchClient(`/comments/${postId}`),
  createComment: (data) =>
    fetchClient("/comments", { method: "POST", body: JSON.stringify(data) }),
  getMessages: (userId) => fetchClient(`/messages/${userId}`),
  sendMessage: (data) =>
    fetchClient("/messages", { method: "POST", body: JSON.stringify(data) }),
};

