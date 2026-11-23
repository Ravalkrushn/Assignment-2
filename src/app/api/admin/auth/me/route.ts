import { NextRequest, NextResponse } from "next/server";
import { verifyAdminApiRequest } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { authenticated, email } = verifyAdminApiRequest(request);

  if (!authenticated) {
    return NextResponse.json(
      { authenticated: false },
      { status: 401 }
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      email,
      role: "admin",
    },
  });
}
