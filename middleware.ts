import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/jwt-edge";

const PROTECTED_PREFIXES = ["/dashboard", "/courses", "/plan", "/techniques", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  if (!isProtected) return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const studentId = await verifySessionToken(token);
  if (studentId) return NextResponse.next();

  const redirectUrl = new URL("/onboarding?source=signin", request.url);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/courses/:path*", "/plan/:path*", "/techniques/:path*", "/settings/:path*"],
};
