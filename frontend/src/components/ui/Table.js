import React from 'react';
import { FiChevronUp, FiChevronDown, FiChevronsLeft, FiChevronsRight, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { cn } from '@/lib/utils';
import Spinner from './Spinner';

const Table = ({
  columns,
  data,
  loading = false,
  sortable = false,
  sortColumn,
  sortDirection,
  onSort,
  selectable = false,
  selectedRows = [],
  onSelectRow,
  onSelectAll,
  emptyMessage = 'No data available',
  className,
}) => {
  const handleSort = (column) => {
    if (!sortable || !column.sortable || !onSort) return;
    
    const newDirection = sortColumn === column.key && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(column.key, newDirection);
  };

  const isAllSelected = data.length > 0 && selectedRows.length === data.length;
  const isPartiallySelected = selectedRows.length > 0 && selectedRows.length < data.length;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-800 dark:text-gray-400">
          <tr>
            {selectable && (
              <th scope="col" className="p-4">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected;
                  }}
                  onChange={(e) => onSelectAll?.(e.target.checked)}
                  className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                />
              </th>
            )}
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  'px-6 py-3',
                  column.sortable && sortable && 'cursor-pointer select-none',
                  column.className
                )}
                onClick={() => handleSort(column)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {sortable && column.sortable && (
                    <span className="flex flex-col">
                      <FiChevronUp
                        className={cn(
                          'w-3 h-3 -mb-1',
                          sortColumn === column.key && sortDirection === 'asc'
                            ? 'text-primary-600'
                            : 'text-gray-400'
                        )}
                      />
                      <FiChevronDown
                        className={cn(
                          'w-3 h-3',
                          sortColumn === column.key && sortDirection === 'desc'
                            ? 'text-primary-600'
                            : 'text-gray-400'
                        )}
                      />
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-6 py-12 text-center"
              >
                <div className="flex items-center justify-center">
                  <Spinner size="lg" />
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length + (selectable ? 1 : 0)}
                className="px-6 py-12 text-center text-gray-500 dark:text-gray-400"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className="bg-white border-b dark:bg-gray-900 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                {selectable && (
                  <td className="w-4 p-4">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(row.id || rowIndex)}
                      onChange={() => onSelectRow?.(row.id || rowIndex)}
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500"
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-6 py-4', column.cellClassName)}
                  >
                    {column.render
                      ? column.render(row[column.key], row, rowIndex)
                      : row[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

const TablePagination = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  className,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3',
        'border-t border-gray-200 dark:border-gray-700',
        className
      )}
    >
      <div className="flex items-center gap-4 text-sm text-gray-700 dark:text-gray-300">
        <span>
          Showing <span className="font-medium">{startItem}</span> to{' '}
          <span className="font-medium">{endItem}</span> of{' '}
          <span className="font-medium">{totalItems}</span> results
        </span>
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-sm"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="First page"
        >
          <FiChevronsLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Previous page"
        >
          <FiChevronLeft className="w-4 h-4" />
        </button>
        <span className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Next page"
        >
          <FiChevronRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Last page"
        >
          <FiChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

Table.Pagination = TablePagination;

export default Table;
