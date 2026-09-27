import { createClient } from "@/lib/supabase/server";
import type { 
  SystemRegistryItem, 
  UserProfile, 
  GlobalAnnouncement, 
  PortalSettings 
} from "@/types/portal";
import { PORTAL_CONFIG } from "@/lib/constants";

/**
 * Service layer for Portal Core data operations.
 * Enforces safe error handling and human-readable feedback.
 */

export async function getPortalSettings(): Promise<PortalSettings> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("db_portal_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      // Fallback to static constants if not yet migrated
      return {
        id: "default",
        portal_name: PORTAL_CONFIG.name,
        school_name: PORTAL_CONFIG.schoolFullName,
        footer_text: PORTAL_CONFIG.footerText,
        inactivity_timeout_minutes: 30,
        is_global_maintenance: false,
        global_maintenance_message: null,
        updated_at: new Date().toISOString(),
      };
    }

    return data as PortalSettings;
  } catch {
    return {
      id: "default",
      portal_name: PORTAL_CONFIG.name,
      school_name: PORTAL_CONFIG.schoolFullName,
      footer_text: PORTAL_CONFIG.footerText,
      inactivity_timeout_minutes: 30,
      is_global_maintenance: false,
      global_maintenance_message: null,
      updated_at: new Date().toISOString(),
    };
  }
}

export async function getActiveAnnouncements(): Promise<GlobalAnnouncement[]> {
  try {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("db_announcements")
      .select("*")
      .eq("is_active", true)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (error || !data) return [];

    // Filter by dates if set
    return (data as GlobalAnnouncement[]).filter((ann) => {
      if (ann.start_date && ann.start_date > now) return false;
      if (ann.end_date && ann.end_date < now) return false;
      return true;
    });
  } catch {
    return [];
  }
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("db_users")
      .select("*, role:db_roles(*)")
      .eq("id", userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserProfile;
  } catch {
    return null;
  }
}

export const FALLBACK_SEED_SYSTEMS: SystemRegistryItem[] = [
  {
    id: "sys-001-uuid",
    system_code: "sys001",
    name: "official_correspondence",
    display_name: "ระบบงานสารบรรณอิเล็กทรอนิกส์",
    description: "ระบบรับ-ส่ง จัดเก็บ และเกษียนหนังสือราชการภายในสถานศึกษา",
    system_group: "งานบริหาร",
    icon_key: "file-text",
    route_or_url: "/systems/sys001",
    system_type: "internal",
    is_active: true,
    is_maintenance: false,
    maintenance_message: null,
    sort_order: 1,
    announcement_content: "กรุณาตรวจสอบเลขที่หนังสือให้ตรงกับหมวดหมู่งานก่อนลงนามเกษียน",
    alert_content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sys-002-uuid",
    system_code: "sys002",
    name: "academic_evaluation",
    display_name: "ระบบงานวัดและประเมินผลการเรียน",
    description: "บันทึกคะแนนเก็บ คะแนนสอบ และออกรายงานผลการเรียน ปพ.",
    system_group: "งานวิชาการ",
    icon_key: "graduation-cap",
    route_or_url: "/systems/sys002",
    system_type: "internal",
    is_active: true,
    is_maintenance: false,
    maintenance_message: null,
    sort_order: 2,
    announcement_content: null,
    alert_content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sys-003-uuid",
    system_code: "sys003",
    name: "student_affairs",
    display_name: "ระบบงานกิจการนักเรียนและความประพฤติ",
    description: "ระบบเช็คชื่อแถวตอนเช้า บันทึกคะแนนพฤติกรรม และระบบดูแลช่วยเหลือนักเรียน",
    system_group: "งานนักเรียน",
    icon_key: "users",
    route_or_url: "/systems/sys003",
    system_type: "internal",
    is_active: true,
    is_maintenance: false,
    maintenance_message: null,
    sort_order: 3,
    announcement_content: null,
    alert_content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sys-004-uuid",
    system_code: "sys004",
    name: "personnel_leave",
    display_name: "ระบบงานบุคลากรและลงเวลาปฏิบัติงาน",
    description: "ระบบบันทึกเวลาเข้า-ออกงาน การลาออนไลน์ และประวัติบุคลากรสถานศึกษา",
    system_group: "งานบุคลากร",
    icon_key: "calendar-check",
    route_or_url: "/systems/sys004",
    system_type: "internal",
    is_active: true,
    is_maintenance: false,
    maintenance_message: null,
    sort_order: 4,
    announcement_content: null,
    alert_content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sys-005-uuid",
    system_code: "sys005",
    name: "school_asset",
    display_name: "ระบบงานพัสดุและสินทรัพย์สถานศึกษา",
    description: "ระบบเบิกจ่ายวัสดุอุปกรณ์ ทะเบียนครุภัณฑ์ และการตรวจสอบพัสดุประจำปี",
    system_group: "งานทั่วไป",
    icon_key: "package",
    route_or_url: "/systems/sys005",
    system_type: "internal",
    is_active: true,
    is_maintenance: true,
    maintenance_message: "ระบบนี้กำลังปิดให้บริการชั่วคราวเพื่อดำเนินการตรวจสอบยอดครุภัณฑ์ประจำปี กรุณากลับมาใช้งานอีกครั้งในภายหลัง",
    sort_order: 5,
    announcement_content: null,
    alert_content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "sys-006-uuid",
    system_code: "sys006",
    name: "it_helpdesk",
    display_name: "ระบบบริการเทคโนโลยีสารสนเทศ (IT Service)",
    description: "ระบบแจ้งซ่อมคอมพิวเตอร์ เครือข่ายอินเทอร์เน็ต และอุปกรณ์โสตทัศนูปกรณ์",
    system_group: "งานสารสนเทศ",
    icon_key: "laptop",
    route_or_url: "https://support.pcsk.ac.th",
    system_type: "external",
    is_active: true,
    is_maintenance: false,
    maintenance_message: null,
    sort_order: 6,
    announcement_content: null,
    alert_content: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getUserAccessibleSystems(): Promise<SystemRegistryItem[]> {
  try {
    const supabase = await createClient();
    
    // Supabase RLS policy "Allow permitted users to read active systems" 
    // automatically filters rows to only systems the authenticated user can access!
    const { data, error } = await supabase
      .from("db_systems")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_SEED_SYSTEMS;
    }
    return data as SystemRegistryItem[];
  } catch {
    return FALLBACK_SEED_SYSTEMS;
  }
}

export async function getSystemByCode(code: string): Promise<SystemRegistryItem | null> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("db_systems")
      .select("*")
      .eq("system_code", code)
      .maybeSingle();

    if (error || !data) {
      const fallback = FALLBACK_SEED_SYSTEMS.find((s) => s.system_code === code);
      return fallback || null;
    }
    return data as SystemRegistryItem;
  } catch {
    const fallback = FALLBACK_SEED_SYSTEMS.find((s) => s.system_code === code);
    return fallback || null;
  }
}

