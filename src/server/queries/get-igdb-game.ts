import { igdbFetch } from "../../lib/igdb";
import type { IgdbGame } from "../../types/igdb";
import { IGDB_GAME_FIELDS } from "./search-games";

// Load one game straight from IGDB by its ID. Used when saving a game so the
// server gets the game's details from IGDB itself rather than trusting the browser.
export async function getIgdbGameById(igdbId: number): Promise<IgdbGame | null> {
  const results = await igdbFetch<IgdbGame[]>(`
    fields ${IGDB_GAME_FIELDS};
    where id = ${igdbId};
    limit 1;
  `);

  return results[0] ?? null;
}
