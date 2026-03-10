import { useState, useEffect } from 'react';
import { Ban, Search, CheckCircle, XCircle, BrainCircuit, ShieldAlert } from 'lucide-react';
import { fetchWithAuth as fetch } from '@/lib/api';
import { cn } from '@/lib/utils';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  status: string;
  blacklist_reason?: string;
  total_spent: number;
}

export function Blacklist() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [analyzeText, setAnalyzeText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{ isHighRisk: boolean, reason: string } | null>(null);

  useEffect(() => {
    fetch('/api/customers')
      .then((res) => res.json())
      .then(setCustomers);
  }, []);

  const handleAnalyze = async () => {
    if (!analyzeText || analyzeText.length > 2000) return;
    setAnalyzing(true);
    try {
      const res = await fetch('/api/customers/analyze-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: analyzeText }),
      });
      const data = await res.json();
      setAnalysisResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const blacklisted = customers.filter(c => 
    c.status === 'Blacklisted' && 
    (c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-neon-cyan/20 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-widest text-white uppercase font-mono neon-text-cyan">Blacklist Matrix</h1>
          <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Exclusion & Risk Management</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search actors..."
              className="h-9 w-64 rounded-md border border-neon-cyan/20 bg-quantum-800/50 pl-9 pr-4 text-xs outline-none focus:border-neon-cyan font-mono text-slate-200 shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 rounded-md bg-rose-600/20 border border-rose-500/50 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-400 hover:bg-rose-600/30 transition-all">
            <Ban className="h-3.5 w-3.5" />
            Add Entity
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 glass-panel rounded-xl border border-rose-500/30 overflow-hidden shadow-lg">
          <div className="border-b border-rose-500/20 bg-rose-500/5 px-6 py-4">
            <h3 className="font-bold text-slate-200 uppercase text-xs tracking-widest">Active Bans ({blacklisted.length})</h3>
          </div>
          <div className="divide-y divide-slate-800">
            {blacklisted.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-6 hover:bg-quantum-800/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/30 group-hover:shadow-[0_0_10px_rgba(244,63,94,0.3)] transition-all">
                    <Ban className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-200 font-mono text-sm">{customer.name}</h4>
                    <div className="text-[10px] text-slate-500 uppercase font-mono">{customer.email} • {customer.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-[9px] font-bold uppercase text-slate-500 tracking-tighter">Violation</div>
                    <div className="text-xs font-bold text-rose-400 font-mono">{customer.blacklist_reason}</div>
                  </div>
                  <button className="rounded border border-slate-700 bg-quantum-800 px-3 py-1.5 text-[9px] font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:border-slate-500 transition-colors">
                    Revoke
                  </button>
                </div>
              </div>
            ))}
            {blacklisted.length === 0 && (
              <div className="p-12 text-center text-slate-600 font-mono text-xs uppercase italic">
                The matrix is currently free of known bad actors.
              </div>
            )}
          </div>
        </div>

        <div className="glass-panel rounded-xl border border-neon-purple/30 shadow-lg flex flex-col h-fit">
          <div className="border-b border-neon-purple/20 bg-neon-purple/5 px-6 py-4 flex items-center gap-3">
            <BrainCircuit className="h-5 w-5 text-neon-purple neon-text-purple" />
            <h3 className="font-bold text-slate-200 uppercase text-xs tracking-widest">Neural Risk Scan</h3>
          </div>
          <div className="p-6 flex flex-col gap-4">
            <p className="text-[10px] text-slate-400 uppercase leading-relaxed font-mono">
              Inbound communications must be assessed for volatility before asset release.
            </p>
            <div className="relative">
                <textarea
                className="w-full rounded-md border border-slate-700 bg-quantum-800/80 p-4 text-xs font-mono text-slate-200 outline-none focus:border-neon-purple min-h-[180px] shadow-[inset_0_0_10px_rgba(0,0,0,0.5)] transition-all"
                placeholder="INPUT DATA // 'Give me the car or else...'"
                maxLength={2000}
                value={analyzeText}
                onChange={(e) => setAnalyzeText(e.target.value)}
                />
                <div className="absolute bottom-2 right-3 text-[9px] font-mono text-slate-600 uppercase">
                    {analyzeText.length}/2000 Bytes
                </div>
            </div>
            <button 
              onClick={handleAnalyze}
              disabled={analyzing || !analyzeText || analyzeText.length > 2000}
              className="w-full flex justify-center items-center gap-2 rounded-md bg-transparent border border-neon-purple px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-neon-purple hover:bg-neon-purple/10 transition-all disabled:opacity-50"
            >
              {analyzing ? 'Processing...' : 'Execute Analysis'}
            </button>

            {analysisResult && (
              <div className={cn(
                  "mt-2 p-4 rounded-md border transition-all animate-in fade-in slide-in-from-top-2",
                  analysisResult.isHighRisk ? 'bg-rose-500/10 border-rose-500/30' : 'bg-emerald-500/10 border-emerald-500/30'
              )}>
                <div className="flex items-center gap-3 mb-2">
                  {analysisResult.isHighRisk ? <XCircle className="h-5 w-5 text-rose-500" /> : <CheckCircle className="h-5 w-5 text-emerald-500" />}
                  <h4 className={cn(
                      "font-bold uppercase text-[10px] tracking-widest",
                      analysisResult.isHighRisk ? 'text-rose-400' : 'text-emerald-400'
                  )}>
                    {analysisResult.isHighRisk ? 'High Volatility Detected' : 'Safety Verified'}
                  </h4>
                </div>
                <p className={cn(
                    "text-xs font-mono leading-relaxed",
                    analysisResult.isHighRisk ? 'text-rose-200' : 'text-emerald-200'
                )}>
                  {analysisResult.reason}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}