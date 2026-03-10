import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, X, Check, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth as fetch } from '@/lib/api';

export function ConflictCenter() {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [aiResolving, setAiResolving] = useState<number | null>(null);
  const [aiDecisions, setAiDecisions] = useState<Record<number, any>>({});

  useEffect(() => {
    fetchConflicts();
  }, []);

  const fetchConflicts = async () => {
    try {
      const res = await fetch('/api/conflicts');
      const data = await res.json();
      setConflicts(data);
    } catch (err) {
      console.error('Failed to fetch conflicts', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (keepId: number, cancelId: number) => {
    try {
      await fetch('/api/conflicts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keep_booking_id: keepId, cancel_booking_id: cancelId }),
      });
      fetchConflicts(); // Refresh list after resolving
    } catch (err) {
      console.error('Failed to resolve conflict', err);
    }
  };

  const handleAiResolve = async (conflict: any, index: number) => {
    setAiResolving(index);
    try {
      const res = await fetch('/api/conflicts/ai-resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingA: {
            id: conflict.b1_id,
            customer: conflict.b1_customer,
            channel: conflict.b1_channel,
            amount: conflict.b1_amount,
          },
          bookingB: {
            id: conflict.b2_id,
            customer: conflict.b2_customer,
            channel: conflict.b2_channel,
            amount: conflict.b2_amount,
          }
        }),
      });
      const data = await res.json();
      setAiDecisions(prev => ({ ...prev, [index]: data }));
    } catch (err) {
      console.error('Failed AI resolve', err);
    } finally {
      setAiResolving(null);
    }
  };

  if (loading) {
    return <div>Loading conflicts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Conflict Center</h1>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-800">
            <AlertTriangle className="mr-2 h-4 w-4" />
            {conflicts.length} Active Conflicts
          </span>
        </div>
      </div>

      {conflicts.length === 0 && (
        <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center text-slate-500">
          No active conflicts detected.
        </div>
      )}

      <div className="space-y-6">
        {conflicts.map((conflict, index) => (
          <div
            key={`${conflict.b1_id}-${conflict.b2_id}`}
            className="overflow-hidden rounded-xl border-2 border-rose-100 bg-white shadow-sm"
          >
            <div className="border-b border-rose-100 bg-rose-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-rose-100 p-2">
                    <AlertTriangle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Conflict Detected</h3>
                    <p className="text-sm text-slate-500">
                      Double booking for <span className="font-medium text-slate-900">{conflict.make} {conflict.model} ({conflict.plate})</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleAiResolve(conflict, index)}
                  disabled={aiResolving === index}
                  className="flex items-center gap-2 text-sm font-medium bg-slate-900 text-white px-3 py-1.5 rounded-md hover:bg-slate-800 disabled:opacity-50"
                >
                  <BrainCircuit className="h-4 w-4" />
                  {aiResolving === index ? 'AI Resolving...' : 'Ask AI to Decide'}
                </button>
              </div>
            </div>

            {aiDecisions[index] && (
              <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3">
                <div className="flex items-start gap-3">
                  <BrainCircuit className="h-5 w-5 text-emerald-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-emerald-900">AI Recommendation: Keep {aiDecisions[index].keep === 'bookingA' ? 'Booking A' : 'Booking B'}</h4>
                    <p className="text-sm text-emerald-800">{aiDecisions[index].reason}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
              {/* Booking A */}
              <div className={cn("p-6", aiDecisions[index]?.keep === 'bookingA' && "bg-emerald-50/30")}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    Booking A (ID: {conflict.b1_id})
                  </span>
                  <span className="text-xs text-slate-400">{conflict.b1_start} to {conflict.b1_end}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-500">Customer</div>
                    <div className="font-medium text-slate-900">{conflict.b1_customer}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-slate-500">Channel</div>
                      <div className="flex items-center gap-1 font-medium text-slate-900">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          conflict.b1_channel === 'Localrent' ? "bg-violet-500" :
                          conflict.b1_channel === 'Karpadu' ? "bg-orange-500" : "bg-blue-500"
                        )} />
                        {conflict.b1_channel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Amount</div>
                      <div className="font-mono font-medium text-slate-900">${conflict.b1_amount}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleResolve(conflict.b1_id, conflict.b2_id)}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                  >
                    <Check className="h-4 w-4" />
                    Keep This Booking
                  </button>
                </div>
              </div>

              {/* Booking B */}
              <div className={cn("p-6", aiDecisions[index]?.keep === 'bookingB' && "bg-emerald-50/30")}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
                    Booking B (ID: {conflict.b2_id})
                  </span>
                  <span className="text-xs text-slate-400">{conflict.b2_start} to {conflict.b2_end}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-slate-500">Customer</div>
                    <div className="font-medium text-slate-900">{conflict.b2_customer}</div>
                  </div>
                  <div className="flex justify-between">
                    <div>
                      <div className="text-sm text-slate-500">Channel</div>
                      <div className="flex items-center gap-1 font-medium text-slate-900">
                        <span className={cn(
                          "h-2 w-2 rounded-full",
                          conflict.b2_channel === 'Localrent' ? "bg-violet-500" :
                          conflict.b2_channel === 'Karpadu' ? "bg-orange-500" : "bg-blue-500"
                        )} />
                        {conflict.b2_channel}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-500">Amount</div>
                      <div className="font-mono font-medium text-slate-900">${conflict.b2_amount}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleResolve(conflict.b2_id, conflict.b1_id)}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200"
                  >
                    <Check className="h-4 w-4" />
                    Keep This Booking
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
