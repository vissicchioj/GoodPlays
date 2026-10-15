import { describe, expect, it } from "vitest";
import { TAG_NAME_MAX_LENGTH, normalizeTagName, validateTagName } from "./tags";

describe("normalizeTagName", () => {
  it("trims the ends and collapses repeated spaces", () => {
    expect(normalizeTagName("  Co-op   night ")).toBe("Co-op night");
  });

  it("collapses tabs and newlines too", () => {
    expect(normalizeTagName("Couch\t\nco-op")).toBe("Couch co-op");
  });

  it("returns an empty string for non-strings", () => {
    expect(normalizeTagName(undefined)).toBe("");
    expect(normalizeTagName(42)).toBe("");
    expect(normalizeTagName({ name: "RPG" })).toBe("");
  });
});

describe("validateTagName", () => {
  it("accepts a normal name", () => {
    expect(validateTagName("Cozy")).toBeNull();
  });

  it("requires a name", () => {
    expect(validateTagName("")).toBe("Tag name is required");
  });

  it("accepts a name exactly at the limit", () => {
    expect(validateTagName("x".repeat(TAG_NAME_MAX_LENGTH))).toBeNull();
  });

  it("rejects a name over the limit", () => {
    expect(validateTagName("x".repeat(TAG_NAME_MAX_LENGTH + 1))).toMatch(
      /at most/,
    );
  });
});
