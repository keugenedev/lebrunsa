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
  customFilters?: React.ReactNode;
  actionButtons?: React.ReactNode;
  defaultRowsPerPage?: number;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export default function DataTable<T extends { id: string }>({
  items = [],
  columns = [],
  title,
  badge,
  subtitle,
  searchPlaceholder = 'Rechercher...',
  searchFields,
  filters,
  customFilters,
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
    let result = Array.isArray(items) ? [...items] : [];

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(item => {
        if (!item) return false;
        if (searchFields && searchFields.length > 0) {
          return searchFields.some(field => {
            const val = (item as any)[field];
            return val !== undefined && val !== null && String(val).toLowerCase().includes(q);
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
        result = result.filter(item => item && String((item as any)[key]) === filterVal);
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
  const totalItems = (processedItems || []).length;
  const totalPages = Math.max(1, Math.ceil(totalItems / (rowsPerPage || 10)));
  const startIndex = (currentPage - 1) * (rowsPerPage || 10);
  const endIndex = Math.min(startIndex + (rowsPerPage || 10), totalItems);
  const paginatedItems = (processedItems || []).slice(startIndex, endIndex);

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-slate-200/90 bg-white p-5 sm:p-6 shadow-xs">
      {/* En-tête avec Titre à gauche, Boutons d'action à droite */}
      {(title || actionButtons) && (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full max-w-full min-w-0">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {title}
              </h3>
              {badge}
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
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

      {/* Barre d'outils de filtres responsive (personnalisée ou par défaut) */}
      {customFilters ? (
        <div className="mb-4">{customFilters}</div>
      ) : (
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full max-w-full min-w-0">
          <div className="min-w-0 w-full max-w-full relative">
            <input
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-9.5 w-full min-w-0 max-w-full truncate rounded-xl border border-slate-300 bg-slate-50/70 pl-9 pr-8 py-2 text-xs text-slate-800 shadow-2xs placeholder:text-slate-400 focus:bg-white focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600 transition-colors"
            />
            <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none"></i>
            {search && (
              <button
                type="button"
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <i className="ri-close-line text-sm"></i>
              </button>
            )}
          </div>

          {filters && filters.map((filter) => (
            <div key={filter.key} className="min-w-0 w-full max-w-full">
              <select
                value={activeFilters[filter.key] || 'all'}
                onChange={(event) => handleFilterChange(filter.key, event.target.value)}
                className="h-9.5 w-full min-w-0 max-w-full truncate rounded-xl border border-slate-300 bg-slate-50/70 px-3 py-2 text-xs text-slate-800 shadow-2xs focus:bg-white focus:border-red-600 focus:outline-hidden focus:ring-1 focus:ring-red-600 cursor-pointer transition-colors"
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
      )}

      {/* Table responsive */}
      <div className="max-w-full overflow-x-auto rounded-xl border border-slate-200/80">
        <table className="w-full text-left text-xs border-collapse min-w-full">
          <thead className="bg-slate-50/80 border-b border-slate-200">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width, minWidth: col.width }}
                  className={`py-2 px-3 text-start text-[11px] font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap ${
                    col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                  } ${col.sortable ? 'cursor-pointer select-none hover:text-slate-800 transition-colors' : ''}`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className={`inline-flex items-center ${
                    col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                  }`}>
                    <span>{col.label}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginatedItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-xs text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => onRowClick && onRowClick(item)}
                  className={`hover:bg-slate-50/80 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      style={{ width: col.width, minWidth: col.width }}
                      className={`py-2 px-3 text-xs text-slate-700 ${
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
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
        <div className="text-xs text-slate-500">
          Affichage de <span className="font-semibold text-slate-800">{totalItems === 0 ? 0 : startIndex + 1}</span> à{' '}
          <span className="font-semibold text-slate-800">{endIndex}</span> sur{' '}
          <span className="font-semibold text-slate-800">{totalItems}</span> élément(s)
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <span>Lignes :</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-8 rounded-lg border border-slate-300 bg-slate-50/70 px-2 text-xs font-medium text-slate-700 focus:outline-hidden focus:border-red-600 cursor-pointer"
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
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Première page"
            >
              <i className="ri-arrow-left-double-line text-xs"></i>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Précédent"
            >
              <i className="ri-arrow-left-s-line text-xs"></i>
            </button>

            <span className="px-2.5 py-1 text-xs font-medium text-slate-800 bg-slate-50 border border-slate-200 rounded-lg">
              Page {currentPage} / {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalItems === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Suivant"
            >
              <i className="ri-arrow-right-s-line text-xs"></i>
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalItems === 0}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition shadow-2xs"
              title="Dernière page"
            >
              <i className="ri-arrow-right-double-line text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
