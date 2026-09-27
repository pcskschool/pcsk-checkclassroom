"use client";

import React, { useState } from "react";
import type { SystemRegistryItem } from "@/types/portal";
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
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { IconResolver } from "@/components/ui/icon-resolver";
import { 
  saveSystemRegistryAction, 
  toggleSystemMaintenanceAction 
} from "@/lib/actions/admin";
import { DEFAULT_SYSTEM_GROUPS } from "@/lib/constants";
import { 
  Plus, 
  Edit3, 
  Wrench, 
  ExternalLink, 
  Check, 
  Layers 
} from "lucide-react";

export interface SystemRegistryManagerProps {
  initialSystems: SystemRegistryItem[];
}

export function SystemRegistryManager({ initialSystems }: SystemRegistryManagerProps) {
  const [systems, setSystems] = useState<SystemRegistryItem[]>(initialSystems);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSystem, setEditingSystem] = useState<Partial<SystemRegistryItem> | null>(null);
  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [targetMaintenanceSystem, setTargetMaintenanceSystem] = useState<SystemRegistryItem | null>(null);
  const [maintenanceMsg, setMaintenanceMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Open Edit or Create modal
  const handleOpenEdit = (system?: SystemRegistryItem) => {
    if (system) {
      setEditingSystem({ ...system });
    } else {
      setEditingSystem({
        id: `sys-new-${Date.now()}`,
        system_code: `sys00${systems.length + 1}`,
        name: `new_system_${Date.now()}`,
        display_name: "",
        description: "",
        system_group: DEFAULT_SYSTEM_GROUPS[0],
        icon_key: "layers",
        route_or_url: `/systems/sys00${systems.length + 1}`,
        system_type: "internal",
        is_active: true,
        is_maintenance: false,
        maintenance_message: null,
        sort_order: systems.length + 1,
      });
    }
    setIsEditModalOpen(true);
  };

  // Save system changes
  const handleSaveSystem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSystem) return;

    setIsLoading(true);
    const res = await saveSystemRegistryAction(editingSystem);
    setIsLoading(false);

    if (res.success) {
      setSystems((prev) => {
        const exists = prev.some((s) => s.id === editingSystem.id);
        if (exists) {
          return prev.map((s) => (s.id === editingSystem.id ? (editingSystem as SystemRegistryItem) : s));
        }
        return [...prev, editingSystem as SystemRegistryItem];
      });
      setIsEditModalOpen(false);
    } else {
      alert(res.error || "เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  // Open Maintenance toggle modal
  const handleOpenMaintenance = (system: SystemRegistryItem) => {
    setTargetMaintenanceSystem(system);
    setMaintenanceMsg(system.maintenance_message || "ระบบกำลังปิดให้บริการชั่วคราวเพื่อดำเนินการปรับปรุงระบบ");
    setIsMaintenanceModalOpen(true);
  };

  const handleConfirmMaintenance = async () => {
    if (!targetMaintenanceSystem) return;
    setIsLoading(true);
    const nextStatus = !targetMaintenanceSystem.is_maintenance;
    const res = await toggleSystemMaintenanceAction(targetMaintenanceSystem.id, nextStatus, maintenanceMsg);
    setIsLoading(false);

    if (res.success) {
      setSystems((prev) =>
        prev.map((s) =>
          s.id === targetMaintenanceSystem.id
            ? { ...s, is_maintenance: nextStatus, maintenance_message: nextStatus ? maintenanceMsg : null }
            : s
        )
      );
      setIsMaintenanceModalOpen(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-base text-slate-600">
            ระบบงานทั้งหมดในสารบบพอร์ทัลกลาง ({systems.length} ระบบ)
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => handleOpenEdit()}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          ลงทะเบียนระบบใหม่
        </Button>
      </div>

      {/* Systems Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20">ไอคอน</TableHead>
            <TableHead>ชื่อระบบทางการ (ภาษาไทย)</TableHead>
            <TableHead className="w-40">หมวดหมู่งาน</TableHead>
            <TableHead className="w-36">ประเภท / เส้นทาง</TableHead>
            <TableHead className="w-32 text-center">สถานะการใช้งาน</TableHead>
            <TableHead className="w-36 text-center">โหมดปรับปรุง</TableHead>
            <TableHead className="w-36 text-right">การจัดการ</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {systems.map((system) => (
            <TableRow key={system.id}>
              {/* Icon */}
              <TableCell>
                <div className="w-10 h-10 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center justify-center">
                  <IconResolver name={system.icon_key} className="w-5 h-5" />
                </div>
              </TableCell>

              {/* Display Name & Technical Code */}
              <TableCell>
                <p className="font-semibold text-slate-900 leading-snug">
                  {system.display_name}
                </p>
                <p className="text-xs text-slate-400 mt-0.5 font-mono">
                  รหัสระบบ: {system.system_code} • ลำดับ: {system.sort_order}
                </p>
              </TableCell>

              {/* Group */}
              <TableCell>
                <Badge variant="default" size="sm">
                  {system.system_group}
                </Badge>
              </TableCell>

              {/* Type / URL */}
              <TableCell className="text-sm text-slate-600">
                <span className="block">{system.system_type === "internal" ? "ระบบภายใน" : "ระบบภายนอก"}</span>
                <span className="text-xs text-slate-400 truncate block max-w-[160px]">
                  {system.route_or_url}
                </span>
              </TableCell>

              {/* Active Status */}
              <TableCell className="text-center">
                <Badge variant={system.is_active ? "success" : "danger"} size="sm" dot>
                  {system.is_active ? "เปิดใช้งาน" : "ปิดระบบ"}
                </Badge>
              </TableCell>

              {/* Maintenance Toggle */}
              <TableCell className="text-center">
                {system.is_maintenance ? (
                  <Badge variant="warning" size="sm" dot>
                    ปิดปรับปรุง
                  </Badge>
                ) : (
                  <span className="text-xs text-slate-400">ปกติ</span>
                )}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenMaintenance(system)}
                    title="สลับโหมดปิดปรับปรุงระบบ"
                    aria-label="ตั้งค่าโหมดปรับปรุง"
                  >
                    <Wrench className="w-4 h-4 text-amber-600" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(system)}
                    aria-label="แก้ไขข้อมูลระบบ"
                  >
                    <Edit3 className="w-4 h-4 text-slate-600" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Edit/Create System Modal */}
      {editingSystem && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={editingSystem.display_name ? "แก้ไขข้อมูลระบบงาน" : "ลงทะเบียนระบบงานใหม่"}
          description="กำหนดรายละเอียด หมวดหมู่ ไอคอน และเส้นทางเข้าถึงระบบ"
          size="lg"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button variant="primary" onClick={handleSaveSystem} isLoading={isLoading}>
                บันทึกข้อมูล
              </Button>
            </>
          }
        >
          <form onSubmit={handleSaveSystem} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="ชื่อระบบทางการ (ภาษาไทย)"
                required
                placeholder="เช่น ระบบงานสารบรรณอิเล็กทรอนิกส์"
                value={editingSystem.display_name || ""}
                onChange={(e) => setEditingSystem({ ...editingSystem, display_name: e.target.value })}
              />

              <Select
                label="หมวดหมู่งาน"
                required
                value={editingSystem.system_group || DEFAULT_SYSTEM_GROUPS[0]}
                onChange={(e) => setEditingSystem({ ...editingSystem, system_group: e.target.value })}
                options={DEFAULT_SYSTEM_GROUPS.map((g) => ({ value: g, label: g }))}
              />
            </div>

            <Textarea
              label="คำอธิบายหน้าที่ของระบบ"
              rows={2}
              placeholder="ระบุวัตถุประสงค์และการทำงานโดยย่อ..."
              value={editingSystem.description || ""}
              onChange={(e) => setEditingSystem({ ...editingSystem, description: e.target.value })}
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Input
                label="คีย์ไอคอน (Lucide Key)"
                required
                placeholder="เช่น file-text, users, laptop"
                value={editingSystem.icon_key || "layers"}
                onChange={(e) => setEditingSystem({ ...editingSystem, icon_key: e.target.value })}
                helperText="เช่น clipboard, users, calendar"
              />

              <Select
                label="ประเภทระบบ"
                value={editingSystem.system_type || "internal"}
                onChange={(e) => setEditingSystem({ ...editingSystem, system_type: e.target.value as any })}
                options={[
                  { value: "internal", label: "ระบบภายในสถานศึกษา" },
                  { value: "external", label: "ลิงก์เว็บภายนอก" },
                ]}
              />

              <Input
                label="ลำดับการแสดงผล"
                type="number"
                value={editingSystem.sort_order?.toString() || "0"}
                onChange={(e) => setEditingSystem({ ...editingSystem, sort_order: parseInt(e.target.value, 10) || 0 })}
              />
            </div>

            <Input
              label="เส้นทาง Route ภายใน หรือ URL ภายนอก"
              required
              placeholder="เช่น /systems/sys001 หรือ https://..."
              value={editingSystem.route_or_url || ""}
              onChange={(e) => setEditingSystem({ ...editingSystem, route_or_url: e.target.value })}
            />

            <Textarea
              label="ข้อความประกาศประจำระบบ (Announcement Banner)"
              rows={2}
              placeholder="ข้อความประกาศที่จะแสดงด้านบนสุดเมื่อเปิดระบบนี้..."
              value={editingSystem.announcement_content || ""}
              onChange={(e) => setEditingSystem({ ...editingSystem, announcement_content: e.target.value || null })}
            />

            <div className="pt-2 flex flex-col gap-2">
              <Checkbox
                label="เปิดใช้งานระบบนี้ (Active Status)"
                checked={editingSystem.is_active ?? true}
                onChange={(e) => setEditingSystem({ ...editingSystem, is_active: e.target.checked })}
              />
            </div>
          </form>
        </Modal>
      )}

      {/* Maintenance Mode Toggle Modal */}
      {targetMaintenanceSystem && (
        <Modal
          isOpen={isMaintenanceModalOpen}
          onClose={() => setIsMaintenanceModalOpen(false)}
          title="ตั้งค่าโหมดปรับปรุงระบบ (Maintenance Mode)"
          description={`ระบบ: ${targetMaintenanceSystem.display_name}`}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsMaintenanceModalOpen(false)}>
                ยกเลิก
              </Button>
              <Button
                variant={targetMaintenanceSystem.is_maintenance ? "success" : "danger"}
                onClick={handleConfirmMaintenance}
                isLoading={isLoading}
              >
                {targetMaintenanceSystem.is_maintenance ? "ปิดโหมดปรับปรุง (เปิดใช้งาน)" : "ยืนยันปิดปรับปรุงระบบ"}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              {targetMaintenanceSystem.is_maintenance
                ? "ขณะนี้ระบบอยู่ในโหมดปิดปรับปรุง หากกดยืนยัน ระบบจะเปิดให้ผู้ใช้ทั่วไปเข้าใช้งานตามปกติ"
                : "เมื่อเปิดโหมดนี้ ผู้ใช้งานทั่วไปจะไม่สามารถเข้าสู่ระบบนี้ได้ และจะเห็นหน้าชี้แจง Maintenance Page แทน"}
            </p>

            {!targetMaintenanceSystem.is_maintenance && (
              <Textarea
                label="ข้อความชี้แจงการปิดปรับปรุง (Maintenance Message)"
                rows={3}
                value={maintenanceMsg}
                onChange={(e) => setMaintenanceMsg(e.target.value)}
                placeholder="ระบุเหตุผลและเวลาที่คาดว่าจะแล้วเสร็จ..."
              />
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
