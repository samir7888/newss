import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.WEBHOOK_SECRET || process.env.CRON_SECRET;

  if (!secret) {
    console.warn("WEBHOOK_SECRET / CRON_SECRET is not configured.");
    return false;
  }

  const headerSecret =
    request.headers.get("x-webhook-secret") ||
    request.headers.get("x-cron-secret");
  if (headerSecret && headerSecret === secret) return true;

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ") && authHeader.slice(7) === secret) {
    return true;
  }

  return false;
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { action, articles } = body;

    if (action === "articles_published" && Array.isArray(articles)) {
      // Revalidate sitemap and related paths immediately
      revalidatePath("/sitemap.xml");

      // Revalidate homepage feeds
      revalidatePath("/");
      revalidatePath("/en");

      // Revalidate article cache tags
      revalidateTag("articles", "default");
      revalidateTag("homepage", "default");

      // Revalidate individual article pages and categories
      for (const article of articles) {
        if (article.slugNe) revalidatePath(`/ne/article/${article.slugNe}`);
        if (article.slugEn) revalidatePath(`/en/article/${article.slugEn}`);
        if (article.category) {
          revalidatePath(`/ne/category/${article.category}`);
          revalidatePath(`/en/category/${article.category}`);
          revalidateTag(`category-${article.category}`, "default");
        }
      }

      return NextResponse.json({
        success: true,
        message: `Revalidated paths for ${articles.length} articles`,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json(
      { error: "Invalid action or missing articles data" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error", message: (error as Error).message },
      { status: 500 },
    );
  }
}

// Allow GET for health checks
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "articles-webhook",
    timestamp: Date.now(),
  });
}
