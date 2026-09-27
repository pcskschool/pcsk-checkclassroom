"use client";

import React, { useState, useEffect, useMemo } from "react";
import type { SystemRegistryItem, GlobalAnnouncement, UserProfile } from "@/types/portal";
import { SystemCard } from "./system-card";
import { AnnouncementBanner } from "./announcement-banner";
import { PageHeader } from "./page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  Layers, 
  Star, 
  History, 
  LayoutGrid, 
  ShieldCheck, 
  Megaphone,
  School
} from "lucide-react";
import { DEFAULT_SYSTEM_GROUPS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export interface DashboardClientProps {
  systems: SystemRegistryItem[];
  announcements?: GlobalAnnouncement[];
  userProfile?: UserProfile | null;
}

const FAVORITES_STORAGE_KEY = "pcsk_favorite_systems";
const RECENTS_STORAGE_KEY = "pcsk_recent_systems";

export function DashboardClient({
  systems,
  announcements = [],
  userProfile,
}: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);

  // Load favorites & recents from localStorage
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (storedFavs) setFavoriteIds(JSON.parse(storedFavs));

      const storedRecents = localStorage.getItem(RECENTS_STORAGE_KEY);
      if (storedRecents) setRecentIds(JSON.parse(storedRecents));
    } catch {
      // Storage access might fail in privacy mode
    }
  }, []);

  // Toggle favorite
  const handleToggleFavorite = (systemId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(systemId)
        ? prev.filter((id) => id !== systemId)
        : [...prev, systemId];
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Record system access
  const handleSystemClick = (system: SystemRegistryItem) => {
    setRecentIds((prev) => {
      const next = [system.id, ...prev.filter((id) => id !== system.id)].slice(0, 4);
      try {
        localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Filtered systems calculation
  const filteredSystems = useMemo(() => {
    return systems.filter((system) => {
      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = system.display_name.toLowerCase().includes(query);
        const matchDesc = system.description.toLowerCase().includes(query);
        const matchGroup = system.system_group.toLowerCase().includes(query);
        if (!matchTitle && !matchDesc && !matchGroup) return false;
      }

      // Filter by group tab
      if (selectedGroup === "favorites") {
        return favoriteIds.includes(system.id);
      }
      if (selectedGroup === "recent") {
        return recentIds.includes(system.id);
      }
      if (selectedGroup !== "all") {
        return system.system_group === selectedGroup;
      }

      return true;
    });
  }, [systems, searchQuery, selectedGroup, favoriteIds, recentIds]);

  // Favorite systems list for quick access section
  const favoriteSystems = useMemo(() => {
    return systems.filter((s) => favoriteIds.includes(s.id));
  }, [systems, favoriteIds]);

  const displayName = userProfile?.display_name || "บุคลากรสถานศึกษา";
  const roleName = userProfile?.role?.role_name || "ผู้ใช้งานระบบ";

  return (
    <div className="space-y-8">
      {/* 1. Page Header & Welcome Area */}
      <PageHeader
        title="แผงควบคุมหลัก (Dashboard)"
        description={`ยินดีต้อนรับคุณ ${displayName} เข้าสู่ศูนย์กลางการเข้าถึงระบบสารสนเทศสถานศึกษา`}
        badge={
          <Badge variant="success" dot>
            {roleName}
          </Badge>
        }
      />

      {/* 2. Global Announcements Banner (Section 23) */}
      {announcements.length > 0 && (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <AnnouncementBanner
              key={ann.id}
              title={`📢 ประกาศจากผู้ดูแลระบบ: ${ann.title}`}
              content={ann.message}
              type={ann.announcement_type === "warning" ? "warning" : "info"}
            />
          ))}
        </div>
      )}

      {/* 3. Search Bar and Group Filter Tabs */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อระบบงาน คำอธิบาย หรือหมวดหมู่..."
            className="w-full pl-11 pr-10 py-3 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors shadow-2xs"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="ล้างคำค้นหา"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 portal_scrollbar select-none">
          <button
            type="button"
            onClick={() => setSelectedGroup("all")}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
              selectedGroup === "all"
                ? "bg-green-700 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
            )}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>ทั้งหมด ({systems.length})</span>
          </button>

          {favoriteIds.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedGroup("favorites")}
              className={cn(
                "px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5",
                selectedGroup === "favorites"
                  ? "bg-green-700 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
              )}
            >
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>ที่ใช้บ่อย ({favoriteSystems.length})</span>
            </button>
          )}

          {DEFAULT_SYSTEM_GROUPS.map((group) => {
            const countInGroup = systems.filter((s) => s.system_group === group).length;
            if (countInGroup === 0) return null;

            return (
              <button
                key={group}
                type="button"
                onClick={() => setSelectedGroup(group)}
                className={cn(
                  "px-3.5 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                  selectedGroup === group
                    ? "bg-green-700 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                )}
              >
                {group} ({countInGroup})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Quick Access / Favorites Section (when viewing "all" and favorites exist) */}
      {selectedGroup === "all" && !searchQuery && favoriteSystems.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">
              ระบบที่ใช้บ่อย (Quick Access)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {favoriteSystems.map((system) => (
              <SystemCard
                key={system.id}
                system={system}
                isFavorite={true}
                onToggleFavorite={handleToggleFavorite}
                onSystemClick={handleSystemClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* 5. Main Systems Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-green-700" />
            <h2 className="text-lg font-bold text-slate-900">
              {selectedGroup === "all"
                ? "ระบบงานทั้งหมดในสังกัดสถานศึกษา"
                : selectedGroup === "favorites"
                ? "ระบบที่ปักหมุดไว้"
                : `หมวดหมู่: ${selectedGroup}`}
            </h2>
          </div>

          <span className="text-sm text-slate-500">
            พบ {filteredSystems.length} ระบบ
          </span>
        </div>

        {filteredSystems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredSystems.map((system) => (
              <SystemCard
                key={system.id}
                system={system}
                isFavorite={favoriteIds.includes(system.id)}
                onToggleFavorite={handleToggleFavorite}
                onSystemClick={handleSystemClick}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="ไม่พบระบบงานที่ตรงกับเงื่อนไข"
            description="กรุณาตรวจสอบคำค้นหาหรือลองเลือกหมวดหมู่อื่นเพื่อค้นหาระบบงานที่ต้องการ"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGroup("all");
                }}
              >
                แสดงระบบงานทั้งหมด
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
}
