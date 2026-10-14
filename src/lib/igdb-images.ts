export const PLACEHOLDER_COVER = "/placeholder-cover.svg";

type IgdbImageSize = "t_thumb" | "t_cover_small" | "t_cover_big" | "t_720p";

// IGDB returns cover URLs like "//images.igdb.com/igdb/image/upload/t_thumb/abc.jpg":
// - "t_thumb" is a tiny 90px image, so we swap in a larger size.
// - The leading "//" is protocol-relative, so we make it explicitly https.
// Discover (IGDB data) and Library (database data) both go through this one
// function, so covers are handled the same way everywhere.
export function getIgdbCoverUrl(
  url: string | null | undefined,
  size: IgdbImageSize = "t_cover_big",
) {
  if (!url) return PLACEHOLDER_COVER;

  const sized = url.replace("t_thumb", size);

  if (sized.startsWith("//")) return `https:${sized}`;
  if (sized.startsWith("http://")) return `https://${sized.slice("http://".length)}`;

  return sized;
}
