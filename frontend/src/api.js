const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000/api")
  .replace(/\/+$/, "");

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
  } catch {
    throw new Error(
      "Cannot connect to the API. Check that the backend is running."
    );
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("The API returned an invalid response.");
  }

  if (!response.ok || !payload.success) {
    throw new Error(payload.message || `Request failed (${response.status}).`);
  }

  return payload;
}

export function getTasks(filters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.set(key, value);
  });
  const query = params.toString();
  return request(`/tasks${query ? `?${query}` : ""}`);
}

export function getTaskStats() {
  return request("/tasks/stats");
}

export function createTask(task) {
  return request("/tasks", {
    method: "POST",
    body: JSON.stringify(task),
  });
}

export function updateTask(id, task) {
  return request(`/tasks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(task),
  });
}

export function deleteTask(id) {
  return request(`/tasks/${id}`, { method: "DELETE" });
}
