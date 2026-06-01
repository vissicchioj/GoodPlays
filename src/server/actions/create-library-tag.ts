"use server";

import { prisma } from "../../lib/db";
import { authOptions } from "../../lib/auth";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

function normalizeTagName(name: string) {
  return name.trim();
}

export async function createLibraryTag(name: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const normalizedName = normalizeTagName(name);

  if (!normalizedName) {
    throw new Error("Tag name is required");
  }

  const tag = await prisma.libraryTag.upsert({
    where: {
      userId_name: {
        userId: session.user.id,
        name: normalizedName,
      },
    },
    update: {},
    create: {
      userId: session.user.id,
      name: normalizedName,
    },
  });

  revalidatePath("/library");

  return tag;
}