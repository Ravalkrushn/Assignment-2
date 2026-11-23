"use client";

import React from "react";
import { X, Calendar, User, FileText, CheckCircle2, AlertOctagon, Download } from "lucide-react";

interface PhotoPreviewModalProps {
  isOpen: boolean;
  photo: {
    id: string;
    imageUrl: string;
    originalName: string;
    mimeType: string;
    size: number;
    displayStatus: "active" | "archived" | "flagged";
    consentGiven: boolean;
    consentTimestamp?: string;
    uploadedAt: string;
    visitor?: {
      id: string;
      name: string;
      email: string;
    } | null;
    visitorName?: string;
    visitorEmail?: string;
  } | null;
  onClose: () => void;
  onToggleStatus?: (photoId: string, currentStatus: string) => void;
}

export function PhotoPreviewModal({
  isOpen,
  photo,
  onClose,
  onToggleStatus,
}: PhotoPreviewModalProps) {
  if (!isOpen || !photo) return null;

  const visitorName = photo.visitor?.name || photo.visitorName || "Unknown Visitor";
  const visitorEmail = photo.visitor?.email || photo.visitorEmail || "";

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#101317] border border-[#EDE7DC]/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-[#EDE7DC]/10 flex items-center justify-between bg-[#0A0C0E]/60">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                photo.displayStatus === "active"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : photo.displayStatus === "flagged"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  : "bg-slate-500/20 text-slate-300 border border-slate-500/30"
              }`}
            >
              {photo.displayStatus}
            </span>
            <span className="text-xs font-sora font-semibold text-[#EDE7DC] truncate">
              {photo.originalName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={photo.imageUrl}
              target="_blank"
              download={photo.originalName}
              className="p-1.5 text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#EDE7DC]/5 rounded-lg transition-colors"
              title="Download image file"
            >
              <Download className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              className="p-1.5 text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#EDE7DC]/5 rounded-lg transition-colors"
              title="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto flex flex-col md:flex-row">
          {/* Image Stage */}
          <div className="md:w-3/5 bg-black/60 flex items-center justify-center p-4 min-h-[300px]">
            <img
              src={photo.imageUrl}
              alt={photo.originalName}
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-lg"
            />
          </div>

          {/* Metadata Sidebar */}
          <div className="md:w-2/5 p-6 space-y-5 border-t md:border-t-0 md:border-l border-[#EDE7DC]/10 bg-[#101317] text-xs font-sora">
            {/* Visitor Identity */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6C7378]">
                Associated Visitor
              </span>
              <div className="p-3 rounded-lg bg-[#0A0C0E] border border-[#EDE7DC]/10 space-y-1">
                <div className="flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-[#E8913C]" />
                  <span className="font-semibold text-[#EDE7DC]">{visitorName}</span>
                </div>
                {visitorEmail && (
                  <p className="text-[11px] text-[#9EA5A8] font-mono pl-5">{visitorEmail}</p>
                )}
              </div>
            </div>

            {/* Technical Specs */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6C7378]">
                File Information
              </span>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between py-1 border-b border-[#EDE7DC]/5">
                  <span className="text-[#6C7378]">MIME Type</span>
                  <span className="font-mono text-[#EDE7DC]">{photo.mimeType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EDE7DC]/5">
                  <span className="text-[#6C7378]">File Size</span>
                  <span className="font-mono text-[#EDE7DC]">{formatSize(photo.size)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-[#EDE7DC]/5">
                  <span className="text-[#6C7378]">Uploaded At</span>
                  <span className="font-mono text-[#EDE7DC]">
                    {new Date(photo.uploadedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Consent Status */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-[#6C7378]">
                Consent Record
              </span>
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <div className="text-[11px] text-[#EDE7DC]">
                  <p className="font-semibold text-emerald-300">Public Consent Granted</p>
                  <p className="text-[#9EA5A8] text-[10px]">
                    Acknowledged terms & authorized playback on venue Smart TV.
                  </p>
                </div>
              </div>
            </div>

            {/* Moderation Status Toggle */}
            {onToggleStatus && (
              <div className="pt-2">
                <button
                  onClick={() =>
                    onToggleStatus(
                      photo.id,
                      photo.displayStatus === "active" ? "flagged" : "active"
                    )
                  }
                  className={`w-full py-2.5 px-3 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                    photo.displayStatus === "active"
                      ? "bg-amber-500/15 hover:bg-amber-500/25 text-[#E8913C] border border-[#E8913C]/30"
                      : "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30"
                  }`}
                >
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>
                    {photo.displayStatus === "active" ? "Flag / Hide From Slideshow" : "Restore To Active Slideshow"}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
