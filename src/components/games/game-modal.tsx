"use client";

import { useEffect, useId, useRef } from "react";
import type { ReactNode } from "react";
import { getIgdbCoverUrl } from "../../lib/igdb-images";
import type { IgdbGenre, IgdbPlatform } from "../../types/igdb";

// The modal works with IGDB-shaped data. Discover passes IGDB games directly;
// the Library maps its database rows into this shape first.
export type ModalGame = {
  id: string | number;
  slug?: string;
  name: string;
  summary?: string;
  cover?: {
    url?: string;
  };
  first_release_date?: number;
  total_rating?: number;
  platforms?: IgdbPlatform[];
  genres?: IgdbGenre[];
};

type GameModalProps = {
  game: ModalGame;
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

function getPlatformLabel(platform: IgdbPlatform) {
  return platform.abbreviation ?? platform.name ?? "Unknown";
}

export function GameModal({ game, onClose, actions }: GameModalProps) {
  const coverUrl = getIgdbCoverUrl(game.cover?.url);
  const titleId = useId();
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // On open: stop the page behind the modal from scrolling (important on phones,
  // where the background otherwise scrolls along with your finger), and move
  // keyboard focus into the modal. On close: undo both.
  useEffect(() => {
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  // Close on Escape.
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto overscroll-contain bg-black/70 px-4 py-6"
      onClick={onClose}
    >
      <div className="flex min-h-full items-start justify-center md:items-center">
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl md:max-h-[90vh] md:grid-cols-[340px_1fr]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* CLOSE BUTTON
              On phones the whole modal scrolls, so the button is `fixed` to the
              screen corner and stays reachable however far down you scroll.
              From md up only the details column scrolls, so it can sit inside
              the modal again. */}
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="fixed right-6 top-8 z-20 rounded-full bg-black/70 px-3 py-1 text-sm font-medium text-white shadow transition hover:bg-black md:absolute md:right-4 md:top-4"
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
            <h2
              id={titleId}
              className="mb-4 pr-10 text-2xl font-bold text-gray-900 md:text-3xl"
            >
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
