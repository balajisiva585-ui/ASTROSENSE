import React, { useState } from 'react';
import { useMission } from '../../context/MissionContext';
import {
  Database,
  Globe2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Server,
  Layers,
  Settings,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';

export const DatabaseStatusCard: React.FC = () => {
  const {
    databaseStatus,
    triggerDatabaseSync,
    refreshDatabaseStatus,
    setTab,
  } = useMission();

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const sqliteOnline = databaseStatus?.sqlite?.status === 'ONLINE';
  const postgresOnline = databaseStatus?.postgres?.status === 'ONLINE';
  const isConfigured = databaseStatus?.databaseConfigured ?? false;
  const engineStatus = databaseStatus?.syncEngine?.engineStatus || 'IDLE';
  const pendingCount = databaseStatus?.syncEngine?.pendingEventsCount || 0;
  const lastSync = databaseStatus?.syncEngine?.lastSyncTime
    ? new Date(databaseStatus.syncEngine.lastSyncTime).toLocaleTimeString()
    : 'None';
  const totalRecords = databaseStatus?.sqlite?.totalRecordsCount || 0;

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await triggerDatabaseSync();
      setSyncFeedback('Sync successful!');
      setTimeout(() => setSyncFeedback(null), 3000);
    } catch (err: any) {
      setSyncFeedback(`Sync failed: ${err.message || 'Offline'}`);
      setTimeout(() => setSyncFeedback(null), 4000);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="bg-space-950 border border-cyan-500/40 rounded-2xl p-4 shadow-[0_0_25px_rgba(0,240,255,0.1)] space-y-4 font-mono text-xs">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-space-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-100 tracking-wider">
                HYBRID DATABASE TELEMETRY
              </h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-semibold">
                SQLITE + POSTGRESQL
              </span>
            </div>
            <div className="text-[11px] text-slate-400 font-sans">
              Onboard Resilient Edge Storage & Ground Central Synchronizer
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-space-950 font-bold flex items-center gap-1.5 shadow-hud-cyan text-[11px] transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>SYNC NOW</span>
          </button>
          <button
            onClick={() => setTab('database-setup')}
            className="px-3 py-1.5 rounded-lg bg-space-900 border border-space-800 hover:border-cyan-500 text-slate-300 font-bold flex items-center gap-1.5 text-[11px] transition-all"
          >
            <Settings className="w-3.5 h-3.5 text-cyan-400" />
            <span>SETUP WIZARD</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div
          className={`p-2.5 rounded-lg border text-[11px] font-mono flex items-center gap-2 ${
            syncFeedback.includes('successful')
              ? 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
              : 'bg-amber-950/70 border-amber-500/50 text-amber-300'
          }`}
        >
          {syncFeedback.includes('successful') ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Database Status Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Local SQLite */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-500 uppercase flex items-center justify-between">
            <span>Local SQLite</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <div className="text-sm font-bold text-emerald-300 mt-1">ONLINE</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Primary Resilient</div>
        </div>

        {/* Ground PostgreSQL */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-500 uppercase flex items-center justify-between">
            <span>Ground Postgres</span>
            <span
              className={`w-2 h-2 rounded-full ${
                postgresOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
          </div>
          <div
            className={`text-sm font-bold mt-1 ${
              postgresOnline ? 'text-emerald-300' : 'text-amber-400'
            }`}
          >
            {postgresOnline ? 'ONLINE' : isConfigured ? 'OFFLINE' : 'AWAITING SETUP'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {databaseStatus?.config?.provider || 'None'}
          </div>
        </div>

        {/* Sync Engine */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-500 uppercase">Sync Engine</div>
          <div
            className={`text-sm font-bold mt-1 ${
              engineStatus === 'SYNCING'
                ? 'text-cyan-400 animate-pulse'
                : engineStatus === 'COMPLETED'
                ? 'text-emerald-400'
                : engineStatus === 'PAUSED'
                ? 'text-amber-400'
                : 'text-slate-300'
            }`}
          >
            {engineStatus}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">10s Auto-Sync</div>
        </div>

        {/* Pending Events */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-500 uppercase">Pending Events</div>
          <div
            className={`text-sm font-bold mt-1 ${
              pendingCount > 0 ? 'text-amber-400' : 'text-emerald-300'
            }`}
          >
            {pendingCount}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">In Resilient Queue</div>
        </div>

        {/* Last Sync */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-500 uppercase">Last Sync</div>
          <div className="text-xs font-bold text-cyan-300 mt-1 truncate">{lastSync}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">Idempotent Batch</div>
        </div>

        {/* Database Records */}
        <div className="bg-space-900 border border-space-800 rounded-xl p-3">
          <div className="text-[10px] text-slate-500 uppercase">Database Records</div>
          <div className="text-sm font-bold text-slate-100 mt-1">{totalRecords}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">10 Active Tables</div>
        </div>
      </div>
    </div>
  );
};
