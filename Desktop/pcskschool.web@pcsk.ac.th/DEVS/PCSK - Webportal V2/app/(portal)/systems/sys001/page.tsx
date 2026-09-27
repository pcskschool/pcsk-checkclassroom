import { getSystemByCode } from "@/lib/services/portal-data";
import { MaintenancePage } from "@/components/core/maintenance-page";
import { Sys001Client } from "@/systems/sys001/components/sys001-client";

export const metadata = {
  title: "ระบบงานสารบรรณอิเล็กทรอนิกส์ (E-Document)",
  description: "ระบบรับ-ส่ง จัดเก็บ และเกษียนหนังสือราชการภายในสถานศึกษา โรงเรียนพิจิตรคริสเตียน",
};

export default async function Sys001Page() {
  const system = await getSystemByCode("sys001");

  // Check Maintenance Mode (Section 20)
  if (system?.is_maintenance) {
    return (
      <MaintenancePage
        systemTitle={system.display_name}
        explanation={system.maintenance_message}
        returnUrl="/dashboard"
      />
    );
  }

  return <Sys001Client />;
}
