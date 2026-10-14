"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function removeGameLog(gameLogId: string) {
  // Server actions are public endpoints: anyone can call them, signed in or not.
  // So we must check who is calling before touching the database.
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Input from the client is untrusted, even when TypeScript says it's a string.
  if (typeof gameLogId !== "string" || !gameLogId) {
    throw new Error("Invalid game log ID");
  }

  // Filtering by BOTH id and userId means a user can only delete their own entry.
  // deleteMany is used because it accepts non-unique filters like userId,
  // and returns how many rows it deleted instead of throwing when none match.
  const result = await prisma.gameLog.deleteMany({
    where: {
      id: gameLogId,
      userId: session.user.id,
    },
  });

  if (result.count === 0) {
    throw new Error("Game log not found");
  }

  revalidatePath("/library");
}
