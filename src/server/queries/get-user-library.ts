import { prisma } from "../../lib/db";

export async function getUserLibrary(userId: string) {
  return prisma.gameLog.findMany({
    where: {
      userId,
    },

    include: {
      game: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}