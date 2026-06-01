"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function addTagToGameLog(gameLogId: string, tagId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const gameLog = await prisma.gameLog.findFirst({
    where: {
      id: gameLogId,
      userId: session.user.id,
    },
  });

  if (!gameLog) {
    throw new Error("Game log not found");
  }

  const tag = await prisma.libraryTag.findFirst({
    where: {
      id: tagId,
      userId: session.user.id,
    },
  });

  if (!tag) {
    throw new Error("Tag not found");
  }

  await prisma.gameLogTag.upsert({
    where: {
      gameLogId_tagId: {
        gameLogId,
        tagId,
      },
    },
    update: {},
    create: {
      gameLogId,
      tagId,
    },
  });

  revalidatePath("/library");
}