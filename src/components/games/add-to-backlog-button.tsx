"use client";

import { useState } from "react";
import { addGameLog } from "../../server/actions/add-game-log";
import { signIn, useSession } from "next-auth/react";

type AddToBacklogButtonProps = {
  game: any;
  status?: "backlog" | "playing" | "completed" | "dropped";
  libraryStatus?: string | null;
  onAdded?: (status: string) => void;
  className?: string;
  stopPropagation?: boolean;
};

function formatStatus(status?: string | null) {
  if (!status) return null;

  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function AddToBacklogButton({
  game,
  status = "backlog",
  libraryStatus = null,
  onAdded,
  className = "",
  stopPropagation = false,
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

      await addGameLog(game, status);

      onAdded?.(status);
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
        disabled={isAdding || isInLibrary|| isCheckingSession}
        onClick={(e) => {
          if (stopPropagation) {
            e.stopPropagation();
          }

          handleAdd();
        }}
        className={`rounded-lg px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-80 ${className}`}
      >
        {isCheckingSession
          ? "Checking..."
          : isAdding
            ? "Adding..."
            : isInLibrary
              ? `In Library ✓${
                  libraryStatus ? ` (${formatStatus(libraryStatus)})` : ""
                }`
              : session
                ? "+ Backlog"
                : "Sign in to add"}
      </button>

      {error && (
        <p className="rounded bg-red-600 px-3 py-1 text-xs font-medium text-white">
          {error}
        </p>
      )}
    </div>
  );
}