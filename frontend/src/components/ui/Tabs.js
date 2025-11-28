import React, { useState } from 'react';
import { cn } from '@/lib/utils';

const Tabs = ({
  tabs,
  defaultTab,
  onChange,
  variant = 'line',
  size = 'md',
  className,
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    onChange?.(tabId);
  };

  const activeTabData = tabs.find((tab) => tab.id === activeTab);

  const variants = {
    line: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: (isActive) => cn(
        'px-4 py-2 font-medium text-sm border-b-2 -mb-px transition-colors',
        isActive
          ? 'border-primary-600 text-primary-600 dark:text-primary-400'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
      ),
    },
    pills: {
      container: 'p-1 bg-gray-100 dark:bg-gray-800 rounded-lg',
      tab: (isActive) => cn(
        'px-4 py-2 font-medium text-sm rounded-md transition-colors',
        isActive
          ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow'
          : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      ),
    },
    boxed: {
      container: 'border-b border-gray-200 dark:border-gray-700',
      tab: (isActive) => cn(
        'px-4 py-2 font-medium text-sm border rounded-t-lg -mb-px transition-colors',
        isActive
          ? 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 border-b-white dark:border-b-gray-900 text-gray-900 dark:text-white'
          : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
      ),
    },
  };

  const sizes = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={className}>
      <div className={cn('flex', variants[variant].container)}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabChange(tab.id)}
            disabled={tab.disabled}
            className={cn(
              variants[variant].tab(activeTab === tab.id),
              sizes[size],
              'inline-flex items-center gap-2',
              tab.disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {tab.icon && <tab.icon className="w-4 h-4" />}
            {tab.label}
            {tab.badge && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded-full">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {activeTabData?.content && (
        <div className="py-4">
          {activeTabData.content}
        </div>
      )}
    </div>
  );
};

export default Tabs;
