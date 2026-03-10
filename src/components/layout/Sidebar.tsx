import {
  LayoutDashboard,
  CalendarRange,
  Ticket,
  CarFront,
  Users,
  AlertTriangle,
  BarChart3,
  Settings,
  LogOut,
  Briefcase,
  Activity,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

const navigation = [
  { name: 'Quantum Core', href: '/', icon: LayoutDashboard },
  { name: 'Telemetry Matrix', href: '/telemetry', icon: Activity, badge: 'Live' },
  { name: 'Calendar', href: '/calendar', icon: CalendarRange },
  { name: 'Bookings', href: '/bookings', icon: Ticket },
  { name: 'Fleet', href: '/fleet', icon: CarFront },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Conflict Center', href: '/conflicts', icon: AlertTriangle, badge: '3' },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Pricing Engine', href: '/pricing', icon: BarChart3 },
  { name: 'Partner Portal', href: '/partner', icon: Briefcase },
  { name: 'Blacklist', href: '/blacklist', icon: AlertTriangle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <div className="flex h-full w-64 flex-col border-r border-neon-cyan/20 glass-panel">
      <div className="flex h-16 items-center border-b border-neon-cyan/20 px-6">
        <div className="flex items-center gap-3 font-mono text-lg font-bold tracking-wider text-neon-cyan neon-text-cyan">
          <div className="h-6 w-6 rounded bg-neon-cyan shadow-[0_0_10px_#00f3ff]" />
          <span>MIRA.OS</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-4 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-all duration-300',
                isActive
                  ? 'bg-neon-cyan/10 text-neon-cyan neon-border'
                  : 'text-slate-400 hover:bg-quantum-800 hover:text-slate-200'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0 transition-colors',
                  isActive ? 'text-neon-cyan' : 'text-slate-500 group-hover:text-slate-300'
                )}
              />
              {item.name}
              {item.badge && (
                <span className={cn(
                  "ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                  item.badge === 'Live' ? "bg-neon-magenta/20 text-neon-magenta border border-neon-magenta/50 animate-pulse" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                )}>
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neon-cyan/20 p-4">
        <button 
          onClick={logout}
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Disconnect Neural Link
        </button>
      </div>
    </div>
  );
}