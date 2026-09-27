"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SystemRegistryItem, UserProfile } from "@/types/portal";
import { logoutAction } from "@/lib/actions/auth";
import { 
  Menu, 
  Search, 
  Bell, 
  User, 
  LogOut, 
  Sliders, 
  Palette, 
  ExternalLink,
  ChevronDown
} from "lucide-react";
import { IconResolver } from "@/components/ui/icon-resolver";
import { Badge } from "@/components/ui/badge";

export interface TopbarProps {
  userProfile?: UserProfile | null;
  systems?: SystemRegistryItem[];
  onOpenSidebar: () => void;
}

export function Topbar({
  userProfile,
  systems = [],
  onOpenSidebar,
}: TopbarProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Filter systems based on user query
  const filteredSystems = searchQuery.trim()
    ? systems.filter(
        (s) =>
          s.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.system_group.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSystem = (system: SystemRegistryItem) => {
    setIsSearchOpen(false);
    setSearchQuery("");
    if (system.system_type === "external") {
      window.open(system.route_or_url, "_blank", "noopener,noreferrer");
    } else {
      router.push(system.route_or_url);
    }
  };

  const displayName = userProfile?.display_name || "บุคลากรสถานศึกษา";
  const roleName = userProfile?.role?.role_name || "ผู้ใช้งานระบบ";
  const userInitials = displayName.slice(0, 2);

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 shadow-2xs">
      {/* Left Area: Mobile Menu Toggle & Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="เปิดเมนูนำทาง"
          className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <span className="text-sm font-semibold text-slate-800">
            ระบบพอร์ทัลกลางสถานศึกษา
          </span>
          <span className="text-xs text-slate-400 block -mt-0.5">
            โรงเรียนพิจิตรคริสเตียน
          </span>
        </div>
      </div>

      {/* Middle Area: Global Quick Search */}
      <div ref={searchRef} className="relative flex-1 max-w-md mx-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder="ค้นหาระบบงานหรือหมวดหมู่..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 transition-colors shadow-2xs"
          />
        </div>

        {/* Quick Search Results Dropdown */}
        {isSearchOpen && searchQuery.trim() && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-50 animate-in fade-in duration-150">
            <div className="p-2 border-b border-slate-100 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              ผลการค้นหาระบบงาน ({filteredSystems.length})
            </div>

            {filteredSystems.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto divide-y divide-slate-100 portal_scrollbar">
                {filteredSystems.map((system) => (
                  <li key={system.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectSystem(system)}
                      className="w-full px-3.5 py-2.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        <IconResolver
                          name={system.icon_key}
                          className="w-5 h-5 text-slate-500 group-hover:text-green-700 flex-shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {system.display_name}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            หมวดหมู่: {system.system_group}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                        {system.is_maintenance && (
                          <Badge variant="danger" size="sm">ปรับปรุง</Badge>
                        )}
                        {system.system_type === "external" && (
                          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        )}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-center text-sm text-slate-500">
                ไม่พบระบบงานที่ตรงกับ &quot;{searchQuery}&quot;
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Area: Notifications & User Profile Menu */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* User Profile Dropdown */}
        <div ref={profileRef} className="relative">
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            aria-expanded={isProfileMenuOpen}
            aria-label="เมนูผู้ใช้งาน"
            className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:ring-2 focus-visible:ring-green-600"
          >
            <div className="w-8 h-8 rounded-full bg-green-700 text-white font-semibold text-xs flex items-center justify-center shadow-2xs">
              {userInitials}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-sm font-semibold text-slate-900 block leading-tight truncate max-w-[130px]">
                {displayName}
              </span>
              <span className="text-xs text-slate-500 block -mt-0.5 truncate max-w-[130px]">
                {roleName}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
          </button>

          {/* User Profile Menu Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl border border-slate-200 shadow-lg p-1.5 z-50 animate-in fade-in duration-150">
              <div className="p-3 border-b border-slate-100">
                <p className="text-sm font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate mt-0.5">{userProfile?.email || "อีเมลผู้ใช้งาน"}</p>
                <div className="mt-2">
                  <Badge variant="success" size="sm">{roleName}</Badge>
                </div>
              </div>

              <div className="py-1">
                <Link
                  href="/design-system"
                  onClick={() => setIsProfileMenuOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors"
                >
                  <Palette className="w-4 h-4 text-slate-500" />
                  <span>คู่มือระบบการออกแบบ</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-slate-100">
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-rose-700 hover:bg-rose-50 rounded-lg transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>ออกจากระบบ</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
