import { describe, expect, it } from "vitest";
import { isDuplicateCandidate } from "./dedup";

describe("deduplication", () => {
  it("flags near-identical stories as duplicates even when wording changes", () => {
    const existing = [
      "Government unveils fresh transport plan for Kathmandu and Pokhara",
    ];

    const candidate =
      "New transport strategy announced to improve travel between Kathmandu and Pokhara";

    expect(isDuplicateCandidate(candidate, existing)).toBe(true);
  });

  it("allows distinctly different stories through", () => {
    const existing = [
      "Government launches new digital learning initiative in schools",
    ];

    const candidate =
      "Mountain tourism businesses report stronger bookings during the monsoon season";

    expect(isDuplicateCandidate(candidate, existing)).toBe(false);
  });
});
