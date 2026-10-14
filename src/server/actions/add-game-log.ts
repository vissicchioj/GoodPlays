"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { getIgdbGameById } from "../queries/get-igdb-game";

function generateSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Make sure the game exists in our shared Game table and return it.
//
// Previously the browser sent the whole game object (title, cover, summary...)
// and we saved it as-is. Since server actions are public endpoints, anyone could
// have sent made-up data and changed how a game appears for every user. Now the
// browser only sends the IGDB ID, and the details come from IGDB on the server.
async function findOrCreateGame(igdbId: number) {
  const existing = await prisma.game.findUnique({
    where: { igdbId },
  });

  // Already stored: no need to call IGDB again. The exception is games saved
  // before the genres column existed (genres is null); refresh those once so
  // they show up in genre filters.
  if (existing && existing.genres !== null) {
    return existing;
  }

  const igdbGame = await getIgdbGameById(igdbId);

  if (!igdbGame) {
    throw new Error("Game not found on IGDB");
  }

  const details = {
    title: igdbGame.name,
    summary: igdbGame.summary ?? null,
    coverUrl: igdbGame.cover?.url ?? null,
    releaseDate: igdbGame.first_release_date
      ? new Date(igdbGame.first_release_date * 1000)
      : null,
    totalRating: igdbGame.total_rating ?? null,
    platforms: igdbGame.platforms ?? [],
    genres: igdbGame.genres ?? [],
  };

  return prisma.game.upsert({
    where: { igdbId },
    update: details,
    create: {
      igdbId,
      // slug is unique in our schema; adding the IGDB ID to the fallback means
      // two games with the same name can't collide.
      slug: igdbGame.slug ?? `${generateSlug(igdbGame.name)}-${igdbId}`,
      ...details,
    },
  });
}

export async function addGameLog(igdbId: number) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (!Number.isInteger(igdbId) || igdbId <= 0) {
    throw new Error("Invalid game ID");
  }

  const game = await findOrCreateGame(igdbId);

  // If the game is already in the library, leave it alone (`update: {}`).
  // The old version reset the status to "backlog", which would have wiped out
  // a "completed" status if the add button was ever clicked again.
  const gameLog = await prisma.gameLog.upsert({
    where: {
      userId_gameId: {
        userId: session.user.id,
        gameId: game.id,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      gameId: game.id,
      status: "backlog",
    },
  });

  revalidatePath("/library");

  // Tell the button the real status so it can show "In Library ✓ (Playing)" etc.
  return { status: gameLog.status };
}
