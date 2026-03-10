import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowRight, X, Check, BrainCircuit } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth as fetch } from '@/lib/api';

export function ConflictCenter() {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState<number | null>(null);
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
    if (resolving !== null) return;
    setResolving(keepId);
    try {
      await fetch('/api/conflicts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keep_booking_id: keepId, cancel_booking_id: cancelId }),
      });
      await fetchConflicts(); 
    } catch (err) {
      console.error('Failed to resolve conflict', err);
    } finally {
      setResolving(null);
    }
  };

  const handleAiResolve = async (conflict: any, index: number) => {
    if (aiResolving !== null) return;
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
    return <div className="p-8 text-center text-neon-cyan font-mono animate-pulse">Establishing Conflict Matrix...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neon-cyan/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase font-mono neon-text-cyan">Conflict Center</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Resolution Engine Alpha</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-rose-500/20 px-3 py-1 text-[10px] font-bold uppercase text-rose-400 border border-rose-500/30">
            <AlertTriangle className="mr-2 h-3.5 w-3.5" />
            {conflicts.length} Active Collisions
          </span>
        </div>
      </div>

      {conflicts.length === 0 && (
        <div className="p-12 glass-panel rounded-xl border border-dashed border-slate-700 text-center text-slate-500 font-mono text-sm">
          No temporal anomalies detected in booking schedule.
        </div>
      )}

      <div className="space-y-6">
        {conflicts.map((conflict, index) => (
          <div
            key={`${conflict.b1_id}-${conflict.b2_id}`}
            className="overflow-hidden rounded-xl border border-rose-500/30 glass-panel shadow-lg"
          >
            <div className="border-b border-rose-500/20 bg-rose-500/5 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-rose-500/20 p-2 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                    <AlertTriangle className="h-5 w-5 text-rose-500" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200 font-mono uppercase tracking-tight">Overlap Detected</h3>
                    <p className="text-xs text-slate-400">
                      Collision for <span className="text-neon-cyan">{conflict.make} {conflict.model}</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => handleAiResolve(conflict, index)}
                  disabled={aiResolving !== null}
                  className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-transparent border border-neon-cyan text-neon-cyan px-4 py-2 rounded-md hover:bg-neon-cyan/10 transition-all disabled:opacity-50"
                >
                  <BrainCircuit className="h-4 w-4" />
                  {aiResolving === index ? 'Processing...' : 'Run Neural Resolve'}
                </button>
              </div>
            </div>

            {aiDecisions[index] && (
              <div className="bg-neon-cyan/5 border-b border-neon-cyan/20 px-6 py-3">
                <div className="flex items-start gap-3">
                  <BrainCircuit className="h-5 w-5 text-neon-cyan mt-0.5" />
                  <div>
                    <h4 className="font-bold text-neon-cyan text-[10px] uppercase tracking-widest">Warlord Recommendation: Keep {aiDecisions[index].keep === 'bookingA' ? 'Node Alpha' : 'Node Beta'}</h4>
                    <p className="text-xs text-slate-300 mt-1 italic">{aiDecisions[index].reason}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-800">
              {/* Booking A */}
              <div className={cn("p-6 transition-colors duration-500", aiDecisions[index]?.keep === 'bookingA' && "bg-neon-cyan/5")}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-700">
                    Node Alpha
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">ID: {conflict.b1_id}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Subject</div>
                    <div className="font-medium text-slate-200">{conflict.b1_customer}</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Yield</div>
                      <div className="font-mono font-bold text-neon-cyan text-lg">${conflict.b1_amount}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleResolve(conflict.b1_id, conflict.b2_id)}
                    disabled={resolving !== null}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-neon-cyan/30 bg-transparent px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-neon-cyan hover:bg-neon-cyan/10 hover:border-neon-cyan transition-all"
                  >
                    <Check className="h-4 w-4" />
                    {resolving === conflict.b1_id ? 'Authorizing...' : 'Authorize Alpha'}
                  </button>
                </div>
              </div>

              {/* Booking B */}
              <div className={cn("p-6 transition-colors duration-500", aiDecisions[index]?.keep === 'bookingB' && "bg-neon-cyan/5")}>
                <div className="mb-4 flex items-center justify-between">
                  <span className="rounded bg-slate-800 px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-700">
                    Node Beta
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter">ID: {conflict.b2_id}</span>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Subject</div>
                    <div className="font-medium text-slate-200">{conflict.b2_customer}</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase font-bold">Yield</div>
                      <div className="font-mono font-bold text-neon-cyan text-lg">${conflict.b2_amount}</div>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleResolve(conflict.b2_id, conflict.b1_id)}
                    disabled={resolving !== null}
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-neon-magenta/30 bg-transparent px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest text-neon-magenta hover:bg-neon-magenta/10 hover:border-neon-magenta transition-all"
                  >
                    <Check className="h-4 w-4" />
                    {resolving === conflict.b2_id ? 'Authorizing...' : 'Authorize Beta'}
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