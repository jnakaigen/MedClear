function getToken() {
  return localStorage.getItem("medclear-token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// --- Auth ---

export async function signup(name, email, password) {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Signup failed");
  return data;
}

export async function login(email, password) {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Login failed");
  return data;
}

// --- Reports ---

export async function analyzeReport(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/reports/analyze", {
    method: "POST",
    headers: authHeaders(),
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to analyze report");
  if (!data.success) throw new Error(data.error || "Analysis failed");
  return data;
}

export async function getReports() {
  const res = await fetch("/api/reports", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch reports");
  return data;
}

export async function getReport(id) {
  const res = await fetch(`/api/reports/${id}`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch report");
  return data;
}

export async function deleteReport(id) {
  const res = await fetch(`/api/reports/${id}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to delete report");
  return data;
}

// --- Timeline ---

export async function getTimeline() {
  const res = await fetch("/api/timeline", {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Failed to fetch timeline");
  return data;
}
