import { useState, useEffect } from 'react';
import { Ban, Search, CheckCircle, XCircle, BrainCircuit } from 'lucide-react';
import { fetchWithAuth as fetch } from '@/lib/api';

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
    if (!analyzeText) return;
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

  const blacklisted = customers.filter(c => c.status === 'Blacklisted');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Blacklist Management</h1>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search bad actors..."
              className="h-9 w-64 rounded-md border border-slate-200 bg-white pl-9 pr-4 text-sm outline-none focus:border-slate-400 focus:ring-0"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 rounded-md bg-rose-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-rose-700">
            <Ban className="h-4 w-4" />
            Add to Blacklist
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
            <h3 className="font-medium text-slate-900">Active Bans ({blacklisted.length})</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {blacklisted.map((customer) => (
              <div key={customer.id} className="flex items-center justify-between p-6 hover:bg-slate-50">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                    <Ban className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-900">{customer.name}</h4>
                    <div className="text-sm text-slate-500">{customer.email} • {customer.phone}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-xs font-medium uppercase text-slate-400">Reason</div>
                    <div className="text-sm font-medium text-rose-600">{customer.blacklist_reason}</div>
                  </div>
                  <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100">
                    Revoke Ban
                  </button>
                </div>
              </div>
            ))}
            {blacklisted.length === 0 && (
              <div className="p-8 text-center text-slate-500">
                No blacklisted customers found.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
          <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-indigo-600" />
            <h3 className="font-medium text-slate-900">AI Risk Analysis</h3>
          </div>
          <div className="p-6 flex-1 flex flex-col gap-4">
            <p className="text-sm text-slate-500">
              Paste customer communications (emails, chat logs) here to automatically assess their risk profile before approving a rental.
            </p>
            <textarea
              className="w-full flex-1 rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-indigo-400 min-h-[150px]"
              placeholder="e.g. 'I don't care about the rules, just give me the fastest car you have right now.'"
              value={analyzeText}
              onChange={(e) => setAnalyzeText(e.target.value)}
            />
            <button 
              onClick={handleAnalyze}
              disabled={analyzing || !analyzeText}
              className="w-full flex justify-center items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Risk Profile'}
            </button>

            {analysisResult && (
              <div className={`mt-2 p-4 rounded-md border ${analysisResult.isHighRisk ? 'bg-rose-50 border-rose-200' : 'bg-emerald-50 border-emerald-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  {analysisResult.isHighRisk ? <XCircle className="h-5 w-5 text-rose-600" /> : <CheckCircle className="h-5 w-5 text-emerald-600" />}
                  <h4 className={`font-semibold ${analysisResult.isHighRisk ? 'text-rose-900' : 'text-emerald-900'}`}>
                    {analysisResult.isHighRisk ? 'High Risk Detected' : 'Low Risk'}
                  </h4>
                </div>
                <p className={`text-sm ${analysisResult.isHighRisk ? 'text-rose-700' : 'text-emerald-700'}`}>
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
