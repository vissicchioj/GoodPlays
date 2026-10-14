import { igdbFetch } from "../../lib/igdb";
import type { IgdbGame } from "../../types/igdb";

// The README promises "popular games from the last 3 months". The code used 80
// days; this makes it a named 90-day setting so the intent is clear.
const TRENDING_WINDOW_DAYS = 90;
const RESULT_LIMIT = 12;
const MAX_SEARCH_LENGTH = 100;

// Only the fields the UI actually uses.
export const IGDB_GAME_FIELDS = `
  id,
  name,
  slug,
  summary,
  cover.url,
  first_release_date,
  total_rating,
  total_rating_count,
  platforms.name,
  platforms.abbreviation,
  genres.id,
  genres.name
`;

// IGDB's query language wraps the search term in double quotes:  search "zelda";
// A " typed by the user would end that string early and break the query (or
// change what it does). We remove quotes and backslashes, collapse whitespace,
// and cap the length.
export function sanitizeSearchTerm(raw: string) {
  return raw
    .replace(/["\\]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_SEARCH_LENGTH);
}

export async function searchGames(search?: string): Promise<IgdbGame[]> {
  const term = sanitizeSearchTerm(search ?? "");

  // ========================
  // TRENDING GAMES
  // ========================
  if (!term) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const windowStart = nowInSeconds - TRENDING_WINDOW_DAYS * 24 * 60 * 60;

    return igdbFetch<IgdbGame[]>(`
      fields ${IGDB_GAME_FIELDS};

      where
        cover != null
        & total_rating != null
        & version_parent = null
        & first_release_date > ${windowStart};

      sort total_rating_count desc;

      limit ${RESULT_LIMIT};
    `);
  }

  // ========================
  // NORMAL SEARCH
  // ========================
  // Note: IGDB rejects `search` combined with `sort` (HTTP 406). Search results
  // come back ordered by relevance.
  return igdbFetch<IgdbGame[]>(`
    search "${term}";

    fields ${IGDB_GAME_FIELDS};

    where
      cover != null
      & total_rating != null
      & version_parent = null;

    limit ${RESULT_LIMIT};
  `);
}
