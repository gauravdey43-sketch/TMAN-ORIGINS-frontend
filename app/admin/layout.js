export const metadata = {
  title: "Admin — TMan Origins"
};

export default function AdminLayout({ children }) {
  // ❌ Do NOT use <html> or <body> inside a nested layout (causes hydration mismatch)
  return <>{children}</>;
}
