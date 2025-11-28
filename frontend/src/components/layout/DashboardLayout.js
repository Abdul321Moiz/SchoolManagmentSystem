import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import { getMe } from '@/store/slices/authSlice';
import { Spinner } from '@/components/ui';

// Dynamically import Sidebar and Header to prevent hydration issues
const Sidebar = dynamic(() => import('./Sidebar'), { ssr: false });
const Header = dynamic(() => import('./Header'), { ssr: false });

const DashboardLayout = ({ children }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const { sidebarOpen, sidebarCollapsed } = useSelector((state) => state.ui);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push('/login');
    } else if (mounted && isAuthenticated && !user) {
      dispatch(getMe());
    }
  }, [isAuthenticated, user, dispatch, router, mounted]);

  if (!mounted || isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <Spinner size="xl" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="p-4 md:p-6 lg:p-8 min-h-[calc(100vh-64px)]">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => dispatch({ type: 'ui/toggleSidebar' })}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
