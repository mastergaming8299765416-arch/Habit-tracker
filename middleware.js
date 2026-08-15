import { NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const ADMIN_PATH = "/secure-admin-x7q9";
const ADMIN_DASHBOARD_PATH = `${ADMIN_PATH}/dashboard`;

export async function middleware(request) {
  const { response, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;

  // Only the /dashboard sub-route needs auth — the bare ADMIN_PATH is the
  // login form itself and must stay reachable while logged out, or a
  // logged-out visitor gets redirected to it and immediately redirected
  // to it again, forever.
  const isAdminDashboard = path.startsWith(ADMIN_DASHBOARD_PATH);
  const isUserArea = path.startsWith("/dashboard");

  // Not logged in and hitting a protected area -> bounce to the right login
  if (!user && (isUserArea || isAdminDashboard)) {
    const loginUrl = new URL(isUserArea ? "/login" : ADMIN_PATH, request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in: check role for the admin dashboard. Regular users get
  // redirected to their own dashboard with no indication the admin area
  // exists.
  if (user && isAdminDashboard) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (!profile || profile.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Regular users should never be routed toward the admin path from
  // normal navigation — this is enforced by simply never linking to it
  // anywhere in the user-facing UI (see README).

  return response;
}

export const config = {
  matcher: ["/dashboard/:path*", "/secure-admin-x7q9/:path*"],
};
