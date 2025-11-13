

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/signin");
  }

  if (session.user?.role !== "CLIENT") {
    redirect("/dashboard");
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
