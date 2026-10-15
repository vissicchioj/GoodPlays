"use client"; // Error boundaries must be Client Components

import { useEffect } from "react";
import Link from "next/link";

// Shown in place of a page when it throws while rendering (for example, the
// database is unreachable when the Library loads). The navbar and footer from
// layout.tsx stay visible, because this boundary sits inside the layout.
//
// Note for Next.js 16: the retry function is `unstable_retry` (it re-fetches
// the page's data and renders again). Older tutorials use `reset`, which only
// re-renders without fetching again.
// Named ErrorPage (not Error) so it doesn't shadow JavaScript's built-in Error,
// which the type below still needs.
export default function ErrorPage({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    // Appears in the browser console. In production the message is replaced by
    // a generic one so server details never reach the browser; `digest`
    // matches the full error in your Vercel logs.
    console.error(error);
  }, [error]);

  return (
    <section className="mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
      <div className="rounded-xl bg-white p-8 shadow">
        <p className="mb-2 text-4xl" aria-hidden="true">
          🕹️
        </p>
        <h2 className="mb-2 text-2xl font-semibold">Something went wrong</h2>
        <p className="mb-6 text-gray-600">
          We couldn&apos;t load this page. This is usually temporary, so please
          try again.
        </p>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-80"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
          >
            Back to Discover
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-xs text-gray-400">Error reference: {error.digest}</p>
        )}
      </div>
    </section>
  );
}
