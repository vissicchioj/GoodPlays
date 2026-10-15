import Link from "next/link";

// Shown for any URL that doesn't match a page (and whenever code calls
// notFound()). It renders inside layout.tsx, so the navbar and footer stay.
export default function NotFound() {
  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <div className="rounded-xl bg-white p-8 shadow">
        <p className="mb-2 text-5xl font-bold text-gray-300">404</p>
        <h2 className="mb-2 text-2xl font-semibold">Game over: page not found</h2>
        <p className="mb-6 text-gray-600">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>

        <Link
          href="/"
          className="inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-80"
        >
          Back to Discover
        </Link>
      </div>
    </section>
  );
}
