import { NextResponse, type NextRequest } from "next/server";
import { getPenelitianList } from "@/features/penelitian/data";
import { getCurrentProfile } from "@/lib/auth/guard";
import { parseListSearchParams } from "@/lib/query/list-query";

/** GET /api/penelitian — REST-style read contract (docs §3.4). RLS-scoped. */
export async function GET(request: NextRequest) {
  const profile = await getCurrentProfile();
  if (!profile) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const sp = Object.fromEntries(request.nextUrl.searchParams);
  const { data, meta } = await getPenelitianList(parseListSearchParams(sp));
  return NextResponse.json({ message: "Data retrieved successfully", data, meta });
}
