import { NextRequest, NextResponse } from "next/server";
import { getPersistentSettings, savePersistentSettings, ISlideshowSettingsData } from "@/lib/admin/settings";
import { verifyAdminApiRequest } from "@/lib/admin/auth";
import { connectToDatabase } from "@/lib/db";
import { Photo } from "@/models/Photo";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { authenticated } = verifyAdminApiRequest(request);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();
    const settings = await getPersistentSettings();

    const activeCount = await Photo.countDocuments({
      displayStatus: "active",
      consentGiven: true,
    });

    const latestDoc = await Photo.findOne({
      displayStatus: "active",
      consentGiven: true,
    })
      .sort({ uploadedAt: -1 })
      .select("uploadedAt")
      .lean<{ uploadedAt: Date } | null>();

    return NextResponse.json({
      success: true,
      settings,
      meta: {
        totalActivePhotos: activeCount,
        lastUpdated: latestDoc?.uploadedAt || null,
        displayUrl: "/display",
      },
    });
  } catch (err: unknown) {
    console.error("Admin settings get error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve slideshow settings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { authenticated } = verifyAdminApiRequest(request);
    if (!authenticated) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));

    // Validation
    const updates: Partial<ISlideshowSettingsData> = {};

    if (typeof body.durationSeconds === "number" && body.durationSeconds >= 2 && body.durationSeconds <= 60) {
      updates.durationSeconds = body.durationSeconds;
    }

    if (["kenburns", "crossfade", "slide"].includes(body.transition)) {
      updates.transition = body.transition;
    }

    if (["ambient", "contain", "cover"].includes(body.fitMode)) {
      updates.fitMode = body.fitMode;
    }

    if (typeof body.showInfoOverlay === "boolean") {
      updates.showInfoOverlay = body.showInfoOverlay;
    }

    if (typeof body.autoPlay === "boolean") {
      updates.autoPlay = body.autoPlay;
    }

    if (typeof body.loop === "boolean") {
      updates.loop = body.loop;
    }

    const updated = await savePersistentSettings(updates);

    return NextResponse.json({
      success: true,
      message: "Slideshow settings saved persistently",
      settings: updated,
    });
  } catch (err: unknown) {
    console.error("Admin settings save error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to save slideshow settings" },
      { status: 500 }
    );
  }
}
