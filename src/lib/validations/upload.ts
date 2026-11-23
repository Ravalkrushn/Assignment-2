import { z } from "zod";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

export const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_BYTES || "10485760", 10); // 10MB
export const MAX_FILES_COUNT = parseInt(process.env.MAX_FILES_COUNT || "5", 10); // 5 files per visit

export const visitorFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),
  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(150, "Email must be under 150 characters"),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "You must give consent to display your photos on the slideshow" }),
  }),
});

export type VisitorFormValues = z.infer<typeof visitorFormSchema>;

/**
 * Validate image buffer headers (magic bytes) to prevent disguised files or malicious uploads.
 */
export function validateImageMagicBytes(buffer: Buffer): { valid: boolean; detectedMime?: string } {
  if (buffer.length < 12) {
    return { valid: false };
  }

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, detectedMime: "image/jpeg" };
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return { valid: true, detectedMime: "image/png" };
  }

  // WEBP: "RIFF" .... "WEBP"
  const riff = buffer.subarray(0, 4).toString("ascii");
  const webp = buffer.subarray(8, 12).toString("ascii");
  if (riff === "RIFF" && webp === "WEBP") {
    return { valid: true, detectedMime: "image/webp" };
  }

  return { valid: false };
}
