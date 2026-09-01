import { describe, expect, it } from "vitest";
import { inferCategorySlugFromText } from "./category-inference";

describe("inferCategorySlugFromText", () => {
  it("prefers politics when the title references government or policy", () => {
    expect(
      inferCategorySlugFromText(
        "Government unveils new digital policy for local businesses",
        "Officials say the policy will support new startups and digital infrastructure in the city.",
      ),
    ).toBe("politics");
  });

  it("prefers technology when the title is about AI and software", () => {
    expect(
      inferCategorySlugFromText(
        "AI startup launches new software platform for local farmers",
        "The digital service is being introduced to improve access to agricultural tools.",
      ),
    ).toBe("technology");
  });

  it("falls back to a valid category when text is generic", () => {
    expect(
      inferCategorySlugFromText(
        "Fresh update from Nepal",
        "Latest report from the capital.",
      ),
    ).toBe("politics");
  });
});
