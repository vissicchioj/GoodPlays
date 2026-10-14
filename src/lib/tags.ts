// Shared tag rules, used by the server actions (to enforce them) and by the
// tag inputs (to give instant feedback). The server is the one that counts:
// client-side limits are a convenience and can be bypassed.

export const TAG_NAME_MAX_LENGTH = 30;

export type TagSummary = {
  id: string;
  name: string;
};

// Expected failures (duplicate name, too long) are returned as values instead of
// thrown. In production, Next.js hides the message of errors thrown from server
// actions, so returning them is the only way to show the user a useful reason.
export type TagActionResult =
  | { ok: true; tag: TagSummary }
  | { ok: false; error: string };

export function normalizeTagName(raw: unknown) {
  if (typeof raw !== "string") return "";

  // Trim the ends and collapse runs of spaces: "  Co-op   night " -> "Co-op night"
  return raw.trim().replace(/\s+/g, " ");
}

export function validateTagName(name: string): string | null {
  if (!name) return "Tag name is required";

  if (name.length > TAG_NAME_MAX_LENGTH) {
    return `Tag names can be at most ${TAG_NAME_MAX_LENGTH} characters`;
  }

  return null;
}
