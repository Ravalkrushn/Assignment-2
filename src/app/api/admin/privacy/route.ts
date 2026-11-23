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

    // Query all visitors and their consent timestamps from photos
    const visitorsDocs = await Visitor.find().sort({ createdAt: -1 }).lean();

    const consentRecords = await Promise.all(
      visitorsDocs.map(async (v) => {
        const photos = await Photo.find({ visitorId: v._id }).select("consentGiven consentTimestamp").lean();
        const hasConsent = photos.length > 0 ? photos.every((p) => p.consentGiven) : true;
        const latestConsentTimestamp = photos.length > 0 ? photos[photos.length - 1].consentTimestamp : v.createdAt;

        return {
          visitorId: String(v._id),
          name: v.name,
          email: v.email,
          consentGiven: hasConsent,
          consentTimestamp: latestConsentTimestamp,
          firstVisitAt: v.createdAt,
          lastVisitAt: v.lastVisitAt,
          photosCount: photos.length,
        };
      })
    );

    const limits = {
      maxFileSizeBytes: 10 * 1024 * 1024, // 10MB
      maxFileFormatted: "10 MB",
      maxFilesCount: 5,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
      allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
      magicByteVerification: "Enabled (FF D8 FF / 89 50 4E 47 / RIFF WEBP)",
    };

    const privacyPolicy = {
      consentRequired: true,
      displayConsentNotice: "I agree to have my uploaded photos displayed publicly on the venue slideshow during this visit.",
      emailPrivacy: "Visitor email is strictly private and administrative. It is never displayed publicly on the Smart TV or slideshow interface.",
      dataRetention: "Photos and visitor records are retained for historical retrospective upon subsequent visits. Administrators can remove individual photos at any time.",
    };

    return NextResponse.json({
      success: true,
      consentRecords,
      limits,
      privacyPolicy,
    });
  } catch (err: unknown) {
    console.error("Admin privacy records error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to retrieve privacy & consent records" },
      { status: 500 }
    );
  }
}
