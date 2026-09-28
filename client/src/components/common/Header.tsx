import React from 'react';
import { useMission } from '../../context/MissionContext';
import {
  Radio,
  Wifi,
  WifiOff,
  Volume2,
  VolumeX,
  Play,
  FileText,
  Activity,
  ShieldAlert,
  Cpu,
  Sparkles,
  Mic,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    session,
    astronaut,
    anomalies,
    soundEnabled,
    toggleSound,
    openJudgeDemo,
    openExtendedDemo,
    openAdvancedDemo,
    openVoiceModal,
    openReportModal,
  } = useMission();

  const isOffline = session?.commStatus === 'OFFLINE';
  const hasCriticalAnomaly = anomalies.some(a => !a.resolved && a.severity === 'CRITICAL');

  return (
    <header className="sticky top-0 z-40 bg-space-950/90 backdrop-blur-md border-b border-space-800 px-4 lg:px-8 py-3 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Branding & Mission Badges */}
        <div className="flex items-center gap-4">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 shadow-hud-cyan">
            <Radio className="w-6 h-6 text-cyan-400 animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isOffline ? 'bg-amber-400' : 'bg-emerald-400'}`} />
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isOffline ? 'bg-amber-500' : 'bg-emerald-500'}`} />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl font-bold tracking-wider text-slate-100 font-mono">
                ASTROSENSE
              </h1>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 font-semibold tracking-wider">
                ONBOARD EDGE AI
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Autonomous Crew Behavioral & Activity Recognition System
            </p>
          </div>
        </div>

        {/* Center: Mission Telemetry Badges */}
        <div className="flex items-center gap-2.5 sm:gap-4 text-xs font-mono">
          <div className="bg-space-900 border border-space-800 px-3 py-1.5 rounded-md flex items-center gap-2">
            <span className="text-slate-500 text-[10px] uppercase">Mission:</span>
            <span className="text-cyan-300 font-semibold">{session?.missionName || 'MISSION AURORA'}</span>
          </div>

          <div className="bg-space-900 border border-space-800 px-3 py-1.5 rounded-md flex items-center gap-2">
            <span className="text-slate-500 text-[10px] uppercase">Astronaut:</span>
            <span className="text-slate-200 font-semibold">{astronaut?.id || 'AST-01'}</span>
          </div>

          <div className="bg-space-900 border border-space-800 px-3 py-1.5 rounded-md flex items-center gap-2">
            <span className="text-slate-500 text-[10px] uppercase">Day:</span>
            <span className="text-cyan-400 font-semibold">DAY 0{session?.missionDay || 42}</span>
          </div>

          {/* Comm Status Pill */}
          <div className={`px-3 py-1.5 rounded-md border flex items-center gap-1.5 transition-all ${
            isOffline
              ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-hud-amber'
              : 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-hud-green'
          }`}>
            {isOffline ? <WifiOff className="w-3.5 h-3.5 animate-pulse" /> : <Wifi className="w-3.5 h-3.5" />}
            <span className="font-semibold uppercase tracking-wider text-[11px]">
              {session?.commStatus || 'ONLINE'}
            </span>
          </div>
        </div>

        {/* Right: Quick Launch & Controls */}
        <div className="flex items-center gap-2">
          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Telemetry Audio' : 'Unmute Telemetry Audio'}
            className="p-2 rounded-lg bg-space-900 border border-space-800 hover:border-slate-600 text-slate-400 hover:text-slate-200 transition-colors"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Voice Assistant Button */}
          <button
            onClick={openVoiceModal}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-200 transition-all shadow-md active:scale-95"
            title="Open Astrosense Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Voice Assistant</span>
          </button>

          {/* Extended Space Demo Button */}
          <button
            onClick={openExtendedDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-200 hover:text-cyan-200 transition-all shadow-md active:scale-95"
            title="14-Step Extended Spacecraft Intelligence Demo (3-5 min)"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Extended Demo</span>
          </button>

          {/* New 16-Step Advanced Monitoring Demo Button */}
          <button
            onClick={openAdvancedDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-mono font-medium rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-600/70 text-purple-200 hover:text-white transition-all shadow-md active:scale-95"
            title="16-Step Advanced Multi-Cam, Robot & Voice Monitoring Demo"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Advanced Demo</span>
          </button>

          {/* Primary Judge Demo Button */}
          <button
            onClick={openJudgeDemo}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-mono font-semibold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-space-950 shadow-hud-cyan transition-all transform active:scale-95"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>START JUDGE DEMO</span>
          </button>
        </div>
      </div>
    </header>
  );
};
