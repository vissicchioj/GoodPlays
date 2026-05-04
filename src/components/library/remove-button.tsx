"use client";

import { removeGameLog } from "../../server/actions/remove-game-log";

export function RemoveButton({ gameLogId }: { gameLogId: string }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        removeGameLog(gameLogId);
      }}
      className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow transition hover:bg-red-700"
    >
      Remove
    </button>
  );
}