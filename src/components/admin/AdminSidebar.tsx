"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  Image as ImageIcon,
  Tv,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Sun,
  Moon,
} from "lucide-react";

export type AdminTab = "overview" | "visitors" | "photos" | "slideshow" | "privacy";

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  adminEmail?: string;
  onLogout: () => void;
}

export function AdminSidebar({
  activeTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  adminEmail = "admin@slideshow.internal",
  onLogout,
}: AdminSidebarProps) {
  const [highContrast, setHighContrast] = React.useState(false);

  const navItems = [
    {
      id: "overview" as AdminTab,
      label: "Overview",
      description: "Live Metrics & Activity",
      icon: LayoutDashboard,
    },
    {
      id: "visitors" as AdminTab,
      label: "Visitors & Directory",
      description: "Visitor profiles & history",
      icon: Users,
    },
    {
      id: "photos" as AdminTab,
      label: "Photo Moderation",
      description: "Gallery, review & delete",
      icon: ImageIcon,
    },
    {
      id: "slideshow" as AdminTab,
      label: "Slideshow Settings",
      description: "TV timing, transitions, loop",
      icon: Tv,
    },
    {
      id: "privacy" as AdminTab,
      label: "Privacy & Consent",
      description: "Consent logs & file policies",
      icon: ShieldCheck,
    },
  ];

  const handleNavClick = (tab: AdminTab) => {
    onSelectTab(tab);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#101317] border-r border-[#EDE7DC]/10 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-[#EDE7DC]/10 flex items-center justify-between">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E8913C] to-[#2E6B72] flex items-center justify-center flex-shrink-0 shadow-lg shadow-[#E8913C]/10 border border-[#EDE7DC]/20">
            <Sparkles className="w-5 h-5 text-[#EDE7DC]" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <span className="font-syne font-bold text-sm tracking-wide text-[#EDE7DC] truncate">
                ARCHIVE CONSOLE
              </span>
              <span className="text-[10px] font-mono tracking-widest text-[#E8913C] uppercase">
                ADMINISTRATION
              </span>
            </div>
          )}
        </div>

        {/* Desktop Collapse Button */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-md text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#EDE7DC]/5 transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all group relative ${
                isActive
                  ? "bg-[#E8913C]/15 text-[#EDE7DC] font-medium border border-[#E8913C]/30 shadow-sm shadow-[#E8913C]/10"
                  : "text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#EDE7DC]/5"
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#E8913C] rounded-r-full" />
              )}
              <Icon
                className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? "text-[#E8913C]" : "text-[#6C7378] group-hover:text-[#EDE7DC]"
                }`}
              />
              {!isCollapsed && (
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-sm font-sora truncate">{item.label}</span>
                  <span className="text-[10px] text-[#6C7378] truncate group-hover:text-[#9EA5A8]">
                    {item.description}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Launch Section */}
      <div className="p-3 border-t border-[#EDE7DC]/10 space-y-2">
        <Link
          href="/display"
          target="_blank"
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#2E6B72]/15 hover:bg-[#2E6B72]/25 text-[#EDE7DC] border border-[#2E6B72]/30 text-xs font-sora transition-colors group"
          title="Open TV Slideshow"
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            {!isCollapsed && <span className="truncate">Live TV Display</span>}
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-[#9EA5A8] group-hover:text-[#EDE7DC] flex-shrink-0" />
        </Link>

        {/* Contrast / Theme Toggle */}
        <button
          onClick={() => setHighContrast(!highContrast)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[#9EA5A8] hover:text-[#EDE7DC] hover:bg-[#EDE7DC]/5 text-xs font-sora transition-colors"
          title="Toggle High Contrast Mode"
        >
          {highContrast ? <Sun className="w-4 h-4 text-[#E8913C]" /> : <Moon className="w-4 h-4" />}
          {!isCollapsed && <span>{highContrast ? "High Contrast Active" : "Onyx Dark Theme"}</span>}
        </button>
      </div>

      {/* Admin Profile & Logout */}
      <div className="p-3 border-t border-[#EDE7DC]/10 bg-[#0A0C0E]/50">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-[#E8913C]/20 border border-[#E8913C]/40 flex items-center justify-center text-[#E8913C] font-syne font-bold text-xs flex-shrink-0">
              {adminEmail.charAt(0).toUpperCase()}
            </div>
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-sora font-semibold text-[#EDE7DC] truncate">
                  Admin Officer
                </span>
                <span className="text-[10px] font-mono text-[#6C7378] truncate" title={adminEmail}>
                  {adminEmail}
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 rounded-md text-[#9EA5A8] hover:text-rose-400 hover:bg-rose-500/10 transition-colors flex-shrink-0"
            title="Log Out of Admin Console"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col h-screen sticky top-0 transition-all duration-300 z-30 ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
        />
      )}

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-y-0 left-0 w-72 max-w-[80vw] z-50 md:hidden transition-transform duration-300 transform ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
