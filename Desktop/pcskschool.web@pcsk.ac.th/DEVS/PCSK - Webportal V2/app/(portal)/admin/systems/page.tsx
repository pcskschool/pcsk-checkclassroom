import { getAllSystemsForAdmin } from "@/lib/services/portal-data";
import { SystemRegistryManager } from "@/components/admin/system-registry-manager";
import { PageHeader } from "@/components/core/page-header";
import { Badge, Button } from "@/components/ui";
import { ArrowLeft, Sliders } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "จัดการทะเบียนระบบงาน (System Registry)",
  description: "จัดการทะเบียนระบบงานทั้งหมดในสังกัดสถานศึกษา การเปิด/ปิดระบบ และโหมดปรับปรุง",
};

export default async function AdminSystemsPage() {
  const systems = await getAllSystemsForAdmin();

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการทะเบียนระบบงาน (System Registry)"
        description="ศูนย์กลางการลงทะเบียนระบบ ควบคุมสถานะเปิด/ปิด โหมดปรับปรุงระบบ และลำดับการแสดงผล"
        breadcrumbs={[
          { label: "การจัดการระบบ", href: "/admin/systems" },
          { label: "ทะเบียนระบบงาน", isCurrent: true },
        ]}
        badge={<Badge variant="success" dot>ผู้ดูแลระบบ</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/users">
              <Button variant="outline" size="sm">
                จัดการผู้ใช้งาน
              </Button>
            </Link>
            <Link href="/admin/settings">
              <Button variant="outline" size="sm">
                ตั้งค่าพอร์ทัล
              </Button>
            </Link>
          </div>
        }
      />

      <SystemRegistryManager initialSystems={systems} />
    </div>
  );
}
