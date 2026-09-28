import React from 'react';
import { useMission } from '../../context/MissionContext';
import { TelemetryCard } from '../common/TelemetryCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  Send,
  Database,
  Radio,
  CheckCircle2,
  AlertOctagon,
  ArrowUpRight,
} from 'lucide-react';

export const CommStatusPanel: React.FC = () => {
  const { session, syncState, setComm, triggerSyncNow } = useMission();

  const isOffline = session?.commStatus === 'OFFLINE';
  const isSyncing = session?.isSyncing || syncState?.isSyncing;
  const syncProgress = session?.syncProgress || syncState?.syncProgress || 100;
  const unsyncedCount = session?.unsyncedEventCount || 0;

  return (
    <TelemetryCard
      title="COMMUNICATION & DELAY-TOLERANT SYNC LINK"
      subtitle="Deep Space Network RF Ground Link Subsystem"
      badge={<StatusBadge type="comm" value={session?.commStatus || 'ONLINE'} />}
      glow={isOffline ? 'amber' : 'green'}
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Status Highlight Banner */}
        <div
          className={`p-3.5 rounded-xl border transition-all ${
            isOffline
              ? 'bg-amber-950/60 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {isOffline ? (
                <WifiOff className="w-5 h-5 text-amber-400 animate-pulse" />
              ) : (
                <Wifi className="w-5 h-5 text-emerald-400" />
              )}
              <span className="font-bold tracking-wider text-sm">
                {isOffline ? 'COMMUNICATION LINK LOST' : 'GROUND LINK ACTIVE'}
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-space-950/80 border border-space-800">
              {isOffline ? 'BLACKOUT SIMULATED' : 'DOWNLINK READY'}
            </span>
          </div>

          <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
            {isOffline ? (
              <span className="text-amber-200/90 font-medium">
                Autonomous Onboard Mode Active. Ground Mission Control is currently unreachable. Real-time Edge AI inference continues locally without telemetry interruption. Events are safely queued in local storage.
              </span>
            ) : (
              <span className="text-emerald-200/90 font-medium">
                Telemetry downlink to Earth Ground Mission Control operational. Real-time event propagation and historical batch synchronization available.
              </span>
            )}
          </p>
        </div>

        {/* Action Controls: Simulate Loss & Restore */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setComm('OFFLINE')}
            disabled={isOffline}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border font-bold tracking-wider transition-all ${
              isOffline
                ? 'bg-space-950 border-space-800 text-slate-600 cursor-not-allowed'
                : 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/60 text-amber-300 shadow-hud-amber active:scale-95'
            }`}
          >
            <WifiOff className="w-4 h-4" />
            <span>SIMULATE COMM LOSS</span>
          </button>

          <button
            onClick={() => setComm('ONLINE')}
            disabled={!isOffline}
            className={`flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-lg border font-bold tracking-wider transition-all ${
              !isOffline
                ? 'bg-space-950 border-space-800 text-slate-600 cursor-not-allowed'
                : 'bg-emerald-950/80 hover:bg-emerald-900 border-emerald-500/60 text-emerald-300 shadow-hud-green active:scale-95'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>RESTORE COMMUNICATION</span>
          </button>
        </div>

        {/* Offline Queue & Sync State */}
        <div className="bg-space-950 p-3 rounded-xl border border-space-800 space-y-2.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unsynchronized Local Events:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-bold px-2 py-0.5 rounded border ${
                unsyncedCount > 0 ? 'bg-amber-950 text-amber-300 border-amber-500/60 animate-pulse' : 'bg-space-900 text-slate-400 border-space-800'
              }`}>
                {unsyncedCount}
              </span>
            </div>
          </div>

          {/* Sync Progress Bar */}
          {isSyncing && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
                  <span>SYNCING MISSION TELEMETRY...</span>
                </span>
                <span className="font-bold">{syncProgress}%</span>
              </div>
              <div className="w-full bg-space-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
                  style={{ width: `${syncProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Sync Now Trigger Button */}
          {!isSyncing && unsyncedCount > 0 && !isOffline && (
            <button
              onClick={triggerSyncNow}
              className="w-full mt-2 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold text-xs transition-all shadow-hud-cyan"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>SYNC {unsyncedCount} PENDING EVENTS TO GROUND</span>
            </button>
          )}

          {!isSyncing && unsyncedCount === 0 && (
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-400/90 pt-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>All local mission telemetry synchronized with Ground Control.</span>
            </div>
          )}
        </div>
      </div>
    </TelemetryCard>
  );
};
