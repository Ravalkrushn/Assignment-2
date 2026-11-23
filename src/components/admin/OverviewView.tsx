"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Users,
  Image as ImageIcon,
  Calendar,
  RotateCcw,
  Tv,
  ArrowUpRight,
  Clock,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { AdminTab } from "./AdminSidebar";

interface OverviewData {
  stats: {
    totalVisitors: number;
    totalPhotos: number;
    todayVisitors: number;
    returningVisitors: number;
    activePhotosCount: number;
    flaggedPhotosCount: number;
  };
  recentVisitors: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    lastVisitAt: string;
    photoCount: number;
    isReturning: boolean;
  }[];
  recentPhotos: {
    id: string;
    imageUrl: string;
    originalName: string;
    mimeType: string;
    size: number;
    displayStatus: "active" | "archived" | "flagged";
    consentGiven: boolean;
    uploadedAt: string;
    visitorName: string;
    visitorEmail: string;
  }[];
  uploadActivity: {
    date: string;
    label: string;
    count: number;
  }[];
  slideshowStatus: {
    isActive: boolean;
    totalAvailable: number;
    lastUpdated: string | null;
  };
}

interface OverviewViewProps {
  onNavigateTab: (tab: AdminTab) => void;
  onPreviewPhoto?: (photo: any) => void;
}

