import mongoose, { Schema, Document, Model } from "mongoose";
import { connectToDatabase } from "@/lib/db";

export interface ISlideshowSettingsData {
  durationSeconds: number;
  transition: "kenburns" | "crossfade" | "slide";
  fitMode: "ambient" | "contain" | "cover";
  showInfoOverlay: boolean;
  autoPlay: boolean;
  loop: boolean;
}

export const DEFAULT_ADMIN_SETTINGS: ISlideshowSettingsData = {
  durationSeconds: 5,
  transition: "kenburns",
  fitMode: "ambient",
  showInfoOverlay: true,
  autoPlay: true,
  loop: true,
};

export interface IAdminSettingDocument extends Document {
  key: string;
  value: ISlideshowSettingsData;
  updatedAt: Date;
}

const AdminSettingSchema = new Schema<IAdminSettingDocument>(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      default: "slideshow_config",
    },
    value: {
      durationSeconds: { type: Number, default: 5, min: 2, max: 60 },
      transition: {
        type: String,
        enum: ["kenburns", "crossfade", "slide"],
        default: "kenburns",
      },
      fitMode: {
        type: String,
        enum: ["ambient", "contain", "cover"],
        default: "ambient",
      },
      showInfoOverlay: { type: Boolean, default: true },
      autoPlay: { type: Boolean, default: true },
      loop: { type: Boolean, default: true },
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

export const AdminSetting: Model<IAdminSettingDocument> =
  mongoose.models.AdminSetting ||
  mongoose.model<IAdminSettingDocument>("AdminSetting", AdminSettingSchema);

export async function getPersistentSettings(): Promise<ISlideshowSettingsData> {
  try {
    await connectToDatabase();
    const doc = await AdminSetting.findOne({ key: "slideshow_config" }).lean<IAdminSettingDocument | null>();
    if (doc && doc.value) {
      return {
        ...DEFAULT_ADMIN_SETTINGS,
        ...doc.value,
      };
    }
  } catch (err) {
    console.error("Error loading admin settings from DB, using defaults:", err);
  }
  return DEFAULT_ADMIN_SETTINGS;
}

export async function savePersistentSettings(
  newSettings: Partial<ISlideshowSettingsData>
): Promise<ISlideshowSettingsData> {
  await connectToDatabase();

  const current = await getPersistentSettings();
  const merged: ISlideshowSettingsData = {
    ...current,
    ...newSettings,
  };

  await AdminSetting.findOneAndUpdate(
    { key: "slideshow_config" },
    {
      $set: {
        key: "slideshow_config",
        value: merged,
        updatedAt: new Date(),
      },
    },
    { upsert: true, new: true }
  );

  return merged;
}
