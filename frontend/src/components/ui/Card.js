import React from 'react';
import { cn } from '@/lib/utils';

const variants = {
  default: 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700',
  elevated: 'bg-white dark:bg-gray-800 shadow-card',
  flat: 'bg-gray-50 dark:bg-gray-900',
};

const Card = ({
  children,
  className,
  variant = 'default',
  padding = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        'rounded-xl overflow-hidden',
        variants[variant],
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-between mb-4',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({
  children,
  className,
  as: Component = 'h3',
  ...props
}) => {
  return (
    <Component
      className={cn(
        'text-lg font-semibold text-gray-900 dark:text-white',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
};

const CardDescription = ({
  children,
  className,
  ...props
}) => {
  return (
    <p
      className={cn(
        'text-sm text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

const CardContent = ({
  children,
  className,
  ...props
}) => {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
};

const CardFooter = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
