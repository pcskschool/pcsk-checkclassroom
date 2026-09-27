import { getPortalSettings } from "@/lib/services/portal-data";
import { SettingsForm } from "@/components/admin/settings-form";
import { PageHeader } from "@/components/core/page-header";
import { Badge, Button } from "@/components/ui";
import Link from "next/link";

export const metadata = {
  title: "การตั้งค่าพอร์ทัลกลาง (Portal Settings)",
  description: "กำหนดชื่อพอร์ทัล ข้อความ Footer และเวลาตัดเซสชัน Inactivity Timeout",
};

export default async function AdminSettingsPage() {
  const settings = await getPortalSettings();

  return (
    <div className="space-y-6">
      <PageHeader
        title="การตั้งค่าพอร์ทัลกลาง (Portal Settings)"
        description="ควบคุมการตั้งค่าระบบกลาง ชื่อสถานศึกษา เวลาตัดการเชื่อมต่อ และโหมดปิดปรับปรุงระดับระบบ"
        breadcrumbs={[
          { label: "การจัดการระบบ", href: "/admin/systems" },
          { label: "ตั้งค่าพอร์ทัล", isCurrent: true },
        ]}
        badge={<Badge variant="success" dot>ผู้ดูแลระบบ</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/systems">
              <Button variant="outline" size="sm">
                ทะเบียนระบบงาน
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                จัดการผู้ใช้งาน
              </Button>
            </Link>
          </div>
        }
      />

      <SettingsForm initialSettings={settings} />
    </div>
  );
}
