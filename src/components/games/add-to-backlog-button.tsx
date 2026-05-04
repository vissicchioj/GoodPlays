"use client";

import { useState } from "react";
import { addGameLog } from "../../server/actions/add-game-log";

type AddToBacklogButtonProps = {
  game: any;
  className?: string;
  stopPropagation?: boolean;
};

export function AddToBacklogButton({
  game,
  className = "",
  stopPropagation = false,
}: AddToBacklogButtonProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd() {
    try {
      setIsAdding(true);
      setError(null);

      await addGameLog({
        id: game.id,
        name: game.name,
        summary: game.summary,
        cover: game.cover,
        slug: game.slug,
        first_release_date: game.first_release_date,
        total_rating: game.total_rating,
        platforms: game.platforms,
        status: "backlog",
      });

      setIsAdded(true);
    } catch (err) {
      console.error("Failed to add game:", err);
      setError("Could not add game");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        disabled={isAdding || isAdded}
        onClick={(e) => {
          if (stopPropagation) {
            e.stopPropagation();
          }

          handleAdd();
        }}
        className={`rounded-lg px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-80 ${className}`}
      >
        {isAdding ? "Adding..." : isAdded ? "Added ✓" : "+ Backlog"}
      </button>

      {error && (
        <p className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white">
          {error}
        </p>
      )}
    </div>
  );
}