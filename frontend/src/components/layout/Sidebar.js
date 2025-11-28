import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  FiHome, FiUsers, FiUser, FiUserPlus, FiBookOpen, FiCheckSquare,
  FiFileText, FiClipboard, FiDollarSign, FiCreditCard, FiBook,
  FiTruck, FiBell, FiBarChart2, FiSettings, FiGrid, FiChevronDown,
  FiChevronRight, FiX, FiCalendar, FiAward,
} from 'react-icons/fi';
import { cn } from '@/lib/utils';
import { toggleSidebar, toggleSidebarCollapse } from '@/store/slices/uiSlice';
import { getNavigationForRole } from '@/lib/navigation';

const iconMap = {
  FiHome,
  FiUsers,
  FiUser,
  FiUserPlus,
  FiBookOpen,
  FiCheckSquare,
  FiFileText,
  FiClipboard,
  FiDollarSign,
  FiCreditCard,
  FiBook,
  FiTruck,
  FiBell,
  FiBarChart2,
  FiSettings,
  FiGrid,
  FiCalendar,
  FiAward,
};

const Sidebar = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { user } = useSelector((state) => state.auth);
  const { sidebarOpen, sidebarCollapsed } = useSelector((state) => state.ui);
  const [expandedItems, setExpandedItems] = useState([]);

  const navigation = getNavigationForRole(user?.role);

  const toggleExpand = (path) => {
    setExpandedItems((prev) =>
      prev.includes(path)
        ? prev.filter((item) => item !== path)
        : [...prev, path]
    );
  };

  const isActive = (path) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  const NavItem = ({ item }) => {
    const Icon = iconMap[item.icon] || FiHome;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.path);
    const active = isActive(item.path);

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleExpand(item.path)}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2.5 rounded-lg',
              'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
              'transition-colors duration-200',
              active && 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
            )}
          >
            <div className="flex items-center gap-3">
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!sidebarCollapsed && <span className="text-sm font-medium">{item.title}</span>}
            </div>
            {!sidebarCollapsed && (
              <FiChevronDown
                className={cn(
                  'w-4 h-4 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )}
              />
            )}
          </button>
          {!sidebarCollapsed && isExpanded && (
            <div className="mt-1 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1">
              {item.children.map((child) => (
                <Link
                  key={child.path}
                  href={child.path}
                  className={cn(
                    'block px-3 py-2 rounded-lg text-sm',
                    'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800',
                    'transition-colors duration-200',
                    isActive(child.path) && 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
                  )}
                >
                  {child.title}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.path}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-lg',
          'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors duration-200',
          active && 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-medium'
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        {!sidebarCollapsed && <span className="text-sm">{item.title}</span>}
      </Link>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen',
          'bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700',
          'transition-all duration-300',
          sidebarCollapsed ? 'w-20' : 'w-64',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            {!sidebarCollapsed && (
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                OSMS
              </span>
            )}
          </Link>
          <button
            onClick={() => dispatch(toggleSidebar())}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 lg:hidden"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>

        {/* Collapse Button - Desktop Only */}
        <div className="hidden lg:block px-3 py-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => dispatch(toggleSidebarCollapse())}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <FiChevronRight
              className={cn(
                'w-5 h-5 transition-transform duration-200',
                sidebarCollapsed && 'rotate-180'
              )}
            />
            {!sidebarCollapsed && <span className="text-sm">Collapse</span>}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
