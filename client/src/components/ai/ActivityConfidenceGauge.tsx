import React from 'react';
import { ActivityType } from '../../types';
import { Cpu, Zap, Activity, Clock, ShieldCheck } from 'lucide-react';

interface ActivityConfidenceGaugeProps {
  activity: ActivityType;
  confidence: number;
  durationSeconds: number;
  inferenceLatencyMs?: number;
}

export const ActivityConfidenceGauge: React.FC<ActivityConfidenceGaugeProps> = ({
  activity,
  confidence,
  durationSeconds,
  inferenceLatencyMs = 24.5,
}) => {
  const isCritical = activity === 'FALL_ABNORMAL_MOVEMENT';
  const isWarning = activity === 'LONG_INACTIVITY';

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins}m ${s.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="bg-space-950/80 border border-space-800 rounded-xl p-4 font-mono">
      {/* Top Banner: Activity & Confidence */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-space-800">
        <div>
          <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
            Current Detected Activity
          </span>
          <h2 className={`text-xl font-bold tracking-wide mt-0.5 ${
            isCritical ? 'text-rose-400 animate-pulse' : isWarning ? 'text-amber-400' : 'text-cyan-300'
          }`}>
            {activity.replace(/_/g, ' ')}
          </h2>
        </div>

        <div className="text-left sm:text-right">
          <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider">
            Model Confidence
          </span>
          <div className="text-2xl font-bold text-slate-100 flex items-baseline gap-1 sm:justify-end">
            <span className="text-cyan-400">{confidence.toFixed(1)}</span>
            <span className="text-xs text-slate-400">%</span>
          </div>
        </div>
      </div>

      {/* Progress Bar for Confidence */}
      <div className="mt-3">
        <div className="w-full bg-space-800 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              isCritical
                ? 'bg-rose-500'
                : isWarning
                ? 'bg-amber-500'
                : 'bg-gradient-to-r from-cyan-500 to-blue-500'
            }`}
            style={{ width: `${Math.min(100, Math.max(0, confidence))}%` }}
          />
        </div>
      </div>

      {/* Edge AI Telemetry Chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 text-xs">
        <div className="bg-space-900/80 border border-space-800 p-2 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>Processing</span>
          </div>
          <div className="font-semibold text-slate-200 mt-0.5 text-[11px] truncate">
            ONBOARD EDGE AI
          </div>
        </div>

        <div className="bg-space-900/80 border border-space-800 p-2 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>Latency</span>
          </div>
          <div className="font-semibold text-slate-200 mt-0.5 text-[11px]">
            {inferenceLatencyMs} ms (INT8)
          </div>
        </div>

        <div className="bg-space-900/80 border border-space-800 p-2 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
            <Clock className="w-3 h-3 text-purple-400" />
            <span>Duration</span>
          </div>
          <div className="font-semibold text-slate-200 mt-0.5 text-[11px]">
            {formatDuration(durationSeconds)}
          </div>
        </div>

        <div className="bg-space-900/80 border border-space-800 p-2 rounded-lg">
          <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Integrity</span>
          </div>
          <div className="font-semibold text-emerald-300 mt-0.5 text-[11px]">
            AUTONOMOUS
          </div>
        </div>
      </div>
    </div>
  );
};
