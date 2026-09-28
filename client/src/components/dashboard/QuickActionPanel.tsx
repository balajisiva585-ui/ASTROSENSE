import React from 'react';
import { useMission } from '../../context/MissionContext';
import { TelemetryCard } from '../common/TelemetryCard';
import { ActivityType, HabitatModule } from '../../types';
import {
  Footprints,
  Briefcase,
  Dumbbell,
  AlertTriangle,
  Clock,
  Coffee,
  Bed,
  Radio,
  WifiOff,
  Wifi,
} from 'lucide-react';

export const QuickActionPanel: React.FC = () => {
  const {
    recordManualActivity,
    triggerFallAnomaly,
    triggerInactivityAnomaly,
    toggleCommStatus,
    session,
  } = useMission();

  const isOffline = session?.commStatus === 'OFFLINE';

  const quickActivities: Array<{
    label: string;
    activity: ActivityType;
    module: HabitatModule;
    icon: any;
    color: string;
  }> = [
    { label: 'Walk (Lab)', activity: 'WALKING', module: 'LABORATORY', icon: Footprints, color: 'hover:border-cyan-500/50 hover:text-cyan-300' },
    { label: 'Research (Lab)', activity: 'WORKING', module: 'LABORATORY', icon: Briefcase, color: 'hover:border-blue-500/50 hover:text-blue-300' },
    { label: 'Exercise (Gym)', activity: 'EXERCISING', module: 'EXERCISE_AREA', icon: Dumbbell, color: 'hover:border-purple-500/50 hover:text-purple-300' },
    { label: 'Meal (Galley)', activity: 'EATING', module: 'CREW_QUARTERS', icon: Coffee, color: 'hover:border-amber-500/50 hover:text-amber-300' },
    { label: 'Rest (Sleep)', activity: 'SLEEPING_RESTING', module: 'CREW_QUARTERS', icon: Bed, color: 'hover:border-emerald-500/50 hover:text-emerald-300' },
    { label: 'Avionics (Work)', activity: 'OPERATING_EQUIPMENT', module: 'WORKSTATION', icon: Radio, color: 'hover:border-indigo-500/50 hover:text-indigo-300' },
  ];

  return (
    <TelemetryCard
      title="EDGE SIMULATION & ANOMALY INJECTION PANEL"
      subtitle="Manual Test Trigger Actions for Hackathon Demonstration"
    >
      <div className="space-y-3 font-mono text-xs">
        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
            Routine Activity Injections:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {quickActivities.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.label}
                  onClick={() => recordManualActivity(item.activity, item.module)}
                  className={`flex items-center gap-2 p-2 rounded-lg bg-space-950 border border-space-800 text-slate-300 transition-all active:scale-95 ${item.color}`}
                >
                  <Icon className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-space-800">
          <span className="text-[10px] text-rose-400/90 uppercase tracking-wider block mb-1.5 font-bold">
            Mission Safety Anomaly Injections:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              onClick={triggerFallAnomaly}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-rose-950/70 hover:bg-rose-900/80 border border-rose-500/60 text-rose-200 font-bold transition-all shadow-hud-rose active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 animate-pulse" />
              <span>TRIGGER SUDDEN FALL / ABNORMAL MOVEMENT</span>
            </button>

            <button
              onClick={triggerInactivityAnomaly}
              className="flex items-center justify-center gap-2 p-2.5 rounded-lg bg-amber-950/70 hover:bg-amber-900/80 border border-amber-500/60 text-amber-200 font-bold transition-all shadow-hud-amber active:scale-95"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>TRIGGER EXTENDED INACTIVITY ALERT</span>
            </button>
          </div>
        </div>
      </div>
    </TelemetryCard>
  );
};
