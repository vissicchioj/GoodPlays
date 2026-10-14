import type { GameStatus } from "@prisma/client";

// Single source of truth for the four library statuses.
//
// `Record<GameStatus, string>` makes TypeScript check this object against the
// GameStatus enum Prisma generates from schema.prisma: if a status is ever added
// to the schema, this file stops compiling until it gets a label here.
//
// `import type` is erased at build time, so this file is safe to use in Client
// Components without pulling the Prisma client into the browser bundle.
export const STATUS_LABELS: Record<GameStatus, string> = {
  backlog: "Backlog",
  playing: "Playing",
  completed: "Completed",
  dropped: "Dropped",
};

export const GAME_STATUSES = Object.keys(STATUS_LABELS) as GameStatus[];

// Runtime check for values that come from the client (or anywhere untrusted).
export function isGameStatus(value: unknown): value is GameStatus {
  return typeof value === "string" && Object.hasOwn(STATUS_LABELS, value);
}

export function getStatusLabel(status: string) {
  return isGameStatus(status) ? STATUS_LABELS[status] : status;
}
