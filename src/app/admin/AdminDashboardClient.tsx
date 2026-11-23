"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Tv,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  LogOut,
  Sparkles,
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";

import { AdminSidebar, AdminTab } from "@/components/admin/AdminSidebar";
import { OverviewView } from "@/components/admin/OverviewView";
import { VisitorsView } from "@/components/admin/VisitorsView";
import { PhotosView } from "@/components/admin/PhotosView";
import { SlideshowManagementView } from "@/components/admin/SlideshowManagementView";
import { PrivacySettingsView } from "@/components/admin/PrivacySettingsView";

import { PhotoDeleteModal } from "@/components/admin/PhotoDeleteModal";
import { PhotoPreviewModal } from "@/components/admin/PhotoPreviewModal";
import { VisitorDetailModal } from "@/components/admin/VisitorDetailModal";

interface AdminDashboardClientProps {
  adminEmail: string;
}

export function AdminDashboardClient({ adminEmail }: AdminDashboardClientProps) {
  const router = useRouter();

  // Navigation & Layout State
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [deleteTargetPhoto, setDeleteTargetPhoto] = useState<any | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<any | null>(null);
  const [selectedVisitorId, setSelectedVisitorId] = useState<string | null>(null);

  // Action toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    router.push("/admin/login");
    router.refresh();
  };

  // Photo Deletion Handler
  const handleConfirmDeletePhoto = async (photoId: string) => {
    setIsDeletingPhoto(true);
    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to delete photo");
      }

      showToast("Photo deleted successfully. Live slideshow updated.");
      setDeleteTargetPhoto(null);
      if (previewPhoto?.id === photoId) {
        setPreviewPhoto(null);
      }
    } catch (err: any) {
      alert(`Deletion failed: ${err.message}`);
    } finally {
      setIsDeletingPhoto(false);
    }
  };

  // Status toggle handler
  const handleTogglePhotoStatus = async (photoId: string, currentStatus: string) => {
    const newStatus = currentStatus === "active" ? "flagged" : "active";
    try {
      const res = await fetch(`/api/admin/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`Photo status set to ${newStatus}`);
        if (previewPhoto && previewPhoto.id === photoId) {
          setPreviewPhoto({ ...previewPhoto, displayStatus: newStatus });
        }
      }
    } catch (err: any) {
      alert(`Status update failed: ${err.message}`);
    }
  };

  const getTabLabel = (tab: AdminTab) => {
    switch (tab) {
      case "overview":
        return "System Overview";
      case "visitors":
        return "Visitors Directory";
      case "photos":
        return "Photo Moderation Gallery";
      case "slideshow":
        return "Slideshow Settings";
      case "privacy":
        return "Privacy & Consent Governance";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0C0E] text-[#EDE7DC] flex flex-col md:flex-row selection:bg-[#E8913C]/30 selection:text-[#EDE7DC]">
      {/* Admin Sidebar */}
      <AdminSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        adminEmail={adminEmail}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-[#101317]/90 backdrop-blur-md border-b border-[#EDE7DC]/10 px-4 md:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 rounded-lg text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#EDE7DC]/5 md:hidden"
              title="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb Trail */}
            <div className="flex items-center gap-2 text-xs font-sora">
              <span className="text-[#6C7378] hidden sm:inline">Admin Console</span>
              <ChevronRight className="w-3.5 h-3.5 text-[#6C7378] hidden sm:inline" />
              <span className="text-[#EDE7DC] font-semibold">{getTabLabel(activeTab)}</span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <Link
              href="/display"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#2E6B72]/15 hover:bg-[#2E6B72]/25 text-[#EDE7DC] border border-[#2E6B72]/30 text-xs font-sora transition-colors"
            >
              <Tv className="w-3.5 h-3.5 text-emerald-400" />
              <span>Smart TV Feed</span>
              <ExternalLink className="w-3 h-3 text-[#9EA5A8]" />
            </Link>

            <div className="h-4 w-px bg-[#EDE7DC]/10 hidden sm:block" />

            <div className="flex items-center gap-2">
              <span className="hidden lg:inline text-[11px] font-mono text-[#9EA5A8]">
                {adminEmail}
              </span>
              <button
                onClick={handleLogout}
                className="p-1.5 text-[#9EA5A8] hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors text-xs flex items-center gap-1.5"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </header>

        {/* Global Toast Alert */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 p-4 rounded-xl bg-[#101317] border border-emerald-500/40 text-emerald-300 text-xs font-sora shadow-2xl flex items-center gap-2.5 animate-in slide-in-from-bottom-3 duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Active View Container */}
        <main className="flex-1">
          {activeTab === "overview" && (
            <OverviewView
              onNavigateTab={(tab) => setActiveTab(tab)}
              onPreviewPhoto={(photo) => setPreviewPhoto(photo)}
            />
          )}

          {activeTab === "visitors" && (
            <VisitorsView
              onSelectVisitor={(id) => setSelectedVisitorId(id)}
            />
          )}

          {activeTab === "photos" && (
            <PhotosView
              onPreviewPhoto={(photo) => setPreviewPhoto(photo)}
              onRequestDelete={(photo) => setDeleteTargetPhoto(photo)}
              onSelectVisitor={(id) => setSelectedVisitorId(id)}
            />
          )}

          {activeTab === "slideshow" && <SlideshowManagementView />}

          {activeTab === "privacy" && <PrivacySettingsView />}
        </main>
      </div>

      {/* Photo Delete Confirmation Modal */}
      <PhotoDeleteModal
        isOpen={Boolean(deleteTargetPhoto)}
        photo={deleteTargetPhoto}
        onClose={() => setDeleteTargetPhoto(null)}
        onConfirmDelete={handleConfirmDeletePhoto}
        isDeleting={isDeletingPhoto}
      />

      {/* Photo High-Res Lightbox Modal */}
      <PhotoPreviewModal
        isOpen={Boolean(previewPhoto)}
        photo={previewPhoto}
        onClose={() => setPreviewPhoto(null)}
        onToggleStatus={handleTogglePhotoStatus}
      />

      {/* Visitor Detail Drawer / Modal */}
      <VisitorDetailModal
        isOpen={Boolean(selectedVisitorId)}
        visitorId={selectedVisitorId}
        onClose={() => setSelectedVisitorId(null)}
        onPreviewPhoto={(p) => setPreviewPhoto(p)}
      />
    </div>
  );
}
