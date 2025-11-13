
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { redirect } from "next/navigation";
import { SignUpForm } from "@/components/auth/signup-form";
import { Stethoscope } from "lucide-react";
import Link from "next/link";

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="p-2 bg-white rounded-lg shadow-sm">
            <Stethoscope className="h-6 w-6 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              Klinik Yönetim Sistemi
            </h1>
          </div>
        </Link>

        {/* Sign Up Form Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
