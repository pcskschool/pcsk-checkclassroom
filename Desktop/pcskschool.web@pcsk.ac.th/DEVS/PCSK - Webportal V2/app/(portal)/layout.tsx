import { createClient } from "@/lib/supabase/server";
import { PortalShell } from "@/components/core/portal-shell";
import { 
  getPortalSettings, 
  getUserAccessibleSystems, 
  getUserProfile 
} from "@/lib/services/portal-data";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, systems] = await Promise.all([
    getPortalSettings(),
    getUserAccessibleSystems(),
  ]);

  let userProfile = null;
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      userProfile = await getUserProfile(user.id);
    }
  } catch {
    // If not authenticated or running in preview mode
  }

  return (
    <PortalShell
      userProfile={userProfile}
      systems={systems}
      timeoutMinutes={settings.inactivity_timeout_minutes || 30}
      footerText={settings.footer_text}
    >
      {children}
    </PortalShell>
  );
}
