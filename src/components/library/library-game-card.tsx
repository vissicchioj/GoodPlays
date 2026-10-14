"use client";

import { useState } from "react";
import { StatusSelect } from "./status-select";
import { RemoveButton } from "./remove-button";
import { GameTagManager } from "./game-tag-manager";
import { GameModal, type ModalGame } from "../games/game-modal";
import { getIgdbCoverUrl } from "../../lib/igdb-images";
import type { LibraryEntry } from "../../server/queries/get-user-library";
import type { TagSummary } from "../../lib/tags";

type LibraryGameCardProps = {
  entry: LibraryEntry;
  allTags: TagSummary[];
};

// Library rows come from our database (title, coverUrl, releaseDate as a Date...)
// but the shared modal expects IGDB-shaped data (name, cover.url, a Unix timestamp...).
function toModalGame(game: LibraryEntry["game"]): ModalGame {
  return {
    id: game.igdbId ?? game.id,
    slug: game.slug ?? undefined,
    name: game.title,
    summary: game.summary ?? undefined,
    cover: game.coverUrl ? { url: game.coverUrl } : undefined,
    first_release_date: game.releaseDate
      ? Math.floor(new Date(game.releaseDate).getTime() / 1000)
      : undefined,
    total_rating: game.totalRating ?? undefined,
    platforms: game.platforms,
    genres: game.genres,
  };
}

export function LibraryGameCard({ entry, allTags }: LibraryGameCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const coverUrl = getIgdbCoverUrl(entry.game.coverUrl);

  return (
    <>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-900 shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        {/* COVER */}
        <img
          src={coverUrl}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* DARK OVERLAY */}
        <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/50" />

        {/* OPEN DETAILS: a real button covering the card (see GameCard) */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label={`View details for ${entry.game.title}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        />

        {/* HOVER CONTROLS (desktop / keyboard only)
            Previously these were only hidden with opacity-0, so on a phone a tap
            in the middle of the cover could hit the invisible Remove button.
            pointer-events-none means invisible controls can't be tapped; phone
            users tap the card and manage the game from the modal. */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-0 transition duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
          <div className="pointer-events-none flex flex-col items-center gap-3 px-4 group-focus-within:pointer-events-auto group-hover:pointer-events-auto">
            <StatusSelect gameLogId={entry.id} currentStatus={entry.status} />

            <RemoveButton gameLogId={entry.id} gameTitle={entry.game.title} />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <GameModal
          game={toModalGame(entry.game)}
          onClose={() => setIsModalOpen(false)}
          actions={
            <div className="space-y-5">
              <div className="flex flex-wrap items-start gap-3">
                <StatusSelect
                  gameLogId={entry.id}
                  currentStatus={entry.status}
                />

                <RemoveButton
                  gameLogId={entry.id}
                  gameTitle={entry.game.title}
                />
              </div>

              <GameTagManager
                gameLogId={entry.id}
                currentTags={entry.tags}
                allTags={allTags}
              />
            </div>
          }
        />
      )}
    </>
  );
}
