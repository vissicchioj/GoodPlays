import { prisma } from "../../lib/db";

export async function getUserLibrary(userId: string) {
  return prisma.gameLog.findMany({
    where: {
      userId,
    },

    include: {
      game: true,
      tags: {
        include: {
          tag: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
}