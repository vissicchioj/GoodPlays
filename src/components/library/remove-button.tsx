"use client";

import { useEffect, useState, useTransition } from "react";
import { removeGameLog } from "../../server/actions/remove-game-log";

type Props = {
  gameLogId: string;
  gameTitle: string;
};

// Two-step remove: the first click asks for confirmation, the second removes.
// This prevents losing a game (and its tags) to a single accidental click.
export function RemoveButton({ gameLogId, gameTitle }: Props) {
  const [isConfirming, setIsConfirming] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // If the user doesn't confirm within a few seconds, go back to "Remove".
  useEffect(() => {
    if (!isConfirming) return;

    const timer = setTimeout(() => setIsConfirming(false), 4000);
    return () => clearTimeout(timer);
  }, [isConfirming]);

  function handleClick() {
    if (!isConfirming) {
      setError(null);
      setIsConfirming(true);
      return;
    }

    // useTransition gives us `isPending` while the server action runs, so the
    // button can show "Removing..." and ignore extra clicks.
    startTransition(async () => {
      try {
        await removeGameLog(gameLogId);
        // On success the library refreshes and this card disappears.
      } catch (err) {
        console.error("Failed to remove game:", err);
        setError("Could not remove game");
        setIsConfirming(false);
      }
    });
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        aria-label={
          isConfirming
            ? `Confirm removing ${gameTitle} from your library`
            : `Remove ${gameTitle} from your library`
        }
        className={`rounded-lg px-3 py-2 text-sm font-medium text-white shadow transition disabled:cursor-not-allowed disabled:opacity-70 ${
          isConfirming
            ? "bg-red-700 ring-2 ring-white hover:bg-red-800"
            : "bg-red-600 hover:bg-red-700"
        }`}
      >
        {isPending
          ? "Removing..."
          : isConfirming
            ? "Confirm remove?"
            : "Remove"}
      </button>

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
