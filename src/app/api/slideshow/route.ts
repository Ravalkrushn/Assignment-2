import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Photo, IPhotoDocument } from "@/models/Photo";
import { Visitor, IVisitorDocument } from "@/models/Visitor";

export const dynamic = "force-dynamic";

export interface SlideshowItem {
  id: string;
  imageUrl: string;
  originalName: string;
  uploadedAt: string;
  mimeType: string;
  size: number;
  visitor: {
    id: string;
    name: string;
    isReturning: boolean;
    lastVisitAt?: string;
    createdAt?: string;
  };
}

export interface SlideshowApiResponse {
  success: boolean;
  count: number;
  lastUpdated: string | null;
  serverTime: string;
  photos: SlideshowItem[];
  hasUpdates?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Ensure models are registered in Mongoose
    if (!Visitor || !Photo) {
      throw new Error("Models not initialized");
    }

    const { searchParams } = new URL(request.url);
    const sinceParam = searchParams.get("since");
    const modeParam = searchParams.get("mode");
    const limitParam = parseInt(searchParams.get("limit") || "100", 10);
    const limit = Math.min(Math.max(1, isNaN(limitParam) ? 100 : limitParam), 200);

    // Delta mode for lightweight polling
    if (modeParam === "delta" && sinceParam) {
      const sinceDate = new Date(sinceParam);
      if (!isNaN(sinceDate.getTime())) {
        const newPhotosCount = await Photo.countDocuments({
          displayStatus: "active",
          consentGiven: true,
          uploadedAt: { $gt: sinceDate },
        });

        const totalActive = await Photo.countDocuments({
          displayStatus: "active",
          consentGiven: true,
        });

        // Also fetch the most recent timestamp
        const latestDoc = await Photo.findOne({
          displayStatus: "active",
          consentGiven: true,
        })
          .sort({ uploadedAt: -1 })
          .select("uploadedAt")
          .lean<{ uploadedAt: Date } | null>();

        return NextResponse.json({
          success: true,
          hasUpdates: newPhotosCount > 0,
          newCount: newPhotosCount,
          totalCount: totalActive,
          lastUpdated: latestDoc?.uploadedAt ? latestDoc.uploadedAt.toISOString() : null,
          serverTime: new Date().toISOString(),
        });
      }
    }

    // Retrieve active photos with populated visitor info
    const photosDocs = await Photo.find({
      displayStatus: "active",
      consentGiven: true,
    })
      .sort({ uploadedAt: -1 })
      .limit(limit)
      .populate<{ visitorId: IVisitorDocument }>("visitorId", "name email createdAt lastVisitAt")
      .lean();

    const formattedPhotos: SlideshowItem[] = photosDocs.map((doc) => {
      const visitorDoc = doc.visitorId as unknown as IVisitorDocument | null;
      const isReturningVisitor = Boolean(
        visitorDoc &&
        visitorDoc.createdAt &&
        visitorDoc.lastVisitAt &&
        new Date(visitorDoc.lastVisitAt).getTime() - new Date(visitorDoc.createdAt).getTime() > 1000
      );

      return {
        id: doc._id.toString(),
        imageUrl: doc.imageUrl,
        originalName: doc.originalName,
        uploadedAt: doc.uploadedAt instanceof Date ? doc.uploadedAt.toISOString() : new Date(doc.uploadedAt).toISOString(),
        mimeType: doc.mimeType,
        size: doc.size,
        visitor: {
          id: visitorDoc?._id ? visitorDoc._id.toString() : doc.visitorId?.toString() || "unknown",
          name: visitorDoc?.name || "Anonymous Visitor",
          isReturning: isReturningVisitor,
          lastVisitAt: visitorDoc?.lastVisitAt ? new Date(visitorDoc.lastVisitAt).toISOString() : undefined,
          createdAt: visitorDoc?.createdAt ? new Date(visitorDoc.createdAt).toISOString() : undefined,
        },
      };
    });

    const latestUpload = formattedPhotos.length > 0 ? formattedPhotos[0].uploadedAt : null;

    const responsePayload: SlideshowApiResponse = {
      success: true,
      count: formattedPhotos.length,
      lastUpdated: latestUpload,
      serverTime: new Date().toISOString(),
      photos: formattedPhotos,
    };

    return NextResponse.json(responsePayload, {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error) {
    console.error("Error in slideshow API route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to load slideshow photos.",
        count: 0,
        lastUpdated: null,
        serverTime: new Date().toISOString(),
        photos: [],
      },
      { status: 500 }
    );
  }
}
