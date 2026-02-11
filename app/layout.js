import "./globals.css";
import Link from "next/link";

export const metadata = {
  title: "TMan Origins",
  description: "Premium creator management and representation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-black text-white">
        {/* NAVBAR */}
        <header className="border-b border-white/10">
       <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">




            
            {/* LOGO */}
        <Link href="/" className="flex items-center">
  {/* eslint-disable-next-line @next/next/no-img-element */}
  <img
    src="/logo.png"
    alt="TMan Origins Logo"
    className="
      h-12
      w-[220px]
      object-contain
      object-left
      shrink-0
      drop-shadow-[0_2px_8px_rgba(0,255,255,0.45)]
    "
  />
</Link>





            {/* Navigation */}
            <nav className="flex items-center gap-6 text-sm text-white/70">
              <Link href="/creators" className="hover:text-cyan-200 transition">
                Creators
              </Link>
              <Link href="/apply" className="hover:text-cyan-200 transition">
                Apply
              </Link>
              <a
                href="mailto:teamtmanorigins@gmail.com"
                className="hover:text-cyan-200 transition"
              >
                Contact
              </a>
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main>{children}</main>
      </body>
    </html>
  );
}
