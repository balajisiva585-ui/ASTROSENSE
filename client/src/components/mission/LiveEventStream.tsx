import React, { useState, useEffect } from 'react';
import { LiveEventStreamItem } from '../../types';
import { api } from '../../services/api';
import { Radio, AlertTriangle, AlertCircle, Info, CheckCircle2, RefreshCw } from 'lucide-react';

export const LiveEventStream: React.FC = () => {
  const [events, setEvents] = useState<LiveEventStreamItem[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'CREW' | 'TELEMETRY' | 'ANOMALY' | 'ASTEROID'>('ALL');
  const [loading, setLoading] = useState(false);

  const fetchEvents = async () => {
    try {
      const data = await api.getLiveEventStream();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load event stream', err);
    }
  };

  useEffect(() => {
    fetchEvents();
    const interval = setInterval(fetchEvents, 1500);
    return () => clearInterval(interval);
  }, []);

  const filteredEvents = events.filter(e => {
    if (filter === 'ALL') return true;
    if (filter === 'CREW') return e.category === 'CREW';
    if (filter === 'TELEMETRY') return e.category === 'TELEMETRY';
    if (filter === 'ANOMALY') return e.category === 'ANOMALY';
    if (filter === 'ASTEROID') return e.category === 'ASTEROID';
    return true;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-300 border border-rose-500/50 text-[10px] font-mono font-bold">
            <AlertCircle className="w-3 h-3" />
            CRITICAL
          </span>
        );
      case 'WARNING':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/80 text-amber-300 border border-amber-500/50 text-[10px] font-mono font-bold">
            <AlertTriangle className="w-3 h-3" />
            WARNING
          </span>
        );
      case 'INFO':
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/50 text-[10px] font-mono">
            <Info className="w-3 h-3" />
            INFO
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 text-[10px] font-mono">
            <CheckCircle2 className="w-3 h-3" />
            NORMAL
          </span>
        );
    }
  };

  return (
    <div className="bg-space-900 border border-space-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[400px]">
      {/* Header */}
      <div className="p-3.5 border-b border-space-800 bg-space-950/70 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <h3 className="text-xs font-semibold font-mono tracking-wider text-slate-100 uppercase">
            LIVE MISSION EVENT FEED
          </h3>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-space-800 text-slate-400 font-mono">
            ROLLING BUFFER ({events.length})
          </span>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1 text-[11px] font-mono">
          {(['ALL', 'CREW', 'ANOMALY', 'ASTEROID', 'TELEMETRY'] as const).map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2 py-0.5 rounded transition-colors ${
                filter === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-400 hover:text-slate-200 bg-space-950'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar font-mono text-xs">
        {filteredEvents.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slate-500">
            No events recorded in buffer matching filter.
          </div>
        ) : (
          filteredEvents.map(evt => (
            <div
              key={evt.id}
              className={`p-2.5 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
                evt.severity === 'CRITICAL'
                  ? 'bg-rose-950/20 border-rose-800/60 text-rose-100'
                  : evt.severity === 'WARNING'
                  ? 'bg-amber-950/20 border-amber-800/60 text-amber-100'
                  : 'bg-space-950/70 border-space-800 text-slate-300 hover:border-space-700'
              }`}
            >
              <div className="flex items-start sm:items-center gap-2">
                <span className="text-[10px] text-slate-500 shrink-0">
                  {evt.displayTime || new Date(evt.timestamp).toLocaleTimeString()}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-space-800 text-cyan-300 border border-space-700 font-mono shrink-0">
                  {evt.category} • {evt.entityId}
                </span>
                <span className="text-xs font-sans text-slate-200">
                  {evt.message}
                </span>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                {getSeverityBadge(evt.severity)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
