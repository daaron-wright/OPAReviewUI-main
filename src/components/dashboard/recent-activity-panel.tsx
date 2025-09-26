/**
 * Recent Activity Panel Component
 * Displays recent OPA policy events and activities
 */
'use client';

import type { ActivityEvent } from '@/domain/dashboard/types';

interface RecentActivityPanelProps {
  readonly activities: ActivityEvent[];
}

export function RecentActivityPanel({ activities }: RecentActivityPanelProps): JSX.Element {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
      <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
      
      <div className="space-y-3">
        {activities.map((activity, idx) => (
          <ActivityItem key={`activity-${idx}`} activity={activity} />
        ))}
      </div>
    </div>
  );
}

interface ActivityItemProps {
  readonly activity: ActivityEvent;
}

function ActivityItem({ activity }: ActivityItemProps): JSX.Element {
  return (
    <div className="flex items-start gap-3">
      <ActivityIndicator status={activity.status} />
      <div className="flex-1 min-w-0">
        <div className="text-white text-sm">{activity.action}</div>
        <div className="text-gray-400 text-xs">{activity.policy}</div>
      </div>
      <div className="text-xs text-gray-400">{activity.time}</div>
    </div>
  );
}

interface ActivityIndicatorProps {
  readonly status: ActivityEvent['status'];
}

function ActivityIndicator({ status }: ActivityIndicatorProps): JSX.Element {
  const statusColors = {
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-blue-500'
  } as const;

  return (
    <div 
      className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${statusColors[status]}`}
      title={`Status: ${status}`}
    />
  );
}
