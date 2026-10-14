"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function deleteLibraryTag(tagId: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (typeof tagId !== "string" || !tagId) {
    throw new Error("Invalid tag ID");
  }

  // Only the owner can delete the tag. The GameLogTag rows that attach it to
  // games are removed automatically by the database, because the schema
  // declares that relation with `onDelete: Cascade`. The games themselves are
  // not affected.
  const result = await prisma.libraryTag.deleteMany({
    where: {
      id: tagId,
      userId: session.user.id,
    },
  });

  if (result.count === 0) {
    throw new Error("Tag not found");
  }

  revalidatePath("/library");
}
