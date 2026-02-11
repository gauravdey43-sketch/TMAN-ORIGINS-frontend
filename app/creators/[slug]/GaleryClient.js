"use client";

import { useState } from "react";

export default function GalleryClient({ images = [], name = "" }) {
  const [active, setActive] = useState(images[0] || "");

  if (!images.length) return null;

  return (
    <div className="mt-6">
      {/* Main image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={active}
        alt={name}
        className="w-full max-h-[520px] object-cover rounded-2xl border border-white/10"
      />

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
          {images.map((src) => (
            <button
              key={src}
              type="button"
              onClick={() => setActive(src)}
              className={`shrink-0 rounded-xl border ${
                active === src ? "border-cyan-400" : "border-white/10"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt=""
                className="h-20 w-28 object-cover rounded-xl"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
