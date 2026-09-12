import { NextRequest, NextResponse } from "next/server";
import {
  cookieName,
  equal,
  makeSession,
  sessionSeconds,
} from "@/lib/access.mjs";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new NextResponse("Forbidden", { status: 403 });
  const expected = process.env.SITE_PASSWORD;
  if (!expected)
    return new NextResponse("Set SITE_PASSWORD in .env.", { status: 503 });
  const form = await request.formData();
  const password = form.get("password");
  if (
    typeof password !== "string" ||
    password.length > 512 ||
    !equal(password, expected)
  ) {
    // ponytail: shared gate for a small demo; use identity-based access and rate limits for a real intranet.
    await new Promise((resolve) => setTimeout(resolve, 500));
    return NextResponse.redirect(new URL("/login?error=1", request.url), 303);
  }
  const response = NextResponse.redirect(new URL("/", request.url), 303);
  response.cookies.set(cookieName, makeSession(expected), {
    httpOnly: true,
    secure: request.nextUrl.protocol === "https:",
    sameSite: "lax",
    path: "/",
    maxAge: sessionSeconds,
  });
  return response;
}
