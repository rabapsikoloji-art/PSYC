
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { IntegrationsSettings } from "@/components/integrations/integrations-settings";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  // Only admins and coordinators can access settings
  if (!["ADMINISTRATOR", "COORDINATOR"].includes(session.user.role)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600 mt-2">
          Sistem ayarlarınızı ve entegrasyonlarınızı yönetin
        </p>
      </div>

      <IntegrationsSettings />
    </div>
  );
}
