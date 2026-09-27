"use client";

import React from "react";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatThaiDateTime } from "@/lib/utils";
import { ShieldCheck, UserCheck, Key, Settings, Wrench, LogIn, LogOut } from "lucide-react";

export interface AuditLogViewerProps {
  logs: any[];
}

const ACTION_CONFIG: Record<string, { label: string; variant: "default" | "success" | "warning" | "danger" | "info"; icon: React.ReactNode }> = {
  login: { label: "เข้าสู่ระบบ", variant: "success", icon: <LogIn className="w-3.5 h-3.5" /> },
  logout: { label: "ออกจากระบบ", variant: "default", icon: <LogOut className="w-3.5 h-3.5" /> },
  settings_update: { label: "ปรับปรุงการตั้งค่า", variant: "info", icon: <Settings className="w-3.5 h-3.5" /> },
  system_save: { label: "บันทึกทะเบียนระบบ", variant: "info", icon: <Settings className="w-3.5 h-3.5" /> },
  maintenance_toggle: { label: "สลับโหมดปรับปรุง", variant: "warning", icon: <Wrench className="w-3.5 h-3.5" /> },
  user_status_change: { label: "เปลี่ยนสถานะบัญชี", variant: "danger", icon: <UserCheck className="w-3.5 h-3.5" /> },
  role_change: { label: "เปลี่ยนบทบาทผู้ใช้", variant: "warning", icon: <Key className="w-3.5 h-3.5" /> },
};

export function AuditLogViewer({ logs }: AuditLogViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-base text-slate-600">
          ประวัติกิจกรรมความปลอดภัยและการใช้งานระบบล่าสุด ({logs.length} รายการล่าสุด)
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-48">วัน-เวลา (ประทับเวลา)</TableHead>
            <TableHead className="w-48">กิจกรรม / เหตุการณ์</TableHead>
            <TableHead>ผู้ดำเนินการ</TableHead>
            <TableHead>รายละเอียดเพิ่มเติม</TableHead>
            <TableHead className="w-36">IP Address</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {logs.map((log) => {
            const config = ACTION_CONFIG[log.action] || {
              label: log.action,
              variant: "default",
              icon: <ShieldCheck className="w-3.5 h-3.5" />,
            };

            const detailsStr = typeof log.details === "object" 
              ? JSON.stringify(log.details) 
              : log.details || "-";

            return (
              <TableRow key={log.id}>
                {/* Timestamp */}
                <TableCell className="text-sm font-medium text-slate-900 whitespace-nowrap">
                  {formatThaiDateTime(log.created_at)}
                </TableCell>

                {/* Action Badge */}
                <TableCell>
                  <Badge variant={config.variant} size="sm" className="gap-1.5 whitespace-nowrap">
                    {config.icon}
                    <span>{config.label}</span>
                  </Badge>
                </TableCell>

                {/* User */}
                <TableCell className="text-sm text-slate-800">
                  {log.user ? (
                    <div>
                      <p className="font-semibold text-slate-900">{log.user.display_name}</p>
                      <p className="text-xs text-slate-400">{log.user.email}</p>
                    </div>
                  ) : (
                    <span className="text-slate-400">ระบบอัตโนมัติ / ผู้มาเยือน</span>
                  )}
                </TableCell>

                {/* Details */}
                <TableCell className="text-xs text-slate-600 font-mono max-w-xs truncate">
                  {detailsStr}
                </TableCell>

                {/* IP Address */}
                <TableCell className="text-xs text-slate-500 font-mono whitespace-nowrap">
                  {log.ip_address || "127.0.0.1"}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