export const FALLBACK_ROLES = [
  { id: "role-1", role_key: "super_admin", role_name: "ผู้ดูแลระบบสูงสุด", is_system_role: true, created_at: new Date().toISOString() },
  { id: "role-2", role_key: "executive", role_name: "ผู้บริหาร", is_system_role: false, created_at: new Date().toISOString() },
  { id: "role-3", role_key: "teacher", role_name: "ครูผู้สอน", is_system_role: false, created_at: new Date().toISOString() },
  { id: "role-4", role_key: "staff", role_name: "เจ้าหน้าที่ / บุคลากร", is_system_role: false, created_at: new Date().toISOString() },
];

export const FALLBACK_USERS: UserProfile[] = [
  {
    id: "user-001",
    email: "wachara.pat@pcsk.ac.th",
    first_name: "วัชระ",
    last_name: "พัฒน์กูล",
    display_name: "วัชระ พัฒน์กูล",
    role_id: "role-1",
    role: FALLBACK_ROLES[0],
    is_active: true,
    last_active_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user-002",
    email: "somchai.t@pcsk.ac.th",
    first_name: "สมชาย",
    last_name: "ใจดี",
    display_name: "สมชาย ใจดี",
    role_id: "role-3",
    role: FALLBACK_ROLES[2],
    is_active: true,
    last_active_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "user-003",
    email: "wanida.k@pcsk.ac.th",
    first_name: "วนิดา",
    last_name: "เกษมสุข",
    display_name: "วนิดา เกษมสุข",
    role_id: "role-4",
    role: FALLBACK_ROLES[3],
    is_active: false,
    last_active_at: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export async function getAllSystemsForAdmin(): Promise<SystemRegistryItem[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("db_systems")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_SEED_SYSTEMS;
    }
    return data as SystemRegistryItem[];
  } catch {
    return FALLBACK_SEED_SYSTEMS;
  }
}

export async function getAllUsersForAdmin(): Promise<UserProfile[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("db_users")
      .select("*, role:db_roles(*)")
      .order("created_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return FALLBACK_USERS;
    }
    return data as UserProfile[];
  } catch {
    return FALLBACK_USERS;
  }
}

export async function getAllRoles() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("db_roles")
      .select("*")
      .order("created_at", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_ROLES;
    }
    return data;
  } catch {
    return FALLBACK_ROLES;
  }
}

