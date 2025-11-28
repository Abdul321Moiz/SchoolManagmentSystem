import React from 'react';
import Image from 'next/image';
import { cn, getInitials, generateAvatar } from '@/lib/utils';

const sizes = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

const Avatar = ({
  src,
  alt,
  name,
  size = 'md',
  rounded = true,
  className,
  ...props
}) => {
  const initials = name ? getInitials(name) : '?';
  const backgroundColor = name ? generateAvatar(name) : '#6366f1';

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center overflow-hidden',
        'bg-gray-200 dark:bg-gray-700',
        rounded ? 'rounded-full' : 'rounded-lg',
        sizes[size],
        className
      )}
      style={{ backgroundColor: !src ? backgroundColor : undefined }}
      {...props}
    >
      {src ? (
        <Image
          src={src}
          alt={alt || name || 'Avatar'}
          fill
          className="object-cover"
        />
      ) : (
        <span className="font-medium text-white">{initials}</span>
      )}
    </div>
  );
};

const AvatarGroup = ({
  avatars = [],
  max = 4,
  size = 'md',
  className,
}) => {
  const visibleAvatars = avatars.slice(0, max);
  const remainingCount = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visibleAvatars.map((avatar, index) => (
        <Avatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt || avatar.name}
          size={size}
          className="ring-2 ring-white dark:ring-gray-800"
        />
      ))}
      {remainingCount > 0 && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center',
            'bg-gray-200 dark:bg-gray-700 rounded-full',
            'ring-2 ring-white dark:ring-gray-800',
            sizes[size]
          )}
        >
          <span className="font-medium text-gray-600 dark:text-gray-300 text-xs">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};

Avatar.Group = AvatarGroup;

export default Avatar;
