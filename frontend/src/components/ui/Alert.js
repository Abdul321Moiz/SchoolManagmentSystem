import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const variants = {
  info: {
    container: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    title: 'text-blue-800 dark:text-blue-300',
    text: 'text-blue-700 dark:text-blue-400',
    Icon: FiInfo,
  },
  success: {
    container: 'bg-success-50 border-success-200 dark:bg-success-900/30 dark:border-success-800',
    icon: 'text-success-600 dark:text-success-400',
    title: 'text-success-800 dark:text-success-300',
    text: 'text-success-700 dark:text-success-400',
    Icon: FiCheckCircle,
  },
  warning: {
    container: 'bg-warning-50 border-warning-200 dark:bg-warning-900/30 dark:border-warning-800',
    icon: 'text-warning-600 dark:text-warning-400',
    title: 'text-warning-800 dark:text-warning-300',
    text: 'text-warning-700 dark:text-warning-400',
    Icon: FiAlertTriangle,
  },
  danger: {
    container: 'bg-danger-50 border-danger-200 dark:bg-danger-900/30 dark:border-danger-800',
    icon: 'text-danger-600 dark:text-danger-400',
    title: 'text-danger-800 dark:text-danger-300',
    text: 'text-danger-700 dark:text-danger-400',
    Icon: FiAlertCircle,
  },
};

const Alert = ({
  variant = 'info',
  title,
  children,
  dismissible = false,
  onDismiss,
  icon,
  className,
}) => {
  const variantStyles = variants[variant];
  const IconComponent = icon || variantStyles.Icon;

  return (
    <div
      className={cn(
        'flex p-4 rounded-lg border',
        variantStyles.container,
        className
      )}
      role="alert"
    >
      <div className={cn('flex-shrink-0', variantStyles.icon)}>
        <IconComponent className="w-5 h-5" />
      </div>
      <div className="ml-3 flex-1">
        {title && (
          <h3 className={cn('text-sm font-medium', variantStyles.title)}>
            {title}
          </h3>
        )}
        {children && (
          <div className={cn('text-sm', title && 'mt-1', variantStyles.text)}>
            {children}
          </div>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            'ml-3 -mx-1.5 -my-1.5 p-1.5 rounded-lg inline-flex h-8 w-8',
            'hover:bg-white/50 dark:hover:bg-gray-800/50',
            variantStyles.icon
          )}
          aria-label="Dismiss"
        >
          <span className="sr-only">Dismiss</span>
          <FiX className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

export default Alert;
