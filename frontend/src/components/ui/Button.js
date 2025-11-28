import React from 'react';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

const variants = {
  primary: 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm',
  secondary: 'bg-secondary-600 hover:bg-secondary-700 text-white shadow-sm',
  success: 'bg-success-600 hover:bg-success-700 text-white shadow-sm',
  warning: 'bg-warning-600 hover:bg-warning-700 text-white shadow-sm',
  danger: 'bg-danger-600 hover:bg-danger-700 text-white shadow-sm',
  outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900',
  ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800',
  link: 'text-primary-600 hover:underline',
};

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
  xl: 'px-6 py-3 text-lg',
};

const Button = React.forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  type = 'button',
  ...props
}, ref) => {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {loading && (
        <Spinner size="sm" className="mr-2" />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className={cn('w-4 h-4', children && 'mr-2')} />
      )}
      {children}
      {!loading && Icon && iconPosition === 'right' && (
        <Icon className={cn('w-4 h-4', children && 'ml-2')} />
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
