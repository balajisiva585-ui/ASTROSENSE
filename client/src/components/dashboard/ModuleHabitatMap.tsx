import React from 'react';
import { useMission } from '../../context/MissionContext';
import { TelemetryCard } from '../common/TelemetryCard';
import { HabitatModule } from '../../types';
import {
  Layers,
  FlaskConical,
  Dumbbell,
  Laptop,
  Box,
  Compass,
  User,
  Radio,
} from 'lucide-react';

interface ModuleConfig {
  id: HabitatModule;
  name: string;
  short: string;
  icon: any;
  sensors: string;
  color: string;
}

const MODULES: ModuleConfig[] = [
  {
    id: 'CONTROL_MODULE',
    name: 'Control Module / Cockpit',
    short: 'CTRL',
    icon: Compass,
    sensors: 'Optical BAS-CTRL-01 (Wide Angle)',
    color: 'border-cyan-500/40 text-cyan-300',
  },
  {
    id: 'LABORATORY',
    name: 'Science Laboratory',
    short: 'LAB',
    icon: FlaskConical,
    sensors: 'Stereo RGB-D Glovebox Cam',
    color: 'border-blue-500/40 text-blue-300',
  },
  {
    id: 'EXERCISE_AREA',
    name: 'Exercise Area (Gym)',
    short: 'EXER',
    icon: Dumbbell,
    sensors: 'High-Speed Kinematic Cam',
    color: 'border-purple-500/40 text-purple-300',
  },
  {
    id: 'WORKSTATION',
    name: 'Workstation / Avionics',
    short: 'WORK',
    icon: Laptop,
    sensors: 'Overhead Console Camera',
    color: 'border-emerald-500/40 text-emerald-300',
  },
  {
    id: 'CREW_QUARTERS',
    name: 'Crew Quarters / Galley',
    short: 'CQ',
    icon: User,
    sensors: 'Low-Light IR Sensor Restraint',
    color: 'border-amber-500/40 text-amber-300',
  },
  {
    id: 'STORAGE',
    name: 'Logistics / Stowage',
    short: 'STOW',
    icon: Box,
    sensors: 'Cargo Bay Volumetric Sensor',
    color: 'border-slate-600 text-slate-300',
  },
];

export const ModuleHabitatMap: React.FC = () => {
  const { astronaut, recordManualActivity } = useMission();
  const currentModule = astronaut?.currentModule || 'LABORATORY';

  const handleModuleClick = (modId: HabitatModule) => {
    let activity = astronaut?.currentActivity || 'WORKING';
    if (modId === 'EXERCISE_AREA') activity = 'EXERCISING';
    else if (modId === 'CREW_QUARTERS') activity = 'SLEEPING_RESTING';
    else if (modId === 'LABORATORY') activity = 'WORKING';
    else if (modId === 'STORAGE') activity = 'PICKING_CARRYING';
    else if (modId === 'WORKSTATION') activity = 'OPERATING_EQUIPMENT';

    recordManualActivity(activity, modId);
  };

  return (
    <TelemetryCard
      title="SPACECRAFT HABITAT MODULE MAP"
      subtitle="Habitation & Laboratory Internal Architecture"
      badge={
        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800">
          AST-01 IN: {currentModule.replace(/_/g, ' ')}
        </span>
      }
    >
      <div className="space-y-3 font-mono text-xs">
        {/* Module Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {MODULES.map(mod => {
            const isCurrent = currentModule === mod.id;
            const Icon = mod.icon;

            return (
              <button
                key={mod.id}
                onClick={() => handleModuleClick(mod.id)}
                className={`relative p-3 rounded-xl border text-left transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/70 border-cyan-400 shadow-hud-cyan ring-1 ring-cyan-400'
                    : 'bg-space-950 hover:bg-space-850 border-space-800 hover:border-space-700'
                }`}
              >
                {/* Active Astronaut Badge Pill */}
                {isCurrent && (
                  <span className="absolute top-2 right-2 flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-500 text-space-950 uppercase animate-pulse">
                    <Radio className="w-2.5 h-2.5" />
                    <span>AST-01</span>
                  </span>
                )}

                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`p-1.5 rounded-lg bg-space-900 border ${mod.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-slate-100 text-xs">{mod.short}</span>
                </div>

                <div className="font-semibold text-slate-200 text-xs truncate">
                  {mod.name}
                </div>
                <div className="text-[10px] text-slate-400 mt-1 truncate">
                  {mod.sensors}
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
          <span>Click module node to simulate astronaut transit</span>
          <span className="text-cyan-400">BAS Multi-Camera Network Active</span>
        </div>
      </div>
    </TelemetryCard>
  );
};
