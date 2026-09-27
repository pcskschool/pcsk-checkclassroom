import { getRecentAuditLogs } from "@/lib/services/audit-log";
import { AuditLogViewer } from "@/components/admin/audit-log-viewer";
import { PageHeader } from "@/components/core/page-header";
import { Badge, Button } from "@/components/ui";
import Link from "next/link";

export const metadata = {
  title: "บันทึกประวัติความปลอดภัย (Audit Logs)",
  description: "ประวัติกิจกรรมการเข้าสู่ระบบ การแก้ไขสิทธิ์ และการตั้งค่าระบบพอร์ทัลกลาง",
};

export default async function AdminAuditLogsPage() {
  const logs = await getRecentAuditLogs(50);

  return (
    <div className="space-y-6">
      <PageHeader
        title="บันทึกประวัติความปลอดภัย (Audit Logs)"
        description="การบันทึกเหตุการณ์กิจกรรมสำคัญและการเข้าใช้งานแบบไม่สามารถแก้ไขได้ (Immutable Audit Trail) ตาม Section 44"
        breadcrumbs={[
          { label: "การจัดการระบบ", href: "/admin/systems" },
          { label: "ประวัติการใช้งาน (Audit Logs)", isCurrent: true },
        ]}
        badge={<Badge variant="success" dot>ระบบตรวจสอบ</Badge>}
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

      <AuditLogViewer logs={logs} />
    </div>
  );
}
