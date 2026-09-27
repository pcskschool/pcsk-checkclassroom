-- ==============================================================================
-- PCSK School Web Portal - Phase 2 Database Schema Migration
-- Migration: 20260926000002_row_level_security.sql
-- Description: Comprehensive Row Level Security (RLS) policies and security helpers
-- ==============================================================================

-- 1. SECURITY HELPER FUNCTIONS
-- Helper to determine if current user has Super Admin role
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT (r.role_key = 'super_admin') INTO is_admin
  FROM public.db_users u
  JOIN public.db_roles r ON u.role_id = r.id
  WHERE u.id = auth.uid() AND u.is_active = TRUE;
  
  RETURN COALESCE(is_admin, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper to check if current user has permission to access a specific system
CREATE OR REPLACE FUNCTION public.can_access_system(check_system_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_access BOOLEAN;
  user_role_uuid UUID;
BEGIN
  -- Super admins can access all systems
  IF public.is_super_admin() THEN
    RETURN TRUE;
  END IF;

  -- Check direct user-system assignment
  IF EXISTS (
    SELECT 1 FROM public.db_user_systems
    WHERE user_id = auth.uid() AND system_id = check_system_id
  ) THEN
    RETURN TRUE;
  END IF;

  -- Check role-based system assignment
  SELECT role_id INTO user_role_uuid FROM public.db_users WHERE id = auth.uid() AND is_active = TRUE;
  
  IF user_role_uuid IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.db_role_systems
    WHERE role_id = user_role_uuid AND system_id = check_system_id
  ) THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ==============================================================================
-- 2. ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.db_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_user_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_role_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.db_audit_logs ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 3. RLS POLICIES: db_roles
-- ==============================================================================
-- Authenticated users can view roles
CREATE POLICY "Allow authenticated users to read roles"
  ON public.db_roles FOR SELECT
  TO authenticated
  USING (TRUE);

-- Only super admins can modify roles
CREATE POLICY "Allow super admin to manage roles"
  ON public.db_roles FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ==============================================================================
-- 4. RLS POLICIES: db_users
-- ==============================================================================
-- Users can view their own profile, Super Admins can view all
CREATE POLICY "Allow users to read own profile or super admin to read all"
  ON public.db_users FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() OR public.is_super_admin()
  );

-- Users can update basic profile info, Super Admin can manage all
CREATE POLICY "Allow users to update own display info"
  ON public.db_users FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.is_super_admin())
  WITH CHECK (
    public.is_super_admin() OR 
    (id = auth.uid() AND role_id = (SELECT role_id FROM public.db_users WHERE id = auth.uid()))
  );

-- Super admin can insert/delete users
CREATE POLICY "Allow super admin to insert users"
  ON public.db_users FOR INSERT
  TO authenticated
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Allow super admin to delete users"
  ON public.db_users FOR DELETE
  TO authenticated
  USING (public.is_super_admin());

-- ==============================================================================
-- 5. RLS POLICIES: db_systems (System Registry)
-- ==============================================================================
-- Authenticated users can only read systems they are permitted to access and are active
-- Super Admin can read all systems including inactive ones
CREATE POLICY "Allow permitted users to read active systems"
  ON public.db_systems FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR (
      is_active = TRUE AND public.can_access_system(id)
    )
  );

-- Only super admin can create, update, or delete systems
CREATE POLICY "Allow super admin to manage systems"
  ON public.db_systems FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ==============================================================================
-- 6. RLS POLICIES: db_user_systems & db_role_systems
-- ==============================================================================
CREATE POLICY "Allow users to view own system access"
  ON public.db_user_systems FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "Allow super admin to manage user systems"
  ON public.db_user_systems FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "Allow users to view role system mappings"
  ON public.db_role_systems FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin() OR
    role_id = (SELECT role_id FROM public.db_users WHERE id = auth.uid())
  );

CREATE POLICY "Allow super admin to manage role systems"
  ON public.db_role_systems FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ==============================================================================
-- 7. RLS POLICIES: db_announcements
-- ==============================================================================
-- Announcements can be read by public and authenticated users if active and within schedule
CREATE POLICY "Allow reading active announcements"
  ON public.db_announcements FOR SELECT
  TO anon, authenticated
  USING (
    is_active = TRUE AND
    (start_date IS NULL OR start_date <= NOW()) AND
    (end_date IS NULL OR end_date >= NOW())
  );

-- Super admin can view all and manage announcements
CREATE POLICY "Allow super admin to manage announcements"
  ON public.db_announcements FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ==============================================================================
-- 8. RLS POLICIES: db_portal_settings
-- ==============================================================================
-- Anyone (anon and authenticated) can read public settings (portal name, footer, timeout)
CREATE POLICY "Allow public read of portal settings"
  ON public.db_portal_settings FOR SELECT
  TO anon, authenticated
  USING (TRUE);

-- Only super admin can update portal settings
CREATE POLICY "Allow super admin to update portal settings"
  ON public.db_portal_settings FOR ALL
  TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ==============================================================================
-- 9. RLS POLICIES: db_audit_logs
-- ==============================================================================
-- Authenticated users can insert their own audit logs
CREATE POLICY "Allow authenticated users to insert audit log"
  ON public.db_audit_logs FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Only super admin can view audit logs
CREATE POLICY "Allow super admin to read audit logs"
  ON public.db_audit_logs FOR SELECT
  TO authenticated
  USING (public.is_super_admin());

-- Audit logs are strictly immutable (no updates or deletes allowed)
