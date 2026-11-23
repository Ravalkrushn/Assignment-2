import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Visitor } from "@/models/Visitor";
import { Photo } from "@/models/Photo";
import { verifyAdminApiRequest } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { authenticated } = verifyAdminApiRequest(request);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ success: false, error: "Invalid visitor ID" }, { status: 400 });
    }

    await connectToDatabase();

    const visitor = await Visitor.findById(id).lean();
    if (!visitor) {
      return NextResponse.json({ success: false, error: "Visitor not found" }, { status: 404 });
    }

    const photos = await Photo.find({ visitorId: visitor._id })
      .sort({ uploadedAt: -1 })
      .lean();

    const isReturning = Boolean(
      visitor.createdAt &&
      visitor.lastVisitAt &&
      new Date(visitor.lastVisitAt).getTime() - new Date(visitor.createdAt).getTime() > 1000
    );

    return NextResponse.json({
      success: true,
      visitor: {
        id: String(visitor._id),
        name: visitor.name,
        email: visitor.email,
        createdAt: visitor.createdAt,
        lastVisitAt: visitor.lastVisitAt,
        isReturning,
        photosCount: photos.length,
        photos: photos.map((p) => ({
          id: String(p._id),
          imageUrl: p.imageUrl,
          originalName: p.originalName,
          mimeType: p.mimeType,
          size: p.size,
          consentGiven: p.consentGiven,
          consentTimestamp: p.consentTimestamp,
          uploadedAt: p.uploadedAt,
          displayStatus: p.displayStatus,
        })),
      },
    });
  } catch (err: unknown) {
    console.error("Admin visitor detail error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve visitor details" },
      { status: 500 }
    );
  }
}
