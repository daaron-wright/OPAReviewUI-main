'use client';

import { useState } from 'react';
import type {
  ConflictFilter,
  ConflictSeverity,
  ConflictType,
  ConflictStatus,
} from '@/domain/conflicts/types';
import { Icon, IconName } from '../icon';

interface ConflictFiltersProps {
  readonly activeFilter: ConflictFilter;
  readonly onFilterChange: (filter: ConflictFilter) => void;
  readonly conflictCount: number;
}

export function ConflictFilters({
  activeFilter,
  onFilterChange,
  conflictCount,
}: ConflictFiltersProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState(activeFilter.searchTerm ?? '');
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  const severityOptions: ConflictSeverity[] = ['critical', 'high', 'medium', 'low'];
  const statusOptions: ConflictStatus[] = [
    'active',
    'investigating',
    'resolving',
    'resolved',
    'ignored',
    'false-positive',
  ];
  const typeOptions: ConflictType[] = [
    'rule-contradiction',
    'overlapping-conditions',
    'circular-dependency',
    'unreachable-rule',
    'ambiguous-precedence',
    'data-inconsistency',
    'performance-conflict',
    'compliance-violation',
  ];

  const updateFilter = (updates: Partial<ConflictFilter>): void => {
    onFilterChange({ ...activeFilter, ...updates });
  };

  const clearAllFilters = (): void => {
    setSearchTerm('');
    onFilterChange({});
  };

  const togglePanel = (): void => {
    setIsPanelOpen((previous) => !previous);
  };

  const handleSearch = (): void => {
    updateFilter({ searchTerm: searchTerm.trim() || undefined });
  };

  const toggleArrayFilter = <T extends string>(
    key: keyof ConflictFilter,
    value: T,
    currentArray: T[] = [],
  ): void => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item) => item !== value)
      : [...currentArray, value];

    updateFilter({ [key]: newArray.length > 0 ? newArray : undefined });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 rounded-2xl bg-slate-50/80 p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-slate-900">Conflict filters</h3>
            <p className="text-sm text-slate-500">
              Refine results by severity, workflow stage, and conflict status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={togglePanel}
              type="button"
              aria-expanded={isPanelOpen}
              aria-controls="conflict-filters-panel"
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 ${
                isPanelOpen
                  ? 'border-emerald-200 bg-white text-emerald-600 hover:border-emerald-300'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <svg
                  className={`h-3 w-3 transition-transform ${isPanelOpen ? 'rotate-0' : '-rotate-90'}`}
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                >
                  <path d="M4 6L8 10L12 6" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              {isPanelOpen ? 'Collapse filters' : 'Expand filters'}
            </button>
            <button
              onClick={clearAllFilters}
              type="button"
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
            >
              Clear all
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            {conflictCount} conflict{conflictCount === 1 ? '' : 's'}
          </span>
          <span className="text-slate-400">match your current filters.</span>
        </div>
      </header>

      <div
        id="conflict-filters-panel"
        className={`space-y-6 overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${
          isPanelOpen ? 'max-h-[4000px] opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
        aria-hidden={!isPanelOpen}
      >
        <section className="space-y-2">
        <label htmlFor="conflict-search" className="text-sm font-medium text-slate-600">
          Search conflicts
        </label>
        <div className="flex gap-2">
          <input
            id="conflict-search"
            type="text"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleSearch();
              }
            }}
            placeholder="Search by applicant, description, or policy"
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          />
          <button
            onClick={handleSearch}
            type="button"
            className="inline-flex items-center justify-center rounded-2xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-100"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="sr-only">Apply search</span>
          </button>
        </div>
        </section>

        <FilterSection title="Severity" icon="alarm">
        {severityOptions.map((severity) => (
          <FilterCheckbox
            key={severity}
            label={toTitleCase(severity)}
            checked={activeFilter.severity?.includes(severity) ?? false}
            onChange={() => toggleArrayFilter('severity', severity, activeFilter.severity)}
            tone={getSeverityTone(severity)}
          />
        ))}
      </FilterSection>

        <FilterSection title="Status" icon="chart">
        {statusOptions.map((status) => (
          <FilterCheckbox
            key={status}
            label={toTitleCase(status.replace('-', ' '))}
            checked={activeFilter.status?.includes(status) ?? false}
            onChange={() => toggleArrayFilter('status', status, activeFilter.status)}
            tone={getStatusTone(status)}
          />
        ))}
      </FilterSection>

        <FilterSection title="Conflict type" icon="wrench">
        {typeOptions.map((type) => (
          <FilterCheckbox
            key={type}
            label={type
              .split('-')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')}
            checked={activeFilter.type?.includes(type) ?? false}
            onChange={() => toggleArrayFilter('type', type, activeFilter.type)}
            tone="text-sky-600"
          />
        ))}
      </FilterSection>

        <section className="space-y-3">
        <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-600">
          <Icon name="bolt" className="h-4 w-4 text-amber-500" />
          Quick filters
        </h4>
        <div className="grid gap-2">
          <QuickFilterButton
            label="Critical only"
            active={activeFilter.severity?.length === 1 && activeFilter.severity[0] === 'critical'}
            onClick={() => updateFilter({ severity: ['critical'] })}
          />
          <QuickFilterButton
            label="Active issues"
            active={activeFilter.status?.length === 1 && activeFilter.status[0] === 'active'}
            onClick={() => updateFilter({ status: ['active'] })}
          />
          <QuickFilterButton
            label="Rule conflicts"
            active={Boolean(activeFilter.type?.includes('rule-contradiction'))}
            onClick={() => updateFilter({ type: ['rule-contradiction', 'overlapping-conditions'] })}
          />
          <QuickFilterButton
            label="Compliance risks"
            active={Boolean(activeFilter.type?.includes('compliance-violation'))}
            onClick={() => updateFilter({ type: ['compliance-violation'] })}
          />
        </div>
        </section>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  readonly title: string;
  readonly icon: IconName;
  readonly children: React.ReactNode;
}

function FilterSection({ title, icon, children }: FilterSectionProps): JSX.Element {
  return (
    <section className="space-y-3 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        {title}
      </h4>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

interface FilterCheckboxProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: () => void;
  readonly tone: string;
}

function FilterCheckbox({ label, checked, onChange, tone }: FilterCheckboxProps): JSX.Element {
  return (
    <label className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 transition hover:border-slate-200 hover:bg-slate-50">
      <span className={`text-sm font-medium ${checked ? tone : 'text-slate-500'}`}>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-400"
      />
    </label>
  );
}

interface QuickFilterButtonProps {
  readonly label: string;
  readonly active: boolean;
  readonly onClick: () => void;
}

function QuickFilterButton({ label, active, onClick }: QuickFilterButtonProps): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-2 text-left text-sm font-semibold transition hover:shadow-sm ${
        active
          ? 'border border-emerald-400 bg-emerald-50 text-emerald-600'
          : 'border border-slate-200 bg-white text-slate-500 hover:border-emerald-200'
      }`}
    >
      {label}
    </button>
  );
}

function toTitleCase(value: string): string {
  return value
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function getSeverityTone(severity: ConflictSeverity): string {
  const tones: Record<ConflictSeverity, string> = {
    critical: 'text-rose-600',
    high: 'text-amber-600',
    medium: 'text-sky-600',
    low: 'text-emerald-600',
  };

  return tones[severity];
}

function getStatusTone(status: ConflictStatus): string {
  const tones: Record<ConflictStatus, string> = {
    active: 'text-rose-600',
    investigating: 'text-amber-600',
    resolving: 'text-sky-600',
    resolved: 'text-emerald-600',
    ignored: 'text-slate-500',
    'false-positive': 'text-violet-600',
  };

  return tones[status];
}
