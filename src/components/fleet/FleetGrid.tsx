import { useState, useEffect } from 'react';
import { CarFront, Battery, Gauge, Settings, Ghost } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth as fetch } from '@/lib/api';

interface Vehicle {
  id: number;
  make: string;
  model: string;
  plate: string;
  class: string;
  status: string;
  is_ghost: number;
  fuel_level: number;
  mileage: number;
  image_url: string;
}

export function FleetGrid() {
  const [fleet, setFleet] = useState<Vehicle[]>([]);
  const [showGhost, setShowGhost] = useState(false);
  const [predictions, setPredictions] = useState<Record<number, any>>({});
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    fetch(`/api/vehicles?include_ghost=${showGhost}`)
      .then((res) => res.json())
      .then(setFleet);
  }, [showGhost]);

  const runAiMaintenance = async () => {
    setLoadingAi(true);
    try {
      const res = await fetch('/api/vehicles/maintenance-predict');
      const data = await res.json();
      const predMap = data.reduce((acc: any, p: any) => {
        acc[p.vehicle_id] = p;
        return acc;
      }, {});
      setPredictions(predMap);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAi(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <button 
          onClick={runAiMaintenance}
          disabled={loadingAi}
          className="flex items-center gap-2 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          <Settings className="h-3.5 w-3.5" />
          {loadingAi ? 'AI Analyzing Fleet...' : 'Run AI Maintenance Scan'}
        </button>
        <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <input 
            type="checkbox" 
            checked={showGhost} 
            onChange={(e) => setShowGhost(e.target.checked)}
            className="rounded border-slate-300 text-slate-900 focus:ring-slate-900" 
          />
          Show Ghost Fleet (Shadow Inventory)
        </label>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {fleet.map((vehicle) => (
          <div
            key={vehicle.id}
            className={cn(
              "group overflow-hidden rounded-xl border bg-white shadow-sm transition-all hover:shadow-md",
              vehicle.is_ghost ? "border-slate-800 bg-slate-50" : "border-slate-200"
            )}
          >
            <div className="relative aspect-video bg-slate-100">
              <img
                src={vehicle.image_url}
                alt={`${vehicle.make} ${vehicle.model}`}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
                  vehicle.is_ghost && "grayscale"
                )}
                referrerPolicy="no-referrer"
              />
              <div className="absolute right-2 top-2 flex flex-col gap-2 items-end">
                <div className="flex gap-2">
                  {vehicle.is_ghost === 1 && (
                    <span className="inline-flex items-center rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-medium text-white shadow-sm">
                      <Ghost className="mr-1 h-3 w-3" /> Ghost
                    </span>
                  )}
                  <span
                    className={cn(
                      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium shadow-sm',
                      vehicle.status === 'Active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    )}
                  >
                    {vehicle.status}
                  </span>
                </div>
                
                {predictions[vehicle.id] && predictions[vehicle.id].needsService && (
                   <span className={cn(
                     "inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-bold shadow-sm border animate-pulse",
                     predictions[vehicle.id].urgency === 'High' ? "bg-rose-100 text-rose-800 border-rose-200" : "bg-amber-100 text-amber-800 border-amber-200"
                   )}>
                     SERVICE DUE
                   </span>
                )}
              </div>
            </div>
            <div className="p-4">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-slate-900">{vehicle.make} {vehicle.model}</h3>
                  <p className="font-mono text-xs text-slate-500">{vehicle.plate}</p>
                </div>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                  {vehicle.class}
                </span>
              </div>

              {predictions[vehicle.id] && (
                <div className={cn(
                  "mb-3 p-2 rounded text-[11px] leading-tight",
                  predictions[vehicle.id].needsService ? "bg-rose-50 text-rose-700 border border-rose-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"
                )}>
                  <strong>AI Note:</strong> {predictions[vehicle.id].reason}
                </div>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500">
                <div className="flex items-center gap-1">
                  <Battery className="h-3.5 w-3.5" />
                  {vehicle.fuel_level}%
                </div>
                <div className="flex items-center gap-1">
                  <Gauge className="h-3.5 w-3.5" />
                  {vehicle.mileage.toLocaleString()} km
                </div>
                <button className="flex items-center gap-1 hover:text-slate-900">
                  <Settings className="h-3.5 w-3.5" />
                  Manage
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Add New Card */}
        <button className="flex aspect-video flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 text-slate-400 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-500">
          <CarFront className="mb-2 h-8 w-8" />
          <span className="text-sm font-medium">Add Vehicle</span>
        </button>
      </div>
    </div>
  );
}
