"use client";

import React from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

interface PhotoDeleteModalProps {
  isOpen: boolean;
  photo: {
    id: string;
    imageUrl: string;
    originalName: string;
    visitorName?: string;
  } | null;
  onClose: () => void;
  onConfirmDelete: (photoId: string) => Promise<void>;
  isDeleting: boolean;
}

export function PhotoDeleteModal({
  isOpen,
  photo,
  onClose,
  onConfirmDelete,
  isDeleting,
}: PhotoDeleteModalProps) {
  if (!isOpen || !photo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#101317] border border-[#EDE7DC]/15 rounded-2xl p-6 shadow-2xl space-y-5 text-left">
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isDeleting}
          className="absolute top-4 right-4 p-1.5 text-[#9EA5A8] hover:text-[#EDE7DC] rounded-lg hover:bg-[#EDE7DC]/5 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 flex-shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-syne font-bold text-[#EDE7DC]">
              Confirm Photo Deletion
            </h3>
            <p className="text-xs font-sora text-[#9EA5A8] mt-1">
              This action cannot be undone. Please confirm removal from database and storage.
            </p>
          </div>
        </div>

        {/* Target Photo Preview Box */}
        <div className="p-3 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 flex items-center gap-3">
          <div className="w-14 h-14 rounded-lg overflow-hidden bg-black/50 border border-[#EDE7DC]/10 flex-shrink-0">
            <img
              src={photo.imageUrl}
              alt={photo.originalName}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1 text-xs font-sora space-y-0.5">
            <p className="font-semibold text-[#EDE7DC] truncate">{photo.originalName}</p>
            {photo.visitorName && (
              <p className="text-[11px] text-[#9EA5A8] truncate">
                Uploaded by: <span className="text-[#EDE7DC]">{photo.visitorName}</span>
              </p>
            )}
            <p className="text-[10px] text-emerald-400 font-mono">
              Visitor history will remain intact
            </p>
          </div>
        </div>

        {/* Explanatory Callout */}
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[11px] font-sora text-[#EDE7DC]/90 space-y-1">
          <p className="font-semibold text-rose-300">Live Slideshow Impact:</p>
          <p className="text-[#9EA5A8]">
            This photo will immediately be removed from the active playlist and will vanish from the Smart TV display on the next 4-second poll cycle.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 rounded-lg text-xs font-sora text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#EDE7DC]/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmDelete(photo.id)}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-sora font-semibold transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{isDeleting ? "Deleting..." : "Permanently Delete"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
