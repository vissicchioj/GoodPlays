"use client";
//<GameCard key={game.id} game={game} />
/*
<GameCard
  key={`${game.id}-${game.slug}`}
  game={game}
/>
*/
import { useEffect, useState } from "react";
import { searchGames } from "../../server/queries/search-games";
import { GameCard } from "./game-card";

export function GameSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
  fetchGames("");
  }, []);

  async function fetchGames(searchTerm: string) {
    setLoading(true);

    try {
      const res = await fetch(
        `/api/games/search?q=${encodeURIComponent(searchTerm)}`
      );

      const data = await res.json();
      console.log(data);

      setResults(
        data.filter((game: any) => game?.id)
      );
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch() {
    fetchGames(query);
  }

  return (
    <div>
      {/* SEARCH BAR */}
      <div className="flex gap-2 mb-6">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearch();
            }
          }}
          placeholder="Search for a game..."
          className="flex-1 border rounded px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <button
          onClick={handleSearch}
          className="bg-black text-white px-4 py-2 rounded hover:opacity-80 hover:scale-105 transition"
        >
          Search
        </button>
      </div>

      {/* STATES */}
      {loading && <p className="text-gray-500 animate-pulse">Searching...</p>}

      {!loading && results.length === 0 && (
      <p className="text-gray-500">
        No games found.
      </p>
      )}

      <h2 className="text-2xl font-semibold mb-4">
      {query ? "Search Results" : "Trending Games"}
      </h2>

      {/* RESULTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  );
}