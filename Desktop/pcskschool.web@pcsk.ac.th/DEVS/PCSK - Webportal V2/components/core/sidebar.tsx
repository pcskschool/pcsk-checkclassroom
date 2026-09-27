"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { SystemRegistryItem } from "@/types/portal";
import { IconResolver } from "@/components/ui/icon-resolver";
import { 
  School, 
  LayoutDashboard, 
  Palette, 
  ExternalLink, 
  Wrench, 
  X,
  ChevronRight,
  Users,
  Sliders,
  Layers,
} from "lucide-react";
import { PORTAL_CONFIG, DEFAULT_SYSTEM_GROUPS } from "@/lib/constants";

export interface SidebarProps {
  systems: SystemRegistryItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function Sidebar({
  systems,
  isOpen,
  onClose,
  className,
}: SidebarProps) {
  const pathname = usePathname();

  // Group systems by their human-readable system_group
  const groupedSystems = DEFAULT_SYSTEM_GROUPS.reduce<Record<string, SystemRegistryItem[]>>(
    (acc, group) => {
      const itemsInGroup = systems.filter((s) => s.system_group === group);
      if (itemsInGroup.length > 0) {
        acc[group] = itemsInGroup;
      }
      return acc;
    },
    {}
  );

  // Catch any system whose group is not in the default list
  const otherSystems = systems.filter(
    (s) => !(DEFAULT_SYSTEM_GROUPS as readonly string[]).includes(s.system_group)
  );
  if (otherSystems.length > 0) {
    groupedSystems["ระบบงานอื่น ๆ"] = otherSystems;
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          role="presentation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-40 w-72 bg-white border-r border-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto shadow-sm lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
          className
        )}
      >
        {/* Brand & Logo Header */}
        <div className="h-16 border-b border-slate-200 px-5 flex items-center justify-between flex-shrink-0 bg-white">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center gap-3 text-slate-900 hover:opacity-90 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-green-700 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <School className="w-6 h-6" />
            </div>
            <div className="overflow-hidden">
              <h1 className="text-base font-bold text-slate-900 leading-tight truncate">
                {PORTAL_CONFIG.name}
              </h1>
              <p className="text-xs text-slate-500 truncate">
                {PORTAL_CONFIG.schoolFullName}
              </p>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            type="button"
            onClick={onClose}
            aria-label="ปิดเมนูนำทาง"
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 lg:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Items */}
        <nav 
          aria-label="เมนูระบบงานพอร์ทัล"
          className="flex-1 overflow-y-auto portal_scrollbar p-3 space-y-6"
        >
          {/* Main Dashboard Link */}
          <div>
            <Link
              href="/dashboard"
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium transition-colors",
                pathname === "/dashboard"
                  ? "bg-green-50 text-green-900 font-semibold"
                  : "text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <LayoutDashboard className={cn(
                "w-5 h-5 flex-shrink-0",
                pathname === "/dashboard" ? "text-green-700" : "text-slate-500"
              )} />
              <span>แผงควบคุมหลัก (Dashboard)</span>
            </Link>
          </div>

          {/* Grouped Dynamic Systems from Database */}
          {Object.entries(groupedSystems).map(([groupName, groupItems]) => (
            <div key={groupName} className="space-y-1">
              <h2 className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
                {groupName}
              </h2>

              <ul className="space-y-0.5">
                {groupItems.map((system) => {
                  const isExternal = system.system_type === "external";
                  const isActive = !isExternal && pathname.startsWith(system.route_or_url);

                  return (
                    <li key={system.id}>
                      <Link
                        href={system.route_or_url}
                        target={isExternal ? "_blank" : undefined}
                        rel={isExternal ? "noopener noreferrer" : undefined}
                        onClick={isExternal ? undefined : onClose}
                        className={cn(
                          "group flex items-center justify-between px-3 py-2 rounded-lg text-base transition-colors",
                          isActive
                            ? "bg-green-50 text-green-900 font-semibold"
                            : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                        )}
                      >
                        <div className="flex items-center gap-3 overflow-hidden">
                          <IconResolver
                            name={system.icon_key}
                            className={cn(
                              "w-5 h-5 flex-shrink-0 transition-colors",
                              isActive
                                ? "text-green-700"
                                : "text-slate-400 group-hover:text-slate-600"
                            )}
                          />
                          <span className="truncate leading-tight">
                            {system.display_name}
                          </span>
                        </div>

                        {/* Status indicators */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                          {system.is_maintenance && (
                            <span 
                              title="ระบบอยู่ระหว่างปรับปรุง"
                              className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-800 flex items-center gap-1"
                            >
                              <Wrench className="w-3 h-3 text-amber-700" />
                              <span className="hidden sm:inline">ปรับปรุง</span>
                            </span>
                          )}
                          {isExternal && (
                            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {/* Administration Section */}
          <div className="space-y-1 pt-2 border-t border-slate-100">
            <h2 className="px-3 text-xs font-semibold text-slate-400 tracking-wider uppercase mb-1">
              การจัดการระบบ (Administration)
            </h2>
            <ul className="space-y-0.5">
              <li>
                <Link
                  href="/admin/systems"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-base transition-colors",
                    pathname.startsWith("/admin/systems")
                      ? "bg-green-50 text-green-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Layers className={cn("w-5 h-5", pathname.startsWith("/admin/systems") ? "text-green-700" : "text-slate-400")} />
                  <span>ทะเบียนระบบงาน</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-base transition-colors",
                    pathname.startsWith("/admin/users")
                      ? "bg-green-50 text-green-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Users className={cn("w-5 h-5", pathname.startsWith("/admin/users") ? "text-green-700" : "text-slate-400")} />
                  <span>จัดการผู้ใช้งาน</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings"
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-base transition-colors",
                    pathname.startsWith("/admin/settings")
                      ? "bg-green-50 text-green-900 font-semibold"
                      : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Sliders className={cn("w-5 h-5", pathname.startsWith("/admin/settings") ? "text-green-700" : "text-slate-400")} />
                  <span>ตั้งค่าพอร์ทัล</span>
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Bottom System Utility Links */}
        <div className="p-3 border-t border-slate-200 bg-slate-50/70 space-y-1">
          <Link
            href="/design-system"
            onClick={onClose}
            className={cn(
              "flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors",
              pathname === "/design-system"
                ? "bg-green-100 text-green-900 font-medium"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <div className="flex items-center gap-2.5">
              <Palette className="w-4 h-4 text-green-700" />
              <span>คู่มือระบบการออกแบบ</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
        </div>
      </aside>
    </>
  );
}
