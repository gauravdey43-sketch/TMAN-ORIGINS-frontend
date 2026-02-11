"use client";

import { useEffect, useMemo, useState } from "react";

export default function AdminClient() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  const [authorized, setAuthorized] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  // ✅ ONLY 2 tabs now
  const [tab, setTab] = useState("creators"); // creators | applications

  // creators
  const [creators, setCreators] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    bio: "",
    instagram: "",
    handle: "",
    featured: false,
    emailSlug: ""
  });

  // applications
  const [applications, setApplications] = useState([]);
  const [appsLoading, setAppsLoading] = useState(false);

  /* =========================
     Session check (cookie auth)
     Requires backend: GET /api/admin/me
     ========================= */
  useEffect(() => {
    let cancelled = false;

    async function check() {
      setCheckingSession(true);
      setError("");
      setMsg("");

      try {
        const res = await fetch(`${API_BASE}/api/admin/me`, {
          method: "GET",
          credentials: "include",
          cache: "no-store"
        });

        if (cancelled) return;
        setAuthorized(res.ok);
      } catch {
        if (!cancelled) setAuthorized(false);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [API_BASE]);

  // Load creators once authorized
  useEffect(() => {
    if (authorized) fetchCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized]);

  // When switching to applications tab, load apps
  useEffect(() => {
    if (authorized && tab === "applications") fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, tab]);

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  }

  /* =========================
     Auth
     ========================= */
  async function login(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    const email = prompt("Enter admin email:");
    if (!email) return;

    const res = await fetch(`${API_BASE}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data?.message || "Login failed");
      return;
    }

    setAuthorized(true);
    setPassword("");
  }

  async function logout() {
    try {
      await fetch(`${API_BASE}/api/admin/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch {}

    setAuthorized(false);
    setCreators([]);
    setApplications([]);
    cancelEdit();
    setMsg("");
    setError("");
    setTab("creators");
  }

  async function forgotPassword() {
    const email = prompt("Enter admin email:");
    if (!email) return;

    await fetch(`${API_BASE}/api/admin/forgot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ email })
    });

    alert("If that email exists, a reset link has been sent.");
  }

  /* =========================
     Creators CRUD
     ========================= */
  async function fetchCreators() {
    try {
      const res = await fetch(`${API_BASE}/api/creators`, {
        cache: "no-store",
        credentials: "include"
      });

      const data = await res.json().catch(() => []);
      setCreators(Array.isArray(data) ? data : []);
    } catch {
      setCreators([]);
    }
  }

  function startEdit(creator) {
    setEditingId(creator._id);
    setMsg("");
    setError("");
    setImageFiles([]);

    setForm({
      name: creator.name || "",
      slug: creator.slug || "",
      bio: creator.bio || "",
      instagram: creator.instagram || "",
      handle: creator.handle || "",
      featured: !!creator.featured,
      emailSlug: creator.emailSlug || ""
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setMsg("");
    setError("");
    setImageFiles([]);
    setForm({
      name: "",
      slug: "",
      bio: "",
      instagram: "",
      handle: "",
      featured: false,
      emailSlug: ""
    });
  }

  async function saveCreator(e) {
    e.preventDefault();
    setMsg("Saving...");
    setError("");

    try {
      const url = editingId
        ? `${API_BASE}/api/creators/${editingId}`
        : `${API_BASE}/api/creators`;

      const method = editingId ? "PUT" : "POST";

      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("slug", form.slug);
      fd.append("bio", form.bio);
      fd.append("instagram", form.instagram);
      fd.append("handle", form.handle);
      fd.append("featured", String(form.featured));
      fd.append("emailSlug", form.emailSlug);

      imageFiles.forEach((file) => fd.append("images", file));

      const res = await fetch(url, {
        method,
        body: fd,
        credentials: "include"
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setAuthorized(false);
        setMsg("");
        setError("Session expired. Please login again.");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Failed");

      setMsg(editingId ? "✅ Updated (gallery appended)" : "✅ Added");
      cancelEdit();
      fetchCreators();
    } catch (err) {
      setMsg("");
      setError("❌ " + (err?.message || "Something went wrong"));
    }
  }

  async function deleteCreator(id) {
    if (!confirm("Delete this creator?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/creators/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setAuthorized(false);
        setError("Session expired. Please login again.");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Delete failed");

      fetchCreators();
    } catch (e) {
      alert(e?.message || "Delete failed.");
    }
  }

  /* =========================
     Gallery controls (Creators)
     ========================= */
  async function setCover(creatorId, imagePath) {
    try {
      const res = await fetch(`${API_BASE}/api/creators/${creatorId}/cover`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: imagePath })
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setAuthorized(false);
        setError("Session expired. Please login again.");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Failed to set cover");

      setMsg("✅ Cover updated");
      fetchCreators();
    } catch (e) {
      alert(e?.message || "Failed to set cover");
    }
  }

  async function removeImage(creatorId, imagePath) {
    if (!confirm("Remove this image from gallery?")) return;

    try {
      const res = await fetch(`${API_BASE}/api/creators/${creatorId}/images`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: imagePath })
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setAuthorized(false);
        setError("Session expired. Please login again.");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Failed to remove image");

      setMsg("✅ Image removed");
      fetchCreators();
    } catch (e) {
      alert(e?.message || "Failed to remove image");
    }
  }

  /* =========================
     Applications (Admin)
     ========================= */
  async function fetchApplications() {
    setAppsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "GET",
        credentials: "include",
        cache: "no-store"
      });

      const data = await res.json().catch(() => []);

      if (res.status === 401) {
        setAuthorized(false);
        setError("Session expired. Please login again.");
        setApplications([]);
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Failed to load applications");

      setApplications(Array.isArray(data) ? data : []);
    } catch (e) {
      setApplications([]);
      setError(e?.message || "Failed to load applications");
    } finally {
      setAppsLoading(false);
    }
  }

  async function updateApplicationStatus(id, status) {
    try {
      // optimistic UI
      setApplications((list) =>
        list.map((a) => (a._id === id ? { ...a, status } : a))
      );

      const res = await fetch(`${API_BASE}/api/applications/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status })
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setAuthorized(false);
        setError("Session expired. Please login again.");
        return;
      }

      if (!res.ok) throw new Error(data?.message || "Failed to update status");

      setMsg("✅ Application updated");
      setApplications((list) => list.map((a) => (a._id === id ? data : a)));
    } catch (e) {
      alert(e?.message || "Failed to update status");
      fetchApplications();
    }
  }

  async function deleteApplication(id) {
    if (!confirm("Delete this application?")) return;

    try {
      const prev = applications;
      setApplications((list) => list.filter((a) => a._id !== id));

      const res = await fetch(`${API_BASE}/api/applications/${id}`, {
        method: "DELETE",
        credentials: "include"
      });

      const data = await res.json().catch(() => ({}));

      if (res.status === 401) {
        setAuthorized(false);
        setError("Session expired. Please login again.");
        return;
      }

      if (!res.ok) {
        setApplications(prev);
        throw new Error(data?.message || "Failed to delete application");
      }

      setMsg("✅ Application deleted");
    } catch (e) {
      alert(e?.message || "Failed to delete application");
    }
  }

  /* =========================
     UI helpers
     ========================= */
  const activeCreatorsCount = useMemo(() => creators.length, [creators]);
  const applicationsCount = useMemo(() => applications.length, [applications]);
  const newAppsCount = useMemo(
    () => applications.filter((a) => (a.status || "new") === "new").length,
    [applications]
  );

  function fmtDate(d) {
    try {
      return new Date(d).toLocaleString();
    } catch {
      return "";
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/70">
          Checking admin session...
        </div>
      </div>
    );
  }

  // LOGIN
  if (!authorized) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <form
          onSubmit={login}
          className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <h1 className="text-2xl font-bold">Admin Login</h1>

          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-4 w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none"
          />

          {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Login
          </button>

          <button
            type="button"
            onClick={forgotPassword}
            className="mt-3 w-full rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Forgot password?
          </button>
        </form>
      </div>
    );
  }

  // DASHBOARD
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <div className="mt-1 text-xs text-white/50">
              Creators: {activeCreatorsCount} • Applications: {applicationsCount}{" "}
              {newAppsCount > 0 ? `• New: ${newAppsCount}` : ""}
            </div>
          </div>

          <button
            onClick={logout}
            className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            Logout
          </button>
        </div>

        {/* mini navbar */}
        <div className="mt-6 flex flex-wrap gap-2">
          {["creators", "applications"].map((k) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-full border px-4 py-2 text-sm ${
                tab === k
                  ? "border-cyan-400 bg-cyan-400/10 text-cyan-200"
                  : "border-white/15 text-white/70 hover:bg-white/10"
              }`}
            >
              {k[0].toUpperCase() + k.slice(1)}
            </button>
          ))}
        </div>

        {/* Tabs */}
        {tab === "applications" ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold">Applications</h2>
                <p className="mt-1 text-xs text-white/50">
                  Submitted from /apply (stored in MongoDB)
                </p>
              </div>

              <button
                onClick={fetchApplications}
                className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Refresh
              </button>
            </div>

            {appsLoading ? (
              <div className="mt-6 text-sm text-white/60">Loading...</div>
            ) : applications.length === 0 ? (
              <div className="mt-6 text-sm text-white/60">No applications yet.</div>
            ) : (
              <div className="mt-6 space-y-3">
                {applications.map((a) => (
                  <div
                    key={a._id}
                    className="rounded-xl border border-white/10 bg-black/30 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="font-semibold">{a.name}</div>
                        <div className="mt-1 text-xs text-white/60">{a.email}</div>
                        <div className="mt-1 text-xs text-white/60">
                          Niche: {a.niche}
                        </div>

                        <a
                          href={a.instagram}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-xs text-cyan-200 hover:underline"
                        >
                          {a.instagram}
                        </a>

                        <div className="mt-2 text-[11px] text-white/40">
                          Submitted: {fmtDate(a.createdAt)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={a.status || "new"}
                          onChange={(e) =>
                            updateApplicationStatus(a._id, e.target.value)
                          }
                          className="rounded-xl bg-black border border-white/15 px-3 py-2 text-sm text-white outline-none"
                        >
                          <option value="new">new</option>
                          <option value="reviewing">reviewing</option>
                          <option value="approved">approved</option>
                          <option value="rejected">rejected</option>
                        </select>

                        <button
                          onClick={() => deleteApplication(a._id)}
                          className="rounded-xl border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {msg && <p className="text-sm mt-4 text-white/70">{msg}</p>}
            {error && <p className="text-sm mt-4 text-red-400">{error}</p>}
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
            {/* FORM */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-bold">
                {editingId ? "Edit Creator" : "Add Creator"}
              </h2>

              <form onSubmit={saveCreator} className="mt-6 space-y-3">
                <input
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  placeholder="Name"
                  className="w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none"
                  required
                />

                <input
                  name="slug"
                  value={form.slug}
                  onChange={onChange}
                  placeholder="Slug (gaurav-dey)"
                  className="w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none"
                  required
                />

                <input
                  name="handle"
                  value={form.handle}
                  onChange={onChange}
                  placeholder="@handle"
                  className="w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none"
                />

                <input
                  name="instagram"
                  value={form.instagram}
                  onChange={onChange}
                  placeholder="Instagram URL"
                  className="w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none"
                />

                <input
                  name="emailSlug"
                  value={form.emailSlug}
                  onChange={onChange}
                  placeholder="emailSlug (gaurav => teamgaurav@tmanorigins.com)"
                  className="w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none"
                />

                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={onChange}
                  placeholder="Bio"
                  rows={4}
                  className="w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none"
                  required
                />

                <label className="flex items-center gap-2 text-sm text-white/80">
                  <input
                    type="checkbox"
                    name="featured"
                    checked={form.featured}
                    onChange={onChange}
                  />
                  Featured
                </label>

                <div className="rounded-xl border border-white/15 bg-black px-4 py-3">
                  <div className="text-sm font-semibold text-white/80">
                    Upload Images (multiple)
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) =>
                      setImageFiles(Array.from(e.target.files || []))
                    }
                    className="mt-2 block w-full text-sm text-white/70"
                  />
                  {imageFiles.length > 0 && (
                    <div className="mt-2 text-xs text-cyan-200">
                      Selected: {imageFiles.length} file(s)
                    </div>
                  )}
                </div>

                <button className="w-full rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-300">
                  {editingId ? "Save Changes" : "Add Creator"}
                </button>

                {editingId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="w-full rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                  >
                    Cancel
                  </button>
                )}

                {msg && <p className="text-sm mt-2 text-white/70">{msg}</p>}
                {error && <p className="text-sm mt-2 text-red-400">{error}</p>}
              </form>
            </div>

            {/* LIST */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Creators</h2>
                <button
                  onClick={fetchCreators}
                  className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Refresh
                </button>
              </div>

              <div className="mt-6 space-y-3">
                {creators.length === 0 && (
                  <p className="text-white/60">No creators yet.</p>
                )}

                {creators.map((c) => {
                  const thumb = c.image
                    ? `${API_BASE}${c.image}?v=${c.updatedAt || c._id}`
                    : "/placeholder.jpg";

                  const gallery = Array.isArray(c.images) ? c.images : [];
                  const count = gallery.length;

                  return (
                    <div
                      key={c._id}
                      className="rounded-xl border border-white/10 bg-black/30 p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={thumb}
                            alt={c.name}
                            className="h-12 w-12 rounded-lg object-cover border border-white/10"
                          />
                          <div>
                            <div className="font-semibold">{c.name}</div>
                            <div className="text-xs text-white/60">/{c.slug}</div>
                            <div className="text-xs text-white/60">
                              {count} images • cover:{" "}
                              <span className="text-white/80">
                                {c.image ? "set" : "none"}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => startEdit(c)}
                            className="rounded-xl border border-white/15 px-3 py-2 text-xs text-white/80 hover:bg-white/10"
                          >
                            Edit
                          </button>

                          <button
                            onClick={() => deleteCreator(c._id)}
                            className="rounded-xl border border-red-500/30 px-3 py-2 text-xs text-red-300 hover:bg-red-500/10"
                          >
                            Delete
                          </button>
                        </div>
                      </div>

                      {count > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {gallery.slice(0, 6).map((img) => (
                            <div
                              key={img}
                              className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-2 py-2"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={`${API_BASE}${img}?v=${c.updatedAt || c._id}`}
                                alt=""
                                className="h-10 w-14 rounded-lg object-cover border border-white/10"
                              />

                              <button
                                type="button"
                                onClick={() => setCover(c._id, img)}
                                className="rounded-lg border border-white/15 px-2 py-1 text-[11px] text-white/80 hover:bg-white/10"
                              >
                                Set cover
                              </button>

                              <button
                                type="button"
                                onClick={() => removeImage(c._id, img)}
                                className="rounded-lg border border-red-500/30 px-2 py-1 text-[11px] text-red-300 hover:bg-red-500/10"
                              >
                                Remove
                              </button>
                            </div>
                          ))}

                          {count > 6 && (
                            <div className="text-xs text-white/50 self-center">
                              +{count - 6} more…
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="mt-6 text-xs text-white/40">
                Tip: upload multiple images → profile shows a gallery. Use “Set cover”
                to decide which image appears on homepage cards.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
