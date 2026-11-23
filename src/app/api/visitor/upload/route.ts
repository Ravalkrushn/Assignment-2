import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import { Visitor } from "@/models/Visitor";
import { Photo } from "@/models/Photo";
import { storageProvider } from "@/lib/storage";
import {
  visitorFormSchema,
  validateImageMagicBytes,
  MAX_FILE_SIZE,
  MAX_FILES_COUNT,
} from "@/lib/validations/upload";
import { normalizeEmail, formatBytes } from "@/lib/utils";
import { VisitorUploadApiResponse } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const consentGivenStr = formData.get("consentGiven")?.toString() || "";
    const consentGiven = consentGivenStr === "true";

    // 1. Validate Form metadata
    const validationResult = visitorFormSchema.safeParse({
      name,
      email,
      consentGiven,
    });

    if (!validationResult.success) {
      const errorMsg = validationResult.error.errors.map((e) => e.message).join(", ");
      return NextResponse.json(
        { success: false, message: errorMsg },
        { status: 400 }
      );
    }

    // 2. Validate Photos
    const files = formData.getAll("photos") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, message: "Please select at least one photo to upload." },
        { status: 400 }
      );
    }

    if (files.length > MAX_FILES_COUNT) {
      return NextResponse.json(
        {
          success: false,
          message: `You can upload at most ${MAX_FILES_COUNT} photos per visit. Received ${files.length}.`,
        },
        { status: 400 }
      );
    }

    // Process and validate buffers in memory
    const validatedFilesData: Array<{
      buffer: Buffer;
      originalName: string;
      mimeType: string;
      size: number;
    }> = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          {
            success: false,
            message: `File "${file.name}" exceeds maximum allowed size of ${formatBytes(MAX_FILE_SIZE)}.`,
          },
          { status: 400 }
        );
      }

      if (file.size === 0) {
        return NextResponse.json(
          { success: false, message: `File "${file.name}" is empty.` },
          { status: 400 }
        );
      }

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Deep validate file headers (magic bytes)
      const magicCheck = validateImageMagicBytes(buffer);
      if (!magicCheck.valid) {
        return NextResponse.json(
          {
            success: false,
            message: `File "${file.name}" is not a valid JPG, PNG, or WEBP image.`,
          },
          { status: 400 }
        );
      }

      validatedFilesData.push({
        buffer,
        originalName: file.name,
        mimeType: magicCheck.detectedMime || file.type || "image/jpeg",
        size: file.size,
      });
    }

    // 3. Connect to Database
    await connectToDatabase();

    const normalized = normalizeEmail(email);
    const now = new Date();

    // 4. Identify Visitor (New or Returning)
    let visitor = await Visitor.findOne({ normalizedEmail: normalized });
    let isReturning = false;
    let previousPhotos: Array<{ id: string; imageUrl: string; uploadedAt: string }> = [];

    if (visitor) {
      isReturning = true;
      // Fetch previous active photos for returning visitor
      const prevPhotosDocs = await Photo.find({
        visitorId: visitor._id,
        displayStatus: "active",
      })
        .sort({ uploadedAt: -1 })
        .limit(10)
        .select("_id imageUrl uploadedAt");

      previousPhotos = prevPhotosDocs.map((p) => ({
        id: p._id.toString(),
        imageUrl: p.imageUrl,
        uploadedAt: p.uploadedAt.toISOString(),
      }));

      // Update visitor's last visit timestamp and ensure name is current
      visitor.lastVisitAt = now;
      if (name && name !== visitor.name) {
        visitor.name = name;
      }
      await visitor.save();
    } else {
      // Create new visitor
      visitor = await Visitor.create({
        name,
        email: email.trim(),
        normalizedEmail: normalized,
        createdAt: now,
        lastVisitAt: now,
      });
    }

    // 5. Store files and persist Photo records
    const createdPhotos = [];

    for (const item of validatedFilesData) {
      const stored = await storageProvider.save(item.buffer, item.originalName, item.mimeType);

      const photoDoc = await Photo.create({
        visitorId: visitor._id,
        imageUrl: stored.imageUrl,
        originalName: item.originalName,
        mimeType: item.mimeType,
        size: stored.size,
        consentGiven: true,
        consentTimestamp: now,
        uploadedAt: now,
        displayStatus: "active", // Immediately eligible for Slideshow
      });

      createdPhotos.push({
        id: photoDoc._id.toString(),
        imageUrl: photoDoc.imageUrl,
        originalName: photoDoc.originalName,
        uploadedAt: photoDoc.uploadedAt.toISOString(),
      });
    }

    const totalVisitorPhotos = await Photo.countDocuments({
      visitorId: visitor._id,
      displayStatus: "active",
    });

    const responsePayload: VisitorUploadApiResponse = {
      success: true,
      message: isReturning
        ? `Welcome back, ${visitor.name}! Your new photos have been added to the slideshow.`
        : `Thank you, ${visitor.name}! Your photos are now playing on the slideshow.`,
      visitor: {
        id: visitor._id.toString(),
        name: visitor.name,
        email: visitor.email,
        isReturning,
        lastVisitAt: visitor.lastVisitAt.toISOString(),
        totalPhotos: totalVisitorPhotos,
      },
      photos: createdPhotos,
      previousPhotos: isReturning ? previousPhotos : undefined,
    };

    return NextResponse.json(responsePayload, { status: 201 });
  } catch (error) {
    console.error("Error in visitor upload route:", error);
    return NextResponse.json(
      {
        success: false,
        message: "An unexpected error occurred while processing your upload.",
      },
      { status: 500 }
    );
  }
}
