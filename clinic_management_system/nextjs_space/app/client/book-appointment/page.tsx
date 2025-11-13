
import { BookAppointment } from "@/components/client/book-appointment";

export default async function BookAppointmentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Randevu Al
        </h1>
        <p className="text-gray-600 mt-1">
          Psikolog seçip randevu oluşturabilirsiniz
        </p>
      </div>
      <BookAppointment />
    </div>
  );
}
