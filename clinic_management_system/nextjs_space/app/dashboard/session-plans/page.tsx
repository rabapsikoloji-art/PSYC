
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { SessionPlansView } from "@/components/session-plans/session-plans-view";

export default async function SessionPlansPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Sadece psikolog ve adminler erişebilir
  if (session.user.role !== "PSYCHOLOGIST" && session.user.role !== "ADMINISTRATOR" && session.user.role !== "COORDINATOR") {
    redirect('/dashboard');
  }

  return <SessionPlansView />;
}
