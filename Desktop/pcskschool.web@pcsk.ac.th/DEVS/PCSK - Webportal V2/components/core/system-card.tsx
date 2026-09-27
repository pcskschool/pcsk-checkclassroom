"use client";

import React from "react";
import Link from "next/link";
import type { SystemRegistryItem } from "@/types/portal";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconResolver } from "@/components/ui/icon-resolver";
import { 
  ArrowRight, 
  ExternalLink, 
  Wrench, 
  Star 
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SystemCardProps {
  system: SystemRegistryItem;
  isFavorite?: boolean;
  onToggleFavorite?: (systemId: string) => void;
  onSystemClick?: (system: SystemRegistryItem) => void;
}

/**
 * Standard System Card for Dashboard (Section 12 & 14).
 * Reuses Shared Design System tokens and never exposes internal system codes.
 */
export function SystemCard({
  system,
  isFavorite = false,
  onToggleFavorite,
  onSystemClick,
}: SystemCardProps) {
  const isExternal = system.system_type === "external";

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleFavorite?.(system.id);
  };

  return (
    <Card 
      hoverable 
      className={cn(
        "flex flex-col justify-between h-full group relative overflow-hidden transition-all duration-200 border-slate-200 hover:border-green-300 hover:shadow-md",
        system.is_maintenance && "bg-slate-50/60 border-dashed"
      )}
    >
      {/* Top Card Body */}
      <div className="p-5 sm:p-6 space-y-4">
        {/* Top Header: Icon, Group Badge, Favorite Toggle */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-2xs",
                system.is_maintenance
                  ? "bg-amber-100 text-amber-800"
                  : "bg-green-50 text-green-700 group-hover:bg-green-700 group-hover:text-white"
              )}
            >
              <IconResolver name={system.icon_key} className="w-6 h-6" />
            </div>

            <div>
              <Badge variant="default" size="sm">
                {system.system_group}
              </Badge>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFavoriteClick}
            aria-label={isFavorite ? "นำออกจากระบบที่ใช้บ่อย" : "เพิ่มเข้าระบบที่ใช้บ่อย"}
            className={cn(
              "p-1.5 rounded-lg transition-colors focus-visible:ring-2 focus-visible:ring-green-600",
              isFavorite
                ? "text-amber-500 hover:text-amber-600 bg-amber-50"
                : "text-slate-300 hover:text-amber-400 hover:bg-slate-100"
            )}
          >
            <Star className={cn("w-4 h-4", isFavorite && "fill-current")} />
          </button>
        </div>

        {/* System Title & Human-readable Description */}
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-green-800 transition-colors">
            {system.display_name}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed line-clamp-2">
            {system.description}
          </p>
        </div>
      </div>

      {/* Bottom Card Footer: Status & Launch Action */}
      <div className="px-5 sm:px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-2 mt-auto">
        <div className="flex items-center gap-2">
          {system.is_maintenance ? (
            <Badge variant="danger" size="sm" dot>
              ปิดปรับปรุง
            </Badge>
          ) : isExternal ? (
            <Badge variant="info" size="sm">
              ระบบภายนอก
            </Badge>
          ) : (
            <Badge variant="success" size="sm" dot>
              พร้อมใช้งาน
            </Badge>
          )}
        </div>

        {/* Action Link or Maintenance Alert */}
        <Link
          href={system.route_or_url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          onClick={() => onSystemClick?.(system)}
          className={cn(
            "inline-flex items-center gap-1.5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-green-600 rounded px-2 py-1",
            system.is_maintenance
              ? "text-amber-700 hover:text-amber-800"
              : "text-green-700 hover:text-green-800"
          )}
        >
          {system.is_maintenance ? (
            <>
              <Wrench className="w-4 h-4" />
              <span>ดูรายละเอียด</span>
            </>
          ) : isExternal ? (
            <>
              <span>เปิดระบบ</span>
              <ExternalLink className="w-4 h-4" />
            </>
          ) : (
            <>
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </Link>
      </div>
    </Card>
  );
}
