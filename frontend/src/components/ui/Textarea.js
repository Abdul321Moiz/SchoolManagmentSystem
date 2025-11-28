import React from 'react';
import { cn } from '@/lib/utils';

const Textarea = React.forwardRef(({
  label,
  error,
  helperText,
  className,
  textareaClassName,
  required,
  disabled,
  rows = 4,
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
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        disabled={disabled}
        className={cn(
          'input resize-none',
          error && 'border-danger-500 focus:ring-danger-500 focus:border-danger-500',
          disabled && 'bg-gray-100 cursor-not-allowed',
          textareaClassName
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-500">{error}</p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
      )}
    </div>
  );
});

Textarea.displayName = 'Textarea';

export default Textarea;
