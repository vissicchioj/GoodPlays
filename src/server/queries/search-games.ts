import { igdbFetch } from "../../lib/igdb";

export async function searchGames(search?: string) {
  // current unix timestamp
  const now = Math.floor(Date.now() / 1000);

  // 80 days ago
  const daysAgo = now - 60 * 60 * 24 * 80;

  // ========================
  // TRENDING GAMES
  // ========================

  if (!search || search.trim() === "") {
    const trendingQuery = `
      fields
        id,
        name,
        summary,
        cover.url,
        first_release_date,
        total_rating,
        slug,
        total_rating_count,
        platforms.name,
        platforms.abbreviation,
        genres.id,
        genres.name,
        follows,
        hypes,
        version_parent;

      where
        cover != null
        & total_rating != null
        & version_parent = null
        & first_release_date > ${daysAgo};

      sort total_rating_count desc;

      limit 12;
    `;

    return igdbFetch(trendingQuery);
  }

  // ========================
  // NORMAL SEARCH
  // ========================
  const searchQuery = `
    search "${search}";

    fields
      id,
      slug,
      name,
      summary,
      cover.url,
      first_release_date,
      total_rating,
      total_rating_count,
      platforms.name,
      platforms.abbreviation,
      genres.id,
      genres.name,
      version_parent;

    where
      cover != null
      & total_rating != null
      & version_parent = null;

    limit 12;
  `;

  return igdbFetch(searchQuery);
}