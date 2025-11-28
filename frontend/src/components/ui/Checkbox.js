import React from 'react';
import { cn } from '@/lib/utils';

const Checkbox = React.forwardRef(({
  label,
  error,
  helperText,
  className,
  disabled,
  ...props
}, ref) => {
  const id = props.id || props.name;

  return (
    <div className={cn('flex items-start', className)}>
      <div className="flex items-center h-5">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          disabled={disabled}
          className={cn(
            'w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded',
            'focus:ring-primary-500 dark:focus:ring-primary-600',
            'dark:ring-offset-gray-800 dark:bg-gray-700 dark:border-gray-600',
            disabled && 'cursor-not-allowed opacity-50'
          )}
          {...props}
        />
      </div>
      {label && (
        <div className="ml-2 text-sm">
          <label
            htmlFor={id}
            className={cn(
              'font-medium text-gray-700 dark:text-gray-300',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label}
          </label>
          {helperText && (
            <p className="text-gray-500 dark:text-gray-400">{helperText}</p>
          )}
          {error && (
            <p className="text-danger-500">{error}</p>
          )}
        </div>
      )}
    </div>
  );
});

Checkbox.displayName = 'Checkbox';

export default Checkbox;
