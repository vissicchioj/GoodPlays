"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GameStatus } from "@prisma/client";
import { LibraryGameCard } from "./library-game-card";
import { TagSettings } from "./tag-settings";
import { GAME_STATUSES, STATUS_LABELS } from "../../lib/game-status";
import type { LibraryEntry } from "../../server/queries/get-user-library";
import type { TagSummary } from "../../lib/tags";

type StatusFilter = "all" | GameStatus;

type LibraryClientProps = {
  library: LibraryEntry[];
  // All of the user's tags, loaded on the server (see get-user-tags.ts).
  allTags: TagSummary[];
};

// The same pill-shaped toggle was written out three times (status, genre, tag),
// so it's now one small component.
function FilterChip({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count?: number;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
        isActive
          ? "bg-black text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
      }`}
    >
      {label}
      {count !== undefined && ` (${count})`}
    </button>
  );
}

export function LibraryClient({ library, allTags }: LibraryClientProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusFilter>("all");
  const [selectedGenre, setSelectedGenre] = useState<string>("all");
  const [selectedTagId, setSelectedTagId] = useState<string>("all");
  const [isManagingTags, setIsManagingTags] = useState(false);

  // If the selected tag gets deleted, fall back to "all" instead of filtering
  // by a tag that no longer exists (which would show zero games).
  const activeTagId = allTags.some((tag) => tag.id === selectedTagId)
    ? selectedTagId
    : "all";

  const statusCounts = useMemo(() => {
    const counts: Record<StatusFilter, number> = {
      all: library.length,
      backlog: 0,
      playing: 0,
      completed: 0,
      dropped: 0,
    };

    for (const entry of library) {
      counts[entry.status] += 1;
    }

    return counts;
  }, [library]);

  const availableGenres = useMemo(() => {
    const genreMap = new Map<string, number>();

    for (const entry of library) {
      for (const genre of entry.game.genres) {
        if (!genre.name) continue;

        genreMap.set(genre.name, (genreMap.get(genre.name) ?? 0) + 1);
      }
    }

    return Array.from(genreMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [library]);

  // How many games use each tag (shown on the chips and in the delete warning).
  const tagUsageCounts = useMemo(() => {
    const counts = new Map<string, number>();

    for (const entry of library) {
      for (const gameLogTag of entry.tags) {
        counts.set(gameLogTag.tag.id, (counts.get(gameLogTag.tag.id) ?? 0) + 1);
      }
    }

    return counts;
  }, [library]);

  const sortedTags = useMemo(
    () => [...allTags].sort((a, b) => a.name.localeCompare(b.name)),
    [allTags],
  );

  // Status, genre and tag filters combine: a game must match all three.
  const filteredLibrary = useMemo(() => {
    return library.filter((entry) => {
      const matchesStatus =
        selectedStatus === "all" || entry.status === selectedStatus;

      const matchesGenre =
        selectedGenre === "all" ||
        entry.game.genres.some((genre) => genre.name === selectedGenre);

      const matchesTag =
        activeTagId === "all" ||
        entry.tags.some((gameLogTag) => gameLogTag.tag.id === activeTagId);

      return matchesStatus && matchesGenre && matchesTag;
    });
  }, [library, selectedStatus, selectedGenre, activeTagId]);

  const activeTagName = sortedTags.find((tag) => tag.id === activeTagId)?.name;

  const hasActiveFilters =
    selectedStatus !== "all" || selectedGenre !== "all" || activeTagId !== "all";

  function clearFilters() {
    setSelectedStatus("all");
    setSelectedGenre("all");
    setSelectedTagId("all");
  }

  if (library.length === 0) {
    return (
      <div className="rounded-xl bg-white p-8 text-center shadow">
        <h3 className="mb-2 text-xl font-semibold">Your library is empty</h3>
        <p className="mb-6 text-gray-600">
          Start discovering games and add them to your backlog.
        </p>

        <Link
          href="/"
          className="inline-block rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:scale-105 hover:opacity-80"
        >
          Discover games
        </Link>
      </div>
    );
  }

  return (
    <section>
      {/* FILTER PANEL */}
      <div className="mb-8 space-y-6 rounded-xl bg-white p-4 shadow">
        <div className="flex flex-wrap items-center justify-between gap-2">
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
            <FilterChip
              label="All"
              count={statusCounts.all}
              isActive={selectedStatus === "all"}
              onClick={() => setSelectedStatus("all")}
            />

            {GAME_STATUSES.map((status) => (
              <FilterChip
                key={status}
                label={STATUS_LABELS[status]}
                count={statusCounts[status]}
                isActive={selectedStatus === status}
                onClick={() => setSelectedStatus(status)}
              />
            ))}
          </div>
        </div>

        {/* GENRE FILTERS */}
        <div>
          <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
            Genre
          </h4>

          {availableGenres.length === 0 ? (
            <p className="text-sm text-gray-500">
              No genre data available yet. Add or re-add games from Discover to
              save genres.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="All Genres"
                isActive={selectedGenre === "all"}
                onClick={() => setSelectedGenre("all")}
              />

              {availableGenres.map((genre) => (
                <FilterChip
                  key={genre.name}
                  label={genre.name}
                  count={genre.count}
                  isActive={selectedGenre === genre.name}
                  onClick={() => setSelectedGenre(genre.name)}
                />
              ))}
            </div>
          )}
        </div>

        {/* TAG FILTERS */}
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h4 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
              Tags
            </h4>

            {sortedTags.length > 0 && (
              <button
                type="button"
                onClick={() => setIsManagingTags((value) => !value)}
                className="text-sm font-medium text-gray-600 underline transition hover:text-black"
              >
                {isManagingTags ? "Done" : "Manage tags"}
              </button>
            )}
          </div>

          {sortedTags.length === 0 ? (
            <p className="text-sm text-gray-500">
              No custom tags yet. Open a game to create one.
            </p>
          ) : isManagingTags ? (
            <TagSettings tags={sortedTags} usageCounts={tagUsageCounts} />
          ) : (
            <div className="flex flex-wrap gap-2">
              <FilterChip
                label="All Tags"
                isActive={activeTagId === "all"}
                onClick={() => setSelectedTagId("all")}
              />

              {sortedTags.map((tag) => (
                <FilterChip
                  key={tag.id}
                  label={tag.name}
                  count={tagUsageCounts.get(tag.id) ?? 0}
                  isActive={activeTagId === tag.id}
                  onClick={() => setSelectedTagId(tag.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* CLEAR FILTERS */}
        {hasActiveFilters && (
          <button
            type="button"
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
          <h3 className="mb-2 text-xl font-semibold">
            No games match these filters
          </h3>

          <p className="mb-4 text-gray-600">
            Try changing the selected status, genre, or tag.
          </p>

          <button
            type="button"
            onClick={clearFilters}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:scale-105 hover:opacity-80"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-2xl font-semibold">
              {selectedStatus === "all"
                ? "All Games"
                : STATUS_LABELS[selectedStatus]}
            </h3>

            <p className="text-sm text-gray-500">
              {filteredLibrary.length}{" "}
              {filteredLibrary.length === 1 ? "game" : "games"}
              {selectedGenre !== "all" ? ` in ${selectedGenre}` : ""}
              {activeTagName ? ` tagged "${activeTagName}"` : ""}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6">
            {filteredLibrary.map((entry) => (
              <LibraryGameCard key={entry.id} entry={entry} allTags={sortedTags} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
