import { useState, useEffect } from 'react';
import { Save, History, User } from 'lucide-react';
import { fetchWithAuth as fetch } from '@/lib/api';

export function Settings() {
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/audit-logs')
      .then(res => res.json())
      .then(setLogs);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Settings</h1>
        <button className="flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
          <Save className="h-4 w-4" />
          Save Changes
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* General Settings */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900">General Information</h2>
            <p className="text-sm text-slate-500">Manage your company details and preferences.</p>
            
            <div className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Company Name</label>
                <input
                  type="text"
                  defaultValue="MiraCars Warlord"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Support Email</label>
                <input
                  type="email"
                  defaultValue="ops@miracars.com"
                  className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
                />
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4 flex items-center gap-2">
              <History className="h-5 w-5 text-slate-600" />
              <h3 className="font-medium text-slate-900">System Audit Logs (Chain of Custody)</h3>
            </div>
            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
              {logs.map((log: any) => (
                <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                      <User className="h-3 w-3" />
                      {log.user_name || 'System'}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-indigo-600">{log.action}</div>
                  <div className="text-xs text-slate-600 mt-1">
                    {log.entity_type} #{log.entity_id}: {log.details}
                  </div>
                </div>
              ))}
              {logs.length === 0 && (
                <div className="p-8 text-center text-slate-500 text-sm">No audit logs found.</div>
              )}
            </div>
          </div>
        </div>

        {/* Channel Integrations */}
        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-medium text-slate-900">Channel Integrations</h2>
            <p className="text-sm text-slate-500">Configure your connections.</p>
            
            <div className="mt-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-violet-100 p-1.5">
                    <div className="h-full w-full rounded-sm bg-violet-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Localrent</h3>
                    <p className="text-xs text-slate-500">Connected</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded bg-orange-100 p-1.5">
                    <div className="h-full w-full rounded-sm bg-orange-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-900">Karpadu</h3>
                    <p className="text-xs text-slate-500">Connected</p>
                  </div>
                </div>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" className="peer sr-only" defaultChecked />
                  <div className="peer h-6 w-11 rounded-full bg-slate-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-slate-300 after:bg-white after:content-[''] peer-checked:bg-emerald-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
