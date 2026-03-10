import { useState, useEffect } from 'react';
import { DollarSign, Activity, CarFront, Ghost } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth as fetch } from '@/lib/api';

export function PartnerPortal() {
  const [fleet, setFleet] = useState<any[]>([]);

  useEffect(() => {
    // Ideally we'd pass a partner_id here, but we'll just filter ghost fleet for now
    fetch('/api/vehicles?include_ghost=true')
      .then(res => res.json())
      .then(data => {
        setFleet(data.filter((v: any) => v.is_ghost === 1));
      });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Partner Portal</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your shadow inventory.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-indigo-900">Total Earnings (YTD)</p>
            <DollarSign className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-indigo-900">$12,450.00</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Active Vehicles</p>
            <Activity className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">{fleet.length}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Next Payout</p>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-semibold text-slate-900">$850.00</div>
          <p className="text-xs text-slate-500 mt-1">Scheduled for Oct 31</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center gap-2">
          <Ghost className="h-5 w-5 text-slate-600" />
          <h3 className="font-medium text-slate-900">Your Ghost Fleet</h3>
        </div>
        <div className="p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fleet.map(vehicle => (
              <div key={vehicle.id} className="rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="relative aspect-video bg-slate-100">
                  <img src={vehicle.image_url} alt={vehicle.model} className="w-full h-full object-cover" />
                  <div className="absolute right-2 top-2">
                    <span className="inline-flex items-center rounded-full bg-slate-900/80 px-2.5 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                      {vehicle.plate}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-slate-900">{vehicle.make} {vehicle.model}</h4>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm border-t border-slate-100 pt-3">
                    <div>
                      <div className="text-slate-500 text-xs">Status</div>
                      <div className={cn("font-medium", vehicle.status === 'Ghost' ? 'text-indigo-600' : 'text-slate-900')}>{vehicle.status}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-xs">Earnings</div>
                      <div className="font-mono font-medium text-emerald-600">$1,200</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}