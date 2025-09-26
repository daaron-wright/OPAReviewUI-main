/**
 * Dashboard Sidebar Component
 * Navigation and filtering sidebar for enterprise dashboard
 */
'use client';

import type { PolicyCategory } from '@/domain/dashboard/enterprise-types';

interface DashboardSidebarProps {
  readonly categories: PolicyCategory[];
  readonly selectedCategory: string | null;
  readonly onCategorySelect: (categoryId: string | null) => void;
  readonly selectedView: string;
  readonly onViewChange: (view: 'overview' | 'policies' | 'compliance' | 'violations' | 'environments') => void;
}

export function DashboardSidebar({ 
  categories, 
  selectedCategory, 
  onCategorySelect,
  selectedView,
  onViewChange 
}: DashboardSidebarProps): JSX.Element {
  const quickActions = [
    { id: 'new-policy', label: 'New Policy Graph', icon: '➕', action: () => console.log('New policy') },
    { id: 'run-tests', label: 'Run All Tests', icon: '🧪', action: () => console.log('Run tests') },
    { id: 'export-data', label: 'Export Analytics', icon: '📊', action: () => console.log('Export data') },
    { id: 'settings', label: 'Dashboard Settings', icon: '⚙️', action: () => console.log('Settings') }
  ];

  return (
    <aside className="w-64 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 h-screen overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Policy Categories Filter */}
        {selectedView === 'policies' && (
          <div>
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
              Filter by Category
            </h3>
            <div className="space-y-1">
              <CategoryButton
                isSelected={selectedCategory === null}
                onClick={() => onCategorySelect(null)}
                icon="📁"
                label="All Categories"
                count={categories.length}
              />
              {categories.map((category) => (
                <CategoryButton
                  key={category.id}
                  isSelected={selectedCategory === category.id}
                  onClick={() => onCategorySelect(category.id)}
                  icon={category.icon}
                  label={category.name}
                  color={category.color}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-1">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className="w-full flex items-center gap-3 px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors text-left"
              >
                <span className="text-lg">{action.icon}</span>
                <span className="text-sm font-medium">{action.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            System Status
          </h3>
          <div className="space-y-3">
            <StatusIndicator
              label="OPA Servers"
              status="healthy"
              count="4/4"
            />
            <StatusIndicator
              label="Policy Sync"
              status="healthy"
              lastUpdate="2 min ago"
            />
            <StatusIndicator
              label="Compliance Check"
              status="warning"
              lastUpdate="1 hour ago"
            />
            <StatusIndicator
              label="Backup Status"
              status="healthy"
              lastUpdate="6 hours ago"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Recent Activity
          </h3>
          <div className="space-y-2">
            <ActivityItem
              action="Policy deployed"
              target="payment-authorization"
              time="5 min ago"
              type="success"
            />
            <ActivityItem
              action="Violation detected"
              target="user-access-control"
              time="12 min ago"
              type="warning"
            />
            <ActivityItem
              action="Test suite passed"
              target="data-classification"
              time="1 hour ago"
              type="success"
            />
          </div>
        </div>
      </div>
    </aside>
  );
}

interface CategoryButtonProps {
  readonly isSelected: boolean;
  readonly onClick: () => void;
  readonly icon: string;
  readonly label: string;
  readonly color?: string;
  readonly count?: number;
}

function CategoryButton({ isSelected, onClick, icon, label, color, count }: CategoryButtonProps): JSX.Element {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-left ${
        isSelected
          ? 'bg-blue-600 text-white'
          : 'text-slate-300 hover:text-white hover:bg-slate-700'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{label}</div>
        {count !== undefined && (
          <div className="text-xs opacity-75">{count} policies</div>
        )}
      </div>
      {color && !isSelected && (
        <div 
          className="w-2 h-2 rounded-full" 
          style={{ backgroundColor: color }}
        />
      )}
    </button>
  );
}

interface StatusIndicatorProps {
  readonly label: string;
  readonly status: 'healthy' | 'warning' | 'error';
  readonly count?: string;
  readonly lastUpdate?: string;
}

function StatusIndicator({ label, status, count, lastUpdate }: StatusIndicatorProps): JSX.Element {
  const statusColors = {
    healthy: 'text-green-400',
    warning: 'text-yellow-400',
    error: 'text-red-400'
  };

  const statusIcons = {
    healthy: '●',
    warning: '⚠',
    error: '●'
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className={`${statusColors[status]}`}>
          {statusIcons[status]}
        </span>
        <span className="text-sm text-slate-300">{label}</span>
      </div>
      <div className="text-xs text-slate-400">
        {count || lastUpdate}
      </div>
    </div>
  );
}

interface ActivityItemProps {
  readonly action: string;
  readonly target: string;
  readonly time: string;
  readonly type: 'success' | 'warning' | 'error' | 'info';
}

function ActivityItem({ action, target, time, type }: ActivityItemProps): JSX.Element {
  const typeColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  };

  return (
    <div className="flex items-start gap-2">
      <div className={`w-1.5 h-1.5 rounded-full mt-2 ${typeColors[type]}`} />
      <div className="flex-1 min-w-0">
        <div className="text-xs text-slate-300">{action}</div>
        <div className="text-xs text-slate-400 truncate">{target}</div>
        <div className="text-xs text-slate-500">{time}</div>
      </div>
    </div>
  );
}
