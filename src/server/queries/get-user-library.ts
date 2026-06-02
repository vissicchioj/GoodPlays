import { prisma } from "../../lib/db";

type Platform = {
  id?: string | number;
  name?: string;
  abbreviation?: string;
};

type Genre = {
  id?: string | number;
  name?: string;
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function normalizePlatforms(value: unknown): Platform[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .map((platform) => ({
      id:
        typeof platform.id === "string" || typeof platform.id === "number"
          ? platform.id
          : undefined,
      name: typeof platform.name === "string" ? platform.name : undefined,
      abbreviation:
        typeof platform.abbreviation === "string"
          ? platform.abbreviation
          : undefined,
    }));
}

function normalizeGenres(value: unknown): Genre[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(isObject)
    .map((genre) => ({
      id:
        typeof genre.id === "string" || typeof genre.id === "number"
          ? genre.id
          : undefined,
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
          tag: true,
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