import { NextResponse } from "next/server";
import { searchGames } from "../../../../server/queries/search-games";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  const games = await searchGames(query);

  if (!Array.isArray(games)) {
    return NextResponse.json(games);
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    const gamesWithoutLibraryStatus = games.map((game) => ({
      ...game,
      isInLibrary: false,
      libraryStatus: null,
    }));

    return NextResponse.json(gamesWithoutLibraryStatus);
  }

  const igdbIds = games
    .map((game) => game.id)
    .filter((id): id is number => typeof id === "number");

  const savedLogs = await prisma.gameLog.findMany({
    where: {
      userId: session.user.id,
      game: {
        igdbId: {
          in: igdbIds,
        },
      },
    },
    include: {
      game: true,
    },
  });

  const savedGameMap = new Map(
    savedLogs.map((log) => [
      log.game.igdbId,
      {
        gameLogId: log.id,
        status: log.status,
      },
    ])
  );

  const gamesWithLibraryStatus = games.map((game) => {
    const savedGame = savedGameMap.get(game.id);

    return {
      ...game,
      isInLibrary: Boolean(savedGame),
      libraryStatus: savedGame?.status ?? null,
      gameLogId: savedGame?.gameLogId ?? null,
    };
  });

  return NextResponse.json(gamesWithLibraryStatus);
}