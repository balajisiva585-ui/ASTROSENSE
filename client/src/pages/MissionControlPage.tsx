import React from 'react';
import { useMission } from '../context/MissionContext';
import { TelemetryCard } from '../components/common/TelemetryCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { MissionEvent } from '../types';
import {
  Globe2,
  Radio,
  Wifi,
  WifiOff,
  Database,
  RefreshCw,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowDownCircle,
  Activity,
  Layers,
  Cpu,
  Server,
  Zap,
} from 'lucide-react';

export const MissionControlPage: React.FC = () => {
  const { session, events, syncState, triggerSyncNow, setComm } = useMission();

  const isOffline = session?.commStatus === 'OFFLINE';
  const unsyncedCount = session?.unsyncedEventCount || 0;
  const syncedEvents = events.filter((e: MissionEvent) => e.syncStatus === 'SYNCED');
  const pendingEvents = events.filter((e: MissionEvent) => e.syncStatus === 'PENDING');

  return (
    <div className="space-y-6 font-mono">
      {/* Header Banner */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
            <Globe2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-100 tracking-wider">
                EARTH GROUND MISSION CONTROL & ONBOARD NODE ARCHITECTURE
              </h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950/80 text-blue-300 border border-blue-800/60 font-semibold">
                DELAY-TOLERANT ARCHITECTURE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Comparison view: Earth Ground Receiver vs Onboard Edge AI Intelligence Layer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right text-xs">
            <span className="text-[10px] text-slate-500 uppercase block">DSN Downlink State:</span>
            <span className={`font-bold ${isOffline ? 'text-amber-400' : 'text-emerald-400'}`}>
              {isOffline ? 'BLACKOUT / LOSS OF SIGNAL' : 'CARRIER LOCKED (ONLINE)'}
            </span>
          </div>
          <button
            onClick={() => setComm(isOffline ? 'ONLINE' : 'OFFLINE')}
            className={`px-3.5 py-2 rounded-lg border text-xs font-bold transition-all shadow-md active:scale-95 ${
              isOffline
                ? 'bg-emerald-600 hover:bg-emerald-500 text-space-950 border-emerald-400 font-mono'
                : 'bg-amber-950/90 hover:bg-amber-900 border-amber-500 text-amber-300'
            }`}
          >
            {isOffline ? 'RESTORE COMMUNICATION' : 'SIMULATE COMMUNICATION LOSS'}
          </button>
        </div>
      </div>

      {/* Split-Screen Concept */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: 🌍 EARTH MISSION CONTROL */}
        <div className="space-y-4">
          <div className="bg-space-900 border border-blue-500/40 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Globe2 className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase">
                  🌍 EARTH MISSION CONTROL (GROUND)
                </h3>
                <div className="text-[11px] text-slate-400 font-sans">
                  Scientists & Flight Directors on Earth (DSN Receiver)
                </div>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${
              isOffline
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 animate-pulse'
                : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
            }`}>
              {isOffline ? 'COMMUNICATION UNAVAILABLE' : 'GROUND LINK ONLINE'}
            </span>
          </div>

          {/* If Offline Alert on Earth side */}
          {isOffline && (
            <div className="p-4 bg-rose-950/30 border border-rose-500/70 rounded-xl text-xs space-y-2 shadow-hud-red animate-pulse">
              <div className="flex items-center gap-2 font-bold text-rose-300">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>⚠ COMMUNICATION UNAVAILABLE – GROUND TELEMETRY FROZEN</span>
              </div>
              <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                Ground stations are currently unable to receive live updates from the spacecraft. Earth telemetry reflects the last confirmed state before blackout.
              </p>
            </div>
          )}

          <TelemetryCard
            title="GROUND SYNCHRONIZED TIMELINE"
            subtitle="Verified Events Received via DSN Downlink"
            badge={
              <span className="text-[11px] text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-800">
                {syncedEvents.length} VERIFIED
              </span>
            }
            glow={isOffline ? 'none' : 'green'}
          >
            <div className="space-y-3 text-xs">
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                {syncedEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Awaiting initial ground telemetry handshake...
                  </div>
                ) : (
                  syncedEvents.map((evt: MissionEvent) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-lg bg-space-950 border border-space-800 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400 font-bold">{evt.displayTime}</span>
                        <StatusBadge type="activity" value={evt.activity} />
                        <span className="text-slate-300 truncate max-w-[160px] text-[11px]">{evt.details}</span>
                      </div>
                      <div className="flex items-center gap-1 text-emerald-400 text-[10px] shrink-0">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>SYNCED</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TelemetryCard>
        </div>

        {/* RIGHT: 🚀 ONBOARD ASTROSENSE NODE */}
        <div className="space-y-4">
          <div className="bg-space-900 border border-cyan-500/40 rounded-xl p-4 shadow-lg flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Cpu className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase">
                  🚀 ONBOARD ASTROSENSE NODE (EDGE)
                </h3>
                <div className="text-[11px] text-slate-400 font-sans">
                  Local HAR Inference, SQLite Event Vault & Safety System
                </div>
              </div>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-mono font-bold ${
              isOffline
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-hud-amber'
                : 'bg-cyan-950/80 border-cyan-500 text-cyan-300'
            }`}>
              {isOffline ? 'AUTONOMOUS MODE ACTIVE' : 'NOMINAL EDGE INFERENCE'}
            </span>
          </div>

          {/* Sync Progress Bar if synchronizing */}
          {syncState && syncState.isSyncing && (
            <div className="p-4 bg-cyan-950/60 border border-cyan-500/60 rounded-xl text-xs space-y-2 shadow-hud-cyan">
              <div className="flex items-center justify-between text-cyan-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  SYNCHRONIZING PENDING EVENTS TO GROUND...
                </span>
                <span>{syncState.syncProgress}%</span>
              </div>
              <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden border border-cyan-800">
                <div
                  className="h-full bg-cyan-400 transition-all duration-300"
                  style={{ width: `${syncState.syncProgress}%` }}
                />
              </div>
            </div>
          )}

          <TelemetryCard
            title="SPACECRAFT ONBOARD PENDING QUEUE"
            subtitle="Local Events Queued in Flash Memory"
            badge={
              <span className={`text-[11px] px-2.5 py-0.5 rounded border ${
                unsyncedCount > 0
                  ? 'bg-amber-950 text-amber-300 border-amber-500 animate-pulse'
                  : 'bg-space-950 text-slate-400 border-space-800'
              }`}>
                {unsyncedCount} PENDING
              </span>
            }
            glow={unsyncedCount > 0 ? 'amber' : 'none'}
          >
            <div className="space-y-3 text-xs">
              <div className={`p-3 rounded-lg border text-[11px] font-sans leading-relaxed ${
                isOffline
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                  : 'bg-space-950 border-space-800 text-slate-300'
              }`}>
                {isOffline ? (
                  <span>
                    <strong>AUTONOMOUS LOGGING:</strong> Onboard AI is recording all astronaut activities and anomalies directly to SQLite. Zero data loss during blackout.
                  </span>
                ) : (
                  <span>
                    Ground link online. Sync engine automatically delivers buffered packets to Earth.
                  </span>
                )}
              </div>

              {unsyncedCount > 0 && !isOffline && (
                <button
                  onClick={triggerSyncNow}
                  className="w-full py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>SYNCHRONIZE STORED EVENTS ({unsyncedCount})</span>
                </button>
              )}

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1 no-scrollbar">
                {pendingEvents.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    All onboard events synchronized with ground database.
                  </div>
                ) : (
                  pendingEvents.map((evt: MissionEvent) => (
                    <div
                      key={evt.id}
                      className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/40 flex items-center justify-between gap-2 text-amber-200"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{evt.displayTime}</span>
                        <StatusBadge type="activity" value={evt.activity} />
                        <span className="text-slate-300 truncate max-w-[160px] text-[11px]">{evt.details}</span>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-900/60 border border-amber-600/50 text-amber-200 font-bold shrink-0">
                        HELD ONBOARD
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </TelemetryCard>
        </div>
      </div>

      {/* Protocol Architecture Summary */}
      <TelemetryCard
        title="DELAY-TOLERANT PROTOCOL (DTN) PACKET METRICS"
        subtitle="CCSDS Space Packet Protocol / Bundle Protocol (RFC 5050)"
      >
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-space-950 p-3 rounded-lg border border-space-800">
            <span className="text-[10px] text-slate-500 uppercase block">Simulated Propagation Delay</span>
            <span className="text-sm font-bold text-cyan-400 mt-0.5">1.34s (Lunar Distance)</span>
          </div>
          <div className="bg-space-950 p-3 rounded-lg border border-space-800">
            <span className="text-[10px] text-slate-500 uppercase block">Local Storage Type</span>
            <span className="text-sm font-bold text-slate-200 mt-0.5">SQLite / Onboard Flash</span>
          </div>
          <div className="bg-space-950 p-3 rounded-lg border border-space-800">
            <span className="text-[10px] text-slate-500 uppercase block">Telemetry Integrity</span>
            <span className="text-sm font-bold text-emerald-400 mt-0.5">100% (CRC32 Verified)</span>
          </div>
          <div className="bg-space-950 p-3 rounded-lg border border-space-800">
            <span className="text-[10px] text-slate-500 uppercase block">AI Decision Mode</span>
            <span className="text-sm font-bold text-cyan-300 mt-0.5">Autonomous Edge Layer</span>
          </div>
        </div>
      </TelemetryCard>
    </div>
  );
};
