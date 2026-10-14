"use client";

import { useState, useTransition } from "react";
import { createLibraryTag } from "../../server/actions/create-library-tag";
import { addTagToGameLog } from "../../server/actions/add-tag-to-game-log";
import { removeTagFromGameLog } from "../../server/actions/remove-tag-from-game-log";
import { TAG_NAME_MAX_LENGTH, type TagSummary } from "../../lib/tags";

type GameLogTag = {
  id: string;
  tag: TagSummary;
};

type GameTagManagerProps = {
  gameLogId: string;
  currentTags: GameLogTag[];
  allTags: TagSummary[];
};

export function GameTagManager({
  gameLogId,
  currentTags,
  allTags,
}: GameTagManagerProps) {
  const [newTagName, setNewTagName] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [error, setError] = useState<string | null>(null);

  // One transition for every tag change in this panel, so the controls are
  // disabled while any of them is saving and can't be double-submitted.
  const [isPending, startTransition] = useTransition();

  const currentTagIds = new Set(currentTags.map((gameLogTag) => gameLogTag.tag.id));
  const availableTags = allTags.filter((tag) => !currentTagIds.has(tag.id));

  function handleCreateTag() {
    if (!newTagName.trim()) return;

    setError(null);

    startTransition(async () => {
      try {
        const result = await createLibraryTag(newTagName);

        // Expected problems (too long, etc.) come back as a value with a
        // message we can show; see TagActionResult in lib/tags.ts.
        if (!result.ok) {
          setError(result.error);
          return;
        }

        await addTagToGameLog(gameLogId, result.tag.id);
        setNewTagName("");
      } catch (err) {
        console.error("Failed to create tag:", err);
        setError("Could not create tag");
      }
    });
  }

  function handleAddExistingTag() {
    if (!selectedTagId) return;

    setError(null);

    startTransition(async () => {
      try {
        await addTagToGameLog(gameLogId, selectedTagId);
        setSelectedTagId("");
      } catch (err) {
        console.error("Failed to add tag:", err);
        setError("Could not add tag");
      }
    });
  }

  function handleRemoveTag(gameLogTagId: string) {
    setError(null);

    startTransition(async () => {
      try {
        await removeTagFromGameLog(gameLogTagId);
      } catch (err) {
        console.error("Failed to remove tag:", err);
        setError("Could not remove tag");
      }
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <h4 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Custom Tags
        </h4>

        {currentTags.length === 0 ? (
          <p className="text-sm text-gray-500">No custom tags yet.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {currentTags.map((gameLogTag) => (
              <button
                key={gameLogTag.id}
                type="button"
                onClick={() => handleRemoveTag(gameLogTag.id)}
                disabled={isPending}
                aria-label={`Remove tag ${gameLogTag.tag.name} from this game`}
                className="rounded-full bg-black px-3 py-1 text-sm font-medium text-white transition hover:bg-red-600 disabled:cursor-wait disabled:opacity-60"
                title="Click to remove tag"
              >
                {gameLogTag.tag.name} ×
              </button>
            ))}
          </div>
        )}
      </div>

      {availableTags.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="Add an existing tag"
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">Add existing tag...</option>
            {availableTags.map((tag) => (
              <option key={tag.id} value={tag.id}>
                {tag.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={handleAddExistingTag}
            disabled={!selectedTagId || isPending}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            Add
          </button>
        </div>
      )}

      {/* A <form> means pressing Enter in the input creates the tag. */}
      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          handleCreateTag();
        }}
      >
        <input
          aria-label="New tag name"
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          maxLength={TAG_NAME_MAX_LENGTH}
          placeholder="Create new tag..."
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        />

        <button
          type="submit"
          disabled={!newTagName.trim() || isPending}
          className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Saving..." : "Create"}
        </button>
      </form>

      {error && (
        <p
          role="alert"
          className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white"
        >
          {error}
        </p>
      )}
    </div>
  );
}
