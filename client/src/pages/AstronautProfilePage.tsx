import React from 'react';
import { useMission } from '../context/MissionContext';
import { TelemetryCard } from '../components/common/TelemetryCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { AnomalyAlert } from '../types';
import {
  User,
  Heart,
  Activity,
  Thermometer,
  Flame,
  Wind,
  ShieldCheck,
  Calendar,
  Compass,
  Award,
  BookOpen,
} from 'lucide-react';

export const AstronautProfilePage: React.FC = () => {
  const { astronaut, session, anomalies } = useMission();

  if (!astronaut) return null;

  const vitals = astronaut.vitals;
  const stats = astronaut.stats;

  const formatHours = (seconds: number) => (seconds / 3600).toFixed(1);

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Astronaut Hero Card */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shadow-hud-cyan">
            <User className="w-10 h-10" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-100 tracking-wider">
                {astronaut.name}
              </h2>
              <span className="text-[11px] px-2.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800 font-bold">
                {astronaut.id}
              </span>
            </div>
            <p className="text-sm text-slate-300 font-sans mt-0.5">{astronaut.role}</p>
            <div className="flex items-center gap-4 mt-2 text-slate-400 text-xs">
              <span>Mission: <strong className="text-cyan-400">{session?.missionName}</strong></span>
              <span>•</span>
              <span>Flight Day: <strong className="text-cyan-400">DAY 0{session?.missionDay}</strong></span>
              <span>•</span>
              <span>Current Module: <strong className="text-slate-200">{astronaut.currentModule.replace(/_/g, ' ')}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-slate-500 uppercase block">Crew Safety Status</span>
            <StatusBadge type="status" value={astronaut.currentStatus} className="text-sm px-3 py-1" />
          </div>
        </div>
      </div>

      {/* Vitals Telemetry Grid */}
      <TelemetryCard
        title="PHYSIOLOGICAL & BIOMEDICAL SENSORS"
        subtitle="Continuous Real-time Microgravity Biosensor Stream"
        badge={<StatusBadge type="status" value="NORMAL" />}
      >
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-space-950 p-3 rounded-xl border border-space-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
              <Heart className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
              <span>Heart Rate</span>
            </div>
            <div className="text-xl font-bold text-rose-400 mt-1">
              {vitals.heartRate} <span className="text-xs text-slate-400 font-normal">BPM</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Resting baseline 68 BPM</div>
          </div>

          <div className="bg-space-950 p-3 rounded-xl border border-space-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
              <Activity className="w-3.5 h-3.5 text-cyan-400" />
              <span>Blood Oxygen</span>
            </div>
            <div className="text-xl font-bold text-cyan-300 mt-1">
              {vitals.spO2} <span className="text-xs text-slate-400 font-normal">% SpO2</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-1">Optimal cabin pressure</div>
          </div>

          <div className="bg-space-950 p-3 rounded-xl border border-space-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>Core Temp</span>
            </div>
            <div className="text-xl font-bold text-amber-300 mt-1">
              {vitals.bodyTemp} <span className="text-xs text-slate-400 font-normal">°C</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Normothermic</div>
          </div>

          <div className="bg-space-950 p-3 rounded-xl border border-space-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
              <Wind className="w-3.5 h-3.5 text-blue-400" />
              <span>Respiration</span>
            </div>
            <div className="text-xl font-bold text-blue-300 mt-1">
              {vitals.respiratoryRate} <span className="text-xs text-slate-400 font-normal">rpm</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Regular rhythmic</div>
          </div>

          <div className="bg-space-950 p-3 rounded-xl border border-space-800">
            <div className="flex items-center gap-1.5 text-slate-400 text-[10px] uppercase">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>Metabolic Rate</span>
            </div>
            <div className="text-xl font-bold text-orange-300 mt-1">
              {vitals.metabolicKcalHour} <span className="text-xs text-slate-400 font-normal">kcal/h</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Dynamic load model</div>
          </div>
        </div>
      </TelemetryCard>

      {/* Behavioral & Activity Cumulative Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TelemetryCard
          title="HABITAT TIME BUDGET & ACTIVITY BREAKDOWN"
          subtitle="Cumulative Microgravity Activity Budget (Flight Day 042)"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="p-2.5 rounded-lg bg-space-950 border border-space-800">
                <span className="text-[10px] text-slate-500 block">Total Active</span>
                <span className="text-base font-bold text-cyan-400">{formatHours(stats.totalActiveSeconds)} hrs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-space-950 border border-space-800">
                <span className="text-[10px] text-slate-500 block">Station Research</span>
                <span className="text-base font-bold text-blue-400">{formatHours(stats.workingSeconds)} hrs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-space-950 border border-space-800">
                <span className="text-[10px] text-slate-500 block">Countermeasure</span>
                <span className="text-base font-bold text-purple-400">{formatHours(stats.exerciseSeconds)} hrs</span>
              </div>
              <div className="p-2.5 rounded-lg bg-space-950 border border-space-800">
                <span className="text-[10px] text-slate-500 block">Rest & Sleep</span>
                <span className="text-base font-bold text-emerald-400">{formatHours(stats.sleepingSeconds)} hrs</span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-space-950 border border-space-800 font-sans text-xs text-slate-300 leading-relaxed">
              <strong>BAS Experiment Protocol Note:</strong> Daily mandatory countermeasure aerobic session target: 2.0 hours. Commander AST-01 is maintaining 100% compliance with flight physical conditioning goals.
            </div>
          </div>
        </TelemetryCard>

        {/* Safety Anomaly History */}
        <TelemetryCard
          title="CREW SAFETY & ANOMALY LOG"
          subtitle="Recorded Behavioral Divergences on Edge Subsystem"
        >
          <div className="space-y-2">
            {anomalies.length === 0 ? (
              <div className="text-center py-6 text-emerald-400 text-xs">
                Zero active safety anomalies logged. Crew operating within nominal parameters.
              </div>
            ) : (
              anomalies.map((a: AnomalyAlert) => (
                <div
                  key={a.id}
                  className={`p-2.5 rounded-lg border ${
                    a.severity === 'CRITICAL' ? 'bg-rose-950/60 border-rose-500/60 text-rose-200' : 'bg-amber-950/60 border-amber-500/50 text-amber-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold">{a.title}</span>
                    <span className="text-[10px]">{a.displayTime} UTC</span>
                  </div>
                  <p className="text-[11px] mt-1 text-slate-300 font-sans">{a.description}</p>
                </div>
              ))
            )}
          </div>
        </TelemetryCard>
      </div>
    </div>
  );
};
