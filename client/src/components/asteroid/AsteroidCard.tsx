import React from 'react';
import { AsteroidObject } from '../../types';
import {
  Compass,
  AlertTriangle,
  Radio,
  Eye,
  Crosshair,
  ShieldAlert,
  Zap,
  CheckCircle2,
} from 'lucide-react';

interface AsteroidCardProps {
  asteroid: AsteroidObject;
  onTriggerAnomaly: (id: string) => void;
}

export const AsteroidCard: React.FC<AsteroidCardProps> = ({ asteroid, onTriggerAnomaly }) => {
  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return (
          <span className="px-2 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/60 text-[10px] font-mono font-bold animate-pulse">
            PHA CRITICAL
          </span>
        );
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/60 text-[10px] font-mono font-bold">
            HIGH RISK
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded bg-yellow-950/80 text-yellow-300 border border-yellow-500/60 text-[10px] font-mono">
            MEDIUM RISK
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-500/60 text-[10px] font-mono">
            LOW RISK
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/60 text-[10px] font-mono">
            NO RISK
          </span>
        );
    }
  };

  const trajString = `[${asteroid.trajectoryVector.x > 0 ? '+' : ''}${asteroid.trajectoryVector.x.toFixed(2)}, ${asteroid.trajectoryVector.y > 0 ? '+' : ''}${asteroid.trajectoryVector.y.toFixed(2)}, ${asteroid.trajectoryVector.z > 0 ? '+' : ''}${asteroid.trajectoryVector.z.toFixed(2)}]`;

  return (
    <div
      className={`bg-space-950/80 border rounded-xl p-4 flex flex-col justify-between space-y-3 transition-all ${
        asteroid.isAnomaly
          ? 'border-rose-500/80 shadow-hud-red'
          : asteroid.riskLevel === 'HIGH' || asteroid.riskLevel === 'CRITICAL'
          ? 'border-amber-500/70 shadow-hud-amber'
          : 'border-space-800 hover:border-cyan-500/40'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-cyan-300">{asteroid.id}</span>
            <span className="text-[10px] font-mono text-slate-400">({asteroid.name})</span>
          </div>
          <div className="text-[11px] text-slate-400 font-sans">{asteroid.type}</div>
        </div>
        {getRiskBadge(asteroid.riskLevel)}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
        <div className="bg-space-900/70 border border-space-800 p-2 rounded">
          <div className="text-[10px] text-slate-400">Distance</div>
          <div className="text-sm font-bold text-slate-100">
            {asteroid.distanceLd.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">LD</span>
          </div>
          <div className="text-[10px] text-slate-500">{(asteroid.distanceKm / 1e6).toFixed(2)}M km</div>
        </div>

        <div className="bg-space-900/70 border border-space-800 p-2 rounded">
          <div className="text-[10px] text-slate-400">Velocity</div>
          <div className="text-sm font-bold text-cyan-300">
            {asteroid.relativeVelocityKmS.toFixed(1)} <span className="text-[10px] font-normal text-slate-400">km/s</span>
          </div>
          <div className="text-[10px] text-slate-500">Relative Vector</div>
        </div>

        <div className="bg-space-900/70 border border-space-800 p-2 rounded">
          <div className="text-[10px] text-slate-400">Estimated Size</div>
          <div className="text-sm font-bold text-amber-300">
            {asteroid.estimatedDiameterM} <span className="text-[10px] font-normal text-slate-400">meters</span>
          </div>
          <div className="text-[10px] text-slate-500">Torino Scale: {asteroid.torinoScale}</div>
        </div>

        <div className="bg-space-900/70 border border-space-800 p-2 rounded">
          <div className="text-[10px] text-slate-400">Observation</div>
          <div className="text-sm font-bold text-emerald-300">{asteroid.observationStatus}</div>
          <div className="text-[10px] text-slate-500">Continuous Track</div>
        </div>
      </div>

      {/* Trajectory */}
      <div className="bg-space-900/70 border border-space-800 p-2.5 rounded text-xs font-mono space-y-1">
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            Trajectory Vector:
          </span>
          <span className="text-slate-200">{trajString}</span>
        </div>
        <div className="flex items-center justify-between text-slate-400 text-[10px]">
          <span>Last Tracked: {new Date(asteroid.lastObservation).toLocaleTimeString()}</span>
          <span className="text-cyan-400">Next Pass: {new Date(asteroid.nextPass).toLocaleDateString()}</span>
        </div>
      </div>

      {/* Anomaly Indicator & Trigger */}
      <div className="pt-2 border-t border-space-800 flex items-center justify-between gap-2">
        {asteroid.isAnomaly ? (
          <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400 font-semibold animate-pulse">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span>ANOMALY DETECTED</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Trajectory Nominal</span>
          </div>
        )}

        <button
          onClick={() => onTriggerAnomaly(asteroid.id)}
          className="px-2.5 py-1 text-[10px] font-mono font-medium rounded bg-rose-950/70 hover:bg-rose-900 border border-rose-700/60 text-rose-300 transition-all active:scale-95"
          title="Simulate unexpected trajectory or observation gap"
        >
          {asteroid.isAnomaly ? 'Retrigger Anomaly' : 'Trigger Sim Anomaly'}
        </button>
      </div>
    </div>
  );
};
