

import { ClientPayments } from "@/components/client/client-payments";

export default async function ClientPaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Ödemelerim
        </h1>
        <p className="text-gray-600 mt-1">
          Ödeme geçmişinizi ve bekleyen ödemelerinizi görüntüleyin
        </p>
      </div>
      <ClientPayments />
    </div>
  );
}
