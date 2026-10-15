import { describe, expect, it } from "vitest";
import { PLACEHOLDER_COVER, getIgdbCoverUrl } from "./igdb-images";

const THUMB = "//images.igdb.com/igdb/image/upload/t_thumb/co1abc.jpg";

describe("getIgdbCoverUrl", () => {
  it("upgrades the size and makes protocol-relative URLs https", () => {
    expect(getIgdbCoverUrl(THUMB)).toBe(
      "https://images.igdb.com/igdb/image/upload/t_cover_big/co1abc.jpg",
    );
  });

  it("uses the requested size", () => {
    expect(getIgdbCoverUrl(THUMB, "t_720p")).toContain("/t_720p/");
  });

  it("upgrades http to https", () => {
    expect(getIgdbCoverUrl("http://images.igdb.com/x/t_thumb/a.jpg")).toBe(
      "https://images.igdb.com/x/t_cover_big/a.jpg",
    );
  });

  it("leaves https URLs as they are apart from the size", () => {
    expect(getIgdbCoverUrl("https://images.igdb.com/x/t_thumb/a.jpg")).toBe(
      "https://images.igdb.com/x/t_cover_big/a.jpg",
    );
  });

  it.each([null, undefined, ""])("returns the placeholder for %s", (value) => {
    expect(getIgdbCoverUrl(value)).toBe(PLACEHOLDER_COVER);
  });
});
