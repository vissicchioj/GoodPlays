import { beforeEach, describe, expect, it, vi } from "vitest";

// vi.mock calls are moved to the top of the file before any imports run, so
// the mock functions they use must be created with vi.hoisted.
const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  revalidatePath: vi.fn(),
  deleteMany: vi.fn(),
}));

// Replace the real session lookup, cache and database with mocks. These tests
// check the action's own logic: who may delete what. They don't need a database.
vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("../../lib/auth", () => ({ authOptions: {} }));
vi.mock("../../lib/db", () => ({
  prisma: { gameLog: { deleteMany: mocks.deleteMany } },
}));

import { removeGameLog } from "./remove-game-log";

const SIGNED_IN = { user: { id: "user-1" } };

describe("removeGameLog", () => {
  beforeEach(() => {
    mocks.getServerSession.mockResolvedValue(SIGNED_IN);
    mocks.deleteMany.mockResolvedValue({ count: 1 });
  });

  it("rejects signed-out callers without touching the database", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(removeGameLog("log-1")).rejects.toThrow("Unauthorized");
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });

  it("rejects a session without a user id", async () => {
    mocks.getServerSession.mockResolvedValue({ user: {} });

    await expect(removeGameLog("log-1")).rejects.toThrow("Unauthorized");
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });

  it("rejects an empty id", async () => {
    await expect(removeGameLog("")).rejects.toThrow("Invalid game log ID");
    expect(mocks.deleteMany).not.toHaveBeenCalled();
  });

  it("only deletes the entry if it belongs to the signed-in user", async () => {
    await removeGameLog("log-1");

    expect(mocks.deleteMany).toHaveBeenCalledWith({
      where: { id: "log-1", userId: "user-1" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/library");
  });

  it("fails when the entry doesn't exist or belongs to someone else", async () => {
    mocks.deleteMany.mockResolvedValue({ count: 0 });

    await expect(removeGameLog("someone-elses-log")).rejects.toThrow(
      "Game log not found",
    );
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
