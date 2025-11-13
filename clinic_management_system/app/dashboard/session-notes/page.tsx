
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { SessionNotesView } from "@/components/session-notes/session-notes-view";

export default async function SessionNotesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/auth/signin');
  }

  // Sadece psikolog ve adminler erişebilir
  if (session.user.role !== "PSYCHOLOGIST" && session.user.role !== "ADMINISTRATOR" && session.user.role !== "COORDINATOR") {
    redirect('/dashboard');
  }

  return <SessionNotesView />;
}
