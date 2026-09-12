import { NextRequest, NextResponse } from "next/server";
import { cookieName } from "@/lib/access.mjs";

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin)
    return new NextResponse("Forbidden", { status: 403 });
  const response = NextResponse.redirect(new URL("/login", request.url), 303);
  response.cookies.delete(cookieName);
  return response;
}
