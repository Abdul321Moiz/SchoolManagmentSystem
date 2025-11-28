import React from 'react';
import { cn } from '@/lib/utils';

const sizes = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-2',
  xl: 'w-12 h-12 border-4',
};

const colors = {
  primary: 'border-primary-600',
  white: 'border-white',
  gray: 'border-gray-600',
};

const Spinner = ({
  size = 'md',
  color = 'primary',
  className,
}) => {
  return (
    <div
      className={cn(
        'animate-spin rounded-full border-t-transparent',
        sizes[size],
        colors[color],
        className
      )}
    />
  );
};

export default Spinner;
