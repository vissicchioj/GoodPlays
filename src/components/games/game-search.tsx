"use client";

import { useEffect, useRef, useState } from "react";
import { GameCard } from "./game-card";
import type { DiscoverGame } from "../../types/igdb";

type SearchOutcome = {
  games: DiscoverGame[];
  error: string | null;
};

// Calls our API route and always resolves to { games, error }, so the component
// never has to deal with a thrown error or an unexpected response shape.
async function requestGames(term: string): Promise<SearchOutcome> {
  try {
    const res = await fetch(`/api/games/search?q=${encodeURIComponent(term)}`);
    const data: unknown = await res.json();

    if (!res.ok || !Array.isArray(data)) {
      const message =
        typeof data === "object" &&
        data !== null &&
        "error" in data &&
        typeof data.error === "string"
          ? data.error
          : "Search failed. Please try again.";

      return { games: [], error: message };
    }

    return {
      games: (data as DiscoverGame[]).filter((game) => Boolean(game?.id)),
      error: null,
    };
  } catch {
    return {
      games: [],
      error: "Could not reach the server. Check your connection and try again.",
    };
  }
}

export function GameSearch() {
  const [query, setQuery] = useState("");
  // The term the current results belong to. Kept separate from `query`, so the
  // heading doesn't change while you're still typing.
  const [activeQuery, setActiveQuery] = useState("");
  const [results, setResults] = useState<DiscoverGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Counts requests so that only the newest one updates the screen. Without
  // this, a slow earlier search could finish last and overwrite newer results.
  const latestRequestId = useRef(0);

  function applyOutcome(requestId: number, outcome: SearchOutcome) {
    if (requestId !== latestRequestId.current) return; // stale response, ignore it

    setResults(outcome.games);
    setError(outcome.error);
    setLoading(false);
  }

  // Load trending games once on first render. (This repeats applyOutcome's
  // logic inline because an effect should only use values it lists as
  // dependencies; state setters and refs never change, so [] is accurate.)
  useEffect(() => {
    const requestId = ++latestRequestId.current;

    requestGames("").then((outcome) => {
      if (requestId !== latestRequestId.current) return;

      setResults(outcome.games);
      setError(outcome.error);
      setLoading(false);
    });
  }, []);

  async function runSearch(term: string) {
    const requestId = ++latestRequestId.current;

    setLoading(true);
    setActiveQuery(term.trim());

    applyOutcome(requestId, await requestGames(term));
  }

  return (
    <div>
      {/* SEARCH BAR
          A <form> handles both the Search button and pressing Enter, so the
          separate onKeyDown handler is no longer needed. Submitting an empty
          search goes back to trending games. */}
      <form
        role="search"
        className="mb-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          runSearch(query);
        }}
      >
        <input
          type="search"
          aria-label="Search for a game"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a game..."
          className="min-w-0 flex-1 rounded border bg-white px-3 py-2 transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded bg-black px-4 py-2 text-white transition hover:scale-105 hover:opacity-80 disabled:cursor-wait disabled:opacity-60"
        >
          Search
        </button>
      </form>

      <h2 className="mb-4 text-2xl font-semibold">
        {activeQuery ? `Results for "${activeQuery}"` : "Trending Games"}
      </h2>

      {/* STATES */}
      {loading ? (
        <p className="mb-4 animate-pulse text-gray-500">Searching...</p>
      ) : error ? (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {error}
        </p>
      ) : results.length === 0 ? (
        <p className="text-gray-500">No games found.</p>
      ) : null}

      {/* RESULTS: two columns on phones instead of one huge cover per row */}
      <div
        aria-busy={loading}
        className={`grid grid-cols-2 gap-4 transition-opacity sm:grid-cols-3 sm:gap-6 ${
          loading ? "opacity-50" : ""
        }`}
      >
        {results.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}
