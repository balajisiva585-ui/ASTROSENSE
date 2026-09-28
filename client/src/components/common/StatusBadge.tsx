import React from 'react';
import { ActivityType, AstronautStatus, CommStatus, SyncStatus } from '../../types';

export const StatusBadge: React.FC<{
  type: 'comm' | 'status' | 'sync' | 'activity' | 'mode';
  value: string;
  className?: string;
}> = ({ type, value, className = '' }) => {
  let colorClasses = 'bg-slate-800 text-slate-300 border-slate-700';

  if (type === 'comm') {
    if (value === 'ONLINE') colorClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    else if (value === 'DEGRADED') colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    else colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-500/50';
  } else if (type === 'status') {
    if (value === 'NORMAL') colorClasses = 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50';
    else if (value === 'WARNING') colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    else colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-500/50 animate-pulse';
  } else if (type === 'sync') {
    if (value === 'SYNCED') colorClasses = 'bg-cyan-950/80 text-cyan-300 border-cyan-500/50';
    else colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
  } else if (type === 'activity') {
    if (value === 'EXERCISING') colorClasses = 'bg-purple-950/80 text-purple-300 border-purple-500/50';
    else if (value === 'WORKING' || value === 'OPERATING_EQUIPMENT') colorClasses = 'bg-blue-950/80 text-blue-300 border-blue-500/50';
    else if (value === 'FALL_ABNORMAL_MOVEMENT') colorClasses = 'bg-rose-950/80 text-rose-300 border-rose-500/50 font-bold';
    else if (value === 'LONG_INACTIVITY') colorClasses = 'bg-amber-950/80 text-amber-300 border-amber-500/50';
    else colorClasses = 'bg-slate-800 text-cyan-300 border-cyan-800/60';
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border font-medium ${colorClasses} ${className}`}
    >
      {value.replace(/_/g, ' ')}
    </span>
  );
};
