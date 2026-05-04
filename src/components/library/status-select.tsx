"use client";

import { updateGameStatus } from "../../server/actions/update-game-status";

type Props = {
  gameLogId: string;
  currentStatus: string;
};

export function StatusSelect({ gameLogId, currentStatus }: Props) {
  return (
    <select
      value={currentStatus}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => updateGameStatus(gameLogId, e.target.value)}
      className="rounded-lg border border-white/20 bg-white px-3 py-2 text-sm font-medium text-gray-900 shadow transition hover:bg-gray-100"
    >
      <option value="backlog">Backlog</option>
      <option value="playing">Playing</option>
      <option value="completed">Completed</option>
      <option value="dropped">Dropped</option>
    </select>
  );
}