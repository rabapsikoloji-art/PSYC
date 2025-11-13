
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NotificationCenter } from "@/components/notifications/notification-center";

export default async function NotificationsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Bildirimler</h1>
        <p className="text-gray-600 mt-2">
          Sistem bildirimlerinizi ve hatırlatıcılarınızı görüntüleyin
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bildirim Merkezi</CardTitle>
          <CardDescription>
            Tüm bildirimleriniz burada görüntülenir
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p>Bildirimler sağ üst köşedeki zil ikonundan erişilebilir.</p>
            <p className="text-sm mt-2">Yeni bildirimleriniz olduğunda sayı ile bildirileceksiniz.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
