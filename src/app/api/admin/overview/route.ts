import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Visitor, IVisitorDocument } from "@/models/Visitor";
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

    // 1. Total counts
    const totalVisitors = await Visitor.countDocuments();
    const totalPhotos = await Photo.countDocuments();

    // 2. Today's visitors (since start of current calendar day in local/UTC)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayVisitors = await Visitor.countDocuments({
      $or: [
        { createdAt: { $gte: startOfToday } },
        { lastVisitAt: { $gte: startOfToday } },
      ],
    });

    // 3. Returning visitors (where lastVisitAt > createdAt by more than 1 second)
    const returningVisitors = await Visitor.countDocuments({
      $expr: {
        $gt: [{ $subtract: ["$lastVisitAt", "$createdAt"] }, 1000],
      },
    });

    // 4. Active photos on slideshow
    const activePhotosCount = await Photo.countDocuments({
      displayStatus: "active",
      consentGiven: true,
    });

    const flaggedPhotosCount = await Photo.countDocuments({
      displayStatus: "flagged",
    });

    // 5. Recent visitors (latest 6)
    const recentVisitorDocs = await Visitor.find()
      .sort({ lastVisitAt: -1 })
      .limit(6)
      .lean();

    // Get photo counts for these recent visitors
    const recentVisitors = await Promise.all(
      recentVisitorDocs.map(async (v) => {
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

    // 6. Recent photos (latest 8)
    const recentPhotoDocs = await Photo.find()
      .sort({ uploadedAt: -1 })
      .limit(8)
      .populate<{ visitorId: IVisitorDocument }>("visitorId", "name email")
      .lean();

    const recentPhotos = recentPhotoDocs.map((p) => {
      const visitor = p.visitorId as unknown as IVisitorDocument | null;
      return {
        id: String(p._id),
        imageUrl: p.imageUrl,
        originalName: p.originalName,
        mimeType: p.mimeType,
        size: p.size,
        displayStatus: p.displayStatus,
        consentGiven: p.consentGiven,
        uploadedAt: p.uploadedAt,
        visitorName: visitor?.name || "Unknown Visitor",
        visitorEmail: visitor?.email || "",
      };
    });

    // 7. Activity aggregation: count photos per day for the last 7 days
    const activityDays: { date: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayStart = new Date(d);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(d);
      dayEnd.setHours(23, 59, 59, 999);

      const count = await Photo.countDocuments({
        uploadedAt: { $gte: dayStart, $lte: dayEnd },
      });

      const label = dayStart.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
      const isoDate = dayStart.toISOString().split("T")[0];
      activityDays.push({ date: isoDate, label, count });
    }

    // 8. Slideshow status
    const latestActivePhoto = await Photo.findOne({
      displayStatus: "active",
      consentGiven: true,
    })
      .sort({ uploadedAt: -1 })
      .select("uploadedAt")
      .lean<{ uploadedAt: Date } | null>();

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalVisitors,
          totalPhotos,
          todayVisitors,
          returningVisitors,
          activePhotosCount,
          flaggedPhotosCount,
        },
        recentVisitors,
        recentPhotos,
        uploadActivity: activityDays,
        slideshowStatus: {
          isActive: activePhotosCount > 0,
          totalAvailable: activePhotosCount,
          lastUpdated: latestActivePhoto?.uploadedAt || null,
        },
      },
    });
  } catch (err: unknown) {
    console.error("Admin overview error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve overview statistics" },
      { status: 500 }
    );
  }
}
