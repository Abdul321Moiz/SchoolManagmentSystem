import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300',
  secondary: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300',
  success: 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-300',
  warning: 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-300',
  danger: 'bg-danger-100 text-danger-800 dark:bg-danger-900 dark:text-danger-300',
  gray: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

const Badge = ({
  children,
  variant = 'primary',
  size = 'md',
  dot = false,
  rounded = false,
  className,
  ...props
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium',
        rounded ? 'rounded-full' : 'rounded-md',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full mr-1.5',
            variant === 'primary' && 'bg-primary-600',
            variant === 'secondary' && 'bg-secondary-600',
            variant === 'success' && 'bg-success-600',
            variant === 'warning' && 'bg-warning-600',
            variant === 'danger' && 'bg-danger-600',
            variant === 'gray' && 'bg-gray-600'
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
