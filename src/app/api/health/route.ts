import { NextResponse } from "next/server";
import { getSupabase, PROJECTS_TABLE } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Keep-alive + health check.
 *
 * Supabase's free tier pauses a project after ~7 days with no queries. This
 * site legitimately sees very low traffic, so a Vercel Cron (see vercel.json)
 * hits this daily to keep the database awake. It doubles as a health endpoint.
 */
export async function GET(request: Request) {
  // Vercel Cron sends `Authorization: Bearer $CRON_SECRET` automatically.
  // Only enforced when CRON_SECRET is set, so local dev works without it.
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  try {
    const { error } = await getSupabase()
      .from(PROJECTS_TABLE)
      .select("id")
      .limit(1);

    if (error) throw new Error(error.message);

    return NextResponse.json({ status: "ok", database: "reachable" });
  } catch (error) {
    console.error("Health check failed:", error);
    return NextResponse.json(
      { status: "error", database: "unreachable" },
      { status: 503 }
    );
  }
}
