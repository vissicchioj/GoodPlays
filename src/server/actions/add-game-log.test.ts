import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getServerSession: vi.fn(),
  revalidatePath: vi.fn(),
  getIgdbGameById: vi.fn(),
  gameFindUnique: vi.fn(),
  gameUpsert: vi.fn(),
  gameLogUpsert: vi.fn(),
}));

vi.mock("next-auth", () => ({ getServerSession: mocks.getServerSession }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));
vi.mock("../../lib/auth", () => ({ authOptions: {} }));
vi.mock("../queries/get-igdb-game", () => ({
  getIgdbGameById: mocks.getIgdbGameById,
}));
vi.mock("../../lib/db", () => ({
  prisma: {
    game: { findUnique: mocks.gameFindUnique, upsert: mocks.gameUpsert },
    gameLog: { upsert: mocks.gameLogUpsert },
  },
}));

import { addGameLog } from "./add-game-log";

const STORED_GAME = { id: "game-1", igdbId: 1942, genres: [{ name: "RPG" }] };

const IGDB_GAME = {
  id: 1942,
  name: "The Witcher 3: Wild Hunt",
  slug: "the-witcher-3-wild-hunt",
  summary: "A story-driven open world RPG.",
  cover: { url: "//images.igdb.com/igdb/image/upload/t_thumb/co1wyy.jpg" },
  first_release_date: 1431993600,
  total_rating: 93.4,
  platforms: [{ id: 6, name: "PC (Microsoft Windows)", abbreviation: "PC" }],
  genres: [{ id: 12, name: "Role-playing (RPG)" }],
};

describe("addGameLog", () => {
  beforeEach(() => {
    mocks.getServerSession.mockResolvedValue({ user: { id: "user-1" } });
    mocks.gameFindUnique.mockResolvedValue(STORED_GAME);
    mocks.gameUpsert.mockResolvedValue(STORED_GAME);
    mocks.gameLogUpsert.mockResolvedValue({ id: "log-1", status: "backlog" });
    mocks.getIgdbGameById.mockResolvedValue(IGDB_GAME);
  });

  it("rejects signed-out callers", async () => {
    mocks.getServerSession.mockResolvedValue(null);

    await expect(addGameLog(1942)).rejects.toThrow("Unauthorized");
    expect(mocks.gameLogUpsert).not.toHaveBeenCalled();
  });

  it.each([0, -5, 1.5, Number.NaN, "1942" as unknown as number])(
    "rejects the invalid IGDB id %j",
    async (igdbId) => {
      await expect(addGameLog(igdbId)).rejects.toThrow("Invalid game ID");
      expect(mocks.gameFindUnique).not.toHaveBeenCalled();
    },
  );

  it("reuses a stored game without calling IGDB", async () => {
    const result = await addGameLog(1942);

    expect(mocks.getIgdbGameById).not.toHaveBeenCalled();
    expect(mocks.gameUpsert).not.toHaveBeenCalled();
    expect(result).toEqual({ status: "backlog" });
  });

  it("adds new entries as backlog and never overwrites an existing status", async () => {
    await addGameLog(1942);

    expect(mocks.gameLogUpsert).toHaveBeenCalledWith({
      where: { userId_gameId: { userId: "user-1", gameId: "game-1" } },
      update: {},
      create: { userId: "user-1", gameId: "game-1", status: "backlog" },
    });
  });

  it("returns the existing status when the game is already in the library", async () => {
    mocks.gameLogUpsert.mockResolvedValue({ id: "log-1", status: "completed" });

    await expect(addGameLog(1942)).resolves.toEqual({ status: "completed" });
  });

  it("loads a new game's details from IGDB on the server", async () => {
    mocks.gameFindUnique.mockResolvedValue(null);

    await addGameLog(1942);

    expect(mocks.getIgdbGameById).toHaveBeenCalledWith(1942);
    expect(mocks.gameUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { igdbId: 1942 },
        create: expect.objectContaining({
          igdbId: 1942,
          title: "The Witcher 3: Wild Hunt",
          slug: "the-witcher-3-wild-hunt",
          coverUrl: IGDB_GAME.cover.url,
          releaseDate: new Date(1431993600 * 1000),
          totalRating: 93.4,
          genres: IGDB_GAME.genres,
        }),
      }),
    );
  });

  it("refreshes games saved before genres existed", async () => {
    mocks.gameFindUnique.mockResolvedValue({ ...STORED_GAME, genres: null });

    await addGameLog(1942);

    expect(mocks.getIgdbGameById).toHaveBeenCalledWith(1942);
    expect(mocks.gameUpsert).toHaveBeenCalled();
  });

  it("fails without creating anything when IGDB doesn't know the game", async () => {
    mocks.gameFindUnique.mockResolvedValue(null);
    mocks.getIgdbGameById.mockResolvedValue(null);

    await expect(addGameLog(999999)).rejects.toThrow("Game not found on IGDB");
    expect(mocks.gameUpsert).not.toHaveBeenCalled();
    expect(mocks.gameLogUpsert).not.toHaveBeenCalled();
  });
});
