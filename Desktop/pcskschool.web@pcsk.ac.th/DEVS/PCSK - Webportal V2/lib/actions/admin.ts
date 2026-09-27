"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { SystemRegistryItem, PortalSettings } from "@/types/portal";

/**
 * Server Actions for Portal Administration.
 * All mutations are validated and audit-logged.
 */

import { createAuditLog } from "@/lib/services/audit-log";

// 1. UPDATE PORTAL SETTINGS
export async function updatePortalSettingsAction(formData: FormData) {
  try {
    const portalName = formData.get("portal_name")?.toString().trim();
    const footerText = formData.get("footer_text")?.toString().trim();
    const timeoutMinutes = parseInt(formData.get("inactivity_timeout_minutes")?.toString() || "30", 10);
    const isGlobalMaintenance = formData.get("is_global_maintenance") === "true";
    const globalMaintenanceMessage = formData.get("global_maintenance_message")?.toString().trim() || null;

    if (!portalName) {
      return { success: false, error: "กรุณาระบุชื่อระบบพอร์ทัล" };
    }

    const supabase = await createClient();

    // Check if settings record exists
    const { data: existing } = await supabase
      .from("db_portal_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (existing?.id) {
      await supabase
        .from("db_portal_settings")
        .update({
          portal_name: portalName,
          footer_text: footerText,
          inactivity_timeout_minutes: timeoutMinutes,
          is_global_maintenance: isGlobalMaintenance,
          global_maintenance_message: globalMaintenanceMessage,
        })
        .eq("id", existing.id);
    } else {
      await supabase
        .from("db_portal_settings")
        .insert({
          portal_name: portalName,
          footer_text: footerText,
          inactivity_timeout_minutes: timeoutMinutes,
          is_global_maintenance: isGlobalMaintenance,
          global_maintenance_message: globalMaintenanceMessage,
        });
    }

    await createAuditLog({
      action: "settings_update",
      entityType: "portal_settings",
      details: { portalName, timeoutMinutes, isGlobalMaintenance },
    });

    revalidatePath("/", "layout");
    return { success: true, message: "บันทึกการตั้งค่าพอร์ทัลเรียบร้อยแล้ว" };
  } catch {
    return { success: false, error: "ไม่สามารถบันทึกการตั้งค่าได้ในขณะนี้" };
  }
}

// 2. SAVE OR UPDATE SYSTEM REGISTRY ITEM
export async function saveSystemRegistryAction(systemData: Partial<SystemRegistryItem>) {
  try {
    const supabase = await createClient();

    if (!systemData.display_name || !systemData.system_group || !systemData.route_or_url) {
      return { success: false, error: "กรุณากรอกข้อมูลในช่องที่จำเป็นให้ครบถ้วน" };
    }

    if (systemData.id && !systemData.id.startsWith("sys-new-")) {
      // Update existing system
      const { error } = await supabase
        .from("db_systems")
        .update({
          name: systemData.name,
          display_name: systemData.display_name,
          description: systemData.description,
          system_group: systemData.system_group,
          icon_key: systemData.icon_key || "layers",
          route_or_url: systemData.route_or_url,
          system_type: systemData.system_type || "internal",
          is_active: systemData.is_active ?? true,
          is_maintenance: systemData.is_maintenance ?? false,
          maintenance_message: systemData.maintenance_message,
          announcement_content: systemData.announcement_content,
          sort_order: systemData.sort_order ?? 0,
        })
        .eq("id", systemData.id);

      if (error) throw error;
    } else {
      // Insert new system
      const systemCode = systemData.system_code || `sys${Date.now().toString().slice(-3)}`;
      const technicalName = systemData.name || `sys_${Date.now()}`;

      const { error } = await supabase
        .from("db_systems")
        .insert({
          system_code: systemCode,
          name: technicalName,
          display_name: systemData.display_name,
          description: systemData.description,
          system_group: systemData.system_group,
          icon_key: systemData.icon_key || "layers",
          route_or_url: systemData.route_or_url,
          system_type: systemData.system_type || "internal",
          is_active: systemData.is_active ?? true,
          is_maintenance: systemData.is_maintenance ?? false,
          maintenance_message: systemData.maintenance_message,
          announcement_content: systemData.announcement_content,
          sort_order: systemData.sort_order ?? 0,
        });

      if (error) throw error;
    }

    await createAuditLog({
      action: "system_save",
      entityType: "system",
      entityId: systemData.system_code,
      details: { displayName: systemData.display_name, group: systemData.system_group },
    });

    revalidatePath("/", "layout");
    return { success: true, message: "บันทึกข้อมูลระบบเรียบร้อยแล้ว" };
  } catch {
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลระบบได้ในขณะนี้" };
  }
}

// 3. TOGGLE SYSTEM MAINTENANCE MODE
export async function toggleSystemMaintenanceAction(
  systemId: string,
  isMaintenance: boolean,
  message?: string
) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("db_systems")
      .update({
        is_maintenance: isMaintenance,
        maintenance_message: message || "ระบบกำลังปิดให้บริการชั่วคราวเพื่อดำเนินการปรับปรุงระบบ",
      })
      .eq("id", systemId);

    if (error) throw error;

    await createAuditLog({
      action: "maintenance_toggle",
      entityType: "system",
      entityId: systemId,
      details: { isMaintenance, message },
    });

    revalidatePath("/", "layout");
    return { success: true, message: isMaintenance ? "เปิดโหมดปรับปรุงระบบแล้ว" : "ปิดโหมดปรับปรุงระบบแล้ว" };
  } catch {
    return { success: false, error: "ไม่สามารถปรับปรุงสถานะได้" };
  }
}

// 4. TOGGLE USER ACCOUNT STATUS
export async function toggleUserStatusAction(userId: string, isActive: boolean) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("db_users")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (error) throw error;

    await createAuditLog({
      action: "user_status_change",
      entityType: "user",
      entityId: userId,
      details: { isActive },
    });

    revalidatePath("/admin/users");
    return { success: true, message: isActive ? "เปิดการใช้งานบัญชีแล้ว" : "ระงับการใช้งานบัญชีแล้ว" };
  } catch {
    return { success: false, error: "ไม่สามารถเปลี่ยนสถานะบัญชีได้" };
  }
}

// 5. UPDATE USER ROLE
export async function updateUserRoleAction(userId: string, roleId: string) {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from("db_users")
      .update({ role_id: roleId })
      .eq("id", userId);

    if (error) throw error;

    await createAuditLog({
      action: "role_change",
      entityType: "user",
      entityId: userId,
      details: { roleId },
    });

    revalidatePath("/admin/users");
    return { success: true, message: "ปรับปรุงบทบาทผู้ใช้งานเรียบร้อยแล้ว" };
  } catch {
    return { success: false, error: "ไม่สามารถปรับปรุงบทบาทได้" };
  }
}
