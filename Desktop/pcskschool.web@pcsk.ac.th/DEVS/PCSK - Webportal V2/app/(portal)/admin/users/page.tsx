import { getAllUsersForAdmin, getAllRoles } from "@/lib/services/portal-data";
import { UserManager } from "@/components/admin/user-manager";
import { PageHeader } from "@/components/core/page-header";
import { Badge, Button } from "@/components/ui";
import Link from "next/link";

export const metadata = {
  title: "จัดการผู้ใช้งานและสิทธิ์ (User & Access Control)",
  description: "จัดการบัญชีผู้ใช้งาน สิทธิ์การเข้าถึง และบทบาทบุคลากรสถานศึกษา",
};

export default async function AdminUsersPage() {
  const [users, roles] = await Promise.all([
    getAllUsersForAdmin(),
    getAllRoles(),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="จัดการผู้ใช้งานและสิทธิ์ (User Management)"
        description="ตรวจสอบรายชื่อบุคลากร กำหนดบทบาท และระงับ/เปิดใช้งานบัญชีผู้ใช้ในระบบ"
        breadcrumbs={[
          { label: "การจัดการระบบ", href: "/admin/systems" },
          { label: "จัดการผู้ใช้งาน", isCurrent: true },
        ]}
        badge={<Badge variant="success" dot>ผู้ดูแลระบบ</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/admin/systems">
              <Button variant="outline" size="sm">
                ทะเบียนระบบงาน
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

      <UserManager initialUsers={users} roles={roles} />
    </div>
  );
}
