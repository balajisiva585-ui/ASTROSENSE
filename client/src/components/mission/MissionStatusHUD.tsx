import React from 'react';
import { useMission } from '../../context/MissionContext';
import {
  Globe,
  Radio,
  Wifi,
  WifiOff,
  Cpu,
  Database,
  Users,
  Clock,
  Compass,
  Activity,
  Shield,
  Layers,
} from 'lucide-react';

export const MissionStatusHUD: React.FC = () => {
  const { session, astronaut, crewList, databaseStatus, telemetry } = useMission();

  const isOffline = session?.commStatus === 'OFFLINE';
  const isPostgresOnline = databaseStatus?.postgres?.status === 'ONLINE';
  const isSqliteOnline = databaseStatus?.sqlite?.status === 'ONLINE';
  const crewCount = crewList?.length || 4;

  return (
    <div className="bg-space-950/80 border border-cyan-500/30 rounded-2xl p-3.5 md:p-4 font-mono shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Corner Brackets */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-400" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-400" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

      {/* Top Header Label */}
      <div className="flex items-center justify-between border-b border-space-800 pb-2 mb-3 text-xs">
        <div className="flex items-center gap-2 text-cyan-300 font-bold tracking-widest">
          <Globe className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <span>MISSION CONTROL // STATUS HUD</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <span>SPACECRAFT NODE: <strong className="text-white">AURORA-01</strong></span>
          <span className="text-cyan-700">|</span>
          <span className="text-amber-400 font-semibold">SIMULATED FLIGHT TELEMETRY</span>
        </div>
      </div>

      {/* Main Mission Telemetry Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 text-xs">
        {/* Mission Name */}
        <div className="bg-space-900/90 p-2.5 rounded-xl border border-space-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span>MISSION</span>
          </div>
          <div className="text-sm font-bold text-cyan-300 mt-1 truncate">
            {session?.missionName || 'AURORA'}
          </div>
        </div>

        {/* Status */}
        <div className="bg-space-900/90 p-2.5 rounded-xl border border-space-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span>STATUS</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            NOMINAL
          </div>
        </div>

        {/* Mission Day */}
        <div className="bg-space-900/90 p-2.5 rounded-xl border border-space-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3 text-cyan-400" />
            <span>DAY</span>
          </div>
          <div className="text-sm font-bold text-white mt-1">
            DAY 0{session?.missionDay || 42}
          </div>
        </div>

        {/* Orbital Altitude */}
        <div className="bg-space-900/90 p-2.5 rounded-xl border border-space-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Compass className="w-3 h-3 text-cyan-400" />
            <span>ORBIT</span>
          </div>
          <div className="text-sm font-bold text-cyan-300 mt-1">
            {telemetry?.orbitAltitudeKm ? `${telemetry.orbitAltitudeKm.toFixed(0)} KM` : '419 KM'}
          </div>
        </div>

        {/* Crew Onboard */}
        <div className="bg-space-900/90 p-2.5 rounded-xl border border-space-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Users className="w-3 h-3 text-purple-400" />
            <span>CREW</span>
          </div>
          <div className="text-sm font-bold text-purple-300 mt-1">
            {crewCount} ASTRONAUTS
          </div>
        </div>

        {/* AI Core */}
        <div className="bg-space-900/90 p-2.5 rounded-xl border border-space-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>AI CORE</span>
          </div>
          <div className="text-sm font-bold text-cyan-400 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
            ONLINE
          </div>
        </div>

        {/* Local Storage (SQLite) */}
        <div className="bg-space-900/90 p-2.5 rounded-xl border border-space-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Database className="w-3 h-3 text-emerald-400" />
            <span>LOCAL STORAGE</span>
          </div>
          <div className="text-xs font-bold text-emerald-300 mt-1 truncate">
            {isSqliteOnline ? 'SQLITE (ACID)' : 'LOCAL VAULT'}
          </div>
        </div>

        {/* Ground Link (DSN) */}
        <div className="bg-space-900/90 p-2.5 rounded-xl border border-space-800/90 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            {isOffline ? (
              <WifiOff className="w-3 h-3 text-amber-400" />
            ) : (
              <Wifi className="w-3 h-3 text-emerald-400" />
            )}
            <span>GROUND LINK</span>
          </div>
          <div
            className={`text-xs font-bold mt-1 truncate ${
              isOffline ? 'text-amber-400' : 'text-emerald-400'
            }`}
          >
            {isOffline ? 'BLACKOUT (OFFLINE)' : isPostgresOnline ? 'POSTGRES SYNCED' : 'ONLINE (LOCAL)'}
          </div>
        </div>
      </div>
    </div>
  );
};
