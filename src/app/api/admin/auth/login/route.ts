import { NextRequest, NextResponse } from "next/server";
import { verifyAdminCredentials, createSessionToken, setAdminCookie, getAdminEmail } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { password, email } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      );
    }

    const isValid = verifyAdminCredentials(password, email);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid administrator credentials" },
        { status: 401 }
      );
    }

    const resolvedEmail = email?.trim() || getAdminEmail();
    const token = createSessionToken(resolvedEmail);

    const response = NextResponse.json({
      success: true,
      message: "Authentication successful",
      user: {
        email: resolvedEmail,
        role: "admin",
      },
    });

    setAdminCookie(response, token);
    return response;
  } catch (err: unknown) {
    console.error("Admin login error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}
