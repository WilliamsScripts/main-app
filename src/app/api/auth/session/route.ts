import { NextResponse } from "next/server";
import { setAuthCookie } from "@/utils/setAuthCookie";

export async function POST(request: Request) {
  try {
    const { session } = await request.json();

    if (!session?.access_token) {
      return NextResponse.json(
        { error: "No access token provided" },
        { status: 400 }
      );
    }

    const response = NextResponse.json({ success: true });
    setAuthCookie(response, session.access_token);

    return response;
  } catch (error) {
    console.error("Error setting auth cookie:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
