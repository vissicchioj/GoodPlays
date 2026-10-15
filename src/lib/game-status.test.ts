import { describe, expect, it } from "vitest";
import {
  GAME_STATUSES,
  STATUS_LABELS,
  getStatusLabel,
  isGameStatus,
} from "./game-status";

describe("GAME_STATUSES", () => {
  it("lists the four statuses in display order", () => {
    expect(GAME_STATUSES).toEqual(["backlog", "playing", "completed", "dropped"]);
  });

  it("has a label for every status", () => {
    for (const status of GAME_STATUSES) {
      expect(STATUS_LABELS[status]).toBeTruthy();
    }
  });
});

describe("isGameStatus", () => {
  it.each(["backlog", "playing", "completed", "dropped"])(
    "accepts %s",
    (value) => {
      expect(isGameStatus(value)).toBe(true);
    },
  );

  it.each([
    { description: "an unknown status", value: "finished" },
    { description: "the wrong case", value: "Playing" },
    { description: "an empty string", value: "" },
    { description: "a number", value: 1 },
    { description: "null", value: null },
    { description: "undefined", value: undefined },
    // A plain `value in object` check would wrongly accept this, because every
    // object inherits a toString property. Object.hasOwn doesn't.
    { description: "an inherited property name", value: "toString" },
  ])("rejects $description", ({ value }) => {
    expect(isGameStatus(value)).toBe(false);
  });
});

describe("getStatusLabel", () => {
  it("returns the label for a known status", () => {
    expect(getStatusLabel("completed")).toBe("Completed");
  });

  it("returns unknown values unchanged", () => {
    expect(getStatusLabel("mystery")).toBe("mystery");
  });
});
