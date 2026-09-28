import React, { useState } from 'react';
import { useMission } from '../../context/MissionContext';
import { AnomalyAlert } from '../../types';
import {
  ShieldAlert,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Bot,
  Filter,
  Clock,
  User,
  Zap,
  Check,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const AnomalyCenter: React.FC = () => {
  const { anomalies, resolveAnomalyAlert } = useMission();
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'WARNING' | 'RESOLVED'>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredAnomalies = anomalies.filter(a => {
    if (filter === 'ALL') return true;
    if (filter === 'CRITICAL') return a.severity === 'CRITICAL' && !a.resolved;
    if (filter === 'WARNING') return a.severity === 'WARNING' && !a.resolved;
    if (filter === 'RESOLVED') return a.resolved;
    return true;
  });

  const activeCount = anomalies.filter(a => !a.resolved).length;
  const criticalCount = anomalies.filter(a => !a.resolved && a.severity === 'CRITICAL').length;
  const warningCount = anomalies.filter(a => !a.resolved && a.severity === 'WARNING').length;
  const resolvedCount = anomalies.filter(a => a.resolved).length;

  const toggleExpand = (id: string) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-5 shadow-lg flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-rose-950/80 border border-rose-700/60 text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
              LIVE MISSION ANOMALY COMMAND CENTER
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Autonomous Crew, Spacecraft Subsystem & Deep-Space Anomaly Aggregator with AI Diagnostic Reasoning
            </p>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-lg bg-rose-950/70 border border-rose-800/60 text-rose-300 font-bold">
            {criticalCount} Critical
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-amber-950/70 border border-amber-800/60 text-amber-300 font-bold">
            {warningCount} Warning
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">
            {resolvedCount} Resolved
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 border-b border-space-800 pb-3">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-slate-400">FILTER:</span>
          {(['ALL', 'CRITICAL', 'WARNING', 'RESOLVED'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                filter === tab
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold shadow-sm'
                  : 'bg-space-950 text-slate-400 hover:text-slate-200 border border-space-800'
              }`}
            >
              {tab} (
              {tab === 'ALL'
                ? anomalies.length
                : tab === 'CRITICAL'
                ? criticalCount
                : tab === 'WARNING'
                ? warningCount
                : resolvedCount}
              )
            </button>
          ))}
        </div>

        <span className="text-[10px] font-mono text-slate-500 hidden sm:inline">
          Delayed-Tolerant Local Storage Active
        </span>
      </div>

      {/* Anomaly Cards List */}
      <div className="space-y-4">
        {filteredAnomalies.length === 0 ? (
          <div className="bg-space-900 border border-space-800 rounded-xl p-8 text-center text-slate-400 font-mono text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            No anomalies found matching current filter "{filter}". All subsystems operating nominally.
          </div>
        ) : (
          filteredAnomalies.map(ano => {
            const isExpanded = expandedId === ano.id;
            return (
              <div
                key={ano.id}
                className={`bg-space-900 border rounded-xl overflow-hidden transition-all shadow-lg ${
                  ano.resolved
                    ? 'border-space-800/80 opacity-75'
                    : ano.severity === 'CRITICAL'
                    ? 'border-rose-500/70 shadow-hud-red'
                    : 'border-amber-500/70 shadow-hud-amber'
                }`}
              >
                {/* Card Header */}
                <div
                  onClick={() => toggleExpand(ano.id)}
                  className="p-4 bg-space-950/80 cursor-pointer flex flex-wrap items-center justify-between gap-3 hover:bg-space-950 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-space-900 border border-space-800">
                      {ano.severity === 'CRITICAL' ? (
                        <AlertOctagon className="w-5 h-5 text-rose-400" />
                      ) : ano.severity === 'WARNING' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-300">{ano.id}</span>
                        <span className="text-xs font-bold text-slate-100">{ano.title}</span>
                        {ano.resolved && (
                          <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                            RESOLVED
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-sans mt-0.5">{ano.description}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-1 text-slate-300">
                        <Clock className="w-3 h-3 text-cyan-400" />
                        <span>{ano.displayTime || new Date(ano.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="text-slate-500">TARGET: {ano.targetObject || ano.astronautId || 'AST-01'}</div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400" />
                    )}
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="p-4 border-t border-space-800/90 bg-space-900 space-y-4 text-xs font-mono">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                      <div className="bg-space-950 p-2 rounded border border-space-800">
                        <span className="text-slate-500">SEVERITY:</span>
                        <div className={`font-bold ${ano.severity === 'CRITICAL' ? 'text-rose-400' : 'text-amber-400'}`}>
                          {ano.severity}
                        </div>
                      </div>
                      <div className="bg-space-950 p-2 rounded border border-space-800">
                        <span className="text-slate-500">MODULE / LOCATION:</span>
                        <div className="text-cyan-300 font-semibold">{ano.module?.replace(/_/g, ' ') || 'HABITAT MODULE'}</div>
                      </div>
                      <div className="bg-space-950 p-2 rounded border border-space-800">
                        <span className="text-slate-500">TRIGGER ACTIVITY:</span>
                        <div className="text-slate-200">{ano.activity || 'ABNORMAL EVENT'}</div>
                      </div>
                      <div className="bg-space-950 p-2 rounded border border-space-800">
                        <span className="text-slate-500">SYNC STATE:</span>
                        <div className="text-emerald-400 font-semibold">{ano.syncStatus || 'STORED_LOCAL'}</div>
                      </div>
                    </div>

                    {/* AI Analysis & Recommended Action */}
                    <div className="bg-space-950 p-3.5 rounded-lg border border-cyan-800/40 space-y-2">
                      <div className="flex items-center gap-2 text-cyan-300 font-bold text-xs">
                        <Bot className="w-4 h-4 text-cyan-400" />
                        <span>AI DIAGNOSTIC ANALYSIS:</span>
                      </div>
                      <p className="text-xs font-sans text-slate-300 leading-relaxed">
                        {ano.aiAnalysis || 'Onboard inference detected kinematic variance exceeding 3.8-sigma from baseline microgravity locomotion model.'}
                      </p>

                      {ano.telemetryEvidence && (
                        <div className="text-[11px] text-slate-400 font-mono bg-space-900/60 p-2 rounded">
                          <strong className="text-slate-300">Evidence:</strong> {ano.telemetryEvidence}
                        </div>
                      )}

                      <div className="pt-2 border-t border-space-800 text-xs">
                        <span className="text-amber-300 font-bold">RECOMMENDED PROCEDURE:</span>
                        <div className="text-slate-200 font-sans mt-1">
                          {ano.recommendedAction || '1. Initiate vocal safety check. 2. Verify telemetry stream. 3. Prepare medical telemetry sync.'}
                        </div>
                      </div>

                      <div className="text-[10px] text-slate-500 italic pt-1">
                        Notice: AI-generated decision support – human verification required. Never automatically actuates flight hardware.
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="text-[11px] text-slate-400">
                        Event Ref: <code className="text-cyan-400">{ano.id}</code>
                      </div>

                      {!ano.resolved && (
                        <button
                          onClick={() => resolveAnomalyAlert(ano.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-space-950 font-bold text-xs font-mono shadow-md transition-all active:scale-95"
                        >
                          <Check className="w-4 h-4" />
                          <span>RESOLVE ANOMALY</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
