import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Photo } from "@/models/Photo";
import { Visitor, IVisitorDocument } from "@/models/Visitor";
import { verifyAdminApiRequest } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { authenticated } = verifyAdminApiRequest(request);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "all";
    const visitorId = searchParams.get("visitorId");
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "24", 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};

    if (status !== "all" && ["active", "archived", "flagged"].includes(status)) {
      filter.displayStatus = status;
    }

    if (visitorId) {
      filter.visitorId = visitorId;
    }

    // If search is provided, find matching visitors first
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      const matchedVisitors = await Visitor.find({
        $or: [{ name: regex }, { email: regex }],
      }).select("_id");
      const matchedVisitorIds = matchedVisitors.map((v) => v._id);

      filter.$or = [
        { originalName: regex },
        { visitorId: { $in: matchedVisitorIds } },
      ];
    }

    const totalCount = await Photo.countDocuments(filter);
    const photosDocs = await Photo.find(filter)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate<{ visitorId: IVisitorDocument }>("visitorId", "name email createdAt lastVisitAt")
      .lean();

    const photos = photosDocs.map((p) => {
      const visitor = p.visitorId as unknown as IVisitorDocument | null;
      return {
        id: String(p._id),
        imageUrl: p.imageUrl,
        originalName: p.originalName,
        mimeType: p.mimeType,
        size: p.size,
        displayStatus: p.displayStatus,
        consentGiven: p.consentGiven,
        consentTimestamp: p.consentTimestamp,
        uploadedAt: p.uploadedAt,
        visitor: visitor
          ? {
              id: String(visitor._id),
              name: visitor.name,
              email: visitor.email,
              lastVisitAt: visitor.lastVisitAt,
            }
          : null,
      };
    });

    return NextResponse.json({
      success: true,
      photos,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: unknown) {
    console.error("Admin photos list error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve photos list" },
      { status: 500 }
    );
  }
}
