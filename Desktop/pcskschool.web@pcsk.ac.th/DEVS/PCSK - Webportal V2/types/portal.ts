/**
 * PCSK School Web Portal - Core Type Definitions
 * Relational and Core Portal interfaces.
 */

export type SystemId = `sys${string}`;

export type SystemType = "internal" | "external";

export interface SystemRegistryItem {
  id: string; // Internal UUID
  system_code: SystemId; // e.g. "sys001" (Internal only, never shown to normal users)
  name: string; // e.g. "student_management"
  display_name: string; // Human-readable Thai name e.g. "ระบบงานสารบรรณ"
  description: string;
  system_group: string; // e.g. "งานบริหาร", "งานวิชาการ"
  icon_key: string; // Icon identifier e.g. "clipboard", "users", "settings"
  route_or_url: string; // Internal route e.g. "/systems/sys001" or external https URL
  system_type: SystemType;
  is_active: boolean;
  is_maintenance: boolean;
  maintenance_message?: string | null;
  sort_order: number;
  announcement_content?: string | null;
  alert_content?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string; // Matches Supabase Auth auth.users.id
  email: string;
  first_name: string;
  last_name: string;
  display_name: string;
  avatar_url?: string | null;
  role_id: string;
  role?: Role;
  is_active: boolean;
  last_active_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  role_key: string; // e.g. "super_admin", "director", "teacher", "staff"
  role_name: string; // Human-readable Thai e.g. "ผู้ดูแลระบบสูงสุด", "ผู้บริหาร", "ครูผู้สอน"
  description?: string;
  is_system_role: boolean;
  created_at: string;
}

export interface UserSystemAccess {
  id: string;
  user_id: string;
  system_id: string;
  granted_by?: string;
  created_at: string;
}

export interface RoleSystemAccess {
  id: string;
  role_id: string;
  system_id: string;
  created_at: string;
}

export type AnnouncementType = "info" | "warning" | "urgent" | "maintenance";

export interface GlobalAnnouncement {
  id: string;
  title: string;
  message: string;
  announcement_type: AnnouncementType;
  is_active: boolean;
  priority: number;
  start_date?: string | null;
  end_date?: string | null;
  action_url?: string | null;
  action_label?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PortalSettings {
  id: string;
  portal_name: string;
  school_name: string;
  logo_url?: string | null;
  footer_text: string;
  inactivity_timeout_minutes: number;
  is_global_maintenance: boolean;
  global_maintenance_message?: string | null;
  updated_at: string;
}
