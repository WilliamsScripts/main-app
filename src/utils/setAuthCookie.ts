import { NextResponse } from "next/server";

export function setAuthCookie(response: NextResponse, accessToken: string) {
  const isLocal = process.env.NODE_ENV !== "production";
  const domain = isLocal ? "localhost" : ".vercel.app";

  console.log("Setting auth cookie with config:", {
    domain,
    isLocal,
    env: process.env.NODE_ENV,
    accessToken,
  });

  response.cookies.set("access_token", accessToken, {
    domain,
    path: "/",
    secure: !isLocal,
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
}
