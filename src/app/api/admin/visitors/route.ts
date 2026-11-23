import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Visitor } from "@/models/Visitor";
import { Photo } from "@/models/Photo";
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
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [{ name: regex }, { email: regex }, { normalizedEmail: regex }];
    }

    const totalCount = await Visitor.countDocuments(filter);
    const visitorsDocs = await Visitor.find(filter)
      .sort({ lastVisitAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Map photo counts and returning status
    const visitors = await Promise.all(
      visitorsDocs.map(async (v) => {
        const photoCount = await Photo.countDocuments({ visitorId: v._id });
        const isReturning = Boolean(
          v.createdAt &&
          v.lastVisitAt &&
          new Date(v.lastVisitAt).getTime() - new Date(v.createdAt).getTime() > 1000
        );

        return {
          id: String(v._id),
          name: v.name,
          email: v.email,
          createdAt: v.createdAt,
          lastVisitAt: v.lastVisitAt,
          photoCount,
          isReturning,
        };
      })
    );

    return NextResponse.json({
      success: true,
      visitors,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (err: unknown) {
    console.error("Admin visitors error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve visitors list" },
      { status: 500 }
    );
  }
}
