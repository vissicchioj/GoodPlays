"use client";

import { useState, useTransition } from "react";
import { renameLibraryTag } from "../../server/actions/rename-library-tag";
import { deleteLibraryTag } from "../../server/actions/delete-library-tag";
import { TAG_NAME_MAX_LENGTH, type TagSummary } from "../../lib/tags";

type TagSettingsProps = {
  tags: TagSummary[];
  // How many games use each tag, keyed by tag ID (for the delete warning).
  usageCounts: Map<string, number>;
};

// "Manage tags" panel in the Library filters: rename or delete your tags.
export function TagSettings({ tags, usageCounts }: TagSettingsProps) {
  return (
    <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
      {tags.map((tag) => (
        <TagRow key={tag.id} tag={tag} usageCount={usageCounts.get(tag.id) ?? 0} />
      ))}
    </ul>
  );
}

// Each row has its own state (editing, confirming, saving), so it's a separate
// component. Rows don't interfere with each other.
function TagRow({ tag, usageCount }: { tag: TagSummary; usageCount: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(tag.name);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function startEditing() {
    setDraftName(tag.name);
    setError(null);
    setIsConfirmingDelete(false);
    setIsEditing(true);
  }

  function handleRename() {
    setError(null);

    startTransition(async () => {
      try {
        const result = await renameLibraryTag(tag.id, draftName);

        if (!result.ok) {
          setError(result.error);
          return;
        }

        setIsEditing(false);
      } catch (err) {
        console.error("Failed to rename tag:", err);
        setError("Could not rename tag");
      }
    });
  }

  function handleDelete() {
    setError(null);

    startTransition(async () => {
      try {
        await deleteLibraryTag(tag.id);
        // On success the library refreshes and this row disappears.
      } catch (err) {
        console.error("Failed to delete tag:", err);
        setError("Could not delete tag");
        setIsConfirmingDelete(false);
      }
    });
  }

  return (
    <li className="space-y-2 px-3 py-2">
      {isEditing ? (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            handleRename();
          }}
        >
          <input
            aria-label={`New name for tag ${tag.name}`}
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            maxLength={TAG_NAME_MAX_LENGTH}
            autoFocus
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isPending || !draftName.trim()}
              className="rounded-lg bg-black px-3 py-1.5 text-sm font-medium text-white transition hover:opacity-80 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              disabled={isPending}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : isConfirmingDelete ? (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-700">
            Delete <span className="font-semibold">{tag.name}</span>?
            {usageCount > 0 &&
              ` It will be removed from ${usageCount} ${usageCount === 1 ? "game" : "games"}.`}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isPending}
              className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {isPending ? "Deleting..." : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setIsConfirmingDelete(false)}
              disabled={isPending}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-medium text-gray-900">
            {tag.name}{" "}
            <span className="font-normal text-gray-500">({usageCount})</span>
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={startEditing}
              className="rounded-lg px-2 py-1 text-sm font-medium text-gray-600 underline transition hover:text-black"
            >
              Rename
            </button>
            <button
              type="button"
              onClick={() => {
                setError(null);
                setIsConfirmingDelete(true);
              }}
              className="rounded-lg px-2 py-1 text-sm font-medium text-red-600 underline transition hover:text-red-800"
            >
              Delete
            </button>
          </div>
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
    </li>
  );
}
