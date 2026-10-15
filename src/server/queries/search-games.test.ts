import { describe, expect, it } from "vitest";
import { sanitizeSearchTerm } from "./search-games";

describe("sanitizeSearchTerm", () => {
  it("keeps normal searches, including apostrophes", () => {
    expect(sanitizeSearchTerm("Baldur's Gate 3")).toBe("Baldur's Gate 3");
  });

  it("removes double quotes so the IGDB query string can't be closed early", () => {
    const result = sanitizeSearchTerm('zelda"; where id = 1');

    expect(result).not.toContain('"');
    expect(result).toBe("zelda ; where id = 1");
  });

  it("removes backslashes", () => {
    expect(sanitizeSearchTerm("half\\life")).toBe("half life");
  });

  it("trims and collapses whitespace", () => {
    expect(sanitizeSearchTerm("   hollow    knight  ")).toBe("hollow knight");
  });

  it("caps the length at 100 characters", () => {
    expect(sanitizeSearchTerm("a".repeat(150))).toHaveLength(100);
  });

  it("returns an empty string for blank input (which means: show trending)", () => {
    expect(sanitizeSearchTerm('  " \\ ')).toBe("");
  });
});
