import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { 
  getUserAccessibleSystems, 
  getActiveAnnouncements, 
  getUserProfile 
} from "@/lib/services/portal-data";
import { DashboardClient } from "@/components/core/dashboard-client";

export const metadata = {
  title: "แผงควบคุมหลัก (Dashboard)",
  description: "ระบบศูนย์กลางการเข้าถึงสารสนเทศสถานศึกษา โรงเรียนพิจิตรคริสเตียน",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If live supabase is connected and user is null, redirect to login
  if (!user && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes("placeholder")) {
    redirect("/login");
  }

  const [systems, announcements, userProfile] = await Promise.all([
    getUserAccessibleSystems(),
    getActiveAnnouncements(),
    user ? getUserProfile(user.id) : null,
  ]);

  return (
    <DashboardClient
      systems={systems}
      announcements={announcements}
      userProfile={userProfile}
    />
  );
}
