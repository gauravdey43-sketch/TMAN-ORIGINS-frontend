import Link from "next/link";

export const dynamic = "force-dynamic"; // ✅ no caching / always fresh

async function getCreators() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  const res = await fetch(`${API_BASE}/api/creators`, {
    cache: "no-store"
  });

  if (!res.ok) return [];
  return res.json();
}

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

  return `mailto:${toEmail}?subject=${encodeURIComponent(
    subject
  )}&body=${encodeURIComponent(body)}`;
}

function CreatorCard({ creator, apiBase }) {
  const imageSrc = creator.image ? `${apiBase}${creator.image}` : "/placeholder.jpg";
  const mailto = buildMailto(creator);

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5">
      <Link href={`/creators/${creator.slug}`} className="block">
        <div className="relative h-56 w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageSrc}
            alt={creator.name}
            className="h-full w-full object-cover opacity-95 transition group-hover:scale-[1.02]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
        </div>

        <div className="absolute bottom-0 w-full p-5">
          <div className="text-xl font-bold tracking-tight">{creator.name}</div>
          <p className="mt-2 text-sm text-white/70 line-clamp-2">{creator.bio}</p>
          <div className="mt-3 text-sm text-cyan-300/90">{creator.handle || ""}</div>
        </div>
      </Link>

      <div className="absolute right-4 top-4 z-10 flex gap-2">
        <Link
          href={`/creators/${creator.slug}`}
          className="rounded-full border border-white/15 bg-black/30 px-3 py-2 text-xs font-semibold text-white/80 backdrop-blur hover:bg-black/45 hover:text-white"
        >
          View
        </Link>

        <a
          href={mailto}
          className="rounded-full bg-cyan-400 px-3 py-2 text-xs font-semibold text-black hover:bg-cyan-300"
        >
          Email
        </a>
      </div>
    </div>
  );
}

export default async function CreatorsPage() {
  const creators = await getCreators();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight">
              All <span className="text-cyan-300">Creators</span>
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Discover all creators managed by TMan Origins.
            </p>
          </div>

          <Link
            href="/"
            className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/80 hover:bg-white/10"
          >
            ← Back
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {creators.map((c) => (
            <CreatorCard key={c._id} creator={c} apiBase={apiBase} />
          ))}
        </div>

        {creators.length === 0 && (
          <p className="mt-10 text-white/60">No creators yet.</p>
        )}
      </div>
    </div>
  );
}
