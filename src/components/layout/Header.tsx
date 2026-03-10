import { Bell, Search } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Header() {
  const { user } = useAuth();
  
  return (
    <header className="flex h-16 items-center justify-between border-b border-neon-cyan/20 glass-panel px-6 sticky top-0 z-50">
      <div className="flex flex-1 items-center gap-4">
        <div className="relative w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neon-cyan/50" />
          <input
            type="text"
            placeholder="Query Warlord Matrix (Cmd+K)..."
            className="h-9 w-full rounded-md border border-neon-cyan/20 bg-quantum-800/50 pl-10 pr-4 text-sm text-slate-200 outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan font-mono placeholder:text-slate-600 transition-all shadow-[inset_0_0_10px_rgba(0,0,0,0.5)]"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="relative rounded-full p-2 text-slate-400 hover:text-neon-cyan transition-colors">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500"></span>
          </span>
        </button>
        <div className="h-8 w-8 rounded-full bg-quantum-800 border border-neon-cyan/50 flex items-center justify-center font-bold text-xs text-neon-cyan neon-text-cyan uppercase">
          {user?.name?.substring(0,2) || 'WL'}
        </div>
      </div>
    </header>
  );
}