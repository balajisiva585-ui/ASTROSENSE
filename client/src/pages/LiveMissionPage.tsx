import React from 'react';
import { useMission } from '../context/MissionContext';
import { MissionGlobe } from '../components/mission/MissionGlobe';
import { TelemetryPanel } from '../components/mission/TelemetryPanel';
import { CrewLiveStatus } from '../components/crew/CrewLiveStatus';
import { LiveEventStream } from '../components/mission/LiveEventStream';
import { Activity, ShieldCheck, Radio } from 'lucide-react';
import { CommStatus } from '../types';

export const LiveMissionPage: React.FC = () => {
  const { session, telemetry, crewList } = useMission();
  const commStatus: CommStatus = session?.commStatus || 'ONLINE';

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
                LIVE SPACECRAFT MISSION CONTROL SCREEN
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                1 HZ TELEMETRY STREAM
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Continuous Subsystem Health, Orbital Mechanics, ECLSS Atmosphere & Multi-Crew Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-space-950 border border-space-800 text-slate-300">
            MET: <span className="text-cyan-400 font-bold">DAY {session?.missionDay || 42} • {telemetry?.displayTime || '19:42:18'}</span>
          </div>
          <div className={`px-3 py-1.5 rounded-lg border font-semibold ${
            commStatus === 'ONLINE'
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
              : 'bg-amber-950/80 border-amber-500/60 text-amber-300 animate-pulse'
          }`}>
            {commStatus === 'ONLINE' ? 'DSN TELEMETRY UPLINK ACTIVE' : 'AUTONOMOUS ONBOARD MODE'}
          </div>
        </div>
      </div>

      {/* Visualizer & Stream Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          <MissionGlobe telemetry={telemetry} commStatus={commStatus} />
          <TelemetryPanel telemetry={telemetry} commStatus={commStatus} />
        </div>

        <div className="lg:col-span-4 space-y-6">
          <LiveEventStream />
        </div>
      </div>

      {/* Multi-Crew Live Status */}
      <CrewLiveStatus crewList={crewList} />
    </div>
  );
};
