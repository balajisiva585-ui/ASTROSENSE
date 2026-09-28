import React from 'react';
import { Astronaut } from '../../types';
import {
  Users,
  Heart,
  Activity,
  MapPin,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
} from 'lucide-react';

interface CrewLiveStatusProps {
  crewList: Astronaut[];
}

export const CrewLiveStatus: React.FC<CrewLiveStatusProps> = ({ crewList }) => {
  const getSafetyBadge = (status: 'NORMAL' | 'WARNING' | 'CRITICAL') => {
    switch (status) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/60 text-[10px] font-mono font-bold animate-pulse">
            <AlertOctagon className="w-3 h-3" />
            CRITICAL SAFETY
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/60 text-[10px] font-mono font-bold">
            <AlertTriangle className="w-3 h-3" />
            CAUTION
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 text-[10px] font-mono font-semibold">
            <CheckCircle className="w-3 h-3" />
            NOMINAL
          </span>
        );
    }
  };

  const getActivityColor = (activity: string) => {
    if (activity.includes('FALL') || activity.includes('ABNORMAL')) return 'text-rose-400 bg-rose-950/30 border-rose-800/60';
    if (activity.includes('INACTIVITY')) return 'text-amber-400 bg-amber-950/30 border-amber-800/60';
    if (activity.includes('EXERCIS')) return 'text-blue-400 bg-blue-950/30 border-blue-800/60';
    if (activity.includes('WORK') || activity.includes('OPERAT')) return 'text-cyan-400 bg-cyan-950/30 border-cyan-800/60';
    return 'text-slate-300 bg-space-950 border-space-800';
  };

  return (
    <div className="bg-space-900 border border-space-800 rounded-xl overflow-hidden shadow-lg space-y-4 p-4 sm:p-5">
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-space-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Users className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-100 uppercase">
            MULTI-CREW HUMAN ACTIVITY & VITALS MONITOR
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            LOCAL HAR INFERENCE (ONBOARD)
          </span>
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-space-800 text-slate-400 border border-space-700">
            {crewList.length} ACTIVE ASTRONAUTS
          </span>
        </div>
      </div>

      {/* Grid of Astronauts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {crewList.map(astro => (
          <div
            key={astro.id}
            className={`bg-space-950/80 border rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all ${
              astro.currentStatus === 'CRITICAL'
                ? 'border-rose-500/80 shadow-hud-red'
                : astro.currentStatus === 'WARNING'
                ? 'border-amber-500/80 shadow-hud-amber'
                : 'border-space-800 hover:border-cyan-500/40'
            }`}
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold text-cyan-300">{astro.id}</span>
                  <span className="text-[10px] font-mono text-slate-400">({astro.name.split(' ')[0]})</span>
                </div>
                <div className="text-[11px] text-slate-400 font-sans">{astro.role}</div>
              </div>
              {getSafetyBadge(astro.currentStatus)}
            </div>

            {/* Current Activity Box */}
            <div className={`p-2.5 rounded-lg border text-center ${getActivityColor(astro.currentActivity)}`}>
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Recognized Activity</div>
              <div className="text-sm font-bold font-mono tracking-wide mt-0.5">
                {astro.currentActivity.replace(/_/g, ' ')}
              </div>
              <div className="text-[10px] font-mono text-cyan-400/90 mt-1">
                Confidence: <strong className="text-slate-100">{astro.activityConfidence.toFixed(1)}%</strong>
              </div>
            </div>

            {/* Vitals & Location */}
            <div className="space-y-2 text-xs font-mono">
              <div className="flex items-center justify-between text-slate-300 bg-space-900/60 p-2 rounded">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Heart className={`w-3.5 h-3.5 ${astro.vitals.heartRate > 105 ? 'text-rose-400 animate-ping' : 'text-rose-400'}`} />
                  Heart Rate:
                </span>
                <span className="font-bold text-slate-100">
                  {astro.vitals.heartRate} <span className="text-[10px] font-normal text-slate-400">bpm (SIM)</span>
                </span>
              </div>

              <div className="flex items-center justify-between text-slate-300 bg-space-900/60 p-2 rounded">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                  Module:
                </span>
                <span className="text-cyan-300 font-semibold">{astro.currentModule.replace(/_/g, ' ')}</span>
              </div>

              <div className="text-[11px] bg-space-900/60 p-2 rounded text-slate-400 space-y-1">
                <div className="text-[10px] uppercase text-slate-500">Current Task:</div>
                <div className="text-slate-200 font-sans line-clamp-1">{astro.assignedTask || 'Standard Mission Protocol'}</div>
              </div>
            </div>

            {/* Movement State footer */}
            <div className="pt-2 border-t border-space-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>State: <strong className="text-slate-200">{astro.movementState || 'STATIONARY'}</strong></span>
              <span>Last: <strong className="text-cyan-400">{astro.lastActivity}</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
