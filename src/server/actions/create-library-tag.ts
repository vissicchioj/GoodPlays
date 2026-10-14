"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import {
  normalizeTagName,
  validateTagName,
  type TagActionResult,
} from "../../lib/tags";

export async function createLibraryTag(name: string): Promise<TagActionResult> {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const normalizedName = normalizeTagName(name);
  const validationError = validateTagName(normalizedName);

  if (validationError) {
    return { ok: false, error: validationError };
  }

  // The database's unique rule on (userId, name) is case-sensitive, so "RPG" and
  // "rpg" would both be allowed. If the user already has this tag in any
  // capitalization, reuse that one instead of creating a near-duplicate.
  const existing = await prisma.libraryTag.findFirst({
    where: {
      userId,
      name: {
        equals: normalizedName,
        mode: "insensitive",
      },
    },
    select: { id: true, name: true },
  });

  if (existing) {
    return { ok: true, tag: existing };
  }

  // upsert (rather than create) covers the rare case where two requests try to
  // create the same tag at the same moment.
  const tag = await prisma.libraryTag.upsert({
    where: {
      userId_name: {
        userId,
        name: normalizedName,
      },
    },
    update: {},
    create: {
      userId,
      name: normalizedName,
    },
    select: { id: true, name: true },
  });

  revalidatePath("/library");

  return { ok: true, tag };
}
