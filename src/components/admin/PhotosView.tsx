"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Image as ImageIcon,
  Search,
  Filter,
  Trash2,
  Eye,
  AlertOctagon,
  RefreshCw,
  CheckCircle2,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";

interface PhotoItem {
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
    lastVisitAt?: string;
  } | null;
}

interface PhotosViewProps {
  onPreviewPhoto: (photo: PhotoItem) => void;
  onRequestDelete: (photo: PhotoItem) => void;
  onSelectVisitor?: (visitorId: string) => void;
}

export function PhotosView({
  onPreviewPhoto,
  onRequestDelete,
  onSelectVisitor,
}: PhotosViewProps) {
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "24",
        status: statusFilter,
        search: searchTerm,
      });

      const res = await fetch(`/api/admin/photos?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setPhotos(data.photos || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      } else {
        throw new Error(data.error || "Failed to load photos");
      }
    } catch (err: any) {
      console.error("Photos fetch error:", err);
      setError(err.message || "Failed to query photos database");
    } finally {
      setIsLoading(false);
    }
  }, [page, statusFilter, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPhotos();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchPhotos]);

  const handleStatusToggle = async (photoId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "flagged" : "active";
    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPhotos((prev) =>
          prev.map((p) =>
            p.id === photoId ? { ...p, displayStatus: newStatus as any } : p
          )
        );
      }
    } catch (err) {
      console.error("Error updating photo status:", err);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-[#EDE7DC] tracking-tight">
            Photo Moderation Gallery
          </h1>
          <p className="text-xs font-sora text-[#9EA5A8] mt-1">
            Review uploaded audience photography, inspect technical telemetry, or remove inappropriate images.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#101317] border border-[#EDE7DC]/10 text-xs font-mono text-[#9EA5A8]">
            {totalCount} Total Uploads
          </span>
          <button
            onClick={() => fetchPhotos()}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#101317] hover:bg-[#101317]/80 text-[#EDE7DC] border border-[#EDE7DC]/10 transition-colors"
            title="Refresh photos"
          >
            <RefreshCw className={`w-4 h-4 text-[#9EA5A8] ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 bg-[#101317] p-1 rounded-xl border border-[#EDE7DC]/10 w-full md:w-auto">
          {[
            { id: "all", label: "All Photos" },
            { id: "active", label: "Active on Slideshow" },
            { id: "flagged", label: "Flagged / Hidden" },
            { id: "archived", label: "Archived" },
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => {
                setStatusFilter(pill.id);
                setPage(1);
              }}
              className={`flex-1 md:flex-initial px-3 py-1.5 rounded-lg text-xs font-sora transition-all ${
                statusFilter === pill.id
                  ? "bg-[#E8913C] text-[#0A0C0E] font-semibold shadow-sm"
                  : "text-[#9EA5A8] hover:text-[#EDE7DC]"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#6C7378] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            placeholder="Search by filename or visitor name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 text-xs font-sora text-[#EDE7DC] placeholder-[#6C7378] focus:outline-none focus:border-[#E8913C] transition-colors"
          />
        </div>
      </div>

      {/* Photo Grid */}
      {isLoading && photos.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E8913C] border-t-transparent animate-spin mx-auto" />
          <p className="text-xs font-sora text-[#9EA5A8]">Loading photo moderation grid...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-xl bg-rose-500/10 border border-rose-500/20 text-center text-xs text-rose-300 space-y-2">
          <p>{error}</p>
          <button
            onClick={() => fetchPhotos()}
            className="px-4 py-1.5 bg-[#E8913C] text-[#0A0C0E] font-medium rounded"
          >
            Retry
          </button>
        </div>
      ) : photos.length === 0 ? (
        <div className="py-24 text-center space-y-3 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10">
          <ImageIcon className="w-12 h-12 text-[#6C7378] mx-auto opacity-40" />
          <h3 className="text-base font-syne font-bold text-[#EDE7DC]">
            No Photos Match Filters
          </h3>
          <p className="text-xs font-sora text-[#6C7378] max-w-sm mx-auto">
            Try adjusting your search criteria or status filter. Photos uploaded from the reception portal will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo) => {
            const visitorName = photo.visitor?.name || "Unknown Visitor";
            const visitorEmail = photo.visitor?.email || "";

            return (
              <div
                key={photo.id}
                className="group relative rounded-xl overflow-hidden bg-[#101317] border border-[#EDE7DC]/10 hover:border-[#E8913C]/40 transition-all flex flex-col shadow-md"
              >
                {/* Thumbnail Container */}
                <div
                  className="relative aspect-[4/3] bg-black/60 overflow-hidden cursor-pointer"
                  onClick={() => onPreviewPhoto(photo)}
                >
                  <img
                    src={photo.imageUrl}
                    alt={photo.originalName}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Gradient shadow */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 opacity-70 group-hover:opacity-90 transition-opacity" />

                  {/* Status Pill Badge */}
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                        photo.displayStatus === "active"
                          ? "bg-emerald-500/90 text-white"
                          : photo.displayStatus === "flagged"
                          ? "bg-rose-500/90 text-white"
                          : "bg-slate-600/90 text-white"
                      }`}
                    >
                      {photo.displayStatus}
                    </span>
                  </div>

                  {/* Quick Preview Hover Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                    <span className="px-3 py-1.5 rounded-lg bg-[#0A0C0E]/80 backdrop-blur-sm text-[#EDE7DC] text-xs font-sora flex items-center gap-1.5 border border-[#EDE7DC]/20">
                      <Eye className="w-3.5 h-3.5" />
                      Inspect High-Res
                    </span>
                  </div>
                </div>

                {/* Metadata & Actions */}
                <div className="p-3.5 flex-1 flex flex-col justify-between space-y-3 text-xs font-sora">
                  <div className="space-y-1">
                    <p
                      className="font-semibold text-[#EDE7DC] truncate"
                      title={photo.originalName}
                    >
                      {photo.originalName}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-[#6C7378]">
                      <button
                        onClick={() =>
                          photo.visitor?.id && onSelectVisitor && onSelectVisitor(photo.visitor.id)
                        }
                        className="truncate hover:text-[#E8913C] transition-colors text-left"
                        title={visitorEmail}
                      >
                        {visitorName}
                      </button>
                      <span className="font-mono">{formatSize(photo.size)}</span>
                    </div>

                    <p className="text-[10px] text-[#6C7378] font-mono">
                      {new Date(photo.uploadedAt).toLocaleString()}
                    </p>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-2 border-t border-[#EDE7DC]/10 flex items-center justify-between gap-2">
                    {/* Status Toggle */}
                    <button
                      onClick={() => handleStatusToggle(photo.id, photo.displayStatus)}
                      className={`px-2 py-1 rounded text-[10px] font-sora transition-colors flex items-center gap-1 ${
                        photo.displayStatus === "active"
                          ? "text-[#E8913C] hover:bg-[#E8913C]/10"
                          : "text-emerald-400 hover:bg-emerald-500/10"
                      }`}
                      title={
                        photo.displayStatus === "active"
                          ? "Hide from slideshow"
                          : "Restore to slideshow"
                      }
                    >
                      <AlertOctagon className="w-3 h-3" />
                      <span>{photo.displayStatus === "active" ? "Flag" : "Unflag"}</span>
                    </button>

                    {/* Delete Photo Button */}
                    <button
                      onClick={() => onRequestDelete(photo)}
                      className="p-1.5 rounded-lg text-[#6C7378] hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Permanently delete photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 flex items-center justify-between text-xs font-sora">
          <span className="text-[#6C7378]">
            Page <span className="text-[#EDE7DC] font-mono">{page}</span> of{" "}
            <span className="text-[#EDE7DC] font-mono">{totalPages}</span>
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              className="px-3 py-1.5 rounded bg-[#0A0C0E] border border-[#EDE7DC]/10 text-[#9EA5A8] hover:text-[#EDE7DC] disabled:opacity-40 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              className="px-3 py-1.5 rounded bg-[#0A0C0E] border border-[#EDE7DC]/10 text-[#9EA5A8] hover:text-[#EDE7DC] disabled:opacity-40 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
