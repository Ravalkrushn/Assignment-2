import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPhotoDocument extends Document {
  visitorId: mongoose.Types.ObjectId;
  imageUrl: string;
  originalName: string;
  mimeType: string;
  size: number;
  consentGiven: boolean;
  consentTimestamp: Date;
  uploadedAt: Date;
  displayStatus: "active" | "archived" | "flagged";
}

const PhotoSchema = new Schema<IPhotoDocument>(
  {
    visitorId: {
      type: Schema.Types.ObjectId,
      ref: "Visitor",
      required: [true, "Visitor ID is required"],
      index: true,
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
    originalName: {
      type: String,
      required: [true, "Original file name is required"],
    },
    mimeType: {
      type: String,
      required: [true, "MIME type is required"],
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
    consentGiven: {
      type: Boolean,
      required: [true, "Consent confirmation is required"],
      default: true,
    },
    consentTimestamp: {
      type: Date,
      required: [true, "Consent timestamp is required"],
      default: Date.now,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    displayStatus: {
      type: String,
      enum: ["active", "archived", "flagged"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: false,
  }
);

// Compound index to quickly find active photos for slideshow
PhotoSchema.index({ displayStatus: 1, uploadedAt: -1 });
PhotoSchema.index({ visitorId: 1, displayStatus: 1 });

export const Photo: Model<IPhotoDocument> =
  mongoose.models.Photo || mongoose.model<IPhotoDocument>("Photo", PhotoSchema);
