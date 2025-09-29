/**
 * Environment Status Component
 * Displays OPA environment health and server clusters
 */
'use client';

import type { PolicyEnvironment } from '@/domain/dashboard/enterprise-types';
import { Icon, IconName } from '../icon';

interface EnvironmentStatusProps {
  readonly environments: PolicyEnvironment[];
}

export function EnvironmentStatus({ environments }: EnvironmentStatusProps): JSX.Element {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white">Environment Status</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {environments.map((env) => (
          <EnvironmentCard key={env.id} environment={env} />
        ))}
      </div>
    </div>
  );
}

interface EnvironmentCardProps {
  readonly environment: PolicyEnvironment;
}

function EnvironmentCard({ environment }: EnvironmentCardProps): JSX.Element {
  const statusColors = {
    healthy: 'bg-green-500/20 border-green-500/30',
    degraded: 'bg-yellow-500/20 border-yellow-500/30',
    down: 'bg-red-500/20 border-red-500/30'
  };

  const statusIcons: Record<PolicyEnvironment['status'], IconName> = {
    healthy: 'checkCircle',
    degraded: 'warningTriangle',
    down: 'xCircle',
  };

  const typeIcons: Record<PolicyEnvironment['type'], IconName> = {
    production: 'factory',
    staging: 'flask',
    development: 'laptop',
    testing: 'microscope',
  };

  return (
    <div className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border ${statusColors[environment.status]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl text-white/90">
            <Icon name={typeIcons[environment.type]} className="h-7 w-7" />
          </span>
          <div>
            <h3 className="font-semibold text-white">{environment.name}</h3>
            <p className="text-sm text-slate-400 capitalize">{environment.type}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-lg">{statusIcons[environment.status]}</span>
          <span className="text-sm font-medium text-white capitalize">{environment.status}</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-lg font-bold text-white">{environment.policyCount}</div>
          <div className="text-xs text-slate-400">Active Policies</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-white">
            {environment.opaServers.reduce((sum, cluster) => sum + cluster.servers.length, 0)}
          </div>
          <div className="text-xs text-slate-400">OPA Servers</div>
        </div>
      </div>
      
      <div className="space-y-3">
        {environment.opaServers.map((cluster) => (
          <ClusterInfo key={cluster.id} cluster={cluster} />
        ))}
      </div>
      
      <div className="text-xs text-slate-400 mt-4">
        Last health check: {new Date(environment.lastHealthCheck).toLocaleString()}
      </div>
    </div>
  );
}

interface ClusterInfoProps {
  readonly cluster: any;
}

function ClusterInfo({ cluster }: ClusterInfoProps): JSX.Element {
  const healthyServers = cluster.servers.filter((s: any) => s.status === 'healthy').length;
  const totalServers = cluster.servers.length;
  
  return (
    <div className="bg-slate-700/50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-white">{cluster.name}</h4>
        <div className="text-xs text-slate-400">{cluster.region}</div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 text-xs">
        <div>
          <div className="text-slate-400">Servers</div>
          <div className="text-white font-medium">{healthyServers}/{totalServers}</div>
        </div>
        <div>
          <div className="text-slate-400">Load</div>
          <div className="text-white font-medium">{cluster.currentLoad.toFixed(1)}%</div>
        </div>
        <div>
          <div className="text-slate-400">RPS</div>
          <div className="text-white font-medium">{cluster.loadBalancer.requestsPerSecond}</div>
        </div>
      </div>
      
      <div className="mt-2">
        <div className="flex justify-between text-xs text-slate-400 mb-1">
          <span>Capacity</span>
          <span>{cluster.currentLoad.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-600 rounded-full h-1.5">
          <div 
            className={`h-1.5 rounded-full ${
              cluster.currentLoad < 70 ? 'bg-green-500' : 
              cluster.currentLoad < 90 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${cluster.currentLoad}%` }}
          />
        </div>
      </div>
    </div>
  );
}
