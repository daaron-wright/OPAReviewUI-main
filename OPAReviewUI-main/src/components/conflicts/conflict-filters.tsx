/**
 * Conflict Filters Component
 * Advanced filtering sidebar for policy conflicts
 */
'use client';

import { useState } from 'react';
import type { ConflictFilter, ConflictSeverity, ConflictType, ConflictStatus } from '@/domain/conflicts/types';

interface ConflictFiltersProps {
  readonly activeFilter: ConflictFilter;
  readonly onFilterChange: (filter: ConflictFilter) => void;
  readonly conflictCount: number;
}

export function ConflictFilters({ 
  activeFilter, 
  onFilterChange, 
  conflictCount 
}: ConflictFiltersProps): JSX.Element {
  const [searchTerm, setSearchTerm] = useState(activeFilter.searchTerm || '');

  const severityOptions: ConflictSeverity[] = ['critical', 'high', 'medium', 'low'];
  const statusOptions: ConflictStatus[] = ['active', 'investigating', 'resolving', 'resolved', 'ignored', 'false-positive'];
  const typeOptions: ConflictType[] = [
    'rule-contradiction',
    'overlapping-conditions', 
    'circular-dependency',
    'unreachable-rule',
    'ambiguous-precedence',
    'data-inconsistency',
    'performance-conflict',
    'compliance-violation'
  ];

  const updateFilter = (updates: Partial<ConflictFilter>): void => {
    onFilterChange({ ...activeFilter, ...updates });
  };

  const clearAllFilters = (): void => {
    setSearchTerm('');
    onFilterChange({});
  };

  const handleSearch = (): void => {
    updateFilter({ searchTerm: searchTerm.trim() || undefined });
  };

  const toggleArrayFilter = <T extends string>(
    key: keyof ConflictFilter,
    value: T,
    currentArray: T[] = []
  ): void => {
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    updateFilter({ [key]: newArray.length > 0 ? newArray : undefined });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Conflict Filters</h3>
        <button
          onClick={clearAllFilters}
          className="text-xs text-red-400 hover:text-red-300 transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Results Count */}
      <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{conflictCount}</div>
          <div className="text-xs text-slate-400">Conflicts Found</div>
        </div>
      </div>

      {/* Search */}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Search Conflicts
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search by title, description..."
            className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white text-sm focus:border-red-500 focus:outline-none"
          />
          <button
            onClick={handleSearch}
            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Severity Filter */}
      <FilterSection title="Severity" icon="🚨">
        {severityOptions.map((severity) => (
          <FilterCheckbox
            key={severity}
            label={severity.charAt(0).toUpperCase() + severity.slice(1)}
            checked={activeFilter.severity?.includes(severity) || false}
            onChange={() => toggleArrayFilter('severity', severity, activeFilter.severity)}
            color={getSeverityColor(severity)}
          />
        ))}
      </FilterSection>

      {/* Status Filter */}
      <FilterSection title="Status" icon="📊">
        {statusOptions.map((status) => (
          <FilterCheckbox
            key={status}
            label={status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
            checked={activeFilter.status?.includes(status) || false}
            onChange={() => toggleArrayFilter('status', status, activeFilter.status)}
            color={getStatusColor(status)}
          />
        ))}
      </FilterSection>

      {/* Conflict Type Filter */}
      <FilterSection title="Conflict Type" icon="⚙️">
        {typeOptions.map((type) => (
          <FilterCheckbox
            key={type}
            label={type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
            checked={activeFilter.type?.includes(type) || false}
            onChange={() => toggleArrayFilter('type', type, activeFilter.type)}
            color="text-blue-400"
          />
        ))}
      </FilterSection>

      {/* Quick Filters */}
      <div>
        <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
          <span>⚡</span>
          Quick Filters
        </h4>
        <div className="space-y-2">
          <QuickFilterButton
            label="Critical Only"
            active={activeFilter.severity?.length === 1 && activeFilter.severity[0] === 'critical'}
            onClick={() => updateFilter({ severity: ['critical'] })}
          />
          <QuickFilterButton
            label="Active Issues"
            active={activeFilter.status?.length === 1 && activeFilter.status[0] === 'active'}
            onClick={() => updateFilter({ status: ['active'] })}
          />
          <QuickFilterButton
            label="Rule Conflicts"
            active={activeFilter.type?.includes('rule-contradiction') || false}
            onClick={() => updateFilter({ type: ['rule-contradiction', 'overlapping-conditions'] })}
          />
          <QuickFilterButton
            label="Compliance Risks"
            active={activeFilter.type?.includes('compliance-violation') || false}
            onClick={() => updateFilter({ type: ['compliance-violation'] })}
          />
        </div>
      </div>
    </div>
  );
}

interface FilterSectionProps {
  readonly title: string;
  readonly icon: string;
  readonly children: React.ReactNode;
}

function FilterSection({ title, icon, children }: FilterSectionProps): JSX.Element {
  return (
    <div>
      <h4 className="text-sm font-medium text-slate-300 mb-3 flex items-center gap-2">
        <span>{icon}</span>
        {title}
      </h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

interface FilterCheckboxProps {
  readonly label: string;
  readonly checked: boolean;
  readonly onChange: () => void;
  readonly color: string;
}

function FilterCheckbox({ label, checked, onChange, color }: FilterCheckboxProps): JSX.Element {
  return (
    <label className="flex items-center gap-2 cursor-pointer hover:bg-slate-800/50 rounded p-1 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-red-600 bg-slate-800 border-slate-600 rounded focus:ring-red-500 focus:ring-2"
      />
      <span className={`text-sm ${checked ? color : 'text-slate-400'}`}>
        {label}
      </span>
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
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
        active
          ? 'bg-red-600 text-white'
          : 'bg-slate-800/50 text-slate-300 hover:bg-slate-700/50'
      }`}
    >
      {label}
    </button>
  );
}

function getSeverityColor(severity: ConflictSeverity): string {
  const colors = {
    critical: 'text-red-400',
    high: 'text-orange-400',
    medium: 'text-yellow-400',
    low: 'text-blue-400'
  };
  return colors[severity];
}

function getStatusColor(status: ConflictStatus): string {
  const colors = {
    active: 'text-red-400',
    investigating: 'text-yellow-400',
    resolving: 'text-blue-400',
    resolved: 'text-green-400',
    ignored: 'text-gray-400',
    'false-positive': 'text-purple-400'
  };
  return colors[status];
}
