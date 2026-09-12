import { NextRequest, NextResponse } from "next/server";
import { cookieName, validSession } from "./lib/access.mjs";

export function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  if (path === "/login" || path === "/api/unlock") return NextResponse.next();
  const password = process.env.SITE_PASSWORD;
  if (!password)
    return new NextResponse(
      "Set SITE_PASSWORD in .env before starting the website.",
      { status: 503 },
    );
  if (!validSession(request.cookies.get(cookieName)?.value, password)) {
    if (path.startsWith("/api/"))
      return NextResponse.json(
        { error: "Enter the site password first." },
        { status: 401 },
      );
    return NextResponse.redirect(new URL("/login", request.url));
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  response.headers.set("X-Robots-Tag", "noindex, nofollow");
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
