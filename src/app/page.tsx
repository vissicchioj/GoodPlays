import { GameSearch } from "../components/games/game-search";

// The navbar and footer now come from layout.tsx. This page no longer reads
// the session itself, so Next.js can serve it as a static page.
export default function HomePage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <div className="mb-8 text-center">
        <h2 className="mb-2 text-3xl font-semibold">Track your games</h2>
        <p className="text-gray-600">
          Search for a game and add it to your backlog.
        </p>
      </div>

      {/* SEARCH */}
      <GameSearch />
    </section>
  );
}
