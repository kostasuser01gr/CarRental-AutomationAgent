import { FleetGrid } from '@/components/fleet/FleetGrid';

export function Fleet() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Fleet</h1>
        <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
          Add Vehicle
        </button>
      </div>

      <FleetGrid />
    </div>
  );
}
