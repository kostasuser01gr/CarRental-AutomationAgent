import { useState, useEffect } from 'react';
import {
  Activity,
  CreditCard,
  AlertTriangle,
  Zap,
  Globe2,
  Cpu,
  BrainCircuit
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
            name: 'GLOBAL REVENUE',
            value: `$${statsData.stats.total_revenue.toLocaleString()}`,
            change: '+20.1%',
            changeType: 'positive',
            icon: Globe2,
            color: 'text-neon-cyan'
          },
          {
            name: 'NET PROFIT MARGIN',
            value: `$${statsData.stats.total_profit.toLocaleString()}`,
            change: '+15.2%',
            changeType: 'positive',
            icon: Activity,
            color: 'text-neon-green'
          },
          {
            name: 'AVG YIELD / NODE',
            value: `$${statsData.stats.avg_booking_value.toFixed(2)}`,
            change: '-2%',
            changeType: 'negative',
            icon: CreditCard,
            color: 'text-neon-magenta'
          },
          {
            name: 'ACTIVE NEURAL LINKS',
            value: statsData.stats.total_bookings.toString(),
            change: '+4',
            changeType: 'positive',
            icon: Cpu,
            color: 'text-neon-purple'
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

  if (loading) return <div className="p-8 text-center text-neon-cyan font-mono animate-pulse">Synchronizing Warlord Core...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold tracking-widest text-white uppercase font-mono neon-text-cyan flex items-center gap-3">
                <Zap className="h-8 w-8 text-neon-cyan" />
                Quantum Core
            </h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Central Command Matrix</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="rounded-md border border-neon-cyan/50 bg-quantum-800/50 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neon-cyan transition-all hover:bg-neon-cyan/10 hover:shadow-[0_0_15px_rgba(0,243,255,0.3)]">
            Export Matrix
          </button>
          <button className="rounded-md bg-neon-cyan text-quantum-900 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(0,243,255,0.4)] transition-all hover:bg-white hover:shadow-[0_0_25px_rgba(0,243,255,0.6)]">
            Initialize Booking
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="glass-panel rounded-xl p-6 relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-${stat.color.split('-')[1]}-${stat.color.split('-')[2]}/20 to-transparent opacity-20 group-hover:opacity-50 transition-opacity rounded-bl-full blur-2xl`}></div>
            <div className="flex items-center justify-between relative z-10">
              <p className="text-xs font-bold tracking-wider text-slate-400 font-mono">{stat.name}</p>
              <stat.icon className={cn("h-5 w-5", stat.color)} />
            </div>
            <div className="mt-4 flex items-end justify-between relative z-10">
              <p className={cn("text-3xl font-bold font-mono tracking-tight text-white", stat.color.replace('text-', 'neon-text-'))}>
                {stat.value}
              </p>
              <span
                className={cn(
                  'flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded border',
                  stat.changeType === 'positive' ? 'text-neon-green border-neon-green/30 bg-neon-green/10' : 'text-rose-400 border-rose-400/30 bg-rose-400/10'
                )}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        {/* Multiverse Scenarios - AI Widget */}
        <div className="col-span-1 glass-panel rounded-xl border border-neon-purple/30 p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                  <BrainCircuit className="h-6 w-6 text-neon-purple neon-text-purple" />
                  <h3 className="text-sm font-bold uppercase tracking-widest text-white">Multiverse Predictions</h3>
              </div>
              <div className="space-y-4 font-mono text-xs">
                  <div className="p-3 border border-neon-cyan/20 rounded bg-quantum-800/80">
                      <div className="text-neon-cyan mb-1 font-bold">Scenario Alpha</div>
                      <p className="text-slate-400">Increase SUV rates by 15% this weekend.</p>
                      <div className="mt-2 text-emerald-400">+ $1,250 Projected Margin</div>
                  </div>
                  <div className="p-3 border border-neon-magenta/20 rounded bg-quantum-800/80">
                      <div className="text-neon-magenta mb-1 font-bold">Scenario Beta</div>
                      <p className="text-slate-400">Liquidate Ghost Fleet to secondary market.</p>
                      <div className="mt-2 text-rose-400">- 12% Market Share Risk</div>
                  </div>
              </div>
              <button className="mt-6 w-full py-2 border border-neon-purple text-neon-purple uppercase text-xs font-bold tracking-widest hover:bg-neon-purple/10 transition-colors">
                  Run Deep Simulation
              </button>
          </div>
        </div>

        <div className="col-span-2 glass-panel rounded-xl p-0 overflow-hidden flex flex-col">
          <div className="border-b border-neon-cyan/20 p-5 bg-quantum-800/50 flex justify-between items-center">
            <h3 className="text-sm font-bold tracking-widest text-white uppercase font-mono">Live Transaction Matrix</h3>
            <span className="flex items-center gap-2 text-[10px] text-neon-cyan uppercase font-bold tracking-wider">
                <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse"></span> Network Active
            </span>
          </div>
          <div className="flex-1 overflow-auto p-5">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="text-slate-500 border-b border-slate-700/50 uppercase tracking-wider">
                  <th className="pb-3 font-medium">Node ID</th>
                  <th className="pb-3 font-medium">Entity</th>
                  <th className="pb-3 font-medium">Asset</th>
                  <th className="pb-3 font-medium">State</th>
                  <th className="pb-3 font-medium text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-slate-800/50 hover:bg-quantum-800/30 transition-colors">
                    <td className="py-3 text-slate-400">#{booking.id}</td>
                    <td className="py-3 text-slate-200">
                        {booking.customer_name}
                        <div className="text-[9px] text-slate-500 mt-0.5">{booking.channel}</div>
                    </td>
                    <td className="py-3 text-slate-400">{booking.plate}</td>
                    <td className="py-3">
                      <span className={cn(
                        'px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border',
                        booking.status === 'Confirmed' && 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
                        booking.status === 'Pending' && 'bg-amber-500/10 text-amber-400 border-amber-500/30',
                        booking.status === 'Conflict' && 'bg-rose-500/10 text-rose-400 border-rose-500/30',
                        booking.status === 'Cancelled' && 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                      )}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-neon-cyan font-bold tracking-wider">
                      \${booking.total_amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}