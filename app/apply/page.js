"use client";

import { useState } from "react";

export default function ApplyPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
  const [status, setStatus] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("Submitting...");

    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      instagram: e.target.instagram.value,
      niche: e.target.niche.value
    };

    try {
      const res = await fetch(`${API_BASE}/api/applications`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setStatus("Application submitted successfully ✅");
        e.target.reset();
      } else {
        setStatus(data?.message || "Something went wrong ❌");
      }
    } catch {
      setStatus("Server not reachable ❌");
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-xl px-6 py-14">
        <p className="text-sm text-white/60">TMan Origins</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">
          Apply as a Creator
        </h1>
        <p className="mt-3 text-white/70">
          Join TMan Origins and grow with premium brand collaborations.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-2xl border border-white/10 bg-white/5 p-6"
        >
          <div>
            <label className="text-sm text-white/70">Full Name</label>
            <input
              name="name"
              required
              className="mt-2 w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Email</label>
            <input
              name="email"
              type="email"
              required
              className="mt-2 w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Instagram Profile</label>
            <input
              name="instagram"
              required
              placeholder="https://instagram.com/username"
              className="mt-2 w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none focus:border-white"
            />
          </div>

          <div>
            <label className="text-sm text-white/70">Content Niche</label>
            <input
              name="niche"
              required
              placeholder="Lifestyle, Tech, Fitness..."
              className="mt-2 w-full rounded-xl bg-black border border-white/15 px-4 py-2 text-white outline-none focus:border-white"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90"
          >
            Submit Application
          </button>

          {status && (
            <p className="text-sm text-white/80 text-center">{status}</p>
          )}
        </form>

        <div className="mt-10 text-sm text-white/60">
          Questions? Email us at{" "}
          <a
            href="mailto:teamtmanorigins@gmail.com"
            className="text-white/80 hover:text-white"
          >
            teamtmanorigins@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
