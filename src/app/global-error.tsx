"use client"; // Error boundaries must be Client Components

import "./globals.css";

// Last line of defense: used only if layout.tsx itself crashes. Because it
// replaces the whole layout, it has to provide its own <html> and <body> and
// import the global styles itself. It can't use `metadata`, so the tab title
// is set with a <title> element.
export default function GlobalError({
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-gray-100 px-4 font-sans text-gray-900">
        <title>Something went wrong | Goodplays</title>

        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow">
          <h1 className="mb-2 text-2xl font-semibold">Goodplays hit a snag</h1>
          <p className="mb-6 text-gray-600">
            Something went wrong while loading the app. Please try again.
          </p>
          <button
            type="button"
            onClick={() => unstable_retry()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-80"
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
