import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_PATHS = ["/login", "/auth"];
/** Exact-match public paths (prefix match would open guarded child routes). */
const PUBLIC_EXACT = ["/"];

/** Prevent the browser from caching auth redirects (avoids stale-redirect bugs). */
function noStore(res: NextResponse): NextResponse {
  res.headers.set("Cache-Control", "no-store, must-revalidate");
  return res;
}

/** Refresh the Supabase session and guard authenticated routes (FR-AUTH-04). */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isPublic =
    PUBLIC_EXACT.includes(pathname) ||
    PUBLIC_PATHS.some((p) => pathname.startsWith(p));

  if (!user && !isPublic) {
    // API routes follow the REST contract (JSON 401), not an HTML redirect.
    if (pathname.startsWith("/api")) {
      return noStore(NextResponse.json({ message: "Unauthorized" }, { status: 401 }));
    }
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return noStore(NextResponse.redirect(url));
  }

  // Note: redirecting a signed-in user away from /login is handled in the login
  // page itself (it checks for a PROFILE, not just a session), which avoids a
  // /login ⇄ /home loop for an authenticated user with no profiles row.

  return response;
}
