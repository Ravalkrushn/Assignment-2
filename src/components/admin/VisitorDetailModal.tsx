"use client";

import React, { useEffect, useState } from "react";
import { X, User, Mail, Calendar, Image as ImageIcon, RotateCcw, Clock, CheckCircle2 } from "lucide-react";

interface VisitorDetailModalProps {
  isOpen: boolean;
  visitorId: string | null;
  onClose: () => void;
  onPreviewPhoto?: (photo: any) => void;
}

export function VisitorDetailModal({
  isOpen,
  visitorId,
  onClose,
  onPreviewPhoto,
}: VisitorDetailModalProps) {
  const [visitor, setVisitor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !visitorId) {
      setVisitor(null);
      return;
    }

    const fetchVisitorDetails = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/admin/visitors/${visitorId}`);
        const data = await res.json();
        if (data.success && data.visitor) {
          setVisitor(data.visitor);
        } else {
          setError(data.error || "Failed to load visitor details");
        }
      } catch (err: any) {
        setError(err.message || "Network error loading visitor details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVisitorDetails();
  }, [isOpen, visitorId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#101317] border border-[#EDE7DC]/15 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#EDE7DC]/10 flex items-center justify-between bg-[#0A0C0E]/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2E6B72] to-[#E8913C] flex items-center justify-center text-[#EDE7DC] font-syne font-bold text-base shadow-lg shadow-[#2E6B72]/20 border border-[#EDE7DC]/20">
              {visitor?.name ? visitor.name.charAt(0).toUpperCase() : "V"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-syne font-bold text-[#EDE7DC]">
                  {visitor?.name || "Visitor Profile"}
                </h3>
                {visitor?.isReturning && (
                  <span className="px-2 py-0.5 rounded text-[9px] font-mono bg-[#E8913C]/20 text-[#E8913C] border border-[#E8913C]/30">
                    RETURNING VISITOR
                  </span>
                )}
              </div>
              <p className="text-xs font-mono text-[#9EA5A8] mt-0.5">
                {visitor?.email || "Retrieving information..."}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#EDE7DC]/5 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isLoading ? (
            <div className="py-12 text-center space-y-3 animate-pulse">
              <div className="w-8 h-8 rounded-full border-2 border-[#E8913C] border-t-transparent animate-spin mx-auto" />
              <p className="text-xs font-sora text-[#9EA5A8]">Loading visitor archive & history...</p>
            </div>
          ) : error ? (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
              {error}
            </div>
          ) : visitor ? (
            <>
              {/* Profile Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-sora">
                <div className="p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#6C7378] text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>First Arrival</span>
                  </div>
                  <p className="font-semibold text-[#EDE7DC]">
                    {new Date(visitor.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-[#9EA5A8] font-mono">
                    {new Date(visitor.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#6C7378] text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Latest Visit</span>
                  </div>
                  <p className="font-semibold text-[#EDE7DC]">
                    {new Date(visitor.lastVisitAt).toLocaleDateString()}
                  </p>
                  <p className="text-[10px] text-[#9EA5A8] font-mono">
                    {new Date(visitor.lastVisitAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 space-y-1">
                  <div className="flex items-center gap-1.5 text-[#6C7378] text-[11px]">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>Uploaded Photos</span>
                  </div>
                  <p className="font-semibold text-[#EDE7DC]">
                    {visitor.photosCount} contribution{visitor.photosCount !== 1 ? "s" : ""}
                  </p>
                  <p className="text-[10px] text-emerald-400 font-mono">
                    Consent confirmed
                  </p>
                </div>
              </div>

              {/* Photo Retrospective Gallery */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-mono tracking-wider text-[#9EA5A8]">
                    Contribution Archive ({visitor.photos?.length || 0})
                  </h4>
                  <span className="text-[10px] text-[#6C7378]">
                    Click any photo to inspect full details
                  </span>
                </div>

                {!visitor.photos || visitor.photos.length === 0 ? (
                  <div className="p-8 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 text-center text-xs text-[#9EA5A8]">
                    No photos uploaded for this visitor profile.
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {visitor.photos.map((p: any) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          if (onPreviewPhoto) {
                            onPreviewPhoto({
                              ...p,
                              visitor: {
                                id: visitor.id,
                                name: visitor.name,
                                email: visitor.email,
                              },
                            });
                          }
                        }}
                        className="group relative aspect-video rounded-lg overflow-hidden bg-[#0A0C0E] border border-[#EDE7DC]/10 cursor-pointer hover:border-[#E8913C] transition-all"
                      >
                        <img
                          src={p.imageUrl}
                          alt={p.originalName}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-1.5 left-2 right-2 text-left">
                          <p className="text-[10px] font-sora font-semibold text-[#EDE7DC] truncate">
                            {p.originalName}
                          </p>
                          <p className="text-[9px] font-mono text-[#9EA5A8]">
                            {new Date(p.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="absolute top-1.5 right-1.5">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[8px] font-mono uppercase ${
                              p.displayStatus === "active"
                                ? "bg-emerald-500/80 text-white"
                                : "bg-rose-500/80 text-white"
                            }`}
                          >
                            {p.displayStatus}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
