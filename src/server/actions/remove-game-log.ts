"use server";

import { prisma } from "../../lib/db";
import { revalidatePath } from "next/cache";

export async function removeGameLog(
  gameLogId: string
) {
  await prisma.gameLog.delete({
    where: {
      id: gameLogId,
    },
  });

  revalidatePath("/library");
}