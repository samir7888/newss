import { revalidatePath, revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

function isAuthorized(request: NextRequest): boolean {
  const secret =
    process.env.REVALIDATE_SECRET || process.env.CRON_SECRET;

  if (!secret) {
    console.warn("REVALIDATE_SECRET / CRON_SECRET is not configured.");
    return false;
  }

  const headerSecret =
    request.headers.get("x-revalidate-secret") ||
    request.headers.get("x-cron-secret");
  if (headerSecret && headerSecret === secret) return true;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && authHeader.slice(7) === secret) {
    return true;
  }

  const querySecret = request.nextUrl.searchParams.get("secret");
  if (querySecret && querySecret === secret) return true;

  return false;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const paths: string[] = Array.isArray(body?.paths) ? body.paths : [];
    const tags: string[] = Array.isArray(body?.tags) ? body.tags : [];

    const revalidatedPaths: string[] = [];
    for (const p of paths) {
      if (typeof p === "string" && p.startsWith("/")) {
        revalidatePath(p);
        revalidatedPaths.push(p);
      }
    }

    const revalidatedTags: string[] = [];
    for (const t of tags) {
      if (typeof t === "string" && t.trim()) {
        revalidateTag(t.trim(), "default");
        revalidatedTags.push(t.trim());
      }
    }

    return NextResponse.json({
      revalidated: true,
      paths: revalidatedPaths,
      tags: revalidatedTags,
      timestamp: Date.now(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to revalidate", message: (error as Error).message },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const path = request.nextUrl.searchParams.get("path");
  const tag = request.nextUrl.searchParams.get("tag");

  if (!path && !tag) {
    return NextResponse.json(
      { error: "Missing 'path' or 'tag' query parameter." },
      { status: 400 },
    );
  }

  if (path && path.startsWith("/")) {
    revalidatePath(path);
  }

  if (tag) {
    revalidateTag(tag, "default");
  }

  return NextResponse.json({
    revalidated: true,
    path: path || null,
    tag: tag || null,
    timestamp: Date.now(),
  });
}
