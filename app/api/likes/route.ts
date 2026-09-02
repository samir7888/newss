import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { articles } from "@/lib/db/schema";

export const revalidate = 0;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const slug = String(body.slug ?? "").trim();

    if (!slug) {
      return NextResponse.json({ error: "Missing slug" }, { status: 400 });
    }

    const rows = await db
      .update(articles)
      .set({ likesCount: sql`${articles.likesCount} + 1` })
      .where(eq(articles.slugEn, slug))
      .returning({ likesCount: articles.likesCount });

    if (rows.length === 0) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json({ likesCount: rows[0].likesCount ?? 0 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
