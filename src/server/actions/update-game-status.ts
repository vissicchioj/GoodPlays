"use server";

import { prisma } from "../../lib/db";
import { revalidatePath } from "next/cache";

export async function updateGameStatus(
  gameLogId: string,
  status: string
) {
  await prisma.gameLog.update({
    where: {
      id: gameLogId,
    },

    data: {
      status: status as any,
    },
  });

  revalidatePath("/library");
}