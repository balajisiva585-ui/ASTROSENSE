import React, { useEffect, useState } from 'react';
import { useMission } from '../../context/MissionContext';
import { api } from '../../services/api';
import { MissionSummaryReport } from '../../types';
import {
  X,
  Download,
  Printer,
  FileSpreadsheet,
  CheckCircle2,
  ShieldCheck,
  Cpu,
  Clock,
  Activity,
  AlertTriangle,
  WifiOff,
} from 'lucide-react';

export const MissionReportModal: React.FC = () => {
  const { isReportModalOpen, closeReportModal } = useMission();
  const [report, setReport] = useState<MissionSummaryReport | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isReportModalOpen) {
      setLoading(true);
      api
        .getMissionReportSummary()
        .then(data => {
          setReport(data);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isReportModalOpen]);

  if (!isReportModalOpen) return null;

  const handleDownloadCsv = () => {
    window.open(api.getExportCsvUrl(), '_blank');
  };

  const handleDownloadJson = () => {
    window.open(api.getExportJsonUrl(), '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-4xl bg-space-900 border border-cyan-500/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-space-800 bg-space-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-wider">
                ASTROSENSE | FINAL MISSION AURORA TELEMETRY REPORT
              </h2>
              <p className="text-xs text-slate-400">
                Official Flight Behavioral & Activity Surveillance Summary
              </p>
            </div>
          </div>
          <button
            onClick={closeReportModal}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs print:text-black print:bg-white">
          {loading || !report ? (
            <div className="text-center py-12 text-slate-400">
              Generating mission telemetry report...
            </div>
          ) : (
            <>
              {/* Mission Header Overview */}
              <div className="p-4 rounded-xl bg-space-950 border border-space-800 grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Mission Name</span>
                  <span className="text-sm font-bold text-cyan-300">{report.mission}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Astronaut ID / Name</span>
                  <span className="text-sm font-bold text-slate-200">{report.astronautId} ({report.astronautName})</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Mission Day</span>
                  <span className="text-sm font-bold text-cyan-400">DAY 0{report.missionDay}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block">Elapsed Time</span>
                  <span className="text-sm font-bold text-slate-200">{report.missionDurationFormatted}</span>
                </div>
              </div>

              {/* Core Telemetry Performance Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-space-950 p-3 rounded-lg border border-space-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Total Detections</span>
                  <div className="text-lg font-bold text-cyan-400 mt-1">{report.totalDetections} events</div>
                </div>

                <div className="bg-space-950 p-3 rounded-lg border border-space-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Active vs Inactive</span>
                  <div className="text-xs font-bold text-slate-200 mt-1">
                    <span className="text-cyan-300">{report.totalActiveTimeFormatted}</span> / <span className="text-slate-400">{report.totalInactiveTimeFormatted}</span>
                  </div>
                </div>

                <div className="bg-space-950 p-3 rounded-lg border border-space-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Exercise Completed</span>
                  <div className="text-lg font-bold text-purple-400 mt-1">{report.exerciseDurationFormatted}</div>
                </div>

                <div className="bg-space-950 p-3 rounded-lg border border-space-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Safety Anomalies</span>
                  <div className="text-lg font-bold text-rose-400 mt-1">
                    {report.anomaliesDetectedCount} <span className="text-[10px] text-slate-400">({report.criticalAlertsCount} crit)</span>
                  </div>
                </div>
              </div>

              {/* Offline & Synchronization Audit */}
              <div className="p-4 rounded-xl bg-space-950 border border-space-800 space-y-3">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-400" />
                  <span>Offline Resilience & Telemetry Synchronization Audit</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-slate-300">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Comm Outage Duration</span>
                    <span className="font-bold text-amber-300">{report.totalOutageDurationFormatted}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Events Stored Locally</span>
                    <span className="font-bold text-slate-200">{report.eventsStoredLocallyCount} items</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Synchronized to Ground</span>
                    <span className="font-bold text-emerald-400">{report.eventsSynchronizedCount} items</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase block">Edge System Availability</span>
                    <span className="font-bold text-cyan-400">{report.systemAvailabilityPercentage}%</span>
                  </div>
                </div>
              </div>

              {/* Activity Breakdown Distribution */}
              <div className="p-4 rounded-xl bg-space-950 border border-space-800 space-y-2">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Human Activity Classification Distribution
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {Object.entries(report.activityBreakdown).map(([act, count]) => (
                    <div key={act} className="bg-space-900 p-2 rounded border border-space-800 flex justify-between items-center">
                      <span className="text-[10px] text-slate-400 truncate">{act.replace(/_/g, ' ')}:</span>
                      <span className="font-bold text-cyan-300">{count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conclusions & Mission Safety Verification */}
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 space-y-2">
                <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Autonomous Flight Safety Verification Conclusions</span>
                </h4>
                <ul className="space-y-1.5 font-sans text-xs text-emerald-100/90 list-disc list-inside">
                  {report.conclusions.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-space-800 bg-space-950/90 text-xs">
          <div className="text-slate-400 text-[11px]">
            Generated by AstroSense Autonomous Onboard Subsystem • Zero External Server
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleDownloadCsv}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700 text-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export CSV</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700 text-slate-200 transition-colors"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              <span>Export JSON</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold transition-all shadow-hud-cyan"
            >
              <Printer className="w-4 h-4" />
              <span>Print Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
