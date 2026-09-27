import { notFound } from "next/navigation";
import { getSystemByCode } from "@/lib/services/portal-data";
import { MaintenancePage } from "@/components/core/maintenance-page";
import { PageHeader } from "@/components/core/page-header";
import { AnnouncementBanner } from "@/components/core/announcement-banner";
import { Badge, Card, CardContent, Button } from "@/components/ui";
import { ArrowLeft, ExternalLink, School } from "lucide-react";
import Link from "next/link";

interface SystemPageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata({ params }: SystemPageProps) {
  const { code } = await params;
  const system = await getSystemByCode(code);

  if (!system) {
    return { title: "ไม่พบระบบงาน" };
  }

  return {
    title: system.display_name,
    description: system.description,
  };
}

export default async function SystemRoutePage({ params }: SystemPageProps) {
  const { code } = await params;
  const system = await getSystemByCode(code);

  if (!system) {
    notFound();
  }

  // Section 20: Maintenance Mode Check
  if (system.is_maintenance) {
    return (
      <MaintenancePage
        systemTitle={system.display_name}
        explanation={system.maintenance_message}
        schedule="โปรดติดตามประกาศผ่านทางพอร์ทัลกลาง"
        returnUrl="/dashboard"
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Standard Page Header */}
      <PageHeader
        title={system.display_name}
        description={system.description}
        breadcrumbs={[
          { label: system.system_group, href: "/dashboard" },
          { label: system.display_name, isCurrent: true },
        ]}
        badge={
          <Badge variant="success" dot>
            {system.system_group}
          </Badge>
        }
        actions={
          <Link href="/dashboard">
            <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
              กลับหน้าแผงควบคุม
            </Button>
          </Link>
        }
      />

      {/* System Announcement Banner if configured (Section 22) */}
      {system.announcement_content && (
        <AnnouncementBanner
          title="📢 ประกาศประจำระบบ"
          content={system.announcement_content}
          type="info"
        />
      )}

      {/* Temporary System Content Placeholder */}
      <Card>
        <CardContent className="p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-700 flex items-center justify-center mx-auto shadow-2xs">
            <School className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900">
            ยินดีต้อนรับสู่ {system.display_name}
          </h2>

          <p className="text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
            ระบบงานนี้ได้รับการลงทะเบียนในสารบบพอร์ทัลกลางอย่างสมบูรณ์แบบ 
            พร้อมรองรับการติดตั้งโมดูลฟังก์ชันงานเฉพาะด้านใน Phase 7 (System Module Development)
          </p>

          <div className="pt-4 flex justify-center gap-3">
            <Link href="/dashboard">
              <Button variant="primary">
                กลับสู่แดชบอร์ดหลัก
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
