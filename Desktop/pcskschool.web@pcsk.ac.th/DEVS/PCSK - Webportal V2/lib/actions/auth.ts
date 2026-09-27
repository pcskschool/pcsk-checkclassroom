"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface AuthActionResult {
  success: boolean;
  error?: string | null;
  message?: string | null;
}

/**
 * Server Action for User Login.
 * Validates credentials via Supabase Auth and verifies user active status in db_users.
 * Translates all errors into human-readable Thai.
 */
export async function loginAction(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString() || "/dashboard";

  // 1. Basic validation
  if (!email || !password) {
    return {
      success: false,
      error: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
    };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      success: false,
      error: "รูปแบบอีเมลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    };
  }

  // 2. Authenticate with Supabase
  try {
    const supabase = await createClient();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      // Map technical errors to human-readable Thai
      if (
        authError.message.includes("Invalid login credentials") ||
        authError.message.includes("invalid_grant")
      ) {
        return {
          success: false,
          error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบข้อมูลและลองใหม่อีกครั้ง",
        };
      }

      if (authError.message.includes("Email not confirmed")) {
        return {
          success: false,
          error: "บัญชีนี้ยังไม่ได้รับการยืนยันอีเมล กรุณาตรวจสอบกล่องข้อความในอีเมลของท่าน",
        };
      }

      if (authError.message.includes("Too many requests")) {
        return {
          success: false,
          error: "มีการพยายามลงชื่อเข้าใช้บ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง",
        };
      }

      return {
        success: false,
        error: "ไม่สามารถเข้าสู่ระบบได้ในขณะนี้ กรุณาลองใหม่อีกครั้งในภายหลัง",
      };
    }

    if (!authData.user) {
      return {
        success: false,
        error: "ไม่พบข้อมูลบัญชีผู้ใช้งาน",
      };
    }

    // 3. Verify user status in db_users table
    const { data: userProfile, error: profileError } = await supabase
      .from("db_users")
      .select("is_active, display_name")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (!profileError && userProfile && !userProfile.is_active) {
      // User is disabled by administrator
      await supabase.auth.signOut();
      return {
        success: false,
        error: "บัญชีผู้ใช้นี้ถูกระงับการใช้งานชั่วคราว กรุณาติดต่อผู้ดูแลระบบสถานศึกษา",
      };
    }

    // 4. Update last_active_at timestamp asynchronously and log audit event
    try {
      await supabase
        .from("db_users")
        .update({ last_active_at: new Date().toISOString() })
        .eq("id", authData.user.id);

      const { createAuditLog } = await import("@/lib/services/audit-log");
      await createAuditLog({
        userId: authData.user.id,
        action: "login",
        entityType: "auth",
        entityId: authData.user.id,
        details: { email },
      });
    } catch {
      // Non-critical, ignore silent error
    }

  } catch {
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการเชื่อมต่อกับระบบ กรุณาลองใหม่อีกครั้ง",
    };
  }

  // 5. Successful login redirect
  revalidatePath("/", "layout");
  redirect(redirectTo);
}

/**
 * Server Action for User Logout.
 */
export async function logoutAction(): Promise<void> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { createAuditLog } = await import("@/lib/services/audit-log");
      await createAuditLog({
        userId: user.id,
        action: "logout",
        entityType: "auth",
        entityId: user.id,
      });
    }
    await supabase.auth.signOut();
  } catch {
    // Ignore error and proceed to redirect
  }

  revalidatePath("/", "layout");
  redirect("/login");
}
