"use client";

import { useOptimistic, useState, useTransition } from "react";
import { updateGameStatus } from "../../server/actions/update-game-status";
import { GAME_STATUSES, STATUS_LABELS } from "../../lib/game-status";

type Props = {
  gameLogId: string;
  currentStatus: string;
};

export function StatusSelect({ gameLogId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // useOptimistic shows the new status immediately, before the server answers.
  // When the transition finishes, React goes back to `currentStatus` from the
  // server: the new value if the save worked, or the old one if it failed.
  const [optimisticStatus, setOptimisticStatus] = useOptimistic(currentStatus);

  function handleChange(nextStatus: string) {
    setError(null);

    startTransition(async () => {
      setOptimisticStatus(nextStatus);

      try {
        await updateGameStatus(gameLogId, nextStatus);
      } catch (err) {
        console.error("Failed to update status:", err);
        setError("Could not update status");
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <select
        aria-label="Game status"
        value={optimisticStatus}
        disabled={isPending}
        onChange={(e) => handleChange(e.target.value)}
        className="rounded-lg border border-white/20 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow transition hover:bg-gray-100 disabled:cursor-wait disabled:opacity-70"
      >
        {GAME_STATUSES.map((status) => (
          <option key={status} value={status}>
            {STATUS_LABELS[status]}
          </option>
        ))}
      </select>

      {error && (
        <p
          role="alert"
          className="rounded bg-red-600 px-2 py-1 text-xs font-medium text-white"
        >
          {error}
        </p>
      )}
    </div>
  );
}
