import React from 'react';
import { ActivityDetectionResult, WebcamCalibration } from '../../types';
import {
  ShieldCheck,
  Cpu,
  Activity,
  AlertTriangle,
  Eye,
  Lock,
  Compass,
  Gauge,
  Info,
} from 'lucide-react';

interface ActivityDetectionHUDProps {
  result: ActivityDetectionResult | null;
  calibration: WebcamCalibration | null;
  compact?: boolean;
}

export const ActivityDetectionHUD: React.FC<ActivityDetectionHUDProps> = ({
  result,
  calibration,
  compact = false,
}) => {
  const isAnomaly = result?.isAnomaly ?? false;
  const isNoPerson = result?.activity === 'NO_PERSON_DETECTED';
  const isAnalyzing = result?.activity === 'ANALYZING' || result?.activity === 'UNKNOWN';
  const isCalibrating = calibration?.calibrating;

  const activityColor = isAnomaly
    ? 'text-red-400'
    : isNoPerson
    ? 'text-gray-400'
    : isAnalyzing
    ? 'text-amber-300'
    : 'text-cyan-300';

  const badgeBg = isAnomaly
    ? 'bg-red-500/20 text-red-300 border-red-500/40'
    : isNoPerson
    ? 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    : isAnalyzing
    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
    : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';

  if (compact) {
    return (
      <div className="bg-space-950/90 backdrop-blur-md rounded-lg p-2 border border-space-800 text-xs font-mono flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-cyan-400">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold">REAL WEBCAM</span>
          </div>

          <div className="text-gray-300">
            ACTIVITY:{' '}
            <span className={`font-bold ${activityColor}`}>
              {result?.displayedActivity || 'ANALYZING...'}
            </span>
          </div>

          <div className="text-gray-400">
            CONF:{' '}
            <span className="text-emerald-400 font-bold">
              {result?.confidence ? `${result.confidence}%` : '--'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-gray-400">
          <div>FPS: <span className="text-white font-bold">{result?.fps ?? 0}</span></div>
          <div>LATENCY: <span className="text-white font-bold">{result?.latencyMs ?? 0}ms</span></div>
          <div className="text-gray-500">HR: <span className="text-gray-400">NOT AVAILABLE</span></div>
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeBg}`}>
            {isAnomaly ? '⚠ HAZARD' : isNoPerson ? 'EMPTY' : 'ON-DEVICE'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 bg-space-950/90 backdrop-blur-md rounded-xl p-3 border border-space-800 font-mono text-xs shadow-lg">
      {/* Top Telemetry Header */}
      <div className="flex items-center justify-between border-b border-space-800/80 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-bold text-white tracking-wide">REAL-TIME WEBCAM HAR</span>
          <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            ON-DEVICE VISION
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-gray-400">
          <div className="flex items-center gap-1 text-emerald-400">
            <Lock className="w-3 h-3" />
            <span>NO RAW VIDEO UPLOAD</span>
          </div>
        </div>
      </div>

      {/* Main Detection Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Activity Card */}
        <div className="bg-space-900/80 p-2 rounded-lg border border-space-800 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Activity className="w-3 h-3 text-cyan-400" />
            <span>DETECTED ACTIVITY</span>
          </div>
          <div className={`text-sm font-bold truncate mt-1 ${activityColor}`}>
            {result?.displayedActivity || 'NO PERSON DETECTED'}
          </div>
        </div>

        {/* Confidence Card */}
        <div className="bg-space-900/80 p-2 rounded-lg border border-space-800 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Gauge className="w-3 h-3 text-emerald-400" />
            <span>CONFIDENCE</span>
          </div>
          <div className="text-sm font-bold text-emerald-400 mt-1">
            {result && result.confidence > 0 ? `${result.confidence}%` : '--'}
          </div>
        </div>

        {/* Inference Latency & FPS */}
        <div className="bg-space-900/80 p-2 rounded-lg border border-space-800 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span>INFERENCE SPEED</span>
          </div>
          <div className="text-xs font-bold text-white mt-1">
            {result?.latencyMs ?? 0} ms <span className="text-gray-400 font-normal">({result?.fps ?? 0} FPS)</span>
          </div>
        </div>

        {/* Landmark Tracking Status */}
        <div className="bg-space-900/80 p-2 rounded-lg border border-space-800 flex flex-col justify-between">
          <div className="text-[10px] text-gray-400 flex items-center gap-1">
            <Eye className="w-3 h-3 text-cyan-400" />
            <span>POSE ESTIMATION</span>
          </div>
          <div className="text-xs font-bold text-cyan-300 mt-1">
            {result && result.landmarksCount > 0
              ? `${result.landmarksCount}/33 LANDMARKS`
              : 'NO SUBJECT'}
          </div>
        </div>
      </div>

      {/* Real Biomechanical Diagnostic Reason Banner */}
      <div className="bg-space-900/60 p-2 rounded-lg border border-space-800/80 flex items-start gap-2 text-[11px]">
        <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="flex-1">
          <span className="text-gray-400 font-semibold">DIAGNOSTIC EVIDENCE: </span>
          <span className="text-gray-200">{result?.reason || 'Awaiting frame input...'}</span>
        </div>
      </div>

      {/* Truthful Biometrics Disclaimer Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-500 border-t border-space-800/60 pt-2">
        <div className="flex items-center gap-3">
          <span>SOURCE: <strong className="text-cyan-400">REAL WEBCAM</strong></span>
          <span>PIPELINE: <strong className="text-gray-300">MEDIAPIPE + TEMPORAL RULES</strong></span>
          <span>HEART RATE: <strong className="text-gray-400">NOT AVAILABLE (NO SENSOR)</strong></span>
        </div>

        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span className="text-emerald-400 font-semibold">100% LOCAL BROWSER INFERENCE</span>
        </div>
      </div>
    </div>
  );
};