export function OverviewView({ onNavigateTab, onPreviewPhoto }: OverviewViewProps) {
  const [data, setData] = useState<OverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchOverview = async (showRefreshState = false) => {
    if (showRefreshState) setIsRefreshing(true);
    try {
      const res = await fetch("/api/admin/overview", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success && json.data) {
        setData(json.data);
        setError(null);
      } else {
        throw new Error(json.error || "Failed to load overview data");
      }
    } catch (err: any) {
      console.error("Overview fetch error:", err);
      setError(err.message || "Failed to connect to admin overview service");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 animate-pulse">
        <div className="h-8 bg-[#101317] rounded-lg w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-[#101317] rounded-xl border border-[#EDE7DC]/10" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-72 bg-[#101317] rounded-xl border border-[#EDE7DC]/10" />
          <div className="h-72 bg-[#101317] rounded-xl border border-[#EDE7DC]/10" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <div className="p-6 rounded-xl bg-rose-500/10 border border-rose-500/20 text-[#EDE7DC] flex flex-col items-center justify-center text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400" />
          <div className="space-y-1">
            <h3 className="text-base font-syne font-bold">Failed to Load Overview Data</h3>
            <p className="text-xs text-[#9EA5A8] max-w-md">{error}</p>
          </div>
          <button
            onClick={() => fetchOverview(true)}
            className="px-4 py-2 bg-[#E8913C] hover:bg-[#E8913C]/80 text-[#0A0C0E] font-medium text-xs rounded-lg transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentVisitors, recentPhotos, uploadActivity, slideshowStatus } = data;

  // Calculate highest activity for relative bar scaling
  const maxActivityCount = Math.max(1, ...uploadActivity.map((a) => a.count));

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-[#EDE7DC] tracking-tight">
            System Overview
          </h1>
          <p className="text-xs font-sora text-[#9EA5A8] mt-1">
            Live database records, audience arrivals, and digital slideshow broadcast telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOverview(true)}
            disabled={isRefreshing}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#101317] hover:bg-[#101317]/80 text-[#EDE7DC] border border-[#EDE7DC]/10 text-xs font-sora transition-colors"
            title="Refresh database records"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#9EA5A8] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Syncing..." : "Sync DB"}</span>
          </button>

          <Link
            href="/display"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#E8913C] hover:bg-[#E8913C]/90 text-[#0A0C0E] font-medium text-xs font-sora transition-colors shadow-sm shadow-[#E8913C]/20"
          >
            <Tv className="w-4 h-4" />
            <span>Launch Slideshow</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visitors */}
        <div className="p-5 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 hover:border-[#EDE7DC]/20 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sora uppercase tracking-wider text-[#9EA5A8]">
              Total Visitors
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#2E6B72]/15 border border-[#2E6B72]/30 flex items-center justify-center text-[#2E6B72] group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-syne font-bold text-[#EDE7DC]">
              {stats.totalVisitors}
            </div>
            <p className="text-[11px] font-sora text-[#6C7378] mt-1">
              Registered visitor profiles
            </p>
          </div>
        </div>

        {/* Total Uploaded Photos */}
        <div className="p-5 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 hover:border-[#EDE7DC]/20 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sora uppercase tracking-wider text-[#9EA5A8]">
              Uploaded Photos
            </span>
            <div className="w-9 h-9 rounded-lg bg-[#E8913C]/15 border border-[#E8913C]/30 flex items-center justify-center text-[#E8913C] group-hover:scale-105 transition-transform">
              <ImageIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-syne font-bold text-[#EDE7DC]">
              {stats.totalPhotos}
            </div>
            <p className="text-[11px] font-sora text-[#6C7378] mt-1">
              {stats.activePhotosCount} active on slideshow
            </p>
          </div>
        </div>

        {/* Today's Visitors */}
        <div className="p-5 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 hover:border-[#EDE7DC]/20 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sora uppercase tracking-wider text-[#9EA5A8]">
              Today&apos;s Arrivals
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-syne font-bold text-[#EDE7DC]">
              {stats.todayVisitors}
            </div>
            <p className="text-[11px] font-sora text-emerald-400/80 mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              Active today
            </p>
          </div>
        </div>

        {/* Returning Visitors */}
        <div className="p-5 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 hover:border-[#EDE7DC]/20 transition-all flex flex-col justify-between group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-sora uppercase tracking-wider text-[#9EA5A8]">
              Returning Visitors
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-[#E8913C] group-hover:scale-105 transition-transform">
              <RotateCcw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-syne font-bold text-[#EDE7DC]">
              {stats.returningVisitors}
            </div>
            <p className="text-[11px] font-sora text-[#E8913C]/80 mt-1">
              Retrospective photo history
            </p>
          </div>
        </div>
      </div>

      {/* Upload Activity Chart & Slideshow Live Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 7-Day Activity Trend */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-syne font-bold text-[#EDE7DC]">
                7-Day Upload Activity
              </h2>
              <p className="text-xs font-sora text-[#6C7378] mt-0.5">
                Daily photo submissions recorded across the visitor portal
              </p>
            </div>
            <span className="text-xs font-mono text-[#9EA5A8] px-2.5 py-1 rounded bg-[#0A0C0E] border border-[#EDE7DC]/10">
              {stats.totalPhotos} Total
            </span>
          </div>

          {/* Activity Bar Chart */}
          <div className="h-44 flex items-end justify-between gap-2 pt-6 pb-2 px-2 border-b border-[#EDE7DC]/10">
            {uploadActivity.map((day) => {
              const heightPct = Math.round((day.count / maxActivityCount) * 100);
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-2 group relative">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 rounded bg-[#0A0C0E] border border-[#EDE7DC]/20 text-[10px] font-mono text-[#EDE7DC] pointer-events-none whitespace-nowrap z-10 shadow-lg">
                    {day.count} photo{day.count !== 1 ? "s" : ""}
                  </div>

                  <div className="w-full max-w-[42px] bg-[#0A0C0E] rounded-t-md h-32 flex items-end overflow-hidden p-0.5">
                    <div
                      style={{ height: `${Math.max(day.count > 0 ? 12 : 4, heightPct)}%` }}
                      className={`w-full rounded-t transition-all duration-500 ${
                        day.count > 0
                          ? "bg-gradient-to-t from-[#2E6B72] to-[#E8913C] shadow-sm shadow-[#E8913C]/20"
                          : "bg-[#6C7378]/20"
                      }`}
                    />
                  </div>
                  <span className="text-[10px] font-sora text-[#9EA5A8] truncate max-w-[48px]">
                    {day.label.split(",")[0]}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-[#6C7378] font-sora">
            <span>Aggregated by UTC day boundaries</span>
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded bg-gradient-to-r from-[#2E6B72] to-[#E8913C]" />
              Submission volume
            </span>
          </div>
        </div>

        {/* Live Slideshow Status Widget */}
        <div className="p-6 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-syne font-bold text-[#EDE7DC] flex items-center gap-2">
                <Tv className="w-4 h-4 text-[#E8913C]" />
                Slideshow Broadcast
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono ${
                  slideshowStatus.isActive
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-[#6C7378]/15 text-[#9EA5A8] border border-[#6C7378]/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    slideshowStatus.isActive ? "bg-emerald-400 animate-pulse" : "bg-[#6C7378]"
                  }`}
                />
                {slideshowStatus.isActive ? "ONLINE" : "STANDBY"}
              </span>
            </div>
            <p className="text-xs font-sora text-[#6C7378] mt-1">
              Smart TV & reception presentation feed
            </p>
          </div>

          <div className="space-y-3 p-4 rounded-lg bg-[#0A0C0E] border border-[#EDE7DC]/10 text-xs font-sora">
            <div className="flex items-center justify-between">
              <span className="text-[#9EA5A8]">Active TV Playlist</span>
              <span className="font-mono font-bold text-[#EDE7DC]">
                {slideshowStatus.totalAvailable} items
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9EA5A8]">Sync Mechanism</span>
              <span className="font-mono text-[#E8913C]">Delta Polling (4s)</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#9EA5A8]">Last Uploaded</span>
              <span className="font-mono text-[#EDE7DC] text-[11px]">
                {slideshowStatus.lastUpdated
                  ? new Date(slideshowStatus.lastUpdated).toLocaleTimeString()
                  : "None yet"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Link
              href="/display"
              target="_blank"
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#2E6B72] hover:bg-[#2E6B72]/90 text-[#EDE7DC] font-sora text-xs font-medium transition-colors"
            >
              <span>Open Smart TV Display</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={() => onNavigateTab("slideshow")}
              className="w-full text-center py-2 text-xs font-sora text-[#9EA5A8] hover:text-[#EDE7DC] transition-colors"
            >
              Adjust transition & duration &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Recent Visitors & Recent Photo Uploads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Visitors Table */}
        <div className="p-6 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-syne font-bold text-[#EDE7DC]">
                Recent Visitors
              </h2>
              <p className="text-xs font-sora text-[#6C7378]">
                Most recent arrivals registered in database
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("visitors")}
              className="text-xs font-sora text-[#E8913C] hover:underline"
            >
              View directory &rarr;
            </button>
          </div>

          {recentVisitors.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Users className="w-8 h-8 text-[#6C7378] mx-auto opacity-50" />
              <p className="text-xs text-[#9EA5A8]">No visitors recorded yet.</p>
              <p className="text-[11px] text-[#6C7378]">
                Photos uploaded via the main visitor portal will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#EDE7DC]/5">
              {recentVisitors.map((v) => (
                <div
                  key={v.id}
                  className="py-3 flex items-center justify-between gap-3 text-xs font-sora"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#2E6B72]/20 border border-[#2E6B72]/40 flex items-center justify-center text-[#EDE7DC] font-syne font-bold text-xs flex-shrink-0">
                      {v.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[#EDE7DC] truncate">
                          {v.name}
                        </span>
                        {v.isReturning && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#E8913C]/20 text-[#E8913C] border border-[#E8913C]/30 flex-shrink-0">
                            RETURNING
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-[#6C7378] truncate font-mono">
                        {v.email}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0 space-y-0.5">
                    <span className="inline-block px-2 py-0.5 rounded bg-[#0A0C0E] border border-[#EDE7DC]/10 text-[10px] font-mono text-[#9EA5A8]">
                      {v.photoCount} photo{v.photoCount !== 1 ? "s" : ""}
                    </span>
                    <p className="text-[10px] text-[#6C7378]">
                      {new Date(v.lastVisitAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Photo Uploads */}
        <div className="p-6 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-syne font-bold text-[#EDE7DC]">
                Recent Uploads
              </h2>
              <p className="text-xs font-sora text-[#6C7378]">
                Real-time submissions queued for slideshow display
              </p>
            </div>
            <button
              onClick={() => onNavigateTab("photos")}
              className="text-xs font-sora text-[#E8913C] hover:underline"
            >
              Review all &rarr;
            </button>
          </div>

          {recentPhotos.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <ImageIcon className="w-8 h-8 text-[#6C7378] mx-auto opacity-50" />
              <p className="text-xs text-[#9EA5A8]">No photo uploads yet.</p>
              <p className="text-[11px] text-[#6C7378]">
                New uploads from visitors will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recentPhotos.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onPreviewPhoto && onPreviewPhoto(p)}
                  className="group relative aspect-square rounded-lg overflow-hidden bg-[#0A0C0E] border border-[#EDE7DC]/10 cursor-pointer hover:border-[#E8913C]/50 transition-all"
                >
                  {/* Image */}
                  <img
                    src={p.imageUrl}
                    alt={p.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />

                  {/* Status pill */}
                  <div className="absolute top-1.5 right-1.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[8px] font-mono uppercase ${
                        p.displayStatus === "active"
                          ? "bg-emerald-500/80 text-white"
                          : p.displayStatus === "flagged"
                          ? "bg-rose-500/80 text-white"
                          : "bg-slate-500/80 text-white"
                      }`}
                    >
                      {p.displayStatus}
                    </span>
                  </div>

                  {/* Caption */}
                  <div className="absolute bottom-1.5 left-1.5 right-1.5 text-left">
                    <p className="text-[11px] font-sora font-semibold text-[#EDE7DC] truncate">
                      {p.visitorName}
                    </p>
                    <p className="text-[9px] font-mono text-[#9EA5A8] truncate">
                      {p.originalName}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
