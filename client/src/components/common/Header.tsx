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
  Database,
  Compass,
  Globe,
  HardDrive,
  Camera,
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    session,
    astronaut,
    anomalies,
    databaseStatus,
    telemetry,
    setTab,
    soundEnabled,
    toggleSound,
    openJudgeDemo,
    openExtendedDemo,
    openAdvancedDemo,
    openRealWebcamDemo,
    openVoiceModal,
    openReportModal,
  } = useMission();

  const isOffline = session?.commStatus === 'OFFLINE';
  const hasCriticalAnomaly = anomalies.some((a) => !a.resolved && a.severity === 'CRITICAL');
  const isPostgresOnline = databaseStatus?.postgres?.status === 'ONLINE';
  const isDbConfigured = databaseStatus?.databaseConfigured ?? false;
  const isSqliteOnline = databaseStatus?.sqlite?.status === 'ONLINE';

  return (
    <header className="sticky top-0 z-40 bg-space-950/95 backdrop-blur-lg border-b border-cyan-500/30 px-3 md:px-6 py-2.5 transition-all shadow-[0_4px_30px_rgba(0,0,0,0.8)]">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-3">
        {/* Left: Futuristic Spacecraft Command Branding */}
        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/20 border border-cyan-500/50 shadow-hud-cyan">
              <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    isOffline ? 'bg-amber-400' : 'bg-emerald-400'
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                    isOffline ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base md:text-lg font-bold tracking-widest text-white font-mono flex items-center gap-1.5">
                  <span className="text-cyan-400">◈</span> ASTROSENSE
                </h1>
                <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-950/90 text-cyan-300 border border-cyan-500/40 font-bold tracking-wider shadow-inner">
                  ONBOARD EDGE AI
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-sans tracking-tight">
                Autonomous Deep Space Crew Vision & Mission Intelligence
              </p>
            </div>
          </div>

          {/* Quick Spacecraft Orbit Metric (Visible on mobile/tablet) */}
          <div className="lg:hidden flex items-center gap-1.5 text-[10px] font-mono bg-space-900/90 px-2 py-1 rounded-lg border border-space-800">
            <span className="text-cyan-400 font-bold">ALT 419 KM</span>
          </div>
        </div>

        {/* Center: Real-Time Orbit & System Status LEDs */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
          {/* Mission Indicator */}
          <div className="bg-space-900/90 border border-space-800/90 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-inner">
            <span className="text-gray-500 text-[9px] uppercase">MISSION:</span>
            <span className="text-cyan-300 font-bold tracking-wider">
              {session?.missionName || 'AURORA'}
            </span>
          </div>

          {/* Mission Day */}
          <div className="bg-space-900/90 border border-space-800/90 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-inner">
            <span className="text-gray-500 text-[9px] uppercase">DAY:</span>
            <span className="text-white font-bold">0{session?.missionDay || 42}</span>
          </div>

          {/* Orbital Altitude */}
          <div className="bg-space-900/90 border border-space-800/90 px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-inner">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span className="text-cyan-300 font-bold">
              {telemetry?.orbitAltitudeKm ? `${telemetry.orbitAltitudeKm.toFixed(0)} KM` : '419 KM'}
            </span>
          </div>

          {/* Ground Comm Status LED */}
          <div
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
              isOffline
                ? 'bg-amber-950/70 border-amber-500/60 text-amber-300 shadow-hud-amber'
                : 'bg-emerald-950/70 border-emerald-500/60 text-emerald-300 shadow-hud-green'
            }`}
          >
            {isOffline ? (
              <WifiOff className="w-3 h-3 animate-pulse" />
            ) : (
              <Wifi className="w-3 h-3 text-emerald-400" />
            )}
            <span className="font-bold uppercase tracking-wider text-[10px]">
              {session?.commStatus || 'ONLINE'}
            </span>
          </div>

          {/* SQLite Local Storage Status LED */}
          <div className="bg-space-900/90 border border-emerald-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-emerald-300 shadow-inner">
            <HardDrive className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-bold">SQLITE ACID</span>
          </div>

          {/* Hybrid Database Setup Button & Status */}
          <button
            onClick={() => setTab('database-setup')}
            title="Open Hybrid Database Setup & Telemetry"
            className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
              isPostgresOnline
                ? 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/60 text-cyan-300 shadow-hud-cyan'
                : 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/60 text-amber-300 animate-pulse'
            }`}
          >
            <Database className="w-3 h-3" />
            <span className="font-bold uppercase tracking-wider text-[10px]">
              {isPostgresOnline ? 'POSTGRES SYNCED' : isDbConfigured ? 'POSTGRES OFFLINE' : 'DB SETUP'}
            </span>
          </button>
        </div>

        {/* Right: Quick Launch Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          {/* Sound Mute/Unmute */}
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Telemetry Audio' : 'Unmute Telemetry Audio'}
            className="p-1.5 rounded-lg bg-space-900 border border-space-800 hover:border-cyan-500/50 text-gray-400 hover:text-cyan-300 transition-colors"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-gray-500" />
            )}
          </button>

          {/* Voice Assistant Button */}
          <button
            onClick={openVoiceModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-600/60 text-cyan-200 transition-all shadow-md active:scale-95"
            title="Open Astrosense Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Voice Assistant</span>
          </button>

          {/* Extended Space Demo Button */}
          <button
            onClick={openExtendedDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-600/60 text-indigo-200 hover:text-cyan-200 transition-all shadow-md active:scale-95"
            title="14-Step Extended Spacecraft Intelligence Demo (3-5 min)"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Extended Demo</span>
          </button>

          {/* 16-Step Advanced Monitoring Demo Button */}
          <button
            onClick={openAdvancedDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-medium rounded-lg bg-purple-950/90 hover:bg-purple-900 border border-purple-600/70 text-purple-200 hover:text-white transition-all shadow-md active:scale-95"
            title="16-Step Advanced Multi-Cam, Robot & Voice Monitoring Demo"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">Advanced Demo</span>
          </button>

          {/* 17-Step Real Webcam + OpenCV Demo Button */}
          <button
            onClick={openRealWebcamDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-mono font-bold rounded-lg bg-emerald-950/90 hover:bg-emerald-900 border border-emerald-500/70 text-emerald-300 hover:text-white transition-all shadow-hud-green active:scale-95"
            title="17-Step Real Webcam + OpenCV.js Interactive Verification Demo"
          >
            <Camera className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">WEBCAM LAB (17-STEP)</span>
          </button>

          {/* Primary Judge Demo Button */}
          <button
            onClick={openJudgeDemo}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black shadow-hud-cyan transition-all transform active:scale-95"
            title="Start 13-Step Automated Judge Demo"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>JUDGE DEMO</span>
          </button>
        </div>
      </div>
    </header>
  );
};
