import { LibraryHeader } from "../../components/library/library-header";

// Next.js shows this automatically while library/page.tsx is loading (it wraps
// the page in a React <Suspense> boundary for you). It mirrors the real page's
// layout (filter panel, then a grid of covers), so nothing jumps around when
// the real content arrives. That's called a "skeleton".
export default function LibraryLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <LibraryHeader />

      {/* role="status" + the visually hidden text tell screen-reader users
          what's happening, since the gray boxes mean nothing to them. */}
      <div role="status" aria-live="polite">
        <span className="sr-only">Loading your library...</span>

        {/* FILTER PANEL SKELETON */}
        <div className="mb-8 space-y-6 rounded-xl bg-white p-4 shadow" aria-hidden="true">
          <div className="flex items-center justify-between">
            <div className="h-5 w-36 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
          </div>

          {["w-60", "w-80", "w-48"].map((rowWidth) => (
            <div key={rowWidth} className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
              <div className="flex flex-wrap gap-2">
                {[0, 1, 2, 3].map((chip) => (
                  <div
                    key={chip}
                    className="h-9 w-24 animate-pulse rounded-full bg-gray-200"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* GRID SKELETON: same columns and aspect ratio as the real cards */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6" aria-hidden="true">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-xl bg-gray-300"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
