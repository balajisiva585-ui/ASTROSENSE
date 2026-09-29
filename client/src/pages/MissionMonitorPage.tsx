import React from 'react';
import { useMission } from '../context/MissionContext';
import { LiveVideoMonitor } from '../components/video/LiveVideoMonitor';
import { RobotCard } from '../components/robots/RobotCard';
import {
  Activity,
  Radio,
  Wifi,
  WifiOff,
  Bot,
  Users,
  AlertTriangle,
  ShieldCheck,
  Cpu,
  Mic,
  Thermometer,
  Gauge,
  Battery,
  Wind,
  Orbit,
  Sparkles,
  Zap,
} from 'lucide-react';

import { DatabaseStatusCard } from '../components/database/DatabaseStatusCard';

export const MissionMonitorPage: React.FC = () => {
  const {
    session,
    telemetry,
    crewList,
    robots,
    anomalies,
    events,
    liveEventStream,
    sendRobotAction,
    openVoiceModal,
    openAssistant,
    openAdvancedDemo,
  } = useMission();

  const isOffline = session?.commStatus === 'OFFLINE';
  const activeAnomalies = anomalies.filter(a => !a.resolved);
  const ares = robots.find(r => r.id === 'ARES-1');
  const nova = robots.find(r => r.id === 'NOVA-2');

  return (
    <div className="flex flex-col gap-5 max-w-[1700px] mx-auto pb-10">
      {/* ========================================================================= */}
      {/* 1. TOP AEROSPACE STATUS BAR                                              */}
      {/* ========================================================================= */}
      <div className="bg-space-950 border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_30px_rgba(0,240,255,0.15)] flex flex-wrap items-center justify-between gap-4">
        {/* Left: Mission & Flight Day */}
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-mono font-bold text-lg">
            🚀
          </div>
          <div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-gray-400 text-xs">MISSION:</span>
              <span className="text-sm font-bold text-white tracking-wider">AURORA</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400 text-xs">DAY:</span>
              <span className="text-sm font-bold text-cyan-400">042</span>
              <span className="text-gray-500">|</span>
              <span className="text-gray-400 text-xs">TIME:</span>
              <span className="text-xs font-mono text-emerald-400 font-bold">LIVE (UTC)</span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono">
              Autonomous Edge Onboard Station • Low Earth Orbit (418.6 km)
            </p>
          </div>
        </div>

        {/* Middle: Live telemetry statuses */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Comm Status */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isOffline
                ? 'bg-red-500/20 border-red-500/50 text-red-300 animate-pulse'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
            }`}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>COMM: {session?.commStatus || 'ONLINE'}</span>
          </div>

          {/* Onboard AI */}
          <div className="px-3 py-1.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>ONBOARD AI: ACTIVE</span>
          </div>

          {/* Autonomous Mode */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              isOffline || session?.autonomousModeActive
                ? 'bg-purple-500/20 border-purple-500/40 text-purple-300 animate-pulse'
                : 'bg-space-900 border-space-800 text-gray-400'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>AUTONOMOUS MODE: {isOffline ? 'ACTIVE' : 'STANDBY'}</span>
          </div>

          {/* Crew count */}
          <div className="px-3 py-1.5 rounded-xl bg-space-900 border border-space-800 text-gray-300 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>CREW: {crewList.length || 4}</span>
          </div>

          {/* Robots count */}
          <div className="px-3 py-1.5 rounded-xl bg-space-900 border border-space-800 text-gray-300 flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>ROBOTS: 2 (ARES, NOVA)</span>
          </div>

          {/* Active Alerts Badge */}
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
              activeAnomalies.length > 0
                ? 'bg-red-500/30 border-red-500 text-red-300 animate-bounce'
                : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>ALERTS: {activeAnomalies.length} ACTIVE</span>
          </div>
        </div>

        {/* Right: Talk to Astrosense Voice & AI Demo Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={openVoiceModal}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold transition flex items-center gap-2 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <Mic className="w-4 h-4" />
            TALK TO ASTROSENSE
          </button>
          <button
            onClick={openAdvancedDemo}
            className="px-3 py-2 rounded-xl bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white border border-purple-500/50 font-mono text-xs font-bold transition flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            ADVANCED DEMO
          </button>
        </div>
      </div>

      {/* Hybrid Database HUD Status Card */}
      <DatabaseStatusCard />

      {/* ========================================================================= */}
      {/* 2. MAIN SPLIT: LIVE VIDEO MONITOR (TOP/LEFT) + TELEMETRY & ROBOTS         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Video Monitor (Takes 2 Columns on large screens) */}
        <div className="lg:col-span-2">
          <LiveVideoMonitor />
        </div>

        {/* Right Sidebar: Spacecraft Telemetry & Environment */}
        <div className="flex flex-col gap-4">
          {/* Spacecraft Telemetry Card */}
          <div className="bg-space-900 border border-space-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                <Orbit className="w-4 h-4" />
                SPACECRAFT TELEMETRY
              </div>
              <span className="text-[10px] font-mono text-amber-400">SIMULATED TELEMETRY</span>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
              <div className="bg-space-950 p-2.5 rounded-lg border border-space-800 flex flex-col">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Thermometer className="w-3 h-3 text-cyan-400" /> CABIN TEMP
                </span>
                <span className="text-white font-bold text-sm mt-0.5">
                  {telemetry?.cabinTemperature ?? 22.4} °C
                </span>
              </div>

              <div className="bg-space-950 p-2.5 rounded-lg border border-space-800 flex flex-col">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Gauge className="w-3 h-3 text-cyan-400" /> PRESSURE
                </span>
                <span className="text-white font-bold text-sm mt-0.5">
                  {telemetry?.cabinPressure ?? 101.3} kPa
                </span>
              </div>

              <div className="bg-space-950 p-2.5 rounded-lg border border-space-800 flex flex-col">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Wind className="w-3 h-3 text-emerald-400" /> O2 CONC.
                </span>
                <span className="text-emerald-400 font-bold text-sm mt-0.5">
                  {telemetry?.oxygenPct ?? 20.9}%
                </span>
              </div>

              <div className="bg-space-950 p-2.5 rounded-lg border border-space-800 flex flex-col">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Battery className="w-3 h-3 text-amber-400" /> POWER BUS
                </span>
                <span className="text-cyan-300 font-bold text-sm mt-0.5">
                  {telemetry?.powerGeneratedKw ?? 14.8} kW
                </span>
              </div>
            </div>

            <div className="bg-space-950 p-2.5 rounded-lg border border-space-800 text-[11px] font-mono text-gray-400 flex items-center justify-between">
              <span>ORBIT ALT: <strong className="text-white">{telemetry?.orbitAltitudeKm ?? 418.6} km</strong></span>
              <span>VELOCITY: <strong className="text-white">{telemetry?.orbitVelocityKmS ?? 7.67} km/s</strong></span>
            </div>
          </div>

          {/* Quick Robots Status Card */}
          <div className="bg-space-900 border border-space-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase">
                <Bot className="w-4 h-4" />
                AUTONOMOUS MISSION ROBOTS
              </div>
              <span className="text-[10px] font-mono text-amber-400">SIMULATED ROBOTS</span>
            </div>

            <div className="flex flex-col gap-2">
              {ares && (
                <div className="bg-space-950 p-2.5 rounded-lg border border-cyan-500/20 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <div>
                      <span className="font-bold text-cyan-300">ARES-1</span>
                      <span className="text-gray-400 text-[10px] block">Crew Support • {ares.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">{ares.batteryPct}%</span>
                    <span className="text-[10px] text-gray-400 block">{ares.status}</span>
                  </div>
                </div>
              )}

              {nova && (
                <div className="bg-space-950 p-2.5 rounded-lg border border-indigo-500/20 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                    <div>
                      <span className="font-bold text-indigo-300">NOVA-2</span>
                      <span className="text-gray-400 text-[10px] block">Engineering • {nova.location}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-bold">{nova.batteryPct}%</span>
                    <span className="text-[10px] text-gray-400 block">{nova.status}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. MULTI-CREW STATUS MATRIX & RECENT LIVE EVENTS STREAM                   */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Multi-Crew Cards (Takes 2 Columns) */}
        <div className="lg:col-span-2 bg-space-900 border border-space-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-space-800 pb-2">
            <div className="flex items-center gap-2 text-white font-mono text-xs font-bold uppercase">
              <Users className="w-4 h-4 text-cyan-400" />
              MULTI-ASTRONAUT MONITORING MATRIX
            </div>
            <span className="text-[10px] font-mono text-cyan-300">EDGE AI TRACKING (4 CREW)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {crewList.map((c) => {
              const isAnomaly = c.currentStatus === 'CRITICAL' || c.currentActivity === 'FALL_ABNORMAL_MOVEMENT';

              return (
                <div
                  key={c.id}
                  className={`p-3 rounded-xl border text-xs font-mono flex flex-col justify-between gap-2 ${
                    isAnomaly
                      ? 'bg-red-950/60 border-red-500/80 text-red-200 animate-pulse'
                      : 'bg-space-950 border-space-800 text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{c.id}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                        isAnomaly ? 'bg-red-500 text-white' : 'bg-emerald-500/20 text-emerald-400'
                      }`}
                    >
                      {c.currentStatus}
                    </span>
                  </div>

                  <div>
                    <div className="text-[11px] text-gray-400">{c.name}</div>
                    <div className="text-cyan-300 font-bold mt-1 truncate">
                      {c.currentActivity.replace(/_/g, ' ')}
                    </div>
                    <div className="text-[10px] text-gray-400">{c.currentModule.replace(/_/g, ' ')}</div>
                  </div>

                  <div className="pt-2 border-t border-space-800/80 flex items-center justify-between text-[10px] text-gray-400">
                    <span>HR: <strong className="text-white">{c.vitals.heartRate}</strong></span>
                    <span>CONF: <strong className="text-emerald-400">{c.activityConfidence}%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Live Mission Events Stream */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-space-800 pb-2">
            <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
              <Activity className="w-4 h-4" />
              LIVE MISSION EVENT STREAM
            </div>
            <span className="text-[10px] font-mono text-emerald-400">ACID LOGS</span>
          </div>

          <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
            {liveEventStream.slice(0, 6).map((item) => (
              <div
                key={item.id}
                className="p-2 rounded-lg bg-space-950 border border-space-800/70 text-[11px] font-mono flex items-center justify-between text-gray-300"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  <span className="truncate">{item.message}</span>
                </div>
                <span className="text-gray-400 text-[10px] shrink-0">{item.displayTime}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
