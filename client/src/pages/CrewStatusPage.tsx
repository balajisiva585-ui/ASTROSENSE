import React from 'react';
import { useMission } from '../context/MissionContext';
import { CrewLiveStatus } from '../components/crew/CrewLiveStatus';
import { LiveEventStream } from '../components/mission/LiveEventStream';
import { Users, Activity, Heart, Shield } from 'lucide-react';

export const CrewStatusPage: React.FC = () => {
  const { crewList, astronaut } = useMission();

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
              MULTI-CREW MISSION STATUS & BEHAVIORAL SURVEILLANCE
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Autonomous Biological & Activity Surveillance (BAS) across all Spacecraft Habitat Modules
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            4 Crew Monitored
          </span>
          <span className="px-3 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60">
            Onboard HAR Active
          </span>
        </div>
      </div>

      <CrewLiveStatus crewList={crewList} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-12">
          <LiveEventStream />
        </div>
      </div>
    </div>
  );
};
