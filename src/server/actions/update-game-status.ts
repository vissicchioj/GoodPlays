"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { GameStatus } from "@prisma/client";

// Prisma generates this object from the GameStatus enum in schema.prisma,
// so the allowed values here always stay in sync with the database.
const VALID_STATUSES = Object.values(GameStatus);

function isGameStatus(value: unknown): value is GameStatus {
  return (
    typeof value === "string" &&
    (VALID_STATUSES as string[]).includes(value)
  );
}

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
  // telling TypeScript to trust it.
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
