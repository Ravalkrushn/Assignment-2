import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Visitor } from "@/models/Visitor";
import { Photo } from "@/models/Photo";
import { normalizeEmail } from "@/lib/utils";
import { VisitorLookupResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { exists: false, error: "Valid email parameter required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const normalized = normalizeEmail(email);
    const visitor = await Visitor.findOne({ normalizedEmail: normalized });

    if (!visitor) {
      const response: VisitorLookupResponse = { exists: false };
      return NextResponse.json(response);
    }

    // Retrieve visitor's active photos count and recent photos
    const [photoCount, recentPhotos] = await Promise.all([
      Photo.countDocuments({ visitorId: visitor._id, displayStatus: "active" }),
      Photo.find({ visitorId: visitor._id, displayStatus: "active" })
        .sort({ uploadedAt: -1 })
        .limit(6)
        .select("_id imageUrl uploadedAt"),
    ]);

    const response: VisitorLookupResponse = {
      exists: true,
      visitor: {
        id: visitor._id.toString(),
        name: visitor.name,
        email: visitor.email,
        lastVisitAt: visitor.lastVisitAt ? visitor.lastVisitAt.toISOString() : visitor.createdAt.toISOString(),
        photoCount,
        recentPhotos: recentPhotos.map((p) => ({
          id: p._id.toString(),
          imageUrl: p.imageUrl,
          uploadedAt: p.uploadedAt.toISOString(),
        })),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in visitor lookup:", error);
    return NextResponse.json(
      { exists: false, error: "Internal server error during lookup" },
      { status: 500 }
    );
  }
}
