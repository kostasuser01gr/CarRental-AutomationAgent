import { useState, useEffect } from 'react';
import { Activity, ShieldAlert, Zap, Compass, MapPin, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth as fetch } from '@/lib/api';

export function Telemetry() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Simulate real-time data flow
  const [tick, setTick] = useState(0);

  useEffect(() => {
    fetch('/api/vehicles')
      .then(res => res.json())
      .then(data => {
        setVehicles(data.filter((v: any) => v.status === 'Active' || v.status === 'Maintenance'));
        setLoading(false);
      });

    const interval = setInterval(() => {
      setTick(t => t + 1);
    }, 2000); // 2 second tick for simulated telemetry

    return () => clearInterval(interval);
  }, []);

  if (loading) return <div className="p-8 text-center text-neon-cyan font-mono animate-pulse">Establishing Telemetry Link...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neon-cyan/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase neon-text-cyan font-mono">
            Telemetry Matrix
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Live Global Asset Tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-magenta opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-neon-magenta"></span>
          </span>
          <span className="text-xs font-mono text-neon-magenta uppercase font-bold">Live Feed</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vehicles.map((v, i) => {
          // Simulated live data based on tick
          const speed = Math.floor(Math.random() * 120);
          const gForce = (Math.random() * 1.5).toFixed(2);
          const batteryTemp = Math.floor(Math.random() * 40) + 20;
          const lat = (40.7128 + (Math.random() - 0.5) * 0.1).toFixed(4);
          const lng = (-74.0060 + (Math.random() - 0.5) * 0.1).toFixed(4);
          const isThrashing = parseFloat(gForce) > 1.2 || speed > 100;

          return (
            <div key={v.id} className={cn(
              "glass-panel rounded-xl p-5 border transition-all duration-500",
              isThrashing ? "border-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.4)]" : "border-neon-cyan/30 hover:border-neon-cyan/60"
            )}>
              <div className="flex justify-between items-start mb-4 border-b border-slate-700/50 pb-3">
                <div>
                  <h3 className="font-bold text-slate-200">{v.make} {v.model}</h3>
                  <p className="text-xs font-mono text-neon-cyan uppercase mt-0.5">{v.plate}</p>
                </div>
                <div className={cn(
                  "px-2 py-1 rounded text-[10px] font-bold uppercase",
                  isThrashing ? "bg-rose-500/20 text-rose-400" : "bg-emerald-500/20 text-emerald-400"
                )}>
                  {isThrashing ? 'Critical' : 'Stable'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Velocity</div>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-200">
                    <Gauge className="h-3.5 w-3.5 text-neon-cyan" />
                    {speed} km/h
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">G-Force</div>
                  <div className={cn("flex items-center gap-1.5 mt-1", parseFloat(gForce) > 1.0 ? 'text-rose-400' : 'text-slate-200')}>
                    <Activity className="h-3.5 w-3.5 text-neon-magenta" />
                    {gForce} G
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Core Temp</div>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-200">
                    <Zap className="h-3.5 w-3.5 text-amber-400" />
                    {batteryTemp}°C
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 uppercase">Coordinates</div>
                  <div className="flex items-center gap-1.5 mt-1 text-slate-200 text-[10px]">
                    <MapPin className="h-3 w-3 text-indigo-400" />
                    {lat}, {lng}
                  </div>
                </div>
              </div>
              
              {isThrashing && (
                <div className="mt-4 pt-3 border-t border-rose-500/30 text-xs text-rose-400 flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4" />
                  Aggressive driving detected. Logging event.
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}