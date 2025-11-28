import React, { useState } from 'react';
import { FiChevronDown, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const Accordion = ({
  children,
  type = 'single',
  defaultOpen,
  className,
}) => {
  const [openItems, setOpenItems] = useState(
    defaultOpen ? (Array.isArray(defaultOpen) ? defaultOpen : [defaultOpen]) : []
  );

  const toggleItem = (id) => {
    if (type === 'single') {
      setOpenItems(openItems.includes(id) ? [] : [id]);
    } else {
      setOpenItems(
        openItems.includes(id)
          ? openItems.filter((item) => item !== id)
          : [...openItems, id]
      );
    }
  };

  return (
    <div className={cn('divide-y divide-gray-200 dark:divide-gray-700', className)}>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          isOpen: openItems.includes(child.props.id),
          onToggle: () => toggleItem(child.props.id),
        })
      )}
    </div>
  );
};

const AccordionItem = ({
  id,
  title,
  children,
  isOpen,
  onToggle,
  icon,
  disabled = false,
  className,
}) => {
  return (
    <div className={cn('py-0', className)}>
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={cn(
          'flex items-center justify-between w-full py-4 text-left',
          'text-gray-900 dark:text-white font-medium',
          'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-gray-500">{icon}</span>}
          <span>{title}</span>
        </div>
        <FiChevronDown
          className={cn(
            'w-5 h-5 text-gray-500 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>
      <div
        className={cn(
          'overflow-hidden transition-all duration-200',
          isOpen ? 'max-h-96' : 'max-h-0'
        )}
      >
        <div className="pb-4 text-gray-600 dark:text-gray-400">
          {children}
        </div>
      </div>
    </div>
  );
};

Accordion.Item = AccordionItem;

export default Accordion;
