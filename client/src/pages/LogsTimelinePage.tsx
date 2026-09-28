import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import { TelemetryCard } from '../components/common/TelemetryCard';
import { StatusBadge } from '../components/common/StatusBadge';
import {
  History,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Radio,
} from 'lucide-react';
import { ActivityType, SyncStatus, MissionEvent } from '../types';

export const LogsTimelinePage: React.FC = () => {
  const { events, session } = useMission();
  const [search, setSearch] = useState<string>('');
  const [syncFilter, setSyncFilter] = useState<string>('ALL');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');

  const filteredEvents = events.filter((evt: MissionEvent) => {
    if (syncFilter !== 'ALL' && evt.syncStatus !== syncFilter) return false;
    if (severityFilter !== 'ALL' && evt.severity !== severityFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        evt.activity.toLowerCase().includes(q) ||
        evt.details.toLowerCase().includes(q) ||
        evt.module.toLowerCase().includes(q) ||
        evt.displayTime.includes(q)
      );
    }
    return true;
  });

  const handleDownloadCsv = () => {
    window.open('/api/export/events.csv', '_blank');
  };

  const handleDownloadJson = () => {
    window.open('/api/export/report.json', '_blank');
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Banner with Controls & Exports */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <History className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100 tracking-wider">
              MISSION TELEMETRY AUDIT LOGS
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              High-Precision Sequential Event Stream with Cryptographic Integrity
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleDownloadCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-space-950 hover:bg-space-850 border border-space-750 text-slate-200 transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleDownloadJson}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-space-950 hover:bg-space-850 border border-space-750 text-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-xl bg-space-900 border border-space-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search events, activities, modules..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Sync Status Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[10px] uppercase">Sync:</span>
          <select
            value={syncFilter}
            onChange={e => setSyncFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Sync States</option>
            <option value="SYNCED">Synced to Ground Only</option>
            <option value="PENDING">Pending (Held Onboard)</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-2">
          <span className="text-slate-500 text-[10px] uppercase">Severity:</span>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="flex-1 px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Severities</option>
            <option value="INFO">Nominal (Info)</option>
            <option value="WARNING">Warnings</option>
            <option value="CRITICAL">Critical Safety Events</option>
          </select>
        </div>
      </div>

      {/* Events Table */}
      <TelemetryCard
        title="EVENT STREAM RECORDS"
        subtitle={`Showing ${filteredEvents.length} of ${events.length} records`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-space-800 text-[10px] text-slate-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Time (UTC)</th>
                <th className="py-2.5 px-3">Event ID</th>
                <th className="py-2.5 px-3">Activity</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Module</th>
                <th className="py-2.5 px-3">Sync Status</th>
                <th className="py-2.5 px-3">Telemetry Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-850">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No matching events found for current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredEvents.map((evt: MissionEvent) => {
                  const isCritical = evt.severity === 'CRITICAL';
                  const isWarning = evt.severity === 'WARNING';

                  return (
                    <tr
                      key={evt.id}
                      className={`hover:bg-space-850/60 transition-colors ${
                        isCritical ? 'bg-rose-950/20' : isWarning ? 'bg-amber-950/20' : ''
                      }`}
                    >
                      <td className="py-3 px-3 font-bold text-slate-300">{evt.displayTime}</td>
                      <td className="py-3 px-3 text-slate-500">{evt.id}</td>
                      <td className="py-3 px-3">
                        <StatusBadge type="activity" value={evt.activity} />
                      </td>
                      <td className="py-3 px-3 text-cyan-400 font-bold">{evt.confidence.toFixed(1)}%</td>
                      <td className="py-3 px-3 text-slate-400">{evt.module.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-3">
                        <StatusBadge type="sync" value={evt.syncStatus} />
                      </td>
                      <td className="py-3 px-3 text-slate-300 font-sans max-w-sm">{evt.details}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </TelemetryCard>
    </div>
  );
};
