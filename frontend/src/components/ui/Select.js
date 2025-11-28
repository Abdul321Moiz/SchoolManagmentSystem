import React from 'react';
import { cn } from '@/lib/utils';

const Select = React.forwardRef(({
  label,
  error,
  helperText,
  options = [],
  placeholder = 'Select an option',
  className,
  selectClassName,
  required,
  disabled,
  ...props
}, ref) => {
  const id = props.id || props.name;

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
          {required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        disabled={disabled}
        className={cn(
          'input',
          error && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
          disabled && 'bg-gray-100 cursor-not-allowed',
          selectClassName
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm text-danger-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
