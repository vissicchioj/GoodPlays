"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { isGameStatus } from "../../lib/game-status";

export async function updateGameStatus(gameLogId: string, status: string) {
  // Server actions are public endpoints: anyone can call them, signed in or not.
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (typeof gameLogId !== "string" || !gameLogId) {
    throw new Error("Invalid game log ID");
  }

  // Replaces the old `status as any`: check the value at runtime instead of
  // telling TypeScript to trust it. The allowed list lives in lib/game-status.ts
  // and is type-checked against the Prisma GameStatus enum.
  if (!isGameStatus(status)) {
    throw new Error("Invalid status");
  }

  // Only update the entry if it belongs to the signed-in user.
  const result = await prisma.gameLog.updateMany({
    where: {
      id: gameLogId,
      userId: session.user.id,
    },
    data: {
      status,
    },
  });

  if (result.count === 0) {
    throw new Error("Game log not found");
  }

  revalidatePath("/library");
}
