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
  Menu,
  Briefcase,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Calendar', href: '/calendar', icon: CalendarRange },
  { name: 'Bookings', href: '/bookings', icon: Ticket },
  { name: 'Fleet', href: '/fleet', icon: CarFront },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Conflict Center', href: '/conflicts', icon: AlertTriangle, badge: true },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Pricing Engine', href: '/pricing', icon: BarChart3 }, // Reusing icon for now
  { name: 'Partner Portal', href: '/partner', icon: Briefcase },
  { name: 'Blacklist', href: '/blacklist', icon: AlertTriangle },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-slate-50 text-slate-900">
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <div className="flex items-center gap-2 font-mono text-lg font-bold tracking-tight">
          <div className="h-6 w-6 rounded bg-slate-900" />
          <span>CRE Admin</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-slate-200 text-slate-900'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <item.icon
                className={cn(
                  'mr-3 h-5 w-5 flex-shrink-0',
                  isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-500'
                )}
              />
              {item.name}
              {item.badge && (
                <span className="ml-auto inline-flex items-center rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
                  3
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900">
          <LogOut className="mr-3 h-5 w-5 text-slate-400" />
          Sign out
        </button>
      </div>
    </div>
  );
}
