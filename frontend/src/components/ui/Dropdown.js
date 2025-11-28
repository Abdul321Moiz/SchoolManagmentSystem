import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Transition } from '@headlessui/react';
import { FiChevronDown } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const Dropdown = ({
  trigger,
  children,
  align = 'left',
  width = 'w-48',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div ref={dropdownRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      <Transition
        as={Fragment}
        show={isOpen}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div
          className={cn(
            'absolute z-50 mt-2 rounded-lg shadow-lg',
            'bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5',
            width,
            alignmentClasses[align]
          )}
        >
          <div className="py-1" onClick={() => setIsOpen(false)}>
            {children}
          </div>
        </div>
      </Transition>
    </div>
  );
};

const DropdownItem = ({
  children,
  icon: Icon,
  onClick,
  disabled = false,
  danger = false,
  className,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'flex items-center w-full px-4 py-2 text-sm text-left',
        'transition-colors duration-150',
        disabled && 'opacity-50 cursor-not-allowed',
        danger
          ? 'text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/30'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700',
        className
      )}
    >
      {Icon && <Icon className="w-4 h-4 mr-3" />}
      {children}
    </button>
  );
};

const DropdownDivider = () => {
  return <div className="my-1 border-t border-gray-200 dark:border-gray-700" />;
};

const DropdownLabel = ({ children, className }) => {
  return (
    <div
      className={cn(
        'px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider',
        className
      )}
    >
      {children}
    </div>
  );
};

const DropdownButton = ({
  children,
  className,
  ...props
}) => {
  return (
    <button
      type="button"
      className={cn(
        'inline-flex items-center justify-center gap-2 px-4 py-2',
        'text-sm font-medium text-gray-700 dark:text-gray-300',
        'bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600',
        'rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        className
      )}
      {...props}
    >
      {children}
      <FiChevronDown className="w-4 h-4" />
    </button>
  );
};

Dropdown.Item = DropdownItem;
Dropdown.Divider = DropdownDivider;
Dropdown.Label = DropdownLabel;
Dropdown.Button = DropdownButton;

export default Dropdown;
