"use client";

import { useState } from "react";
import { addGameLog } from "../../server/actions/add-game-log";
import { signIn, useSession } from "next-auth/react";
import { getStatusLabel } from "../../lib/game-status";

type AddToBacklogButtonProps = {
  igdbId: number;
  libraryStatus?: string | null;
  onAdded?: (status: string) => void;
  className?: string;
};

export function AddToBacklogButton({
  igdbId,
  libraryStatus = null,
  onAdded,
  className = "",
}: AddToBacklogButtonProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isInLibrary = Boolean(libraryStatus);
  const isCheckingSession = sessionStatus === "loading";

  async function handleAdd() {
    if (isInLibrary || isAdding) return;

    if (!session) {
      signIn("github", {
        callbackUrl: window.location.href,
      });
      return;
    }

    try {
      setIsAdding(true);
      setError(null);

      // Only the IGDB ID goes to the server; it looks up the details itself.
      const result = await addGameLog(igdbId);

      onAdded?.(result.status);
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
        type="button"
        disabled={isAdding || isInLibrary || isCheckingSession}
        onClick={handleAdd}
        className={`rounded-lg px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-80 ${className}`}
      >
        {isCheckingSession
          ? "Checking..."
          : isAdding
            ? "Adding..."
            : isInLibrary && libraryStatus
              ? `In Library ✓ (${getStatusLabel(libraryStatus)})`
              : session
                ? "+ Backlog"
                : "Sign in to add"}
      </button>

      {error && (
        <p
          role="alert"
          className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white"
        >
          {error}
        </p>
      )}
    </div>
  );
}
