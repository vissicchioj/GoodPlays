import { beforeEach, describe, expect, it, vi } from "vitest";
import { Prisma } from "@prisma/client";

// Tests for every tag action, sharing one set of mocks.
const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  revalidatePath: vi.fn(),
  tagFindFirst: vi.fn(),
  tagUpsert: vi.fn(),
  tagUpdateMany: vi.fn(),
  tagDeleteMany: vi.fn(),
  gameLogFindFirst: vi.fn(),
  gameLogTagUpsert: vi.fn(),
  gameLogTagFindFirst: vi.fn(),
  gameLogTagDelete: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("../../lib/auth", () => ({ authOptions: {} }));
vi.mock("../../lib/db", () => ({
  prisma: {
    libraryTag: {
      findFirst: mocks.tagFindFirst,
      upsert: mocks.tagUpsert,
      updateMany: mocks.tagUpdateMany,
      deleteMany: mocks.tagDeleteMany,
    },
    gameLog: { findFirst: mocks.gameLogFindFirst },
    gameLogTag: {
      upsert: mocks.gameLogTagUpsert,
      findFirst: mocks.gameLogTagFindFirst,
      delete: mocks.gameLogTagDelete,
    },
  },
}));

import { createLibraryTag } from "./create-library-tag";
import { renameLibraryTag } from "./rename-library-tag";
import { deleteLibraryTag } from "./delete-library-tag";
import { addTagToGameLog } from "./add-tag-to-game-log";
import { removeTagFromGameLog } from "./remove-tag-from-game-log";

beforeEach(() => {
  mocks.getServerSession.mockResolvedValue({ user: { id: "user-1" } });
});

describe("createLibraryTag", () => {
  it("rejects signed-out callers", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(createLibraryTag("Cozy")).rejects.toThrow("Unauthorized");
  });

  it("returns a readable error for an invalid name instead of throwing", async () => {
    await expect(createLibraryTag("   ")).resolves.toEqual({
      ok: false,
      error: "Tag name is required",
    });
    expect(mocks.tagUpsert).not.toHaveBeenCalled();
  });

  it("reuses an existing tag with different capitalization", async () => {
    mocks.tagFindFirst.mockResolvedValue({ id: "tag-1", name: "RPG" });

    await expect(createLibraryTag("rpg")).resolves.toEqual({
      ok: true,
      tag: { id: "tag-1", name: "RPG" },
    });
    expect(mocks.tagFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId: "user-1",
          name: { equals: "rpg", mode: "insensitive" },
        },
      }),
    );
    expect(mocks.tagUpsert).not.toHaveBeenCalled();
  });

  it("creates a normalized tag owned by the signed-in user", async () => {
    mocks.tagFindFirst.mockResolvedValue(null);
    mocks.tagUpsert.mockResolvedValue({ id: "tag-2", name: "Co-op night" });

    await expect(createLibraryTag("  Co-op   night ")).resolves.toEqual({
      ok: true,
      tag: { id: "tag-2", name: "Co-op night" },
    });
    expect(mocks.tagUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { userId: "user-1", name: "Co-op night" },
      }),
    );
  });
});

