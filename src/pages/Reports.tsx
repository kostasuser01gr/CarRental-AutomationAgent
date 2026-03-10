import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Calendar, DollarSign, PieChart, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth as fetch } from '@/lib/api';

export function Reports() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports/financials')
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-500">Loading dynamic insights...</div>;
  }

  const { stats, channelStats, vehicleProfits } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Advanced Business Intelligence</h1>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            <Calendar className="h-4 w-4" />
            Live Data
          </button>
          <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
            Export Report
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-500 text-xs uppercase tracking-wider">Gross Revenue</h3>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">${stats.total_revenue.toLocaleString()}</div>
          <div className="mt-2 text-xs text-slate-500">Avg: ${stats.avg_booking_value.toFixed(2)}/book</div>
        </div>
        
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm border-l-4 border-l-emerald-500">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-500 text-xs uppercase tracking-wider">Net Profit</h3>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-600">${stats.total_profit.toLocaleString()}</div>
          <div className="mt-2 text-xs text-slate-500">Margin: {((stats.total_profit / (stats.total_revenue || 1)) * 100).toFixed(1)}%</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-500 text-xs uppercase tracking-wider">Confirmed Bookings</h3>
            <Calendar className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">{stats.total_bookings}</div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">Optimal Utilization</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-slate-500 text-xs uppercase tracking-wider">Efficiency Index</h3>
            <BarChart3 className="h-4 w-4 text-indigo-500" />
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">A+</div>
          <div className="mt-2 text-xs text-indigo-600 font-medium">Top 5% Market Performer</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <PieChart className="h-5 w-5 text-slate-500" />
                Revenue by Channel
            </h3>
          </div>
          <div className="h-64 flex items-end justify-around gap-4 px-4">
              {channelStats.map((cs: any) => (
                  <div key={cs.channel} className="flex flex-col items-center gap-2 w-full max-w-[80px]">
                      <div className="w-full bg-slate-100 rounded-t-lg relative h-48 overflow-hidden group">
                          <div 
                            className={cn(
                                "absolute bottom-0 left-0 right-0 rounded-t-lg transition-all group-hover:opacity-80",
                                cs.channel === 'Direct' ? "bg-indigo-500" :
                                cs.channel === 'Localrent' ? "bg-violet-500" : "bg-orange-500"
                            )} 
                            style={{ height: `${(cs.revenue / (stats.total_revenue || 1)) * 100}%` }}
                          />
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 uppercase truncate w-full text-center">{cs.channel}</span>
                      <span className="text-xs font-mono text-slate-500">${cs.revenue.toLocaleString()}</span>
                  </div>
              ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-indigo-600" />
                Warlord Net-Profit Heatmap
            </h3>
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500" /> High Margin
                <div className="h-2 w-2 rounded-full bg-amber-500" /> Avg
                <div className="h-2 w-2 rounded-full bg-rose-500" /> Low
            </div>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {vehicleProfits.map((vp: any, i: number) => {
                const maxProfit = vehicleProfits[0]?.profit || 1;
                const ratio = vp.profit / maxProfit;
                return (
                    <div 
                        key={i} 
                        className={cn(
                            "p-3 rounded-lg border-2 transition-all hover:scale-[1.02]",
                            ratio > 0.8 ? "bg-emerald-50 border-emerald-100" :
                            ratio > 0.4 ? "bg-amber-50 border-amber-100" : "bg-rose-50 border-rose-100"
                        )}
                    >
                        <div className="text-[10px] font-bold text-slate-400 uppercase">{vp.class}</div>
                        <div className="font-bold text-slate-900 truncate">{vp.make} {vp.model}</div>
                        <div className={cn(
                            "mt-2 text-sm font-mono font-bold",
                            ratio > 0.8 ? "text-emerald-700" :
                            ratio > 0.4 ? "text-amber-700" : "text-rose-700"
                        )}>
                            +${vp.profit.toLocaleString()}
                        </div>
                    </div>
                );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
