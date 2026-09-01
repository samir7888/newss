import { NextResponse } from "next/server";
import { runNewsFetch } from "../../../../scripts/fetch-news";

export async function GET(request: Request) {
  const secret = request.headers.get("x-cron-secret");

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runNewsFetch();

  return NextResponse.json({
    ok: true,
    message: "News fetch completed successfully.",
    ...result,
  });
}
