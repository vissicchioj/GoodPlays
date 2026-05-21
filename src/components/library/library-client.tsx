"use client";

import { useMemo, useState } from "react";
import { LibraryGameCard } from "./library-game-card";

type GameStatus = "all" | "backlog" | "playing" | "completed" | "dropped";

type Platform = {
  id?: string | number;
  name?: string;
  abbreviation?: string;
};

type Genre = {
  id?: string | number;
  name?: string;
};

type LibraryEntry = {
  id: string;
  status: "backlog" | "playing" | "completed" | "dropped";
  game: {
    id: string;
    igdbId?: number | null;
    slug?: string | null;
    title: string;
    summary?: string | null;
    coverUrl?: string | null;
    releaseDate?: Date | string | null;
    totalRating?: number | null;
    platforms?: Platform[] | null;
    genres?: Genre[] | null;
  };
};

type LibraryClientProps = {
  library: LibraryEntry[];
};

const statusFilters: {
  label: string;
  value: GameStatus;
}[] = [
  { label: "All", value: "all" },
  { label: "Backlog", value: "backlog" },
  { label: "Playing", value: "playing" },
  { label: "Completed", value: "completed" },
  { label: "Dropped", value: "dropped" },
];

function getStatusLabel(status: GameStatus) {
  return statusFilters.find((filter) => filter.value === status)?.label ?? status;
}

function getGameGenres(entry: LibraryEntry) {
  return entry.game.genres ?? [];
}

export function LibraryClient({ library }: LibraryClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<GameStatus>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");


  const counts = useMemo(() => {
    return {
      all: library.length,
      backlog: library.filter((entry) => entry.status === "backlog").length,
      playing: library.filter((entry) => entry.status === "playing").length,
      completed: library.filter((entry) => entry.status === "completed").length,
      dropped: library.filter((entry) => entry.status === "dropped").length,
    };
  }, [library]);

  const availableGenres = useMemo(() => {
    const genreMap = new Map<string, number>();

    for (const entry of library) {
      for (const genre of getGameGenres(entry)) {
        if (!genre.name) continue;

        genreMap.set(genre.name, (genreMap.get(genre.name) ?? 0) + 1);
      }
    }

    return Array.from(genreMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [library]);

  const filteredLibrary = useMemo(() => {
    return library.filter((entry) => {
      const matchesStatus =
        selectedStatus === "all" || entry.status === selectedStatus;

      const matchesGenre =
        selectedGenre === "all" ||
        getGameGenres(entry).some((genre) => genre.name === selectedGenre);

      return matchesStatus && matchesGenre;
    });
  }, [library, selectedStatus, selectedGenre]);

  function clearFilters() {
    setSelectedStatus("all");
    setSelectedGenre("all");
  }

  if (library.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <h3 className="mb-2 text-xl font-semibold">Your library is empty</h3>
        <p className="mb-6 text-gray-600">
          Start discovering games and add them to your backlog.
        </p>

        <a
          href="/"
          className="inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:scale-105 hover:opacity-80"
        >
          Discover games
        </a>
      </div>
    );
  }

  return (
    <section>
      {/* FILTER PANEL */}
      <div className="mb-8 space-y-6 rounded-xl bg-white p-4 shadow">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Filter your library</h3>

          <p className="text-sm text-gray-500">
            Showing {filteredLibrary.length} of {library.length} games
          </p>
        </div>

        {/* STATUS FILTERS */}
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Status
          </h4>

          <div className="flex flex-wrap gap-2">
            {statusFilters.map((filter) => {
              const isActive = selectedStatus === filter.value;
              const count = counts[filter.value];

              return (
                <button
                  key={filter.value}
                  onClick={() => setSelectedStatus(filter.value)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-black text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {filter.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* GENRE FILTERS */}
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Genre
          </h4>

          {availableGenres.length === 0 ? (
            <p className="text-sm text-gray-500">
              No genre data available yet. Add or re-add games from Discover to save genres.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedGenre("all")}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedGenre === "all"
                    ? "bg-black text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                All Genres
              </button>

              {availableGenres.map((genre) => {
                const isActive = selectedGenre === genre.name;

                return (
                  <button
                    key={genre.name}
                    onClick={() => setSelectedGenre(genre.name)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      isActive
                        ? "bg-black text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {genre.name} ({genre.count})
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* CLEAR FILTERS */}
        {(selectedStatus !== "all" || selectedGenre !== "all") && (
          <button
            onClick={clearFilters}
            className="text-sm font-medium text-gray-600 underline transition hover:text-black"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* FILTERED EMPTY STATE */}
      {filteredLibrary.length === 0 ? (
        <div className="rounded-xl bg-white p-8 text-center shadow">
          <h3 className="mb-2 text-xl font-semibold">No games match these filters</h3>

          <p className="mb-4 text-gray-600">
            Try changing the selected status or genre.
          </p>

          <button
            onClick={clearFilters}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:scale-105 hover:opacity-80"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h3 className="text-2xl font-semibold">
                {selectedStatus === "all"
                  ? "All Games"
                  : getStatusLabel(selectedStatus)}
              </h3>

              <p className="text-sm text-gray-500">
                {filteredLibrary.length}{" "}
                {filteredLibrary.length === 1 ? "game" : "games"}
                {selectedGenre !== "all" ? ` in ${selectedGenre}` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredLibrary.map((entry) => (
              <LibraryGameCard key={entry.id} entry={entry} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}