"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  Eye,
  RefreshCw,
  Calendar,
  Clock,
  RotateCcw,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface VisitorItem {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastVisitAt: string;
  photoCount: number;
  isReturning: boolean;
}

interface VisitorsViewProps {
  onSelectVisitor: (visitorId: string) => void;
}

export function VisitorsView({ onSelectVisitor }: VisitorsViewProps) {
  const [visitors, setVisitors] = useState<VisitorItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVisitors = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "15",
        search: searchTerm,
      });

      const res = await fetch(`/api/admin/visitors?${params.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.success) {
        setVisitors(data.visitors || []);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      } else {
        throw new Error(data.error || "Failed to load visitors");
      }
    } catch (err: any) {
      console.error("Visitors fetch error:", err);
      setError(err.message || "Failed to query visitors directory");
    } finally {
      setIsLoading(false);
    }
  }, [page, searchTerm]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVisitors();
    }, 250);
    return () => clearTimeout(timer);
  }, [fetchVisitors]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // reset to page 1 on search
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-[#EDE7DC] tracking-tight">
            Visitors Directory
          </h1>
          <p className="text-xs font-sora text-[#9EA5A8] mt-1">
            Complete registry of registered audience members, arrival history, and contributions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-[#101317] border border-[#EDE7DC]/10 text-xs font-mono text-[#9EA5A8]">
            {totalCount} Total Visitors
          </span>
          <button
            onClick={() => fetchVisitors()}
            disabled={isLoading}
            className="p-2 rounded-lg bg-[#101317] hover:bg-[#101317]/80 text-[#EDE7DC] border border-[#EDE7DC]/10 transition-colors"
            title="Refresh visitor records"
          >
            <RefreshCw className={`w-4 h-4 text-[#9EA5A8] ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#6C7378] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search visitors by name or email address..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#101317] border border-[#EDE7DC]/10 text-xs font-sora text-[#EDE7DC] placeholder-[#6C7378] focus:outline-none focus:border-[#E8913C] transition-colors"
          />
        </div>
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="px-3 py-2 text-xs font-sora text-[#9EA5A8] hover:text-[#EDE7DC]"
          >
            Clear Search
          </button>
        )}
      </div>

      {/* Visitors Table Container */}
      <div className="rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 overflow-hidden shadow-lg">
        {isLoading && visitors.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-[#E8913C] border-t-transparent animate-spin mx-auto" />
            <p className="text-xs font-sora text-[#9EA5A8]">Querying visitors directory...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-xs font-sora text-rose-400 space-y-2">
            <p>{error}</p>
            <button
              onClick={() => fetchVisitors()}
              className="px-4 py-1.5 rounded bg-[#E8913C] text-[#0A0C0E] font-medium"
            >
              Retry
            </button>
          </div>
        ) : visitors.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-10 h-10 text-[#6C7378] mx-auto opacity-40" />
            <p className="text-sm font-syne font-bold text-[#EDE7DC]">
              {searchTerm ? "No matching visitors found" : "No visitors registered yet"}
            </p>
            <p className="text-xs font-sora text-[#6C7378] max-w-sm mx-auto">
              {searchTerm
                ? `No visitor profiles matched query "${searchTerm}". Try a different name or email.`
                : "Audience members who upload photos will automatically be registered here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sora">
              <thead className="bg-[#0A0C0E]/60 text-[#6C7378] uppercase font-mono text-[10px] tracking-wider border-b border-[#EDE7DC]/10">
                <tr>
                  <th className="py-3.5 px-4">Visitor</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">First Visit</th>
                  <th className="py-3.5 px-4">Latest Arrival</th>
                  <th className="py-3.5 px-4 text-center">Photos</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE7DC]/5">
                {visitors.map((v) => (
                  <tr
                    key={v.id}
                    className="hover:bg-[#EDE7DC]/5 transition-colors group cursor-pointer"
                    onClick={() => onSelectVisitor(v.id)}
                  >
                    {/* Visitor Name & Email */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#2E6B72]/20 border border-[#2E6B72]/40 flex items-center justify-center text-[#EDE7DC] font-syne font-bold text-xs flex-shrink-0 group-hover:scale-105 transition-transform">
                          {v.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-[#EDE7DC] truncate group-hover:text-[#E8913C] transition-colors">
                            {v.name}
                          </p>
                          <p className="text-[11px] font-mono text-[#6C7378] truncate">
                            {v.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Returning status */}
                    <td className="py-3.5 px-4">
                      {v.isReturning ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#E8913C]/20 text-[#E8913C] border border-[#E8913C]/30">
                          <RotateCcw className="w-3 h-3" />
                          Returning
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono bg-[#2E6B72]/20 text-[#2E6B72] border border-[#2E6B72]/30">
                          First Visit
                        </span>
                      )}
                    </td>

                    {/* First Visit */}
                    <td className="py-3.5 px-4 text-[#9EA5A8]">
                      <div>
                        <p className="text-[#EDE7DC]">
                          {new Date(v.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-[#6C7378] font-mono">
                          {new Date(v.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </td>

                    {/* Last Visit */}
                    <td className="py-3.5 px-4 text-[#9EA5A8]">
                      <div>
                        <p className="text-[#EDE7DC]">
                          {new Date(v.lastVisitAt).toLocaleDateString()}
                        </p>
                        <p className="text-[10px] text-[#6C7378] font-mono">
                          {new Date(v.lastVisitAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </td>

                    {/* Photos Count */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#0A0C0E] border border-[#EDE7DC]/10 font-mono text-[#EDE7DC] font-semibold text-[11px]">
                        {v.photoCount}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectVisitor(v.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#EDE7DC]/5 hover:bg-[#E8913C]/20 text-[#EDE7DC] hover:text-[#E8913C] transition-colors text-[11px]"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-[#EDE7DC]/10 flex items-center justify-between text-xs font-sora bg-[#0A0C0E]/40">
            <span className="text-[#6C7378]">
              Page <span className="text-[#EDE7DC] font-mono">{page}</span> of{" "}
              <span className="text-[#EDE7DC] font-mono">{totalPages}</span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                className="p-1.5 rounded bg-[#101317] border border-[#EDE7DC]/10 text-[#9EA5A8] hover:text-[#EDE7DC] disabled:opacity-40 transition-colors"
                title="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                className="p-1.5 rounded bg-[#101317] border border-[#EDE7DC]/10 text-[#9EA5A8] hover:text-[#EDE7DC] disabled:opacity-40 transition-colors"
                title="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
