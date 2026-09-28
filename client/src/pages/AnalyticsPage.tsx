import React from 'react';
import { useMission } from '../context/MissionContext';
import { TelemetryCard } from '../components/common/TelemetryCard';
import { ActivityType, MissionEvent } from '../types';
import {
  BarChart3,
  PieChart,
  Activity,
  Heart,
  Wifi,
  WifiOff,
  ShieldAlert,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const { astronaut, session, events, anomalies } = useMission();

  // Activity distribution count
  const activityCounts: Record<string, number> = {};
  events.forEach((e: MissionEvent) => {
    activityCounts[e.activity] = (activityCounts[e.activity] || 0) + 1;
  });

  const totalEvents = events.length || 1;
  const sortedActivities = Object.entries(activityCounts).sort((a, b) => b[1] - a[1]);

  const colors = [
    '#00f2fe',
    '#3b82f6',
    '#8b5cf6',
    '#10b981',
    '#f59e0b',
    '#ec4899',
    '#06b6d4',
    '#6366f1',
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Analytics Summary Header Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-space-900 border border-space-800">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Total Classified Events</span>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-1">{events.length}</div>
          <div className="text-[10px] text-cyan-400 mt-1">100% Onboard Edge AI</div>
        </div>

        <div className="p-4 rounded-xl bg-space-900 border border-space-800">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Exercise Countermeasure</span>
          </div>
          <div className="text-2xl font-bold text-purple-400 mt-1">
            {((astronaut?.stats.exerciseSeconds || 0) / 3600).toFixed(1)} hrs
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Flight quota on track</div>
        </div>

        <div className="p-4 rounded-xl bg-space-900 border border-space-800">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase">
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Safety Alerts Detected</span>
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1">{anomalies.length}</div>
          <div className="text-[10px] text-slate-400 mt-1">Autonomous rule engine</div>
        </div>

        <div className="p-4 rounded-xl bg-space-900 border border-space-800">
          <div className="flex items-center gap-2 text-slate-400 text-[10px] uppercase">
            <WifiOff className="w-4 h-4 text-amber-400" />
            <span>Total Comm Outage</span>
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-1">
            {session?.totalOutageSeconds || 0}s
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Zero data frame loss</div>
        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity Distribution Breakdown (Bar Chart) */}
        <TelemetryCard
          title="HUMAN ACTIVITY FREQUENCY DISTRIBUTION"
          subtitle="Relative Frequency of 12 Onboard HAR Classes"
          badge={
            <span className="text-[10px] text-cyan-400 bg-space-950 px-2 py-0.5 rounded border border-space-800">
              {sortedActivities.length} Classes Logged
            </span>
          }
        >
          <div className="space-y-3 pt-2">
            {sortedActivities.length === 0 ? (
              <div className="text-center py-8 text-slate-500">No activity data available.</div>
            ) : (
              sortedActivities.map(([act, count], idx) => {
                const pct = Math.round((count / totalEvents) * 100);
                const color = colors[idx % colors.length];

                return (
                  <div key={act} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{act.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400">
                        {count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-space-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: color }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </TelemetryCard>

        {/* Heart Rate vs Kinetic Activity Correlation */}
        <TelemetryCard
          title="METABOLIC & KINETIC LOAD CORRELATION"
          subtitle="Simulated Caloric Burn vs Microgravity Physical Exertion"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-space-950 border border-space-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">EXERCISING (High Kinetic):</span>
                <span className="font-bold text-purple-400">142 BPM • 450 kcal/h</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">WORKING / RESEARCH:</span>
                <span className="font-bold text-blue-400">78 BPM • 120 kcal/h</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">TRANSIT / WALKING:</span>
                <span className="font-bold text-cyan-400">92 BPM • 180 kcal/h</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">REST & SLEEP:</span>
                <span className="font-bold text-emerald-400">58 BPM • 60 kcal/h</span>
              </div>
            </div>

            {/* Simulated Live Heart Wave Graph */}
            <div className="p-3 rounded-lg bg-space-950 border border-space-800">
              <span className="text-[10px] text-slate-500 uppercase block mb-2">Live ECG Pulse Profile</span>
              <svg className="w-full h-16 stroke-rose-500 fill-none" viewBox="0 0 300 60">
                <path
                  d="M 0,30 L 40,30 L 50,20 L 55,40 L 60,10 L 65,50 L 70,30 L 120,30 L 130,20 L 135,40 L 140,10 L 145,50 L 150,30 L 200,30 L 210,20 L 215,40 L 220,10 L 225,50 L 230,30 L 300,30"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>
        </TelemetryCard>
      </div>

      {/* Communication Availability & Autonomous Buffer Performance */}
      <TelemetryCard
        title="COMMUNICATION BLACKOUT TOLERANCE & BUFFER INTEGRITY"
        subtitle="Delay-Tolerant Network Bundle Telemetry vs Local Edge Event Buffer"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase block">Telemetry Synchronization</span>
            <div className="text-lg font-bold text-emerald-400">
              {events.filter((e: MissionEvent) => e.syncStatus === 'SYNCED').length} / {events.length} Events Synced
            </div>
            <p className="text-[11px] text-slate-400 font-sans">
              All events generated during comm loss are preserved with microsecond UTC timestamps.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase block">Local Flash Endurance</span>
            <div className="text-lg font-bold text-cyan-400">30+ Days Autonomous Storage</div>
            <p className="text-[11px] text-slate-400 font-sans">
              High-reliability SQLite format allows uninterrupted recording for extended Mars blackouts.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-space-950 border border-space-800 space-y-1.5">
            <span className="text-[10px] text-slate-500 uppercase block">Edge Decision Latency</span>
            <div className="text-lg font-bold text-amber-300">24.5 ms Local vs 14 min Mars Comm</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Safety-critical fall and anomaly alarms trigger immediately without round-trip delay.
            </p>
          </div>
        </div>
      </TelemetryCard>
    </div>
  );
};
