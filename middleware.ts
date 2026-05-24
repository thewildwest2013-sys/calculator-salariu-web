import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const noindexRoutes = [
  "/login",
  "/register",
  "/premium",
  "/history",
  "/security",
];

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;

  if (noindexRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  return response;
}

export const config = {
  matcher: ["/login/:path*", "/register/:path*", "/premium/:path*", "/history/:path*", "/security/:path*"],
};
