"use client";

import React, { useState } from "react";
import type { UserProfile, Role } from "@/types/portal";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select } from "@/components/ui/select";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatThaiDate } from "@/lib/utils";
import { toggleUserStatusAction, updateUserRoleAction } from "@/lib/actions/admin";
import { UserX, UserCheck, Shield } from "lucide-react";

export interface UserManagerProps {
  initialUsers: UserProfile[];
  roles: any[];
}

export function UserManager({ initialUsers, roles }: UserManagerProps) {
  const [users, setUsers] = useState<UserProfile[]>(initialUsers);
  const [confirmTarget, setConfirmTarget] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Toggle user active status
  const handleToggleStatus = async (user: UserProfile) => {
    setIsLoading(true);
    const nextStatus = !user.is_active;
    const res = await toggleUserStatusAction(user.id, nextStatus);
    setIsLoading(false);

    if (res.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, is_active: nextStatus } : u))
      );
      setConfirmTarget(null);
    } else {
      alert(res.error || "เกิดข้อผิดพลาดในการปรับเปลี่ยนสถานะ");
    }
  };

  // Change user role
  const handleRoleChange = async (userId: string, newRoleId: string) => {
    const res = await updateUserRoleAction(userId, newRoleId);
    if (res.success) {
      const selectedRole = roles.find((r) => r.id === newRoleId);
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role_id: newRoleId, role: selectedRole } : u))
      );
    } else {
      alert(res.error || "ไม่สามารถเปลี่ยนบทบาทได้");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-base text-slate-600">
          รายชื่อบุคลากรและผู้มีสิทธิ์ใช้งานทั้งหมดในระบบ ({users.length} คน)
        </p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ผู้ใช้งาน</TableHead>
            <TableHead className="w-64">บทบาทในระบบ</TableHead>
            <TableHead className="w-40">กิจกรรมล่าสุด</TableHead>
            <TableHead className="w-32 text-center">สถานะบัญชี</TableHead>
            <TableHead className="w-36 text-right">การจัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              {/* User Avatar & Name */}
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-green-700 text-white font-semibold text-xs flex items-center justify-center flex-shrink-0">
                    {user.display_name.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 leading-tight">
                      {user.display_name}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>
              </TableCell>

              {/* Role Select */}
              <TableCell>
                <Select
                  value={user.role_id}
                  onChange={(e) => handleRoleChange(user.id, e.target.value)}
                  className="py-1 text-sm bg-slate-50 border-slate-200"
                  options={roles.map((r) => ({
                    value: r.id,
                    label: r.role_name,
                  }))}
                />
              </TableCell>

              {/* Last Active */}
              <TableCell className="text-sm text-slate-500 whitespace-nowrap">
                {user.last_active_at ? formatThaiDate(user.last_active_at) : "ยังไม่เคยเข้าสู่ระบบ"}
              </TableCell>

              {/* Status */}
              <TableCell className="text-center">
                <Badge variant={user.is_active ? "success" : "danger"} size="sm" dot>
                  {user.is_active ? "ปกติ" : "ระงับการใช้งาน"}
                </Badge>
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                {user.is_active ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmTarget(user)}
                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    leftIcon={<UserX className="w-4 h-4" />}
                  >
                    ระงับสิทธิ์
                  </Button>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(user)}
                    className="text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50"
                    leftIcon={<UserCheck className="w-4 h-4" />}
                  >
                    เปิดใช้งาน
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Confirmation Dialog for Suspension */}
      {confirmTarget && (
        <ConfirmDialog
          isOpen={Boolean(confirmTarget)}
          onClose={() => setConfirmTarget(null)}
          onConfirm={() => handleToggleStatus(confirmTarget)}
          title="ยืนยันการระงับสิทธิ์การใช้งาน"
          message={`คุณแน่ใจหรือไม่ว่าต้องการระงับการใช้งานของ ${confirmTarget.display_name} (${confirmTarget.email})? ผู้ใช้จะไม่สามารถเข้าสู่ระบบพอร์ทัลได้`}
          variant="danger"
          confirmLabel="ระงับสิทธิ์ทันที"
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
