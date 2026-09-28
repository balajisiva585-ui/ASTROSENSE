import React from 'react';
import { useMission } from '../../context/MissionContext';
import { TelemetryCard } from '../common/TelemetryCard';
import { StatusBadge } from '../common/StatusBadge';
import {
  Heart,
  Activity,
  Thermometer,
  Flame,
  UserCheck,
  Clock,
  Compass,
} from 'lucide-react';

export const AstronautStatusCard: React.FC = () => {
  const { astronaut, session } = useMission();

  if (!astronaut) return null;

  const vitals = astronaut.vitals || {
    heartRate: 74,
    spO2: 99,
    bodyTemp: 36.8,
    respiratoryRate: 15,
    metabolicKcalHour: 110,
  };

  const formatHours = (seconds: number) => {
    const hrs = (seconds / 3600).toFixed(1);
    return `${hrs} hrs`;
  };

  return (
    <TelemetryCard
      title="ASTRONAUT TELEMETRY & STATUS"
      subtitle={`${astronaut.id} • ${astronaut.name}`}
      badge={<StatusBadge type="status" value={astronaut.currentStatus} />}
      glow={astronaut.currentStatus === 'CRITICAL' ? 'rose' : astronaut.currentStatus === 'WARNING' ? 'amber' : 'cyan'}
    >
      <div className="space-y-4 font-mono text-xs">
        {/* Profile Overview */}
        <div className="flex items-center justify-between p-3 rounded-lg bg-space-950/80 border border-space-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-slate-100 text-sm">{astronaut.name}</div>
              <div className="text-[11px] text-slate-400">{astronaut.role}</div>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">Module</span>
            <span className="text-cyan-400 font-bold text-xs">{astronaut.currentModule.replace(/_/g, ' ')}</span>
          </div>
        </div>

        {/* Live Vitals Telemetry */}
        <div>
          <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider block mb-2">
            Physiological Biosensors
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Heart Rate */}
            <div className="bg-space-950 p-2.5 rounded-lg border border-space-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase">
                  <Heart className="w-3 h-3 text-rose-500 animate-pulse" />
                  <span>Heart Rate</span>
                </div>
                <div className="text-base font-bold text-rose-400 mt-0.5">
                  {vitals.heartRate} <span className="text-[10px] text-slate-400 font-normal">BPM</span>
                </div>
              </div>
            </div>

            {/* SpO2 */}
            <div className="bg-space-950 p-2.5 rounded-lg border border-space-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase">
                  <Activity className="w-3 h-3 text-cyan-400" />
                  <span>SpO2</span>
                </div>
                <div className="text-base font-bold text-cyan-300 mt-0.5">
                  {vitals.spO2} <span className="text-[10px] text-slate-400 font-normal">%</span>
                </div>
              </div>
            </div>

            {/* Body Temp */}
            <div className="bg-space-950 p-2.5 rounded-lg border border-space-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase">
                  <Thermometer className="w-3 h-3 text-amber-400" />
                  <span>Body Temp</span>
                </div>
                <div className="text-base font-bold text-amber-300 mt-0.5">
                  {vitals.bodyTemp} <span className="text-[10px] text-slate-400 font-normal">°C</span>
                </div>
              </div>
            </div>

            {/* Metabolic Burn */}
            <div className="bg-space-950 p-2.5 rounded-lg border border-space-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1 text-slate-400 text-[10px] uppercase">
                  <Flame className="w-3 h-3 text-orange-400" />
                  <span>Metabolic</span>
                </div>
                <div className="text-base font-bold text-orange-300 mt-0.5">
                  {vitals.metabolicKcalHour} <span className="text-[10px] text-slate-400 font-normal">kcal/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Activity Breakdown Stats */}
        <div className="pt-2 border-t border-space-800">
          <span className="text-[10px] uppercase text-slate-400 font-semibold tracking-wider block mb-2">
            Mission Day Cumulative Activity
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-space-950 p-2 rounded-lg border border-space-800">
              <span className="text-[10px] text-slate-400 block">Total Active</span>
              <span className="font-bold text-cyan-400">{formatHours(astronaut.stats.totalActiveSeconds)}</span>
            </div>
            <div className="bg-space-950 p-2 rounded-lg border border-space-800">
              <span className="text-[10px] text-slate-400 block">Exercise</span>
              <span className="font-bold text-purple-400">{formatHours(astronaut.stats.exerciseSeconds)}</span>
            </div>
            <div className="bg-space-950 p-2 rounded-lg border border-space-800">
              <span className="text-[10px] text-slate-400 block">Science / Work</span>
              <span className="font-bold text-blue-400">{formatHours(astronaut.stats.workingSeconds)}</span>
            </div>
            <div className="bg-space-950 p-2 rounded-lg border border-space-800">
              <span className="text-[10px] text-slate-400 block">Sleep Rest</span>
              <span className="font-bold text-emerald-400">{formatHours(astronaut.stats.sleepingSeconds)}</span>
            </div>
          </div>
        </div>
      </div>
    </TelemetryCard>
  );
};
