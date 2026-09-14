'use client';

import React, { useState, useMemo } from 'react';

export interface Column<T> {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  render?: (item: T) => React.ReactNode;
  width?: string;
}

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  items: T[];
  columns: Column<T>[];
  title?: string;
  badge?: React.ReactNode;
  subtitle?: string;
  searchPlaceholder?: string;
  searchFields?: (keyof T | string)[];
  filters?: FilterOption[];
  actionButtons?: React.ReactNode;
  defaultRowsPerPage?: number;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends { id: string }>({
  items,
  columns,
  title,
  badge,
  subtitle,
  searchPlaceholder = 'Rechercher...',
  searchFields,
  filters,
  actionButtons,
  defaultRowsPerPage = 10,
  emptyMessage = 'Aucun élément trouvé',
  onRowClick
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(defaultRowsPerPage);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  // Reset page on search or filter change
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleFilterChange = (key: string, val: string) => {
    setActiveFilters(prev => ({ ...prev, [key]: val }));
    setCurrentPage(1);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortOrder === 'asc') setSortOrder('desc');
      else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Filtered & Sorted items
  const processedItems = useMemo(() => {
    let result = [...items];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item => {
        if (searchFields && searchFields.length > 0) {
          return searchFields.some(field => {
            const val = (item as any)[field];
            return val !== undefined && String(val).toLowerCase().includes(q);
          });
        }
        return Object.values(item).some(val => 
          val !== null && val !== undefined && String(val).toLowerCase().includes(q)
        );
      });
    }

    // Dropdown filters
    Object.entries(activeFilters).forEach(([key, filterVal]) => {
      if (filterVal && filterVal !== 'all') {
        result = result.filter(item => String((item as any)[key]) === filterVal);
      }
    });

    // Sorting
    if (sortKey) {
      result.sort((a, b) => {
        const valA = (a as any)[sortKey];
        const valB = (b as any)[sortKey];

        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;

        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortOrder === 'asc' ? valA - valB : valB - valA;
        }

        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        return sortOrder === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
      });
    }

    return result;
  }, [items, search, searchFields, activeFilters, sortKey, sortOrder]);

  // Pagination calculation
  const totalItems = processedItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
  const paginatedItems = processedItems.slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pb-3 pt-4 sm:px-6 shadow-xs">
      {/* En-tête avec Titre à gauche, Boutons d'action à droite */}
      {(title || actionButtons) && (
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between w-full max-w-full min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-800">
                {title}
              </h3>
              {badge}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {subtitle || `${processedItems.length} élément(s)`}
            </p>
          </div>

          {actionButtons && (
            <div className="flex flex-wrap items-center gap-2 max-w-full min-w-0">
              {actionButtons}
            </div>
          )}
        </div>
      )}

      {/* Barre d'outils de filtres responsive */}
      <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full max-w-full min-w-0">
        <div className="min-w-0 w-full max-w-full relative">
          <input
            value={search}
            onChange={(event) => handleSearchChange(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full min-w-0 max-w-full truncate rounded-lg border border-gray-300 bg-white pl-10 pr-9 py-2.5 text-sm text-gray-800 shadow-xs placeholder:text-gray-400 focus:border-red-400 focus:outline-hidden focus:ring-3 focus:ring-red-500/10"
          />
          <i className="ri-search-line absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"></i>
          {search && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              <i className="ri-close-line text-base"></i>
            </button>
          )}
        </div>

        {filters && filters.map((filter) => (
          <div key={filter.key} className="min-w-0 w-full max-w-full">
            <select
              value={activeFilters[filter.key] || 'all'}
              onChange={(event) => handleFilterChange(filter.key, event.target.value)}
              className="h-11 w-full min-w-0 max-w-full truncate rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 shadow-xs focus:border-red-400 focus:outline-hidden focus:ring-3 focus:ring-red-500/10 cursor-pointer"
            >
              <option value="all">Toutes options ({filter.label})</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Table responsive */}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="border-y border-gray-100">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`py-3 px-4 text-start text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  } ${col.sortable ? 'cursor-pointer select-none hover:text-gray-800 transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`inline-flex items-center gap-1.5 ${
                    col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{col.label}</span>
                    {col.sortable && (
                      sortKey === col.key ? (
                        sortOrder === 'asc' ? (
                          <i className="ri-arrow-up-line text-red-600 text-sm"></i>
                        ) : (
                          <i className="ri-arrow-down-line text-red-600 text-sm"></i>
                        )
                      ) : (
                        <i className="ri-arrow-up-down-line text-gray-400 text-xs"></i>
                      )
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-sm text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-gray-50/70 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`py-3 px-4 text-sm text-gray-700 ${
                        col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                      }`}
                    >
                      {col.render ? col.render(item) : (item as any)[col.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination en bas */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-gray-100 pt-3">
        <div className="text-sm text-gray-500">
          Affichage de <span className="font-semibold text-gray-800">{totalItems === 0 ? 0 : startIndex + 1}</span> à{' '}
          <span className="font-semibold text-gray-800">{endIndex}</span> sur{' '}
          <span className="font-semibold text-gray-800">{totalItems}</span> élément(s)
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <span className="text-xs">Lignes :</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 rounded-lg border border-gray-300 bg-white px-2.5 text-xs font-medium text-gray-700 focus:outline-hidden focus:border-red-400 cursor-pointer"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Première page"
            >
              <i className="ri-arrow-left-double-line text-base"></i>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Précédent"
            >
              <i className="ri-arrow-left-s-line text-base"></i>
            </button>

            <span className="px-3.5 py-1.5 text-xs font-semibold text-gray-800 bg-gray-50 border border-gray-200 rounded-lg">
              Page {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalItems === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Suivant"
            >
              <i className="ri-arrow-right-s-line text-base"></i>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalItems === 0}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Dernière page"
            >
              <i className="ri-arrow-right-double-line text-base"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
