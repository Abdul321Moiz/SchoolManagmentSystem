import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiChevronRight, FiHome } from 'react-icons/fi';
import { cn } from '@/lib/utils';

const Breadcrumbs = ({ items, className }) => {
  const router = useRouter();

  // Generate breadcrumbs from path if items not provided
  const breadcrumbItems = items || generateBreadcrumbs(router.pathname);

  return (
    <nav className={cn('flex items-center', className)} aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        <li>
          <Link
            href="/dashboard"
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <FiHome className="w-4 h-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            <FiChevronRight className="w-4 h-4 text-gray-400 mx-2" />
            {index === breadcrumbItems.length - 1 ? (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {item.label}
              </span>
            ) : (
              <Link
                href={item.path}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

// Helper function to generate breadcrumbs from path
function generateBreadcrumbs(pathname) {
  const paths = pathname.split('/').filter(Boolean);
  const breadcrumbs = [];

  let currentPath = '';
  for (const path of paths) {
    currentPath += `/${path}`;
    breadcrumbs.push({
      label: formatLabel(path),
      path: currentPath,
    });
  }

  return breadcrumbs;
}

// Format path segment to readable label
function formatLabel(segment) {
  return segment
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export default Breadcrumbs;
