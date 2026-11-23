import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads");

export interface StorageResult {
  filename: string;
  imageUrl: string;
  filePath: string;
  size: number;
}

export interface IStorageProvider {
  save(buffer: Buffer, originalName: string, mimeType: string): Promise<StorageResult>;
  get(filename: string): Promise<Buffer | null>;
  delete(filename: string): Promise<boolean>;
}

export class LocalStorageProvider implements IStorageProvider {
  private uploadDir: string;

  constructor(dirPath: string = UPLOAD_DIR) {
    this.uploadDir = path.isAbsolute(dirPath) ? dirPath : path.join(process.cwd(), dirPath);
  }

  private async ensureDir(): Promise<void> {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async save(buffer: Buffer, originalName: string, mimeType: string): Promise<StorageResult> {
    await this.ensureDir();

    // Determine extension
    const ext = this.getExtension(originalName, mimeType);
    const uniqueId = crypto.randomBytes(16).toString("hex");
    const filename = `${Date.now()}-${uniqueId}${ext}`;
    const filePath = path.join(this.uploadDir, filename);

    await fs.writeFile(filePath, buffer);

    // Controlled media route URL
    const imageUrl = `/api/media/${filename}`;

    return {
      filename,
      imageUrl,
      filePath,
      size: buffer.length,
    };
  }

  async get(filename: string): Promise<Buffer | null> {
    try {
      // Prevent path traversal
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(this.uploadDir, sanitizedFilename);
      const data = await fs.readFile(filePath);
      return data;
    } catch {
      return null;
    }
  }

  async delete(filename: string): Promise<boolean> {
    try {
      const sanitizedFilename = path.basename(filename);
      const filePath = path.join(this.uploadDir, sanitizedFilename);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false;
    }
  }

  private getExtension(originalName: string, mimeType: string): string {
    const parsedExt = path.extname(originalName).toLowerCase();
    if (parsedExt && [".jpg", ".jpeg", ".png", ".webp"].includes(parsedExt)) {
      return parsedExt;
    }

    switch (mimeType) {
      case "image/jpeg":
        return ".jpg";
      case "image/png":
        return ".png";
      case "image/webp":
        return ".webp";
      default:
        return ".jpg";
    }
  }
}

// Singleton storage provider instance
export const storageProvider: IStorageProvider = new LocalStorageProvider();
