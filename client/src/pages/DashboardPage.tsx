import React from 'react';
import { useMission } from '../context/MissionContext';
import { AlertBanner } from '../components/common/AlertBanner';
import { LiveAiMonitor } from '../components/dashboard/LiveAiMonitor';
import { AstronautStatusCard } from '../components/dashboard/AstronautStatusCard';
import { CommStatusPanel } from '../components/dashboard/CommStatusPanel';
import { ModuleHabitatMap } from '../components/dashboard/ModuleHabitatMap';
import { QuickActionPanel } from '../components/dashboard/QuickActionPanel';
import { RealtimeTimeline } from '../components/dashboard/RealtimeTimeline';
import {
  Bot,
  Radio,
  Users,
  ShieldAlert,
  Activity,
  Compass,
  Globe2,
  ArrowUpRight,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { setTab, openAssistant, anomalies, telemetry } = useMission();
  const activeAnomaliesCount = anomalies.filter(a => !a.resolved).length;

  const quickWidgets = [
    {
      id: 'ai-assistant',
      label: 'AI ASSISTANT',
      desc: 'Ask Mission Knowledge & Status',
      icon: Bot,
      color: 'from-cyan-500/20 to-blue-600/30 border-cyan-500/40 text-cyan-300',
      action: openAssistant,
      badge: 'OFFLINE AI',
    },
    {
      id: 'live-mission',
      label: 'LIVE MISSION',
      desc: 'Orbital Track & 1Hz Telemetry',
      icon: Radio,
      color: 'from-blue-500/20 to-indigo-600/30 border-blue-500/40 text-blue-300',
      action: () => setTab('live-mission'),
      badge: `${(telemetry?.orbitAltitudeKm || 418.5).toFixed(0)} km`,
    },
    {
      id: 'crew-status',
      label: 'CREW STATUS',
      desc: '4 Astronauts Live HAR',
      icon: Users,
      color: 'from-teal-500/20 to-emerald-600/30 border-teal-500/40 text-teal-300',
      action: () => setTab('crew'),
      badge: '4 ACTIVE',
    },
    {
      id: 'active-anomalies',
      label: 'ACTIVE ANOMALIES',
      desc: 'AI Diagnostic Reasoning',
      icon: ShieldAlert,
      color: 'from-rose-500/20 to-red-600/30 border-rose-500/40 text-rose-300',
      action: () => setTab('anomalies'),
      badge: activeAnomaliesCount > 0 ? `${activeAnomaliesCount} ALERTS` : 'NOMINAL',
    },
    {
      id: 'spacecraft-telemetry',
      label: 'SPACECRAFT TELEMETRY',
      desc: 'Cabin ECLSS & Power Bus',
      icon: Activity,
      color: 'from-sky-500/20 to-cyan-600/30 border-sky-500/40 text-sky-300',
      action: () => setTab('live-mission'),
      badge: 'ECLSS OK',
    },
    {
      id: 'asteroid-monitor',
      label: 'ASTEROID MONITOR',
      desc: 'Deep-Space NEO Radar',
      icon: Compass,
      color: 'from-amber-500/20 to-orange-600/30 border-amber-500/40 text-amber-300',
      action: () => setTab('asteroids'),
      badge: '4 NEOs',
    },
    {
      id: 'mission-control',
      label: 'MISSION CONTROL',
      desc: 'Earth DSN vs Onboard Node',
      icon: Globe2,
      color: 'from-purple-500/20 to-indigo-600/30 border-purple-500/40 text-purple-300',
      action: () => setTab('mission-control'),
      badge: 'SPLIT-VIEW',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Active Anomaly or Autonomous Mode Alerts */}
      <AlertBanner />

      {/* Additive Quick Navigation Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {quickWidgets.map(widget => {
          const Icon = widget.icon;
          return (
            <button
              key={widget.id}
              onClick={widget.action}
              className={`p-3 rounded-xl bg-gradient-to-br ${widget.color} border bg-space-950/80 text-left transition-all hover:scale-[1.02] active:scale-95 shadow-md flex flex-col justify-between group`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon className="w-5 h-5" />
                <ArrowUpRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </div>
              <div className="mt-3">
                <div className="text-xs font-mono font-bold tracking-tight truncate">{widget.label}</div>
                <div className="text-[10px] text-slate-400 font-sans truncate">{widget.desc}</div>
                <div className="mt-1.5 text-[9px] font-mono px-1.5 py-0.2 rounded bg-space-950/80 border border-white/10 w-fit text-slate-300">
                  {widget.badge}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Two Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live AI Vision, Habitat Map, Realtime Timeline */}
        <div className="lg:col-span-7 space-y-6">
          <LiveAiMonitor />
          <ModuleHabitatMap />
          <RealtimeTimeline />
        </div>

        {/* Right Column: Astronaut Telemetry, Comm & Sync, Quick Actions */}
        <div className="lg:col-span-5 space-y-6">
          <CommStatusPanel />
          <AstronautStatusCard />
          <QuickActionPanel />
        </div>
      </div>
    </div>
  );
};
