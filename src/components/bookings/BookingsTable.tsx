import { useState, useEffect } from 'react';
import {
  MoreHorizontal,
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fetchWithAuth as fetch } from '@/lib/api';

export function BookingsTable() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/bookings')
      .then(res => res.json())
      .then(data => {
        setBookings(data);
        setLoading(false);
      });
  }, []);

  const filteredBookings = bookings.filter(
    (booking) => {
      const matchesStatus = filterStatus === 'All' || booking.status === filterStatus;
      const matchesSearch = booking.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            booking.plate.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    }
  );

  if (loading) return <div className="p-8 text-center text-slate-500">Loading bookings...</div>;

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-[250px] rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-0"
            />
          </div>
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-9 rounded-md border border-slate-200 bg-white px-3 py-1 text-sm outline-none focus:border-slate-400"
          >
            <option value="All">All Statuses</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Pending">Pending</option>
            <option value="Conflict">Conflict</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
        <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-slate-50/50 [&_tr]:border-b">
              <tr className="border-b border-slate-200 transition-colors hover:bg-slate-50/50">
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">
                  ID
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">
                  Customer
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">
                  Vehicle
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">
                  Dates
                </th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">
                  Status
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">
                  Amount
                </th>
                <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50"
                >
                  <td className="p-4 align-middle font-mono text-[10px] font-medium text-slate-400">
                    #{booking.id}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="font-medium text-slate-900">{booking.customer_name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{booking.customer_email}</div>
                  </td>
                  <td className="p-4 align-middle">
                    <div className="text-slate-900 font-medium text-xs">{booking.make} {booking.model}</div>
                    <div className="text-[10px] text-slate-500 font-mono uppercase">{booking.plate}</div>
                  </td>
                  <td className="p-4 align-middle text-slate-600">
                    <div className="flex flex-col text-[11px] leading-tight">
                      <span>{format(new Date(booking.start_date), 'MMM d, yyyy')}</span>
                      <span className="text-slate-400">to</span>
                      <span>{format(new Date(booking.end_date), 'MMM d, yyyy')}</span>
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <span
                      className={cn(
                        'inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-tight',
                        booking.status === 'Confirmed' && 'bg-emerald-100 text-emerald-800',
                        booking.status === 'Pending' && 'bg-amber-100 text-amber-800',
                        booking.status === 'Conflict' && 'bg-rose-100 text-rose-800',
                        booking.status === 'Cancelled' && 'bg-slate-100 text-slate-800'
                      )}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right font-mono font-bold text-slate-900">
                    ${booking.total_amount.toFixed(2)}
                  </td>
                  <td className="p-4 align-middle text-right">
                    <button className="rounded-md p-2 hover:bg-slate-100 text-slate-500 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
