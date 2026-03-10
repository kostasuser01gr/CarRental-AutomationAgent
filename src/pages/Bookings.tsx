import { BookingsTable } from '@/components/bookings/BookingsTable';

export function Bookings() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Bookings</h1>
        <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
          New Booking
        </button>
      </div>

      <BookingsTable />
    </div>
  );
}
