import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import path from "path";
import { connectToDatabase } from "@/lib/db";
import { Photo } from "@/models/Photo";
import { storageProvider } from "@/lib/storage";
import { verifyAdminApiRequest } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function DELETE(
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
      return NextResponse.json({ success: false, error: "Invalid photo ID" }, { status: 400 });
    }

    await connectToDatabase();

    const photo = await Photo.findById(id);
    if (!photo) {
      return NextResponse.json({ success: false, error: "Photo not found" }, { status: 404 });
    }

    // Extract filename from imageUrl, e.g. "/api/media/1732400000-xyz.jpg"
    if (photo.imageUrl) {
      const filename = path.basename(photo.imageUrl);
      if (filename) {
        try {
          await storageProvider.delete(filename);
        } catch (storageErr) {
          console.warn("Storage delete warning for file:", filename, storageErr);
        }
      }
    }

    // Delete photo document from MongoDB. Note: The associated Visitor document remains intact.
    await Photo.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: "Photo deleted successfully. It will immediately cease to appear on the slideshow.",
      deletedPhotoId: id,
    });
  } catch (err: unknown) {
    console.error("Admin delete photo error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to delete photo" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
      return NextResponse.json({ success: false, error: "Invalid photo ID" }, { status: 400 });
    }

    const body = await request.json().catch(() => ({}));
    const { displayStatus } = body;

    if (!["active", "flagged", "archived"].includes(displayStatus)) {
      return NextResponse.json(
        { success: false, error: "Invalid displayStatus value. Must be active, flagged, or archived" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const updated = await Photo.findByIdAndUpdate(
      id,
      { $set: { displayStatus } },
      { new: true }
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Photo status updated to ${displayStatus}`,
      photo: {
        id: String(updated._id),
        displayStatus: updated.displayStatus,
      },
    });
  } catch (err: unknown) {
    console.error("Admin update photo error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update photo status" },
      { status: 500 }
    );
  }
}
