import { describe, expect, it } from "vitest";
import { normalizeNepaliText, stripHtml, toRichHtml } from "./article-content";
import {
  hasDevanagari,
  isInvalidTranslationText,
  makeSlug,
} from "../scripts/fetch-news";

describe("article-content", () => {
  it("strips html properly", () => {
    const html = "<p>First paragraph.</p><p>Second paragraph.</p>";
    const text = stripHtml(html);
    expect(text).toBe("First paragraph.\n\nSecond paragraph.");
  });

  it("generates rich HTML in English", () => {
    const input = "Nepal is expanding its digital infrastructure across provincial hubs.";
    const resultHtml = toRichHtml(input, "en");
    expect(resultHtml).toContain('<p class="article-lead">');
    expect(resultHtml).toContain("Nepal is expanding");
  });

  it("generates rich HTML in Nepali", () => {
    const input = "नेपालमा डिजिटल पूर्वाधार विस्तारको काम तीव्र गतिमा अघि बढिरहेको छ।";
    const resultHtml = toRichHtml(input, "ne");
    expect(resultHtml).toContain('<p class="article-lead">');
    expect(hasDevanagari(resultHtml)).toBe(true);
  });

  it("detects devanagari characters accurately", () => {
    expect(hasDevanagari("नेपाल समाचार")).toBe(true);
    expect(hasDevanagari("Nepal News update")).toBe(false);
  });

  it("identifies invalid translation API error responses correctly", () => {
    expect(
      isInvalidTranslationText(
        "'AUTO' IS AN INVALID SOURCE LANGUAGE . EXAMPLE: LANGPAIR=EN|IT USING 2 LETTER ISO OR RFC3066 LIKE ZH-CN. ALMOST ALL LANGUAGES SUPPORTED BUT SOME MAY HAVE NO CONTENT",
      ),
    ).toBe(true);
    expect(
      isInvalidTranslationText("auto-is-an-invalid-source-language-example"),
    ).toBe(true);
    expect(isInvalidTranslationText("MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS")).toBe(true);
    expect(isInvalidTranslationText("Nepal government announces new fiscal policies")).toBe(false);
    expect(isInvalidTranslationText("नेपालको ताजा समाचार")).toBe(false);
  });

  it("sanitizes makeSlug against invalid translation errors", () => {
    expect(
      makeSlug(
        "'AUTO' IS AN INVALID SOURCE LANGUAGE . EXAMPLE: LANGPAIR=EN|IT USING 2 LETTER ISO",
      ),
    ).toBe("nepal-news");
    expect(makeSlug("Flood relief efforts in Rasuwa")).toBe(
      "flood-relief-efforts-in-rasuwa",
    );
  });
});

