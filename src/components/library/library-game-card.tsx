"use client";

import { useState } from "react";
import { StatusSelect } from "./status-select";
import { RemoveButton } from "./remove-button";
import { GameModal } from "../games/game-modal";

type Platform = {
  id?: string | number;
  name?: string;
  abbreviation?: string;
};

type LibraryGameCardProps = {
  entry: {
    id: string;
    status: string;
    game: {
      id: string;
      igdbId?: number;
      slug?: string;
      title: string;
      summary?: string | null;
      coverUrl?: string | null;
      releaseDate?: Date | string | null;
      totalRating?: number | null;
      platforms?: Platform[] | null;
    };
  };
};

export function LibraryGameCard({ entry }: LibraryGameCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const coverUrl = entry.game.coverUrl
    ? `https:${entry.game.coverUrl.replace("t_thumb", "t_cover_big")}`
    : "/placeholder.png";

  const modalGame = {
    id: entry.game.igdbId ?? entry.game.id,
    slug: entry.game.slug,
    name: entry.game.title,
    summary: entry.game.summary ?? undefined,
    cover: entry.game.coverUrl
      ? {
          url: entry.game.coverUrl,
        }
      : undefined,
    first_release_date: entry.game.releaseDate
      ? Math.floor(new Date(entry.game.releaseDate).getTime() / 1000)
      : undefined,
    total_rating: entry.game.totalRating ?? undefined,
    platforms: entry.game.platforms ?? undefined,
  };

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl bg-gray-900 shadow transition duration-300 hover:-translate-y-1 hover:shadow-xl"
      >
        {/* COVER */}
        <img
          src={coverUrl}
          alt={entry.game.title}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* DARK OVERLAY */}
        <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/50" />

        {/* HOVER CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 opacity-0 transition duration-300 group-hover:opacity-100">
          <StatusSelect gameLogId={entry.id} currentStatus={entry.status} />

          <RemoveButton gameLogId={entry.id} />
        </div>
      </div>

      {isModalOpen && (
        <GameModal
          game={modalGame}
          onClose={() => setIsModalOpen(false)}
          actions={
            <div className="flex flex-wrap items-center gap-3">
              <StatusSelect
                gameLogId={entry.id}
                currentStatus={entry.status}
              />

              <RemoveButton gameLogId={entry.id} />
            </div>
          }
        />
      )}
    </>
  );
}