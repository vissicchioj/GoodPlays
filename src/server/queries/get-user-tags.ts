import { prisma } from "../../lib/db";
import type { TagSummary } from "../../lib/tags";

// Every tag the user owns, including tags not currently attached to any game.
// The Library used to build its tag list from the tags attached to games, so a
// tag disappeared from "Add existing tag..." once it was removed from its last
// game, even though it still existed in the database.
export async function getUserTags(userId: string): Promise<TagSummary[]> {
  return prisma.libraryTag.findMany({
    where: { userId },
    select: {
      id: true,
      name: true,
    },
    orderBy: {
      name: "asc",
    },
  });
}
