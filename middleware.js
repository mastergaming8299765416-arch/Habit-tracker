import { NextResponse } from "next/server";
import { updateSession } from "./lib/supabase/middleware";

const ADMIN_PATH = "/secure-admin-x7q9";

export async function middleware(request) {
  const { response, user, supabase } = await updateSession(request);
  const path = request.nextUrl.pathname;

  const isAdminArea = path.startsWith(ADMIN_PATH);
  const isUserArea = path.startsWith("/dashboard");

  // Not logged in and hitting a protected area -> bounce to the right login
  if (!user && (isUserArea || isAdminArea)) {
    const loginUrl = new URL(isAdminArea ? ADMIN_PATH : "/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in: check role for admin area. Regular users get redirected
  // to their own dashboard with no indication the admin area exists.
  if (user && isAdminArea) {
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
