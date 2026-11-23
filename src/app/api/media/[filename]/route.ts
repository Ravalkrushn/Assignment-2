import { NextRequest, NextResponse } from "next/server";
import { storageProvider } from "@/lib/storage";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename;

    if (!filename || filename.includes("..") || filename.includes("/") || filename.includes("\\")) {
      return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
    }

    const fileBuffer = await storageProvider.get(filename);

    if (!fileBuffer) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }

    const ext = path.extname(filename).toLowerCase();
    let contentType = "application/octet-stream";

    switch (ext) {
      case ".jpg":
      case ".jpeg":
        contentType = "image/jpeg";
        break;
      case ".png":
        contentType = "image/png";
        break;
      case ".webp":
        contentType = "image/webp";
        break;
    }

    // Return the image buffer with strong cache headers for slideshow performance
    return new NextResponse(new Uint8Array(fileBuffer), {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": fileBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Error serving media:", error);
    return NextResponse.json({ error: "Failed to read media" }, { status: 500 });
  }
}
