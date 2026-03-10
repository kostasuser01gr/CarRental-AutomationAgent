import { useState, useEffect } from 'react';
import { Mail, Phone, MoreHorizontal, ShieldAlert, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchWithAuth as fetch } from '@/lib/api';

export function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers')
      .then(res => res.json())
      .then(data => {
        setCustomers(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading customer base...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
        <button className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800">
          Add Customer
        </button>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="bg-slate-50/50">
              <tr className="border-b border-slate-200">
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Name</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Contact</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Spent</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Credit Score</th>
                <th className="h-12 px-4 text-left align-middle font-medium text-slate-500">Verification</th>
                <th className="h-12 px-4 text-right align-middle font-medium text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {customers.map((customer) => (
                <tr
                  key={customer.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors hover:bg-slate-50/50",
                    customer.status === 'Blacklisted' && "bg-rose-50/30"
                  )}
                >
                  <td className="p-4 align-middle font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                        {customer.name.split(' ').map((n: string) => n[0]).join('').substring(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className={cn(customer.status === 'Blacklisted' && "line-through text-slate-500")}>
                          {customer.name}
                        </div>
                        {customer.status === 'VIP' && (
                          <span className="inline-flex items-center rounded-full bg-indigo-100 px-2 py-0.5 text-[9px] font-bold text-indigo-800 uppercase">
                            VIP
                          </span>
                        )}
                        {customer.status === 'Blacklisted' && (
                          <span className="inline-flex items-center rounded-full bg-rose-100 px-2 py-0.5 text-[9px] font-bold text-rose-800 uppercase">
                            Banned
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle text-slate-600">
                    <div className="flex flex-col gap-0.5 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-slate-400" />
                        {customer.email}
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {customer.phone || 'N/A'}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 align-middle font-mono font-bold text-slate-900">
                    ${customer.total_spent.toFixed(2)}
                  </td>
                  <td className="p-4 align-middle">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "font-mono font-bold text-base",
                        customer.social_credit_score >= 90 ? "text-emerald-600" :
                        customer.social_credit_score >= 60 ? "text-amber-500" : "text-rose-600"
                      )}>
                        {customer.social_credit_score}
                      </div>
                      {customer.social_credit_score >= 90 && <ShieldCheck className="h-4 w-4 text-emerald-500" />}
                      {customer.social_credit_score < 60 && <ShieldAlert className="h-4 w-4 text-rose-500" />}
                    </div>
                  </td>
                  <td className="p-4 align-middle">
                    <span className={cn(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold border uppercase tracking-tighter",
                        customer.verification_status === 'Verified' ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                        customer.verification_status === 'Flagged' ? "bg-rose-50 text-rose-700 border-rose-100" :
                        "bg-slate-50 text-slate-600 border-slate-100"
                    )}>
                        {customer.verification_status === 'Verified' ? <ShieldCheck className="h-2.5 w-2.5" /> : 
                         customer.verification_status === 'Flagged' ? <ShieldAlert className="h-2.5 w-2.5" /> : null}
                        {customer.verification_status}
                    </span>
                  </td>
                  <td className="p-4 align-middle text-right">
                    <button className="rounded-md p-2 hover:bg-slate-100 text-slate-500">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
