"use server";

import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import {
  normalizeTagName,
  validateTagName,
  type TagActionResult,
} from "../../lib/tags";

export async function renameLibraryTag(
  tagId: string,
  newName: string,
): Promise<TagActionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  if (typeof tagId !== "string" || !tagId) {
    throw new Error("Invalid tag ID");
  }

  const userId = session.user.id;
  const name = normalizeTagName(newName);
  const validationError = validateTagName(name);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  // Same case-insensitive duplicate rule as creating a tag.
  const duplicate = await prisma.libraryTag.findFirst({
    where: {
      userId,
      id: { not: tagId },
      name: { equals: name, mode: "insensitive" },
    },
    select: { name: true },
  });

  if (duplicate) {
    return { ok: false, error: `You already have a tag named "${duplicate.name}"` };
  }

  try {
    // id + userId: only the owner can rename the tag (same pattern as
    // removeGameLog). count is 0 if the tag doesn't exist or isn't theirs.
    const result = await prisma.libraryTag.updateMany({
      where: { id: tagId, userId },
      data: { name },
    });

    if (result.count === 0) {
      return { ok: false, error: "Tag not found" };
    }
  } catch (error) {
    // P2002 = unique constraint violation: another request took this exact
    // name between our duplicate check and this update.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { ok: false, error: `You already have a tag named "${name}"` };
    }

    throw error;
  }

  revalidatePath("/library");

  return { ok: true, tag: { id: tagId, name } };
}
