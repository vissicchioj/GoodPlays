import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  revalidatePath: vi.fn(),
  updateMany: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("../../lib/auth", () => ({ authOptions: {} }));
vi.mock("../../lib/db", () => ({
  prisma: { gameLog: { updateMany: mocks.updateMany } },
}));

import { updateGameStatus } from "./update-game-status";

describe("updateGameStatus", () => {
  beforeEach(() => {
    mocks.getServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mocks.updateMany.mockResolvedValue({ count: 1 });
  });

  it("rejects signed-out callers", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(updateGameStatus("log-1", "playing")).rejects.toThrow(
      "Unauthorized",
    );
    expect(mocks.updateMany).not.toHaveBeenCalled();
  });

  it.each(["finished", "PLAYING", "", "toString"])(
    "rejects the invalid status %j before reaching the database",
    async (status) => {
      await expect(updateGameStatus("log-1", status)).rejects.toThrow(
        "Invalid status",
      );
      expect(mocks.updateMany).not.toHaveBeenCalled();
    },
  );

  it("updates only the signed-in user's entry", async () => {
    await updateGameStatus("log-1", "completed");

    expect(mocks.updateMany).toHaveBeenCalledWith({
      where: { id: "log-1", userId: "user-1" },
      data: { status: "completed" },
    });
    expect(mocks.revalidatePath).toHaveBeenCalledWith("/library");
  });

  it("fails when the entry doesn't exist or belongs to someone else", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });

    await expect(updateGameStatus("someone-elses-log", "dropped")).rejects.toThrow(
      "Game log not found",
    );
    expect(mocks.revalidatePath).not.toHaveBeenCalled();
  });
});
