import React from 'react';
import { useMission } from '../../context/MissionContext';
import { ShieldAlert, AlertTriangle, Radio, CheckCircle, WifiOff } from 'lucide-react';

export const AlertBanner: React.FC = () => {
  const { session, anomalies, resolveAnomalyAlert } = useMission();

  const isOffline = session?.commStatus === 'OFFLINE';
  const unresolvedAnomalies = anomalies.filter(a => !a.resolved);
  const criticalAnomaly = unresolvedAnomalies.find(a => a.severity === 'CRITICAL');
  const warningAnomaly = unresolvedAnomalies.find(a => a.severity === 'WARNING');

  return (
    <div className="space-y-2 mb-4">
      {/* Autonomous Mode Banner */}
      {isOffline && (
        <div className="relative bg-amber-950/80 border border-amber-500/60 rounded-xl p-4 shadow-hud-amber animate-pulse-slow">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/40">
                <WifiOff className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
                    AUTONOMOUS ONBOARD MODE ACTIVE
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/60 text-amber-200 border border-amber-700/50">
                    ZERO EARTH LINK
                  </span>
                </div>
                <p className="text-xs text-amber-200/80 mt-0.5">
                  Spacecraft communication link lost. Local Edge AI inference and safety event generation continue autonomously without ground dependence.
                </p>
              </div>
            </div>
            <div className="text-right text-xs font-mono text-amber-300">
              <span>UNSYNCED EVENTS: </span>
              <span className="font-bold text-base px-2 py-0.5 bg-amber-900/80 rounded border border-amber-600/60">
                {session?.unsyncedEventCount || 0}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Critical Safety Anomaly Alert */}
      {criticalAnomaly && (
        <div className="relative bg-rose-950/90 border border-rose-500 rounded-xl p-4 shadow-hud-rose animate-bounce-short">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300 bg-rose-900/80 px-2 py-0.5 rounded border border-rose-700">
                    {criticalAnomaly.category}
                  </span>
                  <span className="text-xs font-mono text-rose-200">{criticalAnomaly.displayTime} UTC</span>
                </div>
                <h4 className="text-sm font-semibold text-white mt-1">{criticalAnomaly.title}</h4>
                <p className="text-xs text-rose-200/90 mt-0.5">{criticalAnomaly.description}</p>
                <p className="text-[11px] text-rose-300/80 mt-1 font-mono italic">
                  Action: {criticalAnomaly.recommendedAction}
                </p>
              </div>
            </div>
            <button
              onClick={() => resolveAnomalyAlert(criticalAnomaly.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-medium shadow-md transition-all self-end sm:self-center"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Acknowledge Alert</span>
            </button>
          </div>
        </div>
      )}

      {/* Warning Anomaly Alert (if no critical) */}
      {!criticalAnomaly && warningAnomaly && (
        <div className="relative bg-amber-950/70 border border-amber-500/50 rounded-xl p-3.5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-300">
                    {warningAnomaly.category}
                  </span>
                  <span className="text-xs font-mono text-amber-300/70">{warningAnomaly.displayTime} UTC</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-100 mt-0.5">{warningAnomaly.title}</h4>
                <p className="text-xs text-amber-200/80">{warningAnomaly.description}</p>
              </div>
            </div>
            <button
              onClick={() => resolveAnomalyAlert(warningAnomaly.id)}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-600/80 hover:bg-amber-600 text-white text-xs font-mono transition-all self-end sm:self-center"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Dismiss</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
