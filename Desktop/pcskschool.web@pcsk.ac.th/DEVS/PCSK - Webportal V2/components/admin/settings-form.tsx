"use client";

import React, { useState } from "react";
import type { PortalSettings } from "@/types/portal";
import { updatePortalSettingsAction } from "@/lib/actions/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TIMEOUT_OPTIONS } from "@/lib/constants";
import { Save, CheckCircle2, AlertCircle } from "lucide-react";

export interface SettingsFormProps {
  initialSettings: PortalSettings;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const [settings, setSettings] = useState<PortalSettings>(initialSettings);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage(null);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append("portal_name", settings.portal_name);
    formData.append("school_name", settings.school_name);
    formData.append("footer_text", settings.footer_text);
    formData.append("inactivity_timeout_minutes", settings.inactivity_timeout_minutes.toString());
    formData.append("is_global_maintenance", settings.is_global_maintenance ? "true" : "false");
    if (settings.global_maintenance_message) {
      formData.append("global_maintenance_message", settings.global_maintenance_message);
    }

    const res = await updatePortalSettingsAction(formData);
    setIsLoading(false);

    if (res.success) {
      setSuccessMessage("บันทึกการตั้งค่าระบบพอร์ทัลกลางเรียบร้อยแล้ว");
    } else {
      setErrorMessage(res.error || "เกิดข้อผิดพลาดในการบันทึก");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {successMessage && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <span className="text-sm font-medium">{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span className="text-sm font-medium">{errorMessage}</span>
        </div>
      )}

      {/* Card 1: General Branding */}
      <Card>
        <CardHeader bordered>
          <CardTitle>ข้อมูลทั่วไปและอัตลักษณ์พอร์ทัล</CardTitle>
          <CardDescription>
            กำหนดชื่อพอร์ทัล ชื่อโรงเรียน และข้อความท้ายหน้า (Footer) ตามมาตรฐาน Section 33 และ 34
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="ชื่อพอร์ทัล (Portal Name)"
              required
              value={settings.portal_name}
              onChange={(e) => setSettings({ ...settings, portal_name: e.target.value })}
            />

            <Input
              label="ชื่อสถานศึกษา (School Name)"
              required
              value={settings.school_name}
              onChange={(e) => setSettings({ ...settings, school_name: e.target.value })}
            />
          </div>

          <Input
            label="ข้อความลิขสิทธิ์ท้ายหน้า (Footer Text)"
            required
            value={settings.footer_text}
            onChange={(e) => setSettings({ ...settings, footer_text: e.target.value })}
            helperText="ค่าเริ่มต้นตามข้อกำหนด: © 2025 PCSK School | Wachara Patkool"
          />
        </CardContent>
      </Card>

      {/* Card 2: Session & Inactivity Timeout */}
      <Card>
        <CardHeader bordered>
          <CardTitle>การจัดการเซสชันและเวลาตัดการเชื่อมต่อ (Inactivity Timeout)</CardTitle>
          <CardDescription>
            กำหนดระยะเวลาที่ระบบจะตัดการเชื่อมต่ออัตโนมัติเมื่อผู้ใช้ไม่มีการเคลื่อนไหวตาม Section 11
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="max-w-md">
            <Select
              label="ระยะเวลาหมดอายุเซสชัน (Inactivity Timeout Duration)"
              value={settings.inactivity_timeout_minutes}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  inactivity_timeout_minutes: parseInt(e.target.value, 10),
                })
              }
              options={TIMEOUT_OPTIONS.map((opt) => ({
                value: opt.value,
                label: opt.label,
              }))}
              helperText="ระบบจะแสดงหน้าต่างแจ้งเตือนล่วงหน้า 2 นาทีก่อนออกจากระบบอัตโนมัติ"
            />
          </div>
        </CardContent>
      </Card>

      {/* Card 3: Global Maintenance Mode */}
      <Card>
        <CardHeader bordered>
          <CardTitle>โหมดปิดปรับปรุงทั้งระบบ (Global Maintenance Mode)</CardTitle>
          <CardDescription>
            ใช้เมื่อต้องการระงับการเข้าใช้งานทั้งพอร์ทัลสำหรับการบำรุงรักษาครั้งใหญ่
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Checkbox
            label="เปิดใช้งานโหมดปิดปรับปรุงระบบพอร์ทัลส่วนกลาง"
            description="เมื่อเปิดใช้งาน ผู้ใช้งานทุกคนยกเว้นผู้ดูแลระบบจะถูกส่งไปยังหน้า Maintenance Page"
            checked={settings.is_global_maintenance}
            onChange={(e) =>
              setSettings({ ...settings, is_global_maintenance: e.target.checked })
            }
          />

          {settings.is_global_maintenance && (
            <Textarea
              label="ข้อความชี้แจงการปิดปรับปรุงส่วนกลาง"
              rows={3}
              value={settings.global_maintenance_message || ""}
              onChange={(e) =>
                setSettings({ ...settings, global_maintenance_message: e.target.value })
              }
              placeholder="ระบุเหตุผลและเวลาที่คาดว่าจะเปิดให้บริการ..."
            />
          )}
        </CardContent>

        <CardFooter bordered className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            leftIcon={<Save className="w-4 h-4" />}
          >
            บันทึกการตั้งค่าพอร์ทัล
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
