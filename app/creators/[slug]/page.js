"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

function buildMailto(creator) {
  const toEmail = creator.emailSlug
    ? `team${creator.emailSlug}@tmanorigins.com`
    : `team@tmanorigins.com`;

  const subject = `Brand Collaboration Inquiry — ${creator.name}`;
  const body = `Hello TMan Origins Team,

We are interested in collaborating with ${creator.name}.

Brand Name:
Website / Instagram:
Budget Range:
Campaign Details:

Regards,
`;

  return `mailto:${toEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function CreatorProfilePage(props) {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function run() {
      setLoading(true);
      const { slug } = await props.params;

      try {
        const res = await fetch(
          `${API_BASE}/api/creators/slug/${encodeURIComponent(slug)}`,
          { cache: "no-store" }
        );

        if (!res.ok) {
          if (!cancelled) {
            setCreator(null);
            setLoading(false);
          }
          return;
        }

        const data = await res.json();
        if (cancelled) return;

        setCreator(data);

        const imgs = Array.isArray(data.images) ? data.images : [];
        const abs = imgs.map((p) => `${API_BASE}${p}?v=${data.updatedAt || data._id}`);
        if (!abs.length && data.image) abs.push(`${API_BASE}${data.image}?v=${data.updatedAt || data._id}`);

        setActive(abs[0] || "");
        setLoading(false);
      } catch {
        if (!cancelled) {
          setCreator(null);
          setLoading(false);
        }
      }
    }

    run();
    return () => { cancelled = true; };
  }, [API_BASE, props.params]);

  const gallery = useMemo(() => {
    if (!creator) return [];
    const imgs = Array.isArray(creator.images) ? creator.images : [];
    const abs = imgs.map((p) => `${API_BASE}${p}?v=${creator.updatedAt || creator._id}`);
    if (!abs.length && creator.image) abs.push(`${API_BASE}${creator.image}?v=${creator.updatedAt || creator._id}`);
    return abs;
  }, [creator, API_BASE]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-white/70">
          Loading creator...
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl border border-white/10 bg-white/5 p-6 text-center">
          <h1 className="text-2xl font-bold">Creator not found</h1>
          <p className="mt-2 text-sm text-white/60">
            This profile doesn’t exist or was removed.
          </p>
          <Link
            href="/creators"
            className="mt-6 inline-flex rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-black hover:bg-cyan-300"
          >
            Back to Creators →
          </Link>
        </div>
      </div>
    );
  }

  const mailto = buildMailto(creator);

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <Link
            href="/creators"
            className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            ← Back
          </Link>

          <div className="flex gap-2">
            {creator.instagram && (
              <a
                href={creator.instagram}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
              >
                Instagram
              </a>
            )}
            <a
              href={mailto}
              className="rounded-full bg-cyan-400 px-4 py-2 text-sm font-semibold text-black hover:bg-cyan-300"
            >
              Email for Collab
            </a>
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr]">
            <div className="p-4">
              <div className="relative overflow-hidden rounded-2xl border border-white/10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={active || "/placeholder.jpg"}
                  alt={creator.name}
                  className="h-[340px] w-full object-cover"
                />
                {creator.featured && (
                  <div className="absolute left-4 top-4 rounded-full bg-cyan-400 px-3 py-1 text-xs font-bold text-black">
                    Featured
                  </div>
                )}
              </div>

              {gallery.length > 1 && (
                <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                  {gallery.map((src) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setActive(src)}
                      className={`shrink-0 rounded-xl border ${
                        active === src ? "border-cyan-400" : "border-white/10"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt="" className="h-20 w-28 object-cover rounded-xl" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="p-7 lg:p-10">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                {creator.name}
              </h1>

              {creator.handle && (
                <p className="mt-2 text-cyan-300/90">{creator.handle}</p>
              )}

              <p className="mt-5 text-white/70 leading-relaxed">{creator.bio}</p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/creators"
                  className="rounded-full border border-white/15 bg-white/5 px-5 py-2 text-sm text-white/80 hover:bg-white/10"
                >
                  Browse all creators
                </Link>
                <a
                  href={mailto}
                  className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-black hover:bg-cyan-300"
                >
                  Start collaboration
                </a>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-white/40">
          © {new Date().getFullYear()} TMan Origins
        </p>
      </div>
    </div>
  );
}
