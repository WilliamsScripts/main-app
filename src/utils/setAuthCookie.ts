import { NextResponse } from "next/server";

export function setAuthCookie(response: NextResponse, accessToken: string) {
  const isLocal = process.env.NODE_ENV !== "production";
  response.cookies.set("access_token", accessToken, {
    domain: isLocal ? "localhost" : ".vercel.app",
    path: "/",
    secure: !isLocal,
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
