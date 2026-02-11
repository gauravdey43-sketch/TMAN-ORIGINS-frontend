import Link from "next/link";

async function getCreators() {
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
  const res = await fetch(`${API_BASE}/api/creators`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

function StatCard({ title, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-6">
      <div className="text-3xl font-extrabold tracking-tight text-white">
        {title}
      </div>
      <div className="mt-1 text-sm text-white/60">{subtitle}</div>
    </div>
  );
}

function WhyCard({ title, desc }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h3 className="text-base font-semibold text-cyan-300">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
    </div>
  );
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

/** ✅ Random image picker
 * Priority:
 * 1) creator.images[] (gallery)
 * 2) creator.image (single)
 * 3) placeholder
 */
function pickRandomImageUrl(creator, apiBase) {
  const gallery = Array.isArray(creator.images) ? creator.images : [];
  const candidates = [...gallery];

  if (creator.image) candidates.push(creator.image);

  if (candidates.length === 0) return "/placeholder.jpg";

  const random = candidates[Math.floor(Math.random() * candidates.length)];
  // cache-bust: update each refresh + avoid old cached img
  const v = creator.updatedAt || creator._id || Date.now();
  return `${apiBase}${random}?v=${encodeURIComponent(v)}&r=${Math.random()}`;
}

function CreatorCard({ creator, apiBase }) {
  const mailto = buildMailto(creator);

  // ✅ random photo every render/refresh
  const imageSrc = pickRandomImageUrl(creator, apiBase);

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
          <p className="mt-2 text-sm text-white/70 line-clamp-2">
            {creator.bio}
          </p>
          <div className="mt-3 text-sm text-cyan-300/90">
            {creator.handle || ""}
          </div>
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

export default async function HomePage() {
  const creators = await getCreators();
  const featured = creators.filter((c) => c.featured).slice(0, 3);
  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-1/2 top-[-200px] h-[620px] w-[620px] -translate-x-1/2 rounded-full bg-cyan-400/20 blur-[150px]" />
        <div className="absolute left-[10%] top-[120px] h-[360px] w-[360px] rounded-full bg-cyan-300/12 blur-[130px]" />
      </div>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-10 text-center">
        <div className="mx-auto mb-8 flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="TMan Origins Logo"
            className="w-[260px] max-w-full object-contain drop-shadow-[0_6px_24px_rgba(0,255,255,0.35)]"
          />
        </div>

        <h1 className="text-5xl font-extrabold tracking-tight leading-[1.05] sm:text-6xl">
          <span className="text-white">TMan</span>{" "}
          <span className="text-cyan-300">Origins</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-white/60">
          Elevating digital creators to new heights. We manage, promote, and
          empower the next generation of content innovators.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/creators"
            className="inline-flex items-center justify-center rounded-full bg-cyan-400 px-6 py-3 text-sm font-semibold text-black hover:bg-cyan-300"
          >
            View Our Creators <span className="ml-2">→</span>
          </Link>

          <Link
            href="/apply"
            className="inline-flex items-center justify-center rounded-full border border-cyan-400/40 bg-transparent px-6 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/10"
          >
            Apply to Join <span className="ml-2">→</span>
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-3">
          <StatCard title="100M+" subtitle="Combined Reach" />
          <StatCard title="500%" subtitle="Growth Rate" />
          <StatCard title="Premium" subtitle="Brand Partnerships" />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-14">
        <h2 className="text-4xl font-extrabold tracking-tight text-center">
          Featured <span className="text-cyan-300">Creators</span>
        </h2>
        <p className="mt-3 text-center text-sm text-white/60">
          Meet the talented individuals shaping the future of digital content
        </p>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {featured[0] && (
            <div className="lg:col-span-2">
              <CreatorCard creator={featured[0]} apiBase={apiBase} />
            </div>
          )}

          <div className="flex flex-col gap-6">
            {featured.slice(1, 3).map((c) => (
              <CreatorCard key={c._id} creator={c} apiBase={apiBase} />
            ))}
          </div>
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href="/creators"
            className="rounded-full border border-cyan-400/40 px-6 py-3 text-sm font-semibold text-cyan-200 hover:bg-cyan-400/10"
          >
            View All Creators <span className="ml-2">→</span>
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-4xl font-extrabold tracking-tight text-center">
          Why <span className="text-cyan-300">TMan Origins</span>?
        </h2>

        <p className="mx-auto mt-4 max-w-3xl text-center text-sm text-white/60">
          We’re not just a management agency — we’re your partner in building a
          lasting digital legacy. From brand partnerships to content
          optimization and audience growth, we handle it all so you can focus on
          what you do best: creating.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2">
          <WhyCard
            title="Strategic Management"
            desc="Personalized strategies tailored to your unique brand and audience. We amplify what makes you special."
          />
          <WhyCard
            title="Premium Partnerships"
            desc="Access to exclusive brand deals and collaborations that align with your values and elevate your content."
          />
          <WhyCard
            title="Growth & Analytics"
            desc="Data-driven insights and growth strategies to maximize reach and engagement across all platforms."
          />
          <WhyCard
            title="Creative Support"
            desc="Full creative assistance including content planning, production support, and brand development."
          />
        </div>
      </section>

      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex items-center justify-between gap-6">
            <div>
              <div className="font-semibold">TMan Origins</div>
              <div className="mt-1 text-sm text-white/60">
                Empowering digital creators worldwide
              </div>
              <a
                href="mailto:team@tmanorigins.com"
                className="mt-2 inline-block text-sm text-cyan-200 hover:text-cyan-100"
              >
                team@tmanorigins.com
              </a>
            </div>

            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="text-sm text-white/60 hover:text-white"
            >
              Instagram
            </a>
          </div>

          <div className="mt-10 text-center text-xs text-white/40">
            © {new Date().getFullYear()} TMan Origins. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
