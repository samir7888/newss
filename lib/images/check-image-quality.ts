export interface ImageQualityResult {
  isUsable: boolean;
  width?: number;
  height?: number;
  contentType?: string;
  reason?: string; // why it failed, for logging
}

export const MIN_IMAGE_WIDTH = 600;
export const MIN_IMAGE_HEIGHT = 315;
export const MIN_IMAGE_FILE_SIZE = 5_000; // 5KB minimum to filter tracking pixels / icons

const ALLOWED_CONTENT_TYPES = ["image/jpeg", "image/png", "image/webp"];

const BROWSER_USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

export async function checkImageQuality(imageUrl: string): Promise<ImageQualityResult> {
  if (!imageUrl || !imageUrl.startsWith("http")) {
    return { isUsable: false, reason: "invalid or missing URL" };
  }

  try {
    // 1. HEAD request first to cheaply inspect headers without downloading full payload
    let contentType = "";
    let contentLength = 0;

    try {
      const headResponse = await fetch(imageUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(5000),
        headers: {
          "User-Agent": BROWSER_USER_AGENT,
        },
      });

      if (headResponse.ok) {
        contentType = headResponse.headers.get("content-type") ?? "";
        contentLength = Number(headResponse.headers.get("content-length") ?? 0);
      } else if (headResponse.status === 405 || headResponse.status === 501) {
        // Some CDNs/origins reject HEAD methods; fall back to GET check below
      } else {
        return { isUsable: false, reason: `HTTP ${headResponse.status}` };
      }
    } catch {
      // If HEAD fails due to network quirk or method unsupported, proceed to GET
    }

    if (contentType) {
      if (!contentType.startsWith("image/")) {
        return { isUsable: false, reason: `not an image (${contentType})` };
      }

      if (!ALLOWED_CONTENT_TYPES.some((type) => contentType.includes(type))) {
        return { isUsable: false, reason: `unsupported format (${contentType})` };
      }
    }

    if (contentLength > 0 && contentLength < MIN_IMAGE_FILE_SIZE) {
      return { isUsable: false, reason: "file too small, likely not a real photo" };
    }

    // 2. Fetch image bytes to verify format and calculate dimensions
    const imageResponse = await fetch(imageUrl, {
      signal: AbortSignal.timeout(6000),
      headers: {
        "User-Agent": BROWSER_USER_AGENT,
      },
    });

    if (!imageResponse.ok) {
      return { isUsable: false, reason: `HTTP ${imageResponse.status}` };
    }

    const fetchedContentType = imageResponse.headers.get("content-type") ?? contentType;
    if (fetchedContentType) {
      if (!fetchedContentType.startsWith("image/")) {
        return { isUsable: false, reason: `not an image (${fetchedContentType})` };
      }

      if (!ALLOWED_CONTENT_TYPES.some((type) => fetchedContentType.includes(type))) {
        return { isUsable: false, reason: `unsupported format (${fetchedContentType})` };
      }
    }

    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    if (buffer.length < MIN_IMAGE_FILE_SIZE) {
      return { isUsable: false, reason: "file too small, likely not a real photo" };
    }

    const { imageSize, default: sizeOf } = await import("image-size");
    const getSize = imageSize || sizeOf;
    const dimensions = getSize(buffer);

    if (!dimensions || !dimensions.width || !dimensions.height) {
      return { isUsable: false, reason: "could not determine dimensions" };
    }

    if (dimensions.width < MIN_IMAGE_WIDTH || dimensions.height < MIN_IMAGE_HEIGHT) {
      return {
        isUsable: false,
        width: dimensions.width,
        height: dimensions.height,
        reason: `too small (${dimensions.width}x${dimensions.height})`,
      };
    }

    return {
      isUsable: true,
      width: dimensions.width,
      height: dimensions.height,
      contentType: fetchedContentType || contentType,
    };
  } catch (error) {
    return { isUsable: false, reason: (error as Error).message };
  }
}
