import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const privateRoutes = [
  "/login", "/register", "/forgot-password", "/dashboard", "/profiles", "/company",
  "/history", "/settings", "/assistant", "/pricing/success",
];

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  const pathname = request.nextUrl.pathname;
  if (privateRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)"],
};