describe("renameLibraryTag", () => {
  beforeEach(() => {
    mocks.tagFindFirst.mockResolvedValue(null);
    mocks.tagUpdateMany.mockResolvedValue({ count: 1 });
  });

  it("rejects signed-out callers", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(renameLibraryTag("tag-1", "Cozy")).rejects.toThrow(
      "Unauthorized",
    );
    expect(mocks.tagUpdateMany).not.toHaveBeenCalled();
  });

  it("refuses a name another of the user's tags already has", async () => {
    mocks.tagFindFirst.mockResolvedValue({ name: "Cozy" });

    await expect(renameLibraryTag("tag-1", "cozy")).resolves.toEqual({
      ok: false,
      error: 'You already have a tag named "Cozy"',
    });
    // The duplicate check must ignore the tag being renamed.
    expect(mocks.tagFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ id: { not: "tag-1" } }),
      }),
    );
    expect(mocks.tagUpdateMany).not.toHaveBeenCalled();
  });

  it("renames only the signed-in user's tag", async () => {
    await expect(renameLibraryTag("tag-1", " Cozy  games ")).resolves.toEqual({
      ok: true,
      tag: { id: "tag-1", name: "Cozy games" },
    });
    expect(mocks.tagUpdateMany).toHaveBeenCalledWith({
      where: { id: "tag-1", userId: "user-1" },
      data: { name: "Cozy games" },
    });
  });

  it("reports someone else's (or a missing) tag as not found", async () => {
    mocks.tagUpdateMany.mockResolvedValue({ count: 0 });

    await expect(renameLibraryTag("tag-x", "Cozy")).resolves.toEqual({
      ok: false,
      error: "Tag not found",
    });
  });

  it("handles a duplicate created at the same moment (unique constraint P2002)", async () => {
    mocks.tagUpdateMany.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "test",
      }),
    );

    await expect(renameLibraryTag("tag-1", "Cozy")).resolves.toEqual({
      ok: false,
      error: 'You already have a tag named "Cozy"',
    });
  });

  it("re-throws unexpected database errors", async () => {
    mocks.tagUpdateMany.mockRejectedValue(new Error("connection lost"));

    await expect(renameLibraryTag("tag-1", "Cozy")).rejects.toThrow(
      "connection lost",
    );
  });
});

describe("deleteLibraryTag", () => {
  it("rejects signed-out callers", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(deleteLibraryTag("tag-1")).rejects.toThrow("Unauthorized");
    expect(mocks.tagDeleteMany).not.toHaveBeenCalled();
  });

  it("deletes only the signed-in user's tag", async () => {
    mocks.tagDeleteMany.mockResolvedValue({ count: 1 });

    await deleteLibraryTag("tag-1");

    expect(mocks.tagDeleteMany).toHaveBeenCalledWith({
      where: { id: "tag-1", userId: "user-1" },
    });
  });

  it("fails for someone else's (or a missing) tag", async () => {
    mocks.tagDeleteMany.mockResolvedValue({ count: 0 });

    await expect(deleteLibraryTag("tag-x")).rejects.toThrow("Tag not found");
  });
});

describe("addTagToGameLog", () => {
  it("refuses to tag someone else's game log", async () => {
    mocks.gameLogFindFirst.mockResolvedValue(null);

    await expect(addTagToGameLog("log-x", "tag-1")).rejects.toThrow(
      "Game log not found",
    );
    expect(mocks.gameLogFindFirst).toHaveBeenCalledWith({
      where: { id: "log-x", userId: "user-1" },
    });
    expect(mocks.gameLogTagUpsert).not.toHaveBeenCalled();
  });

  it("refuses to use someone else's tag", async () => {
    mocks.gameLogFindFirst.mockResolvedValue({ id: "log-1" });
    mocks.tagFindFirst.mockResolvedValue(null);

    await expect(addTagToGameLog("log-1", "tag-x")).rejects.toThrow(
      "Tag not found",
    );
    expect(mocks.gameLogTagUpsert).not.toHaveBeenCalled();
  });

  it("attaches the tag when both belong to the user", async () => {
    mocks.gameLogFindFirst.mockResolvedValue({ id: "log-1" });
    mocks.tagFindFirst.mockResolvedValue({ id: "tag-1" });

    await addTagToGameLog("log-1", "tag-1");

    expect(mocks.gameLogTagUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: { gameLogId: "log-1", tagId: "tag-1" },
      }),
    );
  });
});

describe("removeTagFromGameLog", () => {
  it("refuses to remove a tag from someone else's game", async () => {
    mocks.gameLogTagFindFirst.mockResolvedValue(null);

    await expect(removeTagFromGameLog("link-x")).rejects.toThrow(
      "Tag connection not found",
    );
    expect(mocks.gameLogTagFindFirst).toHaveBeenCalledWith({
      where: { id: "link-x", gameLog: { userId: "user-1" } },
    });
    expect(mocks.gameLogTagDelete).not.toHaveBeenCalled();
  });
});
