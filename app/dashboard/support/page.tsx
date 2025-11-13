
import { SupportView } from "@/components/support/support-view";

export default async function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Destek & Yardım
        </h1>
        <p className="text-gray-600 mt-1">
          Sorun yaşıyorsanız bize ulaşabilirsiniz
        </p>
      </div>
      <SupportView />
    </div>
  );
}
