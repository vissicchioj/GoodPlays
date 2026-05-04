"use client";

import { useState } from "react";
import { GameModal } from "./game-modal";
import { AddToBacklogButton } from "./add-to-backlog-button";

type Props = {
  game: any;
};

export function GameCard({ game }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const cover = game.cover?.url
    ? `https:${game.cover.url.replace("t_thumb", "t_cover_big")}`
    : "/placeholder.png";

  return (
    <>
      <div
        onClick={() => setIsModalOpen(true)}
        className="group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl bg-gray-900 shadow"
      >
        {/* COVER */}
        <img
          src={cover}
          alt={game.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/40" />

        {/* HOVER CONTENT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 opacity-0 transition duration-300 group-hover:opacity-100">
          <AddToBacklogButton
            game={game}
            stopPropagation
            className="bg-white text-black hover:scale-105"
          />
        </div>
      </div>

      {isModalOpen && (
        <GameModal
          game={game}
          onClose={() => setIsModalOpen(false)}
          actions={
            <AddToBacklogButton
              game={game}
              className="bg-black text-white hover:bg-gray-800"
            />
          }
        />
      )}
    </>
  );
}