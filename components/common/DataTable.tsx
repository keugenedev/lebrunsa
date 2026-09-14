'use client';

import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown, 
  X, 
  SlidersHorizontal 
} from 'lucide-react';

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
    <div className="space-y-4">
      {/* Table Header Section */}
      {(title || actionButtons) && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {title && (
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold tracking-tight text-slate-800">{title}</h2>
                {badge}
              </div>
            )}
            {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
          </div>
          {actionButtons && <div className="flex items-center gap-2.5">{actionButtons}</div>}
        </div>
      )}

      {/* Control Bar: Search & Filters */}
      <div className="lebron-card p-3.5 flex flex-col md:flex-row items-center justify-between gap-3 bg-white">
        <div className="flex items-center gap-3 w-full md:w-auto flex-1">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-9 pr-8 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all"
            />
            {search && (
              <button
                onClick={() => handleSearchChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters */}
          {filters && filters.map(filter => (
            <div key={filter.key} className="shrink-0">
              <select
                value={activeFilters[filter.key] || 'all'}
                onChange={(e) => handleFilterChange(filter.key, e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
              >
                <option value="all">Tous ({filter.label})</option>
                {filter.options.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Rows per page selector */}
        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0 self-end md:self-center">
          <span>Lignes par page :</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="px-2 py-1 rounded bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="lebron-card overflow-hidden bg-white border border-slate-200 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50/90 text-slate-500 uppercase text-[11px] tracking-wider border-b border-slate-200 font-medium select-none">
              <tr>
                {columns.map(col => (
                  <th
                    key={col.key}
                    style={{ width: col.width }}
                    className={`px-4 py-3.5 ${
                      col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'
                    } ${col.sortable ? 'cursor-pointer hover:bg-slate-100/70 transition-colors' : ''}`}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <div className={`inline-flex items-center gap-1.5 ${
                      col.align === 'center' ? 'justify-center' : col.align === 'right' ? 'justify-end' : 'justify-start'
                    }`}>
                      <span>{col.label}</span>
                      {col.sortable && (
                        sortKey === col.key ? (
                          sortOrder === 'asc' ? (
                            <ArrowUp className="w-3.5 h-3.5 text-red-600" />
                          ) : (
                            <ArrowDown className="w-3.5 h-3.5 text-red-600" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 text-slate-400" />
                        )
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {paginatedItems.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-400 text-xs">
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
                    {columns.map(col => (
                      <td
                        key={col.key}
                        className={`px-4 py-3.5 ${
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

        {/* Pagination Bar */}
        <div className="px-4 py-3 bg-slate-50/80 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Affichage de <strong className="text-slate-800 font-medium">{totalItems === 0 ? 0 : startIndex + 1}</strong> à{' '}
            <strong className="text-slate-800 font-medium">{endIndex}</strong> sur{' '}
            <strong className="text-slate-800 font-medium">{totalItems}</strong> éléments
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              title="Première page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              title="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 font-medium text-slate-700 bg-white border border-slate-200 rounded-lg text-xs">
              Page {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalItems === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              title="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalItems === 0}
              className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-600"
              title="Dernière page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
