"use client";

import { useState } from "react";
import { GameModal } from "./game-modal";
import { AddToBacklogButton } from "./add-to-backlog-button";
import { getIgdbCoverUrl } from "../../lib/igdb-images";
import type { DiscoverGame } from "../../types/igdb";

type Props = {
  game: DiscoverGame;
};

export function GameCard({ game }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [libraryStatus, setLibraryStatus] = useState<string | null>(
    game.libraryStatus ?? null,
  );

  const cover = getIgdbCoverUrl(game.cover?.url);

  return (
    <>
      <div className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-900 shadow">
        <img
          src={cover}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        <div className="pointer-events-none absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/40" />

        {/* OPEN DETAILS
            A real <button> covering the whole card. It's focusable with Tab and
            works with Enter/Space, which a clickable <div> doesn't. */}
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          aria-label={`View details for ${game.name}`}
          className="absolute inset-0 z-10 cursor-pointer rounded-xl focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
        />

        {/* HOVER ACTION (desktop / keyboard only)
            Tailwind's hover: variants only apply on devices that can hover, so
            on phones this layer never becomes visible. pointer-events-none stops
            the invisible button from catching taps; phone users tap the card
            and use the button in the modal instead. It also shows up when a
            keyboard user tabs onto the card (group-focus-within). */}
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center opacity-0 transition duration-300 group-focus-within:opacity-100 group-hover:opacity-100">
          <div className="pointer-events-none group-focus-within:pointer-events-auto group-hover:pointer-events-auto">
            <AddToBacklogButton
              igdbId={game.id}
              libraryStatus={libraryStatus}
              onAdded={setLibraryStatus}
              className={
                libraryStatus
                  ? "bg-green-600 text-white"
                  : "bg-white text-black hover:scale-105"
              }
            />
          </div>
        </div>
      </div>

      {isModalOpen && (
        <GameModal
          game={game}
          onClose={() => setIsModalOpen(false)}
          actions={
            <AddToBacklogButton
              igdbId={game.id}
              libraryStatus={libraryStatus}
              onAdded={setLibraryStatus}
              className={
                libraryStatus
                  ? "bg-green-600 text-white"
                  : "bg-black text-white hover:bg-gray-800"
              }
            />
          }
        />
      )}
    </>
  );
}
