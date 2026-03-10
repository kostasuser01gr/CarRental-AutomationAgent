import { useState, useEffect } from 'react';
import {
  format,
  addDays,
  startOfDay,
  eachDayOfInterval,
  isSameDay,
  differenceInDays,
} from 'date-fns';
import { ChevronLeft, ChevronRight, User, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth as fetch } from '@/lib/api';

const CELL_WIDTH = 120;

export function CalendarView() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(startOfDay(new Date()));
  const daysToShow = 14;

  useEffect(() => {
    async function loadData() {
      try {
        const [vRes, bRes] = await Promise.all([
          fetch('/api/vehicles'),
          fetch('/api/bookings')
        ]);
        setVehicles(await vRes.json());
        setBookings(await bRes.json());
      } catch (e) {
        console.error('Temporal link failed', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const dates = eachDayOfInterval({
    start: startDate,
    end: addDays(startDate, daysToShow - 1),
  });

  const handlePrev = () => setStartDate((prev) => addDays(prev, -7));
  const handleNext = () => setStartDate((prev) => addDays(prev, 7));
  const handleToday = () => setStartDate(startOfDay(new Date()));

  const getBookingStyle = (booking: any) => {
    const bStart = startOfDay(new Date(booking.start_date));
    const bEnd = startOfDay(new Date(booking.end_date));
    
    const left = differenceInDays(bStart, startDate) * CELL_WIDTH;
    const width = (differenceInDays(bEnd, bStart) + 1) * CELL_WIDTH;

    return {
      left: `${left}px`,
      width: `${width - 8}px`,
    };
  };

  if (loading) return <div className="p-8 text-center text-neon-cyan font-mono animate-pulse uppercase tracking-widest">Syncing Temporal Matrix...</div>;

  return (
    <div className="flex h-full flex-col bg-quantum-900 border border-neon-cyan/20 rounded-xl overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-neon-cyan/20 p-4 glass-panel">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-white font-mono uppercase tracking-widest neon-text-cyan">
            {format(startDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center rounded-md border border-neon-cyan/30 bg-quantum-800 shadow-sm overflow-hidden">
            <button onClick={handlePrev} className="p-1.5 hover:bg-neon-cyan/10 text-neon-cyan border-r border-neon-cyan/20"><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={handleToday} className="px-3 py-1.5 text-[10px] font-bold uppercase text-neon-cyan hover:bg-neon-cyan/10 transition-colors tracking-widest">Today</button>
            <button onClick={handleNext} className="p-1.5 hover:bg-neon-cyan/10 text-neon-cyan border-l border-neon-cyan/20"><ChevronRight className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-500">
            <span className="h-2 w-2 rounded-full bg-violet-500 shadow-[0_0_5px_#8b5cf6]"></span> Localrent
            <span className="h-2 w-2 rounded-full bg-orange-500 shadow-[0_0_5px_#f97316] ml-2"></span> Karpadu
            <span className="h-2 w-2 rounded-full bg-neon-cyan shadow-[0_0_5px_#00f3ff] ml-2"></span> Direct
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (Vehicles) */}
        <div className="w-64 flex-shrink-0 overflow-hidden border-r border-neon-cyan/20 glass-panel">
          <div className="h-12 border-b border-neon-cyan/20 bg-quantum-800/50 px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center">
            Neural Asset
          </div>
          <div>
            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="flex h-[60px] flex-col justify-center border-b border-slate-800/50 px-4 hover:bg-neon-cyan/5 transition-colors">
                <div className="font-bold text-slate-200 text-sm">{vehicle.make} {vehicle.model}</div>
                <div className="font-mono text-[9px] text-neon-cyan uppercase">{vehicle.plate}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline */}
        <div className="flex flex-1 flex-col overflow-x-auto">
          {/* Header Row (Dates) */}
          <div className="flex h-12 min-w-max border-b border-neon-cyan/20 bg-quantum-800/30">
            {dates.map((date) => (
              <div
                key={date.toString()}
                className={cn(
                  'flex w-[120px] flex-shrink-0 flex-col items-center justify-center border-r border-slate-800/50 px-2 text-xs font-mono',
                  isSameDay(date, new Date()) ? 'bg-neon-cyan/10' : ''
                )}
              >
                <span className={cn("font-bold", isSameDay(date, new Date()) ? "text-neon-cyan" : "text-slate-400")}>{format(date, 'EEE')}</span>
                <span className="text-slate-500 text-[10px]">{format(date, 'd')}</span>
              </div>
            ))}
          </div>

          {/* Body Rows */}
          <div className="relative min-w-max">
            <div className="absolute inset-0 flex pointer-events-none">
              {dates.map((date) => (
                <div key={date.toString()} className="w-[120px] flex-shrink-0 border-r border-slate-800/30" />
              ))}
            </div>

            {vehicles.map((vehicle) => (
              <div key={vehicle.id} className="relative h-[60px] border-b border-slate-800/50">
                {bookings
                  .filter((b) => b.vehicle_id === vehicle.id)
                  .map((booking) => {
                    const bStart = new Date(booking.start_date);
                    const bEnd = new Date(booking.end_date);
                    const viewEnd = addDays(startDate, daysToShow);
                    if (bEnd < startDate || bStart > viewEnd) return null;

                    const style = getBookingStyle(booking);
                    
                    let bgClass = 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan';
                    if (booking.channel === 'Localrent') bgClass = 'bg-violet-500/20 border-violet-500/50 text-violet-400';
                    if (booking.channel === 'Karpadu') bgClass = 'bg-orange-500/20 border-orange-500/50 text-orange-400';
                    if (booking.status === 'Conflict') bgClass = 'bg-rose-500/20 border-rose-500/50 text-rose-400';

                    return (
                      <div
                        key={booking.id}
                        style={{ left: style.left, width: style.width }}
                        className={cn(
                          'absolute top-2 bottom-2 z-10 flex items-center rounded border px-3 text-[10px] font-bold uppercase tracking-tighter shadow-lg transition-all hover:scale-[1.02] cursor-pointer overflow-hidden whitespace-nowrap',
                          bgClass
                        )}
                      >
                        <User className="mr-1.5 h-3 w-3 flex-shrink-0" />
                        <span className="truncate">{booking.customer_name}</span>
                        {booking.status === 'Conflict' && <AlertTriangle className="ml-1.5 h-3 w-3 animate-pulse" />}
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