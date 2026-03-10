import { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Users,
  Activity,
  CreditCard,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth as fetch } from '@/lib/api';

export function Dashboard() {
  const [stats, setStats] = useState<any[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsRes, bookingsRes] = await Promise.all([
          fetch('/api/reports/financials'),
          fetch('/api/bookings')
        ]);
        const statsData = await statsRes.json();
        const bookingsData = await bookingsRes.json();

        setStats([
          {
            name: 'Total Revenue',
            value: `$${statsData.stats.total_revenue.toLocaleString()}`,
            change: '+20.1%',
            changeType: 'positive',
            icon: DollarSign,
          },
          {
            name: 'Total Profit',
            value: `$${statsData.stats.total_profit.toLocaleString()}`,
            change: '+15.2%',
            changeType: 'positive',
            icon: Activity,
          },
          {
            name: 'Avg Booking',
            value: `$${statsData.stats.avg_booking_value.toFixed(2)}`,
            change: '-2%',
            changeType: 'negative',
            icon: CreditCard,
          },
          {
            name: 'Active Bookings',
            value: statsData.stats.total_bookings.toString(),
            change: '+4',
            changeType: 'positive',
            icon: Users,
          },
        ]);

        setRecentBookings(bookingsData.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) return <div className="p-8 text-center">Loading Warlord Intelligence...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
        <div className="flex items-center gap-2">
          <button className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 border border-slate-200">
            Download Report
          </button>
          <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
            New Booking
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">{stat.name}</p>
              <stat.icon className="h-4 w-4 text-slate-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
              <span
                className={cn(
                  'flex items-center text-xs font-medium',
                  stat.changeType === 'positive' ? 'text-emerald-600' : 'text-rose-600'
                )}
              >
                {stat.changeType === 'positive' ? (
                  <ArrowUpRight className="mr-1 h-3 w-3" />
                ) : (
                  <ArrowDownRight className="mr-1 h-3 w-3" />
                )}
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="col-span-4 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-900">Recent Bookings</h3>
            <p className="text-sm text-slate-500">Latest activity across all channels.</p>
          </div>
          <div className="p-6">
            <div className="relative w-full overflow-auto">
              <table className="w-full caption-bottom text-sm">
                <thead className="[&_tr]:border-b">
                  <tr className="border-b border-slate-200 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50">
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
                      Status
                    </th>
                    <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="[&_tr:last-child]:border-0">
                  {recentBookings.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-slate-100 transition-colors hover:bg-slate-50/50 data-[state=selected]:bg-slate-50"
                    >
                      <td className="p-4 align-middle font-mono text-[10px] font-medium text-slate-400">
                        #{booking.id}
                      </td>
                      <td className="p-4 align-middle font-medium text-slate-900">
                        {booking.customer_name}
                        <div className="text-[10px] text-slate-500 uppercase">{booking.channel}</div>
                      </td>
                      <td className="p-4 align-middle text-slate-600 text-xs">{booking.make} {booking.model}</td>
                      <td className="p-4 align-middle">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase',
                            booking.status === 'Confirmed' && 'bg-emerald-100 text-emerald-800',
                            booking.status === 'Pending' && 'bg-amber-100 text-amber-800',
                            booking.status === 'Conflict' && 'bg-rose-100 text-rose-800',
                            booking.status === 'Cancelled' && 'bg-slate-100 text-slate-800'
                          )}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 align-middle text-right font-mono text-slate-900 font-bold">
                        ${booking.total_amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-6">
            <h3 className="text-lg font-medium text-slate-900">Warlord Priorities</h3>
            <p className="text-sm text-slate-500">High-impact tasks needing attention.</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg border border-rose-100 bg-rose-50 p-4">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-rose-600" />
                <div>
                  <h4 className="font-medium text-rose-900">Inventory Conflicts</h4>
                  <p className="text-xs text-rose-700">
                    Double bookings detected on 2 units. Profit loss risk: $1,200.
                  </p>
                  <button className="mt-2 text-xs font-bold text-rose-800 hover:underline uppercase tracking-wider">
                    Resolve Instantly &rarr;
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-4 rounded-lg border border-amber-100 bg-amber-50 p-4">
                <CreditCard className="mt-0.5 h-5 w-5 text-amber-600" />
                <div>
                  <h4 className="font-medium text-amber-900">Revenue Leakage</h4>
                  <p className="text-xs text-amber-700">
                    3 vehicles are currently underpriced vs market average.
                  </p>
                  <button className="mt-2 text-xs font-bold text-amber-800 hover:underline uppercase tracking-wider">
                    Update Predator Engine &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
