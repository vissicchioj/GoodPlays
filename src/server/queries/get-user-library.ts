import { prisma } from "../../lib/db";
import type { IgdbGenre, IgdbPlatform } from "../../types/igdb";

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizeId(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? value
    : undefined;
}

// Game.platforms and Game.genres are Prisma Json columns, typed as JsonValue.
// TypeScript can't know what's inside, so we check each item at runtime and
// build properly typed arrays before handing them to the UI.
function normalizePlatforms(value: unknown): IgdbPlatform[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isObject).map((platform) => ({
    id: normalizeId(platform.id),
    name: typeof platform.name === "string" ? platform.name : undefined,
    abbreviation:
      typeof platform.abbreviation === "string"
        ? platform.abbreviation
        : undefined,
  }));
}

function normalizeGenres(value: unknown): IgdbGenre[] {
  if (!Array.isArray(value)) return [];

  return value.filter(isObject).map((genre) => ({
    id: normalizeId(genre.id),
    name: typeof genre.name === "string" ? genre.name : undefined,
  }));
}

export async function getUserLibrary(userId: string) {
  const library = await prisma.gameLog.findMany({
    where: {
      userId,
    },
    include: {
      game: true,
      tags: {
        include: {
          // Only the fields the UI needs; no need to send userId/createdAt to the browser.
          tag: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return library.map((entry) => ({
    ...entry,
    game: {
      ...entry.game,
      platforms: normalizePlatforms(entry.game.platforms),
      genres: normalizeGenres(entry.game.genres),
    },
  }));
}

// The type of one library entry, derived from the query above. Components import
// this (with `import type`) instead of re-declaring the shape by hand, so if the
// query changes, every component's types update with it.
export type LibraryEntry = Awaited<ReturnType<typeof getUserLibrary>>[number];
