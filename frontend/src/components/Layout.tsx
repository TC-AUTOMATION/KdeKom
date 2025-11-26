// client/src/components/Layout.tsx
import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './ui/Navbar';
import Sidebar from './ui/Sidebar';
import { useSidebar } from '../contexts/SidebarContext';

const Layout: React.FC = () => {
  const { isCollapsed, sidebarWidth } = useSidebar();
  const location = useLocation();
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setIsTransitioning(true);

    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  return (
    <div className="flex h-screen bg-app-black overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div
        style={{ marginLeft: isCollapsed ? '4.5rem' : `${sidebarWidth}px` }}
        className="flex flex-col flex-1 overflow-hidden relative z-10 transition-all duration-300"
      >
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto mt-16 bg-app-black relative">
          {/* Content wrapper with padding */}
          <div className="p-4 lg:p-6">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </div>

          {/* Page Transition Loading Overlay */}
          {isTransitioning && (
            <div className="absolute inset-0 bg-app-black z-[9999] transition-opacity duration-300 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-app-border border-t-app-text-primary rounded-full animate-spin" />
                <p className="text-app-text-secondary text-sm">Chargement...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Layout;