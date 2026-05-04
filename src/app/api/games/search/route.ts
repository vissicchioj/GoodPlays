import { NextResponse } from "next/server";
import { searchGames } from "../../../../server/queries/search-games";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  const games = await searchGames(query);

  return NextResponse.json(games);
}