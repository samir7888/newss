import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  checkImageQuality,
  MIN_IMAGE_WIDTH,
  MIN_IMAGE_HEIGHT,
  MIN_IMAGE_FILE_SIZE,
} from "./check-image-quality";

describe("checkImageQuality", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("rejects missing or invalid URLs immediately", async () => {
    expect((await checkImageQuality("")).isUsable).toBe(false);
    expect((await checkImageQuality("invalid-url")).isUsable).toBe(false);
    expect((await checkImageQuality("ftp://example.com/pic.jpg")).isUsable).toBe(false);
  });

  it("rejects non-200 HTTP responses on HEAD", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url, init) => {
      if (init?.method === "HEAD") {
        return new Response(null, { status: 404 });
      }
      return new Response(null, { status: 404 });
    });

    const result = await checkImageQuality("https://example.com/missing.jpg");
    expect(result.isUsable).toBe(false);
    expect(result.reason).toContain("HTTP 404");
  });

  it("rejects non-image content types", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url, init) => {
      if (init?.method === "HEAD") {
        return new Response(null, {
          status: 200,
          headers: { "content-type": "text/html" },
        });
      }
      return new Response("<html>Not an image</html>", {
        status: 200,
        headers: { "content-type": "text/html" },
      });
    });

    const result = await checkImageQuality("https://example.com/page");
    expect(result.isUsable).toBe(false);
    expect(result.reason).toContain("not an image");
  });

  it("rejects unsupported image formats (e.g. svg, gif)", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url, init) => {
      if (init?.method === "HEAD") {
        return new Response(null, {
          status: 200,
          headers: { "content-type": "image/gif" },
        });
      }
      return new Response("GIF89a...", {
        status: 200,
        headers: { "content-type": "image/gif" },
      });
    });

    const result = await checkImageQuality("https://example.com/anim.gif");
    expect(result.isUsable).toBe(false);
    expect(result.reason).toContain("unsupported format");
  });

  it("rejects tiny files via content-length header (e.g. 1x1 tracking pixel)", async () => {
    globalThis.fetch = vi.fn().mockImplementation(async (url, init) => {
      if (init?.method === "HEAD") {
        return new Response(null, {
          status: 200,
          headers: {
            "content-type": "image/jpeg",
            "content-length": "42",
          },
        });
      }
      return new Response(new Uint8Array(42), {
        status: 200,
        headers: { "content-type": "image/jpeg" },
      });
    });

    const result = await checkImageQuality("https://example.com/tracker.jpg");
    expect(result.isUsable).toBe(false);
    expect(result.reason).toContain("file too small");
  });

  it("rejects images smaller than minimum dimension thresholds (600x315)", async () => {
    // A valid PNG header for a 300x150 image, padded to > 5000 bytes
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    // IHDR chunk: length 13 (00 00 00 0D), "IHDR", width (300 = 0x0000012C), height (150 = 0x00000096),
    // bit depth 8, color type 2, compression 0, filter 0, interlace 0, CRC 4 bytes
    const pngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
      0x00, 0x00, 0x00, 0x0d, // IHDR length
      0x49, 0x48, 0x44, 0x52, // "IHDR"
      0x00, 0x00, 0x01, 0x2c, // width = 300
      0x00, 0x00, 0x00, 0x96, // height = 150
      0x08, 0x02, 0x00, 0x00, 0x00,
      0x7a, 0x3d, 0x24, 0x8a, // CRC
    ]);
    const smallImageBuffer = Buffer.concat([pngHeader, Buffer.alloc(6000)]);

    globalThis.fetch = vi.fn().mockImplementation(async (url, init) => {
      if (init?.method === "HEAD") {
        return new Response(null, {
          status: 200,
          headers: {
            "content-type": "image/png",
            "content-length": smallImageBuffer.length.toString(),
          },
        });
      }
      return new Response(smallImageBuffer, {
        status: 200,
        headers: { "content-type": "image/png" },
      });
    });

    const result = await checkImageQuality("https://example.com/thumbnail.png");
    expect(result.isUsable).toBe(false);
    expect(result.reason).toContain("too small (300x150)");
    expect(result.width).toBe(300);
    expect(result.height).toBe(150);
  });

  it("accepts valid hero images that exceed thresholds (e.g. 1200x630)", async () => {
    // PNG IHDR: width = 1200 (0x000004B0), height = 630 (0x00000276)
    const validPngHeader = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, // PNG Signature
      0x00, 0x00, 0x00, 0x0d, // IHDR length
      0x49, 0x48, 0x44, 0x52, // "IHDR"
      0x00, 0x00, 0x04, 0xb0, // width = 1200
      0x00, 0x00, 0x02, 0x76, // height = 630
      0x08, 0x02, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, // CRC dummy
    ]);
    const validImageBuffer = Buffer.concat([validPngHeader, Buffer.alloc(8000)]);

    globalThis.fetch = vi.fn().mockImplementation(async (url, init) => {
      if (init?.method === "HEAD") {
        return new Response(null, {
          status: 200,
          headers: {
            "content-type": "image/png",
            "content-length": validImageBuffer.length.toString(),
          },
        });
      }
      return new Response(validImageBuffer, {
        status: 200,
        headers: { "content-type": "image/png" },
      });
    });

    const result = await checkImageQuality("https://example.com/hero.png");
    expect(result.isUsable).toBe(true);
    expect(result.width).toBe(1200);
    expect(result.height).toBe(630);
    expect(result.contentType).toBe("image/png");
  });
});
