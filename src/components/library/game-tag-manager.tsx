"use client";

import { useState } from "react";
import { createLibraryTag } from "../../server/actions/create-library-tag";
import { addTagToGameLog } from "../../server/actions/add-tag-to-game-log";
import { removeTagFromGameLog } from "../../server/actions/remove-tag-from-game-log";

type LibraryTag = {
  id: string;
  name: string;
};

type GameLogTag = {
  id: string;
  tag: LibraryTag;
};

type GameTagManagerProps = {
  gameLogId: string;
  currentTags: GameLogTag[];
  allTags: LibraryTag[];
};

export function GameTagManager({
  gameLogId,
  currentTags,
  allTags,
}: GameTagManagerProps) {
  const [newTagName, setNewTagName] = useState("");
  const [selectedTagId, setSelectedTagId] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentTagIds = new Set(currentTags.map((tag) => tag.tag.id));

  const availableTags = allTags.filter((tag) => !currentTagIds.has(tag.id));

  async function handleCreateTag() {
    if (!newTagName.trim()) return;

    try {
      setIsCreating(true);
      setError(null);

      const createdTag = await createLibraryTag(newTagName);

      await addTagToGameLog(gameLogId, createdTag.id);

      setNewTagName("");
    } catch (err) {
      console.error("Failed to create tag:", err);
      setError("Could not create tag");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleAddExistingTag() {
    if (!selectedTagId) return;

    try {
      setIsAdding(true);
      setError(null);

      await addTagToGameLog(gameLogId, selectedTagId);

      setSelectedTagId("");
    } catch (err) {
      console.error("Failed to add tag:", err);
      setError("Could not add tag");
    } finally {
      setIsAdding(false);
    }
  }

  async function handleRemoveTag(gameLogTagId: string) {
    try {
      setError(null);
      await removeTagFromGameLog(gameLogTagId);
    } catch (err) {
      console.error("Failed to remove tag:", err);
      setError("Could not remove tag");
    }
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
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveTag(gameLogTag.id);
                }}
                className="rounded-full bg-black px-3 py-1 text-sm font-medium text-white transition hover:bg-red-600"
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
            value={selectedTagId}
            onChange={(e) => setSelectedTagId(e.target.value)}
            onClick={(e) => e.stopPropagation()}
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
            onClick={(e) => {
              e.stopPropagation();
              handleAddExistingTag();
            }}
            disabled={!selectedTagId || isAdding}
            className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAdding ? "Adding..." : "Add"}
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          value={newTagName}
          onChange={(e) => setNewTagName(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          placeholder="Create new tag..."
          className="flex-1 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm"
        />

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCreateTag();
          }}
          disabled={!newTagName.trim() || isCreating}
          className="rounded-lg bg-purple-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isCreating ? "Creating..." : "Create"}
        </button>
      </div>

      {error && (
        <p className="rounded bg-red-600 px-3 py-2 text-sm font-medium text-white">
          {error}
        </p>
      )}
    </div>
  );
}