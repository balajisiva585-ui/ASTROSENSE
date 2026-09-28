import React from 'react';
import { useMission } from '../../context/MissionContext';
import { TelemetryCard } from '../common/TelemetryCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  WifiOff,
  Wifi,
  Radio,
  FileSpreadsheet,
} from 'lucide-react';

export const RealtimeTimeline: React.FC = () => {
  const { events, session, setTab } = useMission();

  const isOffline = session?.commStatus === 'OFFLINE';
  const recentEvents = events.slice(0, 8);

  return (
    <TelemetryCard
      title="REALTIME MISSION TIMELINE & AUDIT LOG"
      subtitle="Local Sequential Event Stream with Sync State Tracking"
      badge={
        <span className="text-[11px] font-mono text-cyan-400 bg-space-950 px-2.5 py-0.5 rounded border border-space-800">
          TOTAL LOGGED: {events.length}
        </span>
      }
      action={
        <button
          onClick={() => setTab('timeline')}
          className="text-xs font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-4"
        >
          View Full Log
        </button>
      }
    >
      <div className="space-y-2.5 font-mono text-xs">
        {recentEvents.length === 0 ? (
          <div className="text-center py-6 text-slate-500 text-xs">
            No mission events logged yet.
          </div>
        ) : (
          recentEvents.map(evt => {
            const isCritical = evt.severity === 'CRITICAL';
            const isWarning = evt.severity === 'WARNING';
            const isPending = evt.syncStatus === 'PENDING';

            return (
              <div
                key={evt.id}
                className={`p-2.5 rounded-lg border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 ${
                  isCritical
                    ? 'bg-rose-950/60 border-rose-500/60 text-rose-200'
                    : isWarning
                    ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                    : 'bg-space-950/80 border-space-800 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400 font-bold tracking-tight">
                    {evt.displayTime}
                  </span>

                  <StatusBadge type="activity" value={evt.activity} />

                  <span className="text-[11px] text-slate-400 truncate max-w-xs sm:max-w-md">
                    {evt.details}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span className="text-[10px] text-slate-500 uppercase px-1.5 py-0.5 rounded bg-space-900 border border-space-800">
                    {evt.module.replace(/_/g, ' ')}
                  </span>

                  <StatusBadge type="sync" value={evt.syncStatus} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </TelemetryCard>
  );
};
