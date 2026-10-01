// Talks to the Express backend. Auth endpoints are stubbed for now.
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function post(path, body) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Could not reach the server. Is the backend running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

export const signIn = (credentials) => post("/api/auth/signin", credentials);
export const signUp = (details) => post("/api/auth/signup", details);
