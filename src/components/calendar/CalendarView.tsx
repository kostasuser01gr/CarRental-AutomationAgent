import { useState } from 'react';
import {
  format,
  addDays,
  startOfDay,
  eachDayOfInterval,
  isSameDay,
  isWithinInterval,
  differenceInDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Data
const vehicles = [
  { id: 'v1', name: 'Toyota Camry', plate: 'ABC-123', class: 'Economy' },
  { id: 'v2', name: 'Honda CR-V', plate: 'XYZ-789', class: 'SUV' },
  { id: 'v3', name: 'Ford Mustang', plate: 'MUS-001', class: 'Sports' },
  { id: 'v4', name: 'Tesla Model 3', plate: 'EV-999', class: 'Electric' },
  { id: 'v5', name: 'Jeep Wrangler', plate: 'OFF-444', class: 'SUV' },
  { id: 'v6', name: 'BMW 3 Series', plate: 'BMW-333', class: 'Luxury' },
];

const bookings = [
  {
    id: 'b1',
    vehicleId: 'v1',
    start: addDays(new Date(), -1),
    end: addDays(new Date(), 2),
    customer: 'John Doe',
    status: 'Confirmed',
    channel: 'Localrent',
  },
  {
    id: 'b2',
    vehicleId: 'v2',
    start: addDays(new Date(), 1),
    end: addDays(new Date(), 4),
    customer: 'Jane Smith',
    status: 'Pending',
    channel: 'Karpadu',
  },
  {
    id: 'b3',
    vehicleId: 'v3',
    start: addDays(new Date(), 0),
    end: addDays(new Date(), 3),
    customer: 'Mike Johnson',
    status: 'Conflict',
    channel: 'Direct',
  },
  {
    id: 'b4',
    vehicleId: 'v1',
    start: addDays(new Date(), 4),
    end: addDays(new Date(), 6),
    customer: 'Sarah Williams',
    status: 'Confirmed',
    channel: 'Localrent',
  },
];

const CELL_WIDTH = 120; // Width of each day column
const ROW_HEIGHT = 60; // Height of each vehicle row

export function CalendarView() {
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const daysToShow = 14;

  const dates = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, daysToShow - 1),
  });

  const handlePrev = () => setStartDate((prev) => addDays(prev, -7));
  const handleNext = () => setStartDate((prev) => addDays(prev, 7));
  const handleToday = () => setStartDate(startOfDay(new Date()));

  const getBookingStyle = (booking: (typeof bookings)[0]) => {
    const start = booking.start < startDate ? startDate : booking.start;
    const end = booking.end > dates[dates.length - 1] ? dates[dates.length - 1] : booking.end;
    
    // Calculate position and width
    const diffStart = differenceInDays(start, startDate);
    const duration = differenceInDays(end, start) + 1; // +1 to include the end day visually

    // Adjust for bookings starting before the view
    const offset = booking.start < startDate ? 0 : diffStart * CELL_WIDTH;
    
    // Calculate width based on visible duration
    // If booking starts before view, we only show the part within view
    // If booking ends after view, we only show the part within view
    
    // Let's simplify:
    // Left position is based on start date relative to view start date.
    // Width is based on duration.
    
    const left = differenceInDays(booking.start, startDate) * CELL_WIDTH;
    const width = (differenceInDays(booking.end, booking.start) + 1) * CELL_WIDTH;

    return {
      left: `${left}px`,
      width: `${width - 8}px`, // -8 for margin
    };
  };

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            {format(startDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center rounded-md border border-slate-200 bg-white shadow-sm">
            <button
              onClick={handlePrev}
              className="p-1.5 hover:bg-slate-50 text-slate-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleToday}
              className="border-l border-r border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Today
            </button>
            <button
              onClick={handleNext}
              className="p-1.5 hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="h-3 w-3 rounded-full bg-violet-500"></span> Localrent
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="h-3 w-3 rounded-full bg-orange-500"></span> Karpadu
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <span className="h-3 w-3 rounded-full bg-blue-500"></span> Direct
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Vehicles) */}
        <div className="w-64 flex-shrink-0 overflow-hidden border-r border-slate-200 bg-slate-50">
          <div className="h-12 border-b border-slate-200 bg-slate-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            Vehicle
          </div>
          <div className="overflow-y-hidden">
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex h-[60px] flex-col justify-center border-b border-slate-200 px-4"
              >
                <div className="font-medium text-slate-900">{vehicle.name}</div>
                <div className="font-mono text-xs text-slate-500">{vehicle.plate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-1 flex-col overflow-x-auto">
          {/* Header Row (Dates) */}
          <div className="flex h-12 min-w-max border-b border-slate-200 bg-slate-50">
            {dates.map((date) => (
              <div
                key={date.toString()}
                className={cn(
                  'flex w-[120px] flex-shrink-0 flex-col items-center justify-center border-r border-slate-200 px-2 text-sm',
                  isSameDay(date, new Date()) ? 'bg-blue-50' : ''
                )}
              >
                <span className="font-medium text-slate-900">{format(date, 'EEE')}</span>
                <span className="text-slate-500">{format(date, 'd')}</span>
              </div>
            ))}
          </div>

          {/* Body Rows */}
          <div className="relative min-w-max">
            {/* Grid Lines */}
            <div className="absolute inset-0 flex pointer-events-none">
              {dates.map((date) => (
                <div
                  key={date.toString()}
                  className="w-[120px] flex-shrink-0 border-r border-slate-100"
                />
              ))}
            </div>

            {/* Vehicle Rows */}
            {vehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className="relative h-[60px] border-b border-slate-200"
              >
                {/* Bookings */}
                {bookings
                  .filter((b) => b.vehicleId === vehicle.id)
                  .map((booking) => {
                    // Only render if visible in current view
                    const viewEnd = addDays(startDate, daysToShow);
                    if (booking.end < startDate || booking.start > viewEnd) return null;

                    const style = getBookingStyle(booking);
                    
                    let bgClass = 'bg-blue-100 border-blue-300 text-blue-700';
                    if (booking.channel === 'Localrent') bgClass = 'bg-violet-100 border-violet-300 text-violet-700';
                    if (booking.channel === 'Karpadu') bgClass = 'bg-orange-100 border-orange-300 text-orange-700';
                    if (booking.status === 'Conflict') bgClass = 'bg-rose-100 border-rose-300 text-rose-700';

                    return (
                      <div
                        key={booking.id}
                        style={{
                            left: style.left,
                            width: style.width,
                        }}
                        className={cn(
                          'absolute top-2 bottom-2 z-10 flex items-center rounded-md border px-2 text-xs font-medium shadow-sm transition-all hover:shadow-md cursor-pointer overflow-hidden whitespace-nowrap',
                          bgClass
                        )}
                      >
                        <User className="mr-1 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{booking.customer}</span>
                      </div>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
