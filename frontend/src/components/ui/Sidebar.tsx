// client/src/components/ui/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Users, BarChart3, Settings, ChevronLeft, Briefcase, Sun, Moon, Handshake, UserCog, Receipt
} from 'lucide-react';
import { useSidebar, MIN_WIDTH, MAX_WIDTH } from '../../contexts/SidebarContext';
import { useTheme } from '../../contexts/ThemeContext';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/shadcn/button';
import { Badge } from '@/components/ui/shadcn/badge';
import { Separator } from '@/components/ui/shadcn/separator';

interface NavItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: string | number | null;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { isCollapsed, toggleCollapse, sidebarWidth, setSidebarWidth } = useSidebar();
  const { theme, toggleTheme } = useTheme();
  const [isResizing, setIsResizing] = React.useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  };

  React.useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setSidebarWidth]);

  const navSections: NavSection[] = [
    {
      title: 'Vue d\'ensemble',
      items: [
        { path: '/', label: 'Tableau de bord', icon: BarChart3 },
      ],
    },
    {
      title: 'OPERATIONS',
      items: [
        { path: '/missions', label: 'Missions', icon: Briefcase },
        { path: '/charges', label: 'Charges', icon: Receipt },
      ],
    },
    {
      title: 'GESTION',
      items: [
        { path: '/clients', label: 'Clients', icon: Users },
        { path: '/consultants', label: 'Collaborateurs', icon: UserCog },
        { path: '/apporteurs', label: 'Apporteurs d\'affaires', icon: Handshake },
      ],
    },
    {
      title: 'CONFIGURATION',
      items: [
        { path: '/parametres', label: 'Paramètres', icon: Settings },
      ],
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <aside
      style={{ width: isCollapsed ? '4.5rem' : `${sidebarWidth}px` }}
      className="fixed left-0 top-16 h-[calc(100vh-4rem)] bg-app-black border-r border-app-dark z-[60] transition-all duration-300 flex flex-col"
    >
      {/* Navigation */}
      <nav className="p-3 pb-6 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {navSections.map((section, sectionIndex) => (
          <div
            key={section.title}
            className="mb-4"
          >
            {/* Section Title */}
            {!isCollapsed && (
              <h3 className="px-3 mb-2 text-xs font-semibold text-app-text-muted uppercase tracking-wider">
                {section.title}
              </h3>
            )}

            {/* Section Card */}
            <div className={cn(
              "rounded-lg overflow-hidden transition-all duration-200",
              !isCollapsed && "bg-app-dark border border-app-border"
            )}>
              <div className={cn("space-y-0.5", !isCollapsed && "p-2")}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);

                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        "group relative flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200",
                        active
                          ? "bg-app-border text-app-text-primary"
                          : "text-app-text-secondary hover:bg-app-dark hover:text-app-text-primary",
                        isCollapsed && "justify-center"
                      )}
                      title={isCollapsed ? item.label : undefined}
                    >
                      

                      {/* Icon */}
                      <Icon className={cn(
                        "w-5 h-5 flex-shrink-0 transition-all duration-200",
                        isCollapsed ? "mx-auto" : ""
                      )} />

                      {/* Label */}
                      {!isCollapsed && (
                        <span className={cn(
                          "text-sm whitespace-nowrap overflow-hidden",
                          active ? "font-medium" : "font-normal"
                        )}>
                          {item.label}
                        </span>
                      )}

                      {/* Badge */}
                      {item.badge && !isCollapsed && (
                        <span className={cn(
                          "ml-auto px-2 py-0.5 rounded-full text-xs font-medium",
                          active
                            ? "bg-app-hover text-app-text-primary"
                            : "bg-app-dark text-app-text-muted"
                        )}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </nav>

      {/* Collapse Toggle Button & Theme Switcher - Integrated at bottom */}
      <div className="flex items-center justify-center gap-2 border-t border-app-border p-3 flex-shrink-0">
        <button
          onClick={toggleTheme}
          className="w-8 h-8 bg-app-dark border border-app-border rounded-md flex items-center justify-center hover:bg-app-border transition-all duration-200 group"
          title={theme === 'light' ? "Thème sombre" : "Thème clair"}
        >
          {theme === 'light' ? (
            <Moon className="w-4 h-4 text-app-text-muted group-hover:text-app-text-primary transition-all duration-200" />
          ) : (
            <Sun className="w-4 h-4 text-app-text-muted group-hover:text-app-text-primary transition-all duration-200" />
          )}
        </button>
        <button
          onClick={toggleCollapse}
          className="w-8 h-8 bg-app-dark border border-app-border rounded-md flex items-center justify-center hover:bg-app-border transition-all duration-200 group"
          title={isCollapsed ? "Développer la sidebar" : "Réduire la sidebar"}
        >
          <ChevronLeft className={cn(
            "w-4 h-4 text-app-text-muted group-hover:text-app-text-primary transition-all duration-200",
            isCollapsed && "rotate-180"
          )} />
        </button>
      </div>

      {/* Resize Handle */}
      {!isCollapsed && (
        <div
          onMouseDown={handleMouseDown}
          className="absolute right-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-app-border transition-colors group"
        >
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-12 bg-app-border opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
    </aside>
  );
};

export default Sidebar;