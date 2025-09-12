import { NextResponse } from "next/server";

export function middleware(req) {
  const url = req.nextUrl.clone();
  const cookie = req.cookies.get("admin-auth");

  if (url.pathname.startsWith("/admin") && !url.pathname.startsWith("/admin/login")) {
    if (!cookie) {
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
