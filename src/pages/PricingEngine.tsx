import { useState, useEffect } from 'react';
import { ShieldAlert, Plus, Trash2, TrendingUp, TrendingDown, Activity, BrainCircuit } from 'lucide-react';
import { fetchWithAuth as fetch } from '@/lib/api';

interface Rule {
  id: number;
  name: string;
  condition_type: string;
  condition_value: string;
  action_type: string;
  action_value: number;
}

export function PricingEngine() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketData, setMarketData] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  
  // Simulator State
  const [simPriceChange, setSimPriceChange] = useState<string>('10');
  const [simVehicleClass, setSimVehicleClass] = useState<string>('SUV');
  const [simulating, setSimulating] = useState(false);
  const [simResult, setSimResult] = useState<{ occupancy_change: string, revenue_change: string, recommendation: string } | null>(null);

  useEffect(() => {
    fetch('/api/pricing-rules')
      .then((res) => res.json())
      .then((data) => {
        setRules(data);
        setLoading(false);
      });
  }, []);

  const handleScanMarket = async () => {
    setScanning(true);
    try {
      const res = await fetch('/api/market-intelligence/scan');
      const data = await res.json();
      setMarketData(data);
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  const handleSimulate = async () => {
    setSimulating(true);
    try {
      const res = await fetch('/api/pricing-rules/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_change_percentage: simPriceChange, vehicle_class: simVehicleClass })
      });
      const data = await res.json();
      setSimResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setSimulating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Predator Pricing Engine</h1>
        <button className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
          <Plus className="h-4 w-4" />
          Add Rule
        </button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {rules.map((rule) => (
          <div key={rule.id} className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
            <div className="absolute right-0 top-0 h-24 w-24 translate-x-8 translate-y--8 rotate-45 bg-slate-50 opacity-50"></div>
            
            <div className="flex items-start justify-between">
              <div className="rounded-full bg-slate-100 p-2">
                {rule.action_type === 'Increase' ? (
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-600" />
                )}
              </div>
              <button className="text-slate-400 hover:text-rose-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            <h3 className="mt-4 font-semibold text-slate-900">{rule.name}</h3>
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-500">Condition</span>
                <span className="font-medium text-slate-900">{rule.condition_type} {rule.condition_value}</span>
              </div>
              <div className="flex justify-between pt-2">
                <span className="text-slate-500">Action</span>
                <span className={`font-bold ${rule.action_type === 'Increase' ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {rule.action_type} {((rule.action_value - 1) * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Competitor Intelligence Widget */}
        <div className="rounded-xl border border-slate-200 bg-slate-900 p-6 text-white shadow-sm flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 text-rose-500" />
              <h2 className="text-lg font-bold">Competitor Intelligence</h2>
            </div>
            <button 
              onClick={handleScanMarket}
              disabled={scanning}
              className="text-xs bg-slate-800 hover:bg-slate-700 px-3 py-1.5 rounded-md font-medium disabled:opacity-50"
            >
              {scanning ? 'Scanning Market...' : 'Run Live Scan'}
            </button>
          </div>
          
          <div className="mt-4 grid gap-4 grid-cols-2 sm:grid-cols-3 flex-1">
            {marketData.length > 0 ? marketData.map((data, i) => (
              <div key={i} className="rounded-lg bg-slate-800 p-4 border border-slate-700">
                <div className="flex justify-between items-start">
                  <div className="text-xs text-slate-400 font-semibold uppercase">{data.competitor}</div>
                  {data.trend === 'up' ? <TrendingUp className="h-3 w-3 text-rose-400" /> : <TrendingDown className="h-3 w-3 text-emerald-400" />}
                </div>
                <div className={`mt-1 text-xl font-mono font-bold ${data.status === 'SOLD OUT' ? 'text-rose-500' : 'text-white'}`}>
                  {data.price ? `$${data.price}/day` : data.status}
                </div>
                <div className="mt-2 text-xs text-slate-500">{data.class} Class</div>
              </div>
            )) : (
              <div className="col-span-full flex flex-col items-center justify-center text-slate-500 py-8 bg-slate-800/50 rounded-lg border border-dashed border-slate-700">
                 <ShieldAlert className="h-8 w-8 mb-2 opacity-50" />
                 <p className="text-sm">Click 'Run Live Scan' to generate market insights.</p>
              </div>
            )}
          </div>
        </div>

        {/* AI Yield Management Simulator */}
        <div className="rounded-xl border border-indigo-200 bg-white shadow-sm flex flex-col">
          <div className="border-b border-indigo-100 bg-indigo-50/50 p-6 flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-indigo-600" />
            <div>
              <h2 className="text-lg font-bold text-slate-900">AI Yield Simulator</h2>
              <p className="text-xs text-slate-500">Predict impact before making changes.</p>
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Price Change (%)</label>
                <input 
                  type="number" 
                  value={simPriceChange} 
                  onChange={(e) => setSimPriceChange(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-500 mb-1">Vehicle Class</label>
                <select 
                  value={simVehicleClass}
                  onChange={(e) => setSimVehicleClass(e.target.value)}
                  className="w-full h-9 rounded-md border border-slate-200 px-3 text-sm focus:border-indigo-400 focus:outline-none bg-white"
                >
                  <option value="Economy">Economy</option>
                  <option value="SUV">SUV</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Sports">Sports</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleSimulate}
              disabled={simulating}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              <Activity className="h-4 w-4" />
              {simulating ? 'Simulating...' : 'Run Simulation'}
            </button>

            {simResult && (
              <div className="mt-2 rounded-lg bg-slate-50 p-4 border border-slate-200">
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-xs text-slate-500">Predicted Occupancy</div>
                    <div className={`font-mono font-bold ${simResult.occupancy_change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {simResult.occupancy_change}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Predicted Revenue</div>
                    <div className={`font-mono font-bold ${simResult.revenue_change.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {simResult.revenue_change}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-slate-700 bg-white p-3 rounded border border-slate-100">
                  <span className="font-semibold text-slate-900 mr-2">Recommendation:</span> 
                  {simResult.recommendation}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
