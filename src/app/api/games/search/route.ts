import { NextResponse } from "next/server";
import { searchGames } from "../../../../server/queries/search-games";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/db";
import type { DiscoverGame, IgdbGame } from "../../../../types/igdb";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") ?? "";

  let games: IgdbGame[];

  // igdbFetch now throws on failure instead of returning IGDB's error body.
  // Catch it here, log the details on the server, and send the browser a clear
  // status code and a message that's safe to display.
  try {
    games = await searchGames(query);
  } catch (error) {
    console.error("Game search failed:", error);

    return NextResponse.json(
      { error: "Game search is unavailable right now. Please try again." },
      { status: 502 },
    );
  }

  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    const gamesWithoutLibraryStatus: DiscoverGame[] = games.map((game) => ({
      ...game,
      isInLibrary: false,
      libraryStatus: null,
    }));

    return NextResponse.json(gamesWithoutLibraryStatus);
  }

  const igdbIds = games.map((game) => game.id);

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
    ]),
  );

  const gamesWithLibraryStatus: DiscoverGame[] = games.map((game) => {
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
