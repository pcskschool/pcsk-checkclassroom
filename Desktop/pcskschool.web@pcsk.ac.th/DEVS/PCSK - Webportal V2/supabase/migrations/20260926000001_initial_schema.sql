-- ==============================================================================
-- PCSK School Web Portal - Phase 2 Database Schema Migration
-- Migration: 20260926000001_initial_schema.sql
-- Description: Core relational schema for PCSK Web Portal (Portal Core & Systems)
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. HELPER FUNCTIONS
-- Function to automatically manage updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. ROLES TABLE (db_roles)
CREATE TABLE IF NOT EXISTS public.db_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_key VARCHAR(50) UNIQUE NOT NULL, -- e.g. 'super_admin', 'director', 'teacher', 'staff'
  role_name VARCHAR(100) NOT NULL,      -- Human-readable Thai e.g. 'ผู้ดูแลระบบสูงสุด', 'ผู้บริหาร', 'ครูผู้สอน'
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_db_roles_updated_at
  BEFORE UPDATE ON public.db_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 4. USERS PROFILE TABLE (db_users)
-- Mapped 1:1 with Supabase auth.users
CREATE TABLE IF NOT EXISTS public.db_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  display_name VARCHAR(200) NOT NULL,
  avatar_url TEXT,
  role_id UUID REFERENCES public.db_roles(id) ON DELETE RESTRICT,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  last_active_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_db_users_role_id ON public.db_users(role_id);
CREATE INDEX IF NOT EXISTS idx_db_users_is_active ON public.db_users(is_active);

CREATE TRIGGER set_db_users_updated_at
  BEFORE UPDATE ON public.db_users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 5. SYSTEM REGISTRY TABLE (db_systems)
-- Centralized registry for all school sub-systems
CREATE TABLE IF NOT EXISTS public.db_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  system_code VARCHAR(20) UNIQUE NOT NULL, -- e.g. 'sys001', 'sys002' (Internal identifier)
  name VARCHAR(100) UNIQUE NOT NULL,       -- e.g. 'academic_records'
  display_name VARCHAR(200) NOT NULL,      -- Human-readable Thai name e.g. 'ระบบงานวิชาการและผลการเรียน'
  description TEXT,                        -- Detailed description
  system_group VARCHAR(100) NOT NULL,      -- e.g. 'งานบริหาร', 'งานวิชาการ', 'งานบุคลากร'
  icon_key VARCHAR(50) DEFAULT 'layers' NOT NULL, -- Key mapped to Lucide icons
  route_or_url TEXT NOT NULL,              -- Application route e.g. '/systems/sys001' or https://...
  system_type VARCHAR(20) DEFAULT 'internal' NOT NULL CHECK (system_type IN ('internal', 'external')),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  is_maintenance BOOLEAN DEFAULT FALSE NOT NULL,
  maintenance_message TEXT,
  sort_order INT DEFAULT 0 NOT NULL,
  announcement_content TEXT,               -- System-specific announcement banner
  alert_content TEXT,                      -- System-specific startup alert/modal
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_db_systems_system_code ON public.db_systems(system_code);
CREATE INDEX IF NOT EXISTS idx_db_systems_system_group ON public.db_systems(system_group);
CREATE INDEX IF NOT EXISTS idx_db_systems_active_order ON public.db_systems(is_active, sort_order);

CREATE TRIGGER set_db_systems_updated_at
  BEFORE UPDATE ON public.db_systems
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 6. USER-SPECIFIC SYSTEM ACCESS (db_user_systems)
-- Explicit system assignment per individual user
CREATE TABLE IF NOT EXISTS public.db_user_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.db_users(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES public.db_systems(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES public.db_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_user_system UNIQUE (user_id, system_id)
);

CREATE INDEX IF NOT EXISTS idx_db_user_systems_user_id ON public.db_user_systems(user_id);
CREATE INDEX IF NOT EXISTS idx_db_user_systems_system_id ON public.db_user_systems(system_id);

-- 7. ROLE-BASED SYSTEM ACCESS (db_role_systems)
-- Default system access granted to entire roles
CREATE TABLE IF NOT EXISTS public.db_role_systems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.db_roles(id) ON DELETE CASCADE,
  system_id UUID NOT NULL REFERENCES public.db_systems(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT uq_role_system UNIQUE (role_id, system_id)
);

CREATE INDEX IF NOT EXISTS idx_db_role_systems_role_id ON public.db_role_systems(role_id);
CREATE INDEX IF NOT EXISTS idx_db_role_systems_system_id ON public.db_role_systems(system_id);

-- 8. GLOBAL & PORTAL ANNOUNCEMENTS TABLE (db_announcements)
CREATE TABLE IF NOT EXISTS public.db_announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  announcement_type VARCHAR(20) DEFAULT 'info' NOT NULL CHECK (announcement_type IN ('info', 'warning', 'urgent', 'maintenance')),
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  priority INT DEFAULT 0 NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  action_url TEXT,
  action_label VARCHAR(100),
  created_by UUID REFERENCES public.db_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_db_announcements_active_priority ON public.db_announcements(is_active, priority DESC);

CREATE TRIGGER set_db_announcements_updated_at
  BEFORE UPDATE ON public.db_announcements
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 9. PORTAL SETTINGS TABLE (db_portal_settings)
-- Singleton or key-value configuration for the portal
CREATE TABLE IF NOT EXISTS public.db_portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  portal_name VARCHAR(150) DEFAULT 'PCSK School Web Portal' NOT NULL,
  school_name VARCHAR(150) DEFAULT 'PCSK School' NOT NULL,
  logo_url TEXT,
  footer_text VARCHAR(255) DEFAULT '© 2025 PCSK School | Wachara Patkool' NOT NULL,
  inactivity_timeout_minutes INT DEFAULT 30 NOT NULL CHECK (inactivity_timeout_minutes IN (15, 30, 60, 120)),
  is_global_maintenance BOOLEAN DEFAULT FALSE NOT NULL,
  global_maintenance_message TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TRIGGER set_db_portal_settings_updated_at
  BEFORE UPDATE ON public.db_portal_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 10. AUDIT LOGS TABLE (db_audit_logs)
CREATE TABLE IF NOT EXISTS public.db_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.db_users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL, -- e.g. 'login', 'logout', 'permission_update', 'system_toggle'
  entity_type VARCHAR(50),     -- e.g. 'system', 'user', 'role'
  entity_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_db_audit_logs_user_action ON public.db_audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_db_audit_logs_created_at ON public.db_audit_logs(created_at DESC);

-- 11. TRIGGER: AUTH USER AUTOMATIC PROFILE CREATION
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
DECLARE
  default_role_id UUID;
  user_full_name TEXT;
  user_first TEXT;
  user_last TEXT;
BEGIN
  -- Fetch default role for new users (e.g. 'staff' or 'teacher')
  SELECT id INTO default_role_id FROM public.db_roles WHERE role_key = 'staff' LIMIT 1;
  
  -- Extract metadata if present
  user_first := COALESCE(NEW.raw_user_meta_data->>'first_name', 'บุคลากร');
  user_last  := COALESCE(NEW.raw_user_meta_data->>'last_name', 'ใหม่');
  user_full_name := COALESCE(NEW.raw_user_meta_data->>'display_name', user_first || ' ' || user_last);

  INSERT INTO public.db_users (
    id,
    email,
    first_name,
    last_name,
    display_name,
    role_id,
    is_active
  ) VALUES (
    NEW.id,
    NEW.email,
    user_first,
    user_last,
    user_full_name,
    default_role_id,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();
