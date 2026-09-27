-- ==============================================================================
-- PCSK School Web Portal - Phase 2 Database Schema Migration
-- Migration: 20260926000003_seed_data.sql
-- Description: Initial system roles, portal settings, system registry, and seed data
-- ==============================================================================

-- 1. INSERT INITIAL ROLES
INSERT INTO public.db_roles (role_key, role_name, description, is_system_role)
VALUES 
  ('super_admin', 'ผู้ดูแลระบบสูงสุด', 'สิทธิ์ระดับสูงสุด สามารถจัดการระบบ ผู้ใช้งาน สิทธิ์ และการตั้งค่าทั้งหมดได้', TRUE),
  ('executive', 'ผู้บริหาร', 'เข้าถึงรายงานและระบบสารสนเทศเพื่อการตัดสินใจของผู้บริหารโรงเรียน', FALSE),
  ('teacher', 'ครูผู้สอน', 'เข้าถึงระบบงานวิชาการ กิจการนักเรียน และงานครูที่เกี่ยวข้อง', FALSE),
  ('staff', 'เจ้าหน้าที่ / บุคลากร', 'เข้าถึงระบบงานสารบรรณ พัสดุ และภารกิจสนับสนุนสถานศึกษา', FALSE),
  ('officer', 'เจ้าหน้าที่งานเฉพาะทาง', 'เข้าถึงเฉพาะระบบที่ได้รับมอบหมายตามคำสั่งโรงเรียน', FALSE)
ON CONFLICT (role_key) DO UPDATE SET
  role_name = EXCLUDED.role_name,
  description = EXCLUDED.description;

-- 2. INSERT INITIAL PORTAL SETTINGS
INSERT INTO public.db_portal_settings (
  portal_name,
  school_name,
  footer_text,
  inactivity_timeout_minutes,
  is_global_maintenance
)
SELECT 
  'PCSK School Web Portal',
  'PCSK School',
  '© 2025 PCSK School | Wachara Patkool',
  30,
  FALSE
WHERE NOT EXISTS (SELECT 1 FROM public.db_portal_settings);

-- 3. INSERT SYSTEM REGISTRY ITEMS (Sample school systems across all official groups)
INSERT INTO public.db_systems (
  system_code,
  name,
  display_name,
  description,
  system_group,
  icon_key,
  route_or_url,
  system_type,
  is_active,
  is_maintenance,
  maintenance_message,
  sort_order,
  announcement_content
)
VALUES
  (
    'sys001',
    'official_correspondence',
    'ระบบงานสารบรรณอิเล็กทรอนิกส์ (E-Document)',
    'ระบบรับ-ส่ง จัดเก็บ และเกษียนหนังสือราชการภายในสถานศึกษา',
    'งานบริหาร',
    'file-text',
    '/systems/sys001',
    'internal',
    TRUE,
    FALSE,
    NULL,
    1,
    'กรุณาตรวจสอบเลขที่หนังสือให้ตรงกับหมวดหมู่งานก่อนลงนามเกษียน'
  ),
  (
    'sys002',
    'academic_evaluation',
    'ระบบงานวัดและประเมินผลการเรียน (Academic Records)',
    'บันทึกคะแนนเก็บ คะแนนสอบ และออกรายงานผลการเรียน ปพ. ทุกระดับชั้น',
    'งานวิชาการ',
    'graduation-cap',
    '/systems/sys002',
    'internal',
    TRUE,
    FALSE,
    NULL,
    2,
    NULL
  ),
  (
    'sys003',
    'student_affairs',
    'ระบบงานกิจการนักเรียนและความประพฤติ (Student Care)',
    'ระบบเช็คชื่อแถวตอนเช้า บันทึกคะแนนพฤติกรรม และระบบดูแลช่วยเหลือนักเรียน',
    'งานนักเรียน',
    'users',
    '/systems/sys003',
    'internal',
    TRUE,
    FALSE,
    NULL,
    3,
    NULL
  ),
  (
    'sys004',
    'personnel_leave',
    'ระบบงานบุคลากรและลงเวลาปฏิบัติงาน (HR & Time Attendance)',
    'ระบบบันทึกเวลาเข้า-ออกงาน การลาออนไลน์ และประวัติบุคลากรสถานศึกษา',
    'งานบุคลากร',
    'calendar-check',
    '/systems/sys004',
    'internal',
    TRUE,
    FALSE,
    NULL,
    4,
    NULL
  ),
  (
    'sys005',
    'school_asset',
    'ระบบงานพัสดุและสินทรัพย์สถานศึกษา (Asset & Inventory)',
    'ระบบเบิกจ่ายวัสดุอุปกรณ์ ทะเบียนครุภัณฑ์ และการตรวจสอบพัสดุประจำปี',
    'งานทั่วไป',
    'package',
    '/systems/sys005',
    'internal',
    TRUE,
    TRUE,
    'ระบบนี้กำลังปิดให้บริการชั่วคราวเพื่อดำเนินการตรวจสอบยอดครุภัณฑ์ประจำปี กรุณากลับมาใช้งานอีกครั้งในภายหลัง',
    5,
    NULL
  ),
  (
    'sys006',
    'it_helpdesk',
    'ระบบบริการเทคโนโลยีสารสนเทศ (IT Service Desk)',
    'ระบบแจ้งซ่อมคอมพิวเตอร์ เครือข่ายอินเทอร์เน็ต และอุปกรณ์โสตทัศนูปกรณ์',
    'งานสารสนเทศ',
    'laptop',
    'https://support.pcsk.ac.th',
    'external',
    TRUE,
    FALSE,
    NULL,
    6,
    NULL
  )
ON CONFLICT (system_code) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  description = EXCLUDED.description,
  system_group = EXCLUDED.system_group,
  icon_key = EXCLUDED.icon_key,
  route_or_url = EXCLUDED.route_or_url,
  system_type = EXCLUDED.system_type,
  is_maintenance = EXCLUDED.is_maintenance,
  maintenance_message = EXCLUDED.maintenance_message,
  sort_order = EXCLUDED.sort_order;

-- 4. LINK DEFAULT ROLES TO SYSTEMS (db_role_systems)
-- Role: Teacher -> sys001, sys002, sys003, sys004, sys006
INSERT INTO public.db_role_systems (role_id, system_id)
SELECT r.id, s.id
FROM public.db_roles r
CROSS JOIN public.db_systems s
WHERE r.role_key = 'teacher' AND s.system_code IN ('sys001', 'sys002', 'sys003', 'sys004', 'sys006')
ON CONFLICT (role_id, system_id) DO NOTHING;

-- Role: Staff -> sys001, sys004, sys005, sys006
INSERT INTO public.db_role_systems (role_id, system_id)
SELECT r.id, s.id
FROM public.db_roles r
CROSS JOIN public.db_systems s
WHERE r.role_key = 'staff' AND s.system_code IN ('sys001', 'sys004', 'sys005', 'sys006')
ON CONFLICT (role_id, system_id) DO NOTHING;

-- Role: Executive -> all systems
INSERT INTO public.db_role_systems (role_id, system_id)
SELECT r.id, s.id
FROM public.db_roles r
CROSS JOIN public.db_systems s
WHERE r.role_key = 'executive'
ON CONFLICT (role_id, system_id) DO NOTHING;

-- 5. INSERT INITIAL GLOBAL ANNOUNCEMENTS
INSERT INTO public.db_announcements (
  title,
  message,
  announcement_type,
  is_active,
  priority,
  action_label
)
VALUES
  (
    'ยินดีต้อนรับสู่ระบบเว็บพอร์ทัลกลาง PCSK School V2',
    'ระบบศูนย์รวมการบริหารจัดการสถานศึกษาเวอร์ชันใหม่ เพิ่มความปลอดภัย ความสะดวก และความรวดเร็วในการปฏิบัติงาน',
    'info',
    TRUE,
    10,
    'เริ่มสำรวจระบบ'
  ),
  (
    'การลงเวลาปฏิบัติราชการออนไลน์',
    'ขอความร่วมมือคณะครูและบุคลากรทุกท่านตรวจสอบประวัติการลงเวลาปฏิบัติงานผ่านระบบ HR ภายในสัปดาห์นี้',
    'warning',
    TRUE,
    5,
    NULL
  );
