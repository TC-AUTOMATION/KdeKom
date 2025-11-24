import { Link, useLocation, Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    FileText,
    Users,
    Settings,
    PieChart,
    Building2,
    LogOut,
    Bell,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const sidebarItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
    { icon: PieChart, label: 'Récapitulatif', href: '/recap' },
    { icon: FileText, label: 'Missions', href: '/missions' },
    { icon: Users, label: 'Personnes', href: '/persons' },
    { icon: Building2, label: 'Clients', href: '/clients' },
    { icon: Settings, label: 'Paramètres', href: '/settings' },
];

export default function Layout() {
    const location = useLocation();

    return (
        <div className="flex h-screen bg-slate-50 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-xl z-20">
                <div className="p-6 flex items-center gap-3 border-b border-slate-800">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
                        K
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white tracking-tight">KDEKOM</h1>
                        <p className="text-xs text-slate-500">Financial CRM</p>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-1">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 px-3">
                        Menu Principal
                    </div>
                    {sidebarItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                    isActive
                                        ? "bg-blue-600 text-white shadow-md shadow-blue-900/20"
                                        : "hover:bg-slate-800 hover:text-white"
                                )}
                            >
                                <Icon className={cn("w-5 h-5", isActive ? "text-white" : "text-slate-400")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <Button variant="ghost" className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-800">
                        <LogOut className="w-4 h-4 mr-2" />
                        Déconnexion
                    </Button>
                </div>
            </aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-10">
                    <div className="flex items-center gap-4 w-1/3">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Rechercher une mission, un client..."
                                className="pl-9 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-700">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </Button>
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden md:block">
                                <p className="text-sm font-medium text-slate-900">User</p>
                                <p className="text-xs text-slate-500">Admin</p>
                            </div>
                            <Avatar className="h-9 w-9 border border-slate-200">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>U</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-8">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
