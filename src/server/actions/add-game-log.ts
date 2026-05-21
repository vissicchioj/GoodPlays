// src/server/actions/add-game-log.ts
"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type Platform = {
  id?: number;
  name?: string;
  abbreviation?: string;
};

type Genre = {
  id?: number;
  name?: string;
};

type IgdbGame = {
  id: number;
  slug?: string;
  name: string;
  summary?: string;
  cover?: {
    url?: string;
  };
  status?: string;
  first_release_date?: number;
  total_rating?: number;
  platforms?: Platform[];
  genres?: Genre[];
};

export async function addGameLog(game: IgdbGame, status = "backlog") {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const coverUrl = game.cover?.url ?? null;

  const dbGame = await prisma.game.upsert({
    where: {
      igdbId: game.id,
    },
    update: {
      coverUrl,
      summary: game.summary ?? null,
      releaseDate: game.first_release_date
        ? new Date(game.first_release_date * 1000)
        : null,
      totalRating: game.total_rating ?? null,
      platforms: game.platforms ?? [],
      genres: game.genres ?? [],
    },
    create: {
      igdbId: game.id,
      title: game.name,
      slug: game.slug ?? generateSlug(game.name),
      summary: game.summary ?? null,
      coverUrl,
      releaseDate: game.first_release_date
        ? new Date(game.first_release_date * 1000)
        : null,
      totalRating: game.total_rating ?? null,
      platforms: game.platforms ?? [],
      genres: game.genres ?? [],
    },
  });

  await prisma.gameLog.upsert({
    where: {
      userId_gameId: {
        userId: session.user.id,
        gameId: dbGame.id,
      },
    },
    update: {
      status: status as any,
    },
    create: {
      userId: session.user.id,
      gameId: dbGame.id,
      status: status as any,
    },
  });

  revalidatePath("/library");
}