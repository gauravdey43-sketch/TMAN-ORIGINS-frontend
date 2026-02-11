export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export async function apiGet(path) {
  const res = await fetch(`${API_BASE}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
