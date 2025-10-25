

import { getToken } from "next-auth/jwt";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const { pathname } = request.nextUrl;

  console.log(token)

  // --- PUBLIC ROUTES ---
  const publicRoutes = [
    "/more",
    "/login",
    "/sign-up",
    "/forgot-password",
    "/forgot-password/otp",
    "/forgot-password/otp/reset-password",
  ];

  // Allow public routes without token
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // --- CASE 1: Not logged in → redirect to /login ---
  if (!token) {
    return NextResponse.redirect(new URL("/more", request.url));
  }

  // --- CASE 2: Logged in but not paid ---
  if (token && !token.isPaid) {
    if (pathname !== "/subscription") {
      return NextResponse.redirect(new URL("/subscription", request.url));
    }
    return NextResponse.next();
  }

  // --- CASE 3: Logged in and paid ---
  if (token?.isPaid && (pathname === "/more" || pathname === "/subscription")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // --- CASE 4: Everything fine ---
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico|webp|css|js|map|json)|api).*)',
  ],
};
