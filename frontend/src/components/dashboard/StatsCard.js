import React from 'react';
import { FiUsers, FiUserCheck, FiDollarSign, FiCalendar, FiTrendingUp, FiTrendingDown, FiBookOpen, FiBell } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const variants = {
  primary: {
    bg: 'bg-primary-100 dark:bg-primary-900/30',
    icon: 'text-primary-600 dark:text-primary-400',
    trend: 'text-primary-600',
  },
  success: {
    bg: 'bg-success-100 dark:bg-success-900/30',
    icon: 'text-success-600 dark:text-success-400',
    trend: 'text-success-600',
  },
  warning: {
    bg: 'bg-warning-100 dark:bg-warning-900/30',
    icon: 'text-warning-600 dark:text-warning-400',
    trend: 'text-warning-600',
  },
  danger: {
    bg: 'bg-danger-100 dark:bg-danger-900/30',
    icon: 'text-danger-600 dark:text-danger-400',
    trend: 'text-danger-600',
  },
  secondary: {
    bg: 'bg-secondary-100 dark:bg-secondary-900/30',
    icon: 'text-secondary-600 dark:text-secondary-400',
    trend: 'text-secondary-600',
  },
};

const iconMap = {
  students: FiUsers,
  teachers: FiUserCheck,
  revenue: FiDollarSign,
  attendance: FiCalendar,
  classes: FiBookOpen,
  notifications: FiBell,
};

const StatsCard = ({
  title,
  value,
  icon,
  trend,
  trendValue,
  variant = 'primary',
  className,
}) => {
  const Icon = iconMap[icon] || FiUsers;
  const variantStyles = variants[variant];
  const isPositiveTrend = trend === 'up';

  return (
    <div
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {trendValue && (
            <div className="flex items-center mt-2">
              {isPositiveTrend ? (
                <FiTrendingUp className="w-4 h-4 text-success-600 mr-1" />
              ) : (
                <FiTrendingDown className="w-4 h-4 text-danger-600 mr-1" />
              )}
              <span
                className={cn(
                  'text-sm font-medium',
                  isPositiveTrend ? 'text-success-600' : 'text-danger-600'
                )}
              >
                {trendValue}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                vs last month
              </span>
            </div>
          )}
        </div>
        <div
          className={cn(
            'w-12 h-12 rounded-lg flex items-center justify-center',
            variantStyles.bg
          )}
        >
          <Icon className={cn('w-6 h-6', variantStyles.icon)} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
