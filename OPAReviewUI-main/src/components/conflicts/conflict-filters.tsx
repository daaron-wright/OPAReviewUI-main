import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import type {
  ConflictFilter,
  ConflictSeverity,
  ConflictStatus,
} from '@/domain/conflicts/types';

interface ConflictFiltersProps {
  readonly activeFilter: ConflictFilter;
  readonly onFilterChange: (filter: ConflictFilter) => void;
  readonly conflictCount: number;
}

interface FilterOption<T extends string> {
  readonly label: string;
  readonly value?: T;
}

const SEVERITY_OPTIONS: ReadonlyArray<FilterOption<ConflictSeverity>> = [
  { label: 'All severities' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
];

const STATUS_OPTIONS: ReadonlyArray<FilterOption<ConflictStatus>> = [
  { label: 'All statuses' },
  { label: 'Active', value: 'active' },
  { label: 'Investigating', value: 'investigating' },
  { label: 'Resolving', value: 'resolving' },
  { label: 'Resolved', value: 'resolved' },
  { label: 'Ignored', value: 'ignored' },
  { label: 'False positive', value: 'false-positive' },
];

export function ConflictFilters({
  activeFilter,
  onFilterChange,
  conflictCount,
}: ConflictFiltersProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState(activeFilter.searchTerm ?? '');

  useEffect(() => {
    setSearchTerm(activeFilter.searchTerm ?? '');
  }, [activeFilter.searchTerm]);

  const updateFilter = (updates: Partial<ConflictFilter>): void => {
    const merged = { ...activeFilter } as ConflictFilter & Record<string, unknown>;

    (Object.entries(updates) as Array<[
      keyof ConflictFilter,
      ConflictFilter[keyof ConflictFilter]
    ]>).forEach(([key, value]) => {
      if (typeof value === 'undefined') {
        delete merged[key as string];
      } else {
        merged[key as string] = value;
      }
    });

    onFilterChange(merged as ConflictFilter);
  };

  const clearAllFilters = (): void => {
    setSearchTerm('');
    onFilterChange({} as ConflictFilter);
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    const trimmed = searchTerm.trim();
    updateFilter(trimmed ? { searchTerm: trimmed } : {});
  };

  const handleSeverityChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value as ConflictSeverity | '';
    updateFilter(value ? { severity: [value] } : {});
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>): void => {
    const value = event.target.value as ConflictStatus | '';
    updateFilter({
      status: value ? [value] : undefined,
    });
  };

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Filters</h3>
          <p className="text-sm text-slate-500">Quickly narrow results or reset to view everything.</p>
        </div>
        <button
          onClick={clearAllFilters}
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-emerald-200 hover:text-emerald-600"
        >
          Clear all
        </button>
      </header>

      <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
        <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
        {conflictCount} conflict{conflictCount === 1 ? '' : 's'} match your filters
      </div>

      <form onSubmit={handleSearchSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <label className="sm:col-span-3">
            <span className="block text-sm font-medium text-slate-600">Search</span>
            <div className="mt-1 flex items-center rounded-full border border-[#dbe9e3] bg-white px-3 py-1.5 shadow-inner focus-within:border-[#0f766e] focus-within:ring-2 focus-within:ring-[#0f766e]/20">
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search conflicts"
                className="flex-1 rounded-full border-none bg-transparent px-2 py-1.5 text-sm text-slate-700 focus:outline-none"
              />
              <button
                type="submit"
                className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0f766e] text-white transition hover:bg-[#0c5f59] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                aria-label="Apply search"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </label>

          <label>
            <span className="block text-sm font-medium text-slate-600">Severity</span>
            <select
              value={activeFilter.severity?.[0] ?? ''}
              onChange={handleSeverityChange}
              className="mt-1 w-full rounded-full border border-[#dbe9e3] bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
            >
              {SEVERITY_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            <span className="block text-sm font-medium text-slate-600">Status</span>
            <select
              value={activeFilter.status?.[0] ?? ''}
              onChange={handleStatusChange}
              className="mt-1 w-full rounded-full border border-[#dbe9e3] bg-white px-3 py-2 text-sm text-slate-700 shadow-inner focus:border-[#0f766e] focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.label} value={option.value ?? ''}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </form>
    </section>
  );
}
