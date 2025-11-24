import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut,
  Bell,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const navItems = [
  { icon: LayoutDashboard, label: 'Mon Tableau de Bord', href: '/partner' },
  { icon: FileText, label: 'Mes Missions', href: '/partner/missions' },
  { icon: User, label: 'Mon Profil', href: '/partner/profile' },
];

export function PartnerLayout() {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      {/* Simplified Sidebar */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex flex-col shadow-sm z-20 transition-all duration-300">
        <div className="h-16 flex items-center justify-center lg:justify-start lg:px-6 border-b border-slate-100">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold shrink-0">
            K
          </div>
          <span className="ml-3 font-bold text-slate-900 hidden lg:block">KDEKOM</span>
        </div>

        <nav className="flex-1 py-6 space-y-2 px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href || (item.href !== '/partner' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center justify-center lg:justify-start gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                  isActive
                    ? "bg-emerald-50 text-emerald-700"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
                <span className="hidden lg:block">{item.label}</span>
                
                {/* Tooltip for mobile/collapsed state */}
                <span className="absolute left-14 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 lg:hidden pointer-events-none transition-opacity whitespace-nowrap z-50">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100">
          <Link to="/">
            <Button variant="ghost" size="icon" className="w-full lg:justify-start lg:w-full text-slate-400 hover:text-red-600 hover:bg-red-50">
              <LogOut className="w-5 h-5 lg:mr-2" />
              <span className="hidden lg:inline">Déconnexion</span>
            </Button>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Espace Partenaire</h2>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
              <Bell className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-slate-900">John Doe</p>
                <p className="text-xs text-emerald-600 font-medium">Partenaire Gold</p>
              </div>
              <Avatar className="h-9 w-9 border border-slate-200">
                <AvatarImage src="https://github.com/shadcn.png" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}