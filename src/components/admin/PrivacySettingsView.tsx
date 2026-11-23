"use client";

import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Lock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  HardDrive,
  EyeOff,
  UserCheck,
  RefreshCw,
  Search,
} from "lucide-react";

interface ConsentRecord {
  visitorId: string;
  name: string;
  email: string;
  consentGiven: boolean;
  consentTimestamp: string;
  firstVisitAt: string;
  lastVisitAt: string;
  photosCount: number;
}

interface LimitsConfig {
  maxFileSizeBytes: number;
  maxFileFormatted: string;
  maxFilesCount: number;
  allowedMimeTypes: string[];
  allowedExtensions: string[];
  magicByteVerification: string;
}

export function PrivacySettingsView() {
  const [consentRecords, setConsentRecords] = useState<ConsentRecord[]>([]);
  const [limits, setLimits] = useState<LimitsConfig | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrivacyData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/privacy");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success) {
        setConsentRecords(data.consentRecords || []);
        setLimits(data.limits || null);
      } else {
        throw new Error(data.error || "Failed to load privacy data");
      }
    } catch (err: any) {
      console.error("Privacy fetch error:", err);
      setError(err.message || "Failed to retrieve consent audit records");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrivacyData();
  }, []);

  const filteredRecords = consentRecords.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-syne font-bold text-[#EDE7DC] tracking-tight">
            Privacy & Consent Governance
          </h1>
          <p className="text-xs font-sora text-[#9EA5A8] mt-1">
            Immutable visitor consent audit logs, public exhibition policies, and intake security restrictions.
          </p>
        </div>

        <button
          onClick={fetchPrivacyData}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#101317] hover:bg-[#101317]/80 text-[#EDE7DC] border border-[#EDE7DC]/10 text-xs font-sora transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#9EA5A8] ${isLoading ? "animate-spin" : ""}`} />
          <span>Sync Consent Logs</span>
        </button>
      </div>

      {/* Safety & Compliance Notice Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Consent Mandate */}
        <div className="p-5 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-syne font-bold text-[#EDE7DC]">
              Universal Consent Enforcement
            </h3>
            <p className="text-xs font-sora text-[#9EA5A8] mt-1 leading-relaxed">
              Every photo upload requires explicit checkbox consent before submission. Non-consented photos cannot be ingested or displayed.
            </p>
          </div>
        </div>

        {/* Private Email Shield */}
        <div className="p-5 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#2E6B72]/20 border border-[#2E6B72]/40 flex items-center justify-center text-[#2E6B72]">
            <EyeOff className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-syne font-bold text-[#EDE7DC]">
              PII Email Cloaking
            </h3>
            <p className="text-xs font-sora text-[#9EA5A8] mt-1 leading-relaxed">
              Visitor emails are strictly restricted to administrative audit logs. Under no circumstances are email addresses sent to or projected on the Smart TV slideshow.
            </p>
          </div>
        </div>

        {/* Binary Inspection */}
        <div className="p-5 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8913C]/15 border border-[#E8913C]/30 flex items-center justify-center text-[#E8913C]">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-syne font-bold text-[#EDE7DC]">
              Magic Byte Validation
            </h3>
            <p className="text-xs font-sora text-[#9EA5A8] mt-1 leading-relaxed">
              Files are inspected at the binary level (magic bytes) to prevent disguised executable scripts or non-image payloads from penetrating storage.
            </p>
          </div>
        </div>
      </div>

      {/* Upload Limits & Storage Policies */}
      <div className="p-6 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 space-y-4">
        <h2 className="text-base font-syne font-bold text-[#EDE7DC] flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-[#E8913C]" />
          Intake Limits & Storage Policy
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sora">
          <div className="p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 space-y-1">
            <span className="text-[#6C7378] text-[11px]">Max File Size</span>
            <p className="font-mono font-bold text-base text-[#EDE7DC]">10 MB</p>
            <p className="text-[10px] text-[#9EA5A8]">10,485,760 bytes per item</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 space-y-1">
            <span className="text-[#6C7378] text-[11px]">Submission Limit</span>
            <p className="font-mono font-bold text-base text-[#EDE7DC]">5 Photos</p>
            <p className="text-[10px] text-[#9EA5A8]">Per intake batch session</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 space-y-1">
            <span className="text-[#6C7378] text-[11px]">Allowed Formats</span>
            <p className="font-mono font-bold text-base text-[#EDE7DC]">JPG, PNG, WEBP</p>
            <p className="text-[10px] text-[#9EA5A8]">Strict MIME & magic check</p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0A0C0E] border border-[#EDE7DC]/10 space-y-1">
            <span className="text-[#6C7378] text-[11px]">Storage Provider</span>
            <p className="font-mono font-bold text-base text-[#EDE7DC]">Isolated Disk</p>
            <p className="text-[10px] text-emerald-400 font-mono">Traversal protected</p>
          </div>
        </div>
      </div>

      {/* Consent Audit Records Table */}
      <div className="p-6 rounded-2xl bg-[#101317] border border-[#EDE7DC]/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-syne font-bold text-[#EDE7DC] flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              Audience Consent Records
            </h2>
            <p className="text-xs font-sora text-[#6C7378] mt-0.5">
              Verified legal consent acknowledgments captured during intake
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#6C7378] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search consent log..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#0A0C0E] border border-[#EDE7DC]/10 text-xs font-sora text-[#EDE7DC] placeholder-[#6C7378] focus:outline-none focus:border-[#E8913C]"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="py-16 text-center text-xs font-sora text-[#9EA5A8]">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#E8913C]" />
            Loading consent audit records...
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="py-16 text-center text-xs font-sora text-[#6C7378] space-y-2">
            <FileText className="w-8 h-8 mx-auto opacity-40 text-[#9EA5A8]" />
            <p>No consent records match your filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#EDE7DC]/10">
            <table className="w-full text-left text-xs font-sora">
              <thead className="bg-[#0A0C0E]/80 text-[#6C7378] uppercase font-mono text-[10px] tracking-wider border-b border-[#EDE7DC]/10">
                <tr>
                  <th className="py-3 px-4">Visitor Identity</th>
                  <th className="py-3 px-4">Admin Email</th>
                  <th className="py-3 px-4">Consent Status</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Photos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EDE7DC]/5">
                {filteredRecords.map((r) => (
                  <tr key={r.visitorId} className="hover:bg-[#EDE7DC]/5 transition-colors">
                    <td className="py-3 px-4 font-semibold text-[#EDE7DC]">{r.name}</td>
                    <td className="py-3 px-4 font-mono text-[#9EA5A8]">{r.email}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" />
                        Confirmed Active
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[#9EA5A8]">
                      {new Date(r.consentTimestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#EDE7DC] font-semibold">
                      {r.photosCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
