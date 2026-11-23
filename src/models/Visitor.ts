import mongoose, { Schema, Document, Model } from "mongoose";

export interface IVisitorDocument extends Document {
  name: string;
  email: string;
  normalizedEmail: string;
  createdAt: Date;
  lastVisitAt: Date;
}

const VisitorSchema = new Schema<IVisitorDocument>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      maxlength: [150, "Email cannot exceed 150 characters"],
    },
    normalizedEmail: {
      type: String,
      required: [true, "Normalized email is required"],
      trim: true,
      lowercase: true,
    },
    lastVisitAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Compound index or unique index on normalizedEmail
VisitorSchema.index({ normalizedEmail: 1 }, { unique: true });

export const Visitor: Model<IVisitorDocument> =
  mongoose.models.Visitor || mongoose.model<IVisitorDocument>("Visitor", VisitorSchema);
