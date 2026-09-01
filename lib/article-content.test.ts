import { describe, expect, it } from "vitest";
import { normalizeNepaliText, stripHtml, toRichHtml } from "./article-content";
import { hasDevanagari } from "../scripts/fetch-news";

describe("article-content", () => {
  it("strips html properly", () => {
    const html = "<p>First paragraph.</p><p>Second paragraph.</p>";
    const text = stripHtml(html);
    expect(text).toBe("First paragraph.\n\nSecond paragraph.");
  });

  it("increases body content length and generates rich HTML in English", () => {
    const input = "Nepal is expanding its digital infrastructure across provincial hubs.";
    const resultHtml = toRichHtml(input, "en");
    expect(resultHtml).toContain('<p class="article-lead">');
    expect(resultHtml.length).toBeGreaterThan(1500);
    expect(resultHtml).toContain("Nepal News Pulse");
  });

  it("increases body content length and generates rich HTML in Nepali", () => {
    const input = "नेपालमा डिजिटल पूर्वाधार विस्तारको काम तीव्र गतिमा अघि बढिरहेको छ।";
    const resultHtml = toRichHtml(input, "ne");
    expect(resultHtml).toContain('<p class="article-lead">');
    expect(resultHtml.length).toBeGreaterThan(1200);
    expect(hasDevanagari(resultHtml)).toBe(true);
  });

  it("detects devanagari characters accurately", () => {
    expect(hasDevanagari("नेपाल समाचार")).toBe(true);
    expect(hasDevanagari("Nepal News update")).toBe(false);
  });
});
