"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function removeTagFromGameLog(gameLogTagId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const gameLogTag = await prisma.gameLogTag.findFirst({
    where: {
      id: gameLogTagId,
      gameLog: {
        userId: session.user.id,
      },
    },
  });

  if (!gameLogTag) {
    throw new Error("Tag connection not found");
  }

  await prisma.gameLogTag.delete({
    where: {
      id: gameLogTagId,
    },
  });

  revalidatePath("/library");
}