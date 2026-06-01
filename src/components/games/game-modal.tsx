"use client";

import { AddToBacklogButton } from "./add-to-backlog-button";
import type { ReactNode } from "react";

type Platform = {
  id?: number | string;
  name?: string;
  abbreviation?: string;
};

type Genre = {
  id?: number | string;
  name?: string;
};

type Game = {
  id: string;
  slug?: string;
  name: string;
  summary?: string;
  cover?: {
    url?: string;
  };
  first_release_date?: number;
  total_rating?: number;
  platforms?: Platform[];
  genres?: Genre[];
};

type GameModalProps = {
  game: Game;
  onClose: () => void;
  actions?: ReactNode;
};

function formatReleaseDate(timestamp?: number) {
  if (!timestamp) return "Unknown release date";

  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatRating(rating?: number) {
  if (!rating) return "No rating yet";

  return `${Math.round(rating)}/100`;
}

function getCoverUrl(game: Game) {
  if (!game.cover?.url) return "/placeholder.png";

  return `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`;
}

function getPlatformLabel(platform: Platform) {
  return platform.abbreviation ?? platform.name ?? "Unknown";
}

export function GameModal({ game, onClose, actions }: GameModalProps) {
  const coverUrl = getCoverUrl(game);

  return (
  <div
    className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-6"
    onClick={onClose}
  >
    <div className="flex min-h-full items-start justify-center md:items-center">
      <div
        className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl md:max-h-[90vh] md:grid-cols-[340px_1fr]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-white transition hover:bg-black"
        >
          ✕
        </button>

        {/* COVER */}
        <div className="bg-gray-900 p-4 md:flex md:items-center md:justify-center md:p-6">
          <img
            src={coverUrl}
            alt={game.name}
            className="mx-auto aspect-[3/4] max-h-[260px] w-auto rounded-xl object-cover shadow-lg md:max-h-[70vh] md:w-full md:max-w-[300px]"
          />
        </div>

        {/* DETAILS */}
        <div className="p-6 md:max-h-[90vh] md:overflow-y-auto md:p-8">
          <h2 className="mb-4 pr-10 text-2xl font-bold text-gray-900 md:text-3xl">
            {game.name}
          </h2>

          <div className="mb-3 flex flex-wrap gap-3 text-sm">
            <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
              {formatReleaseDate(game.first_release_date)}
            </span>

            <span className="rounded-full bg-blue-100 px-3 py-1 font-medium text-blue-700">
              Rating: {formatRating(game.total_rating)}
            </span>
          </div>

          {actions && (
            <div className="mb-6 rounded-xl border border-gray-200 bg-gray-50 p-4">
              {actions}
            </div>
          )}

          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Summary
            </h3>

            <p className="leading-7 text-gray-700">
              {game.summary ?? "No summary available for this game yet."}
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Genres
            </h3>

            {game.genres && game.genres.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {game.genres.map((genre) => (
                  <span
                    key={`${genre.id ?? genre.name}`}
                    className="rounded-lg border border-purple-200 bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 shadow-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Genre information unavailable.
              </p>
            )}
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
              Available On
            </h3>

            {game.platforms && game.platforms.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {game.platforms.map((platform) => (
                  <span
                    key={`${platform.id}-${platform.abbreviation ?? platform.name}`}
                    className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm"
                  >
                    {getPlatformLabel(platform)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Platform information unavailable.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
);
}