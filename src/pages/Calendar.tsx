import { CalendarView } from '@/components/calendar/CalendarView';

export function Calendar() {
  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Calendar</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
            New Booking
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <CalendarView />
      </div>
    </div>
  );
}
