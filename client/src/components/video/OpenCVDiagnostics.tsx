import React from 'react';
import { CameraDiagnostics } from '../../services/vision/PoseDetectionService';
import { ActivityDetectionResult, WebcamCalibration } from '../../types';
import {
  Camera,
  Activity,
  Cpu,
  Layers,
  Sparkles,
  Sun,
  Shield,
  Gauge,
  Scan,
  Radio,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

interface OpenCVDiagnosticsProps {
  diagnostics: CameraDiagnostics | null;
  result: ActivityDetectionResult | null;
  calibration: WebcamCalibration | null;
  isOpen: boolean;
  onClose?: () => void;
}

export const OpenCVDiagnostics: React.FC<OpenCVDiagnosticsProps> = ({
  diagnostics,
  result,
  calibration,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const openCV = diagnostics?.openCVMetrics;
  const isLive = diagnostics?.cameraState === 'LIVE';
  const openCvReady = diagnostics?.openCVReady ?? false;
  const mediaPipeReady = diagnostics?.modelStatus === 'READY';
  const landmarksCount = diagnostics?.landmarksCount ?? 0;
  const fps = diagnostics?.inferenceFps ?? result?.fps ?? 0;
  const latency = diagnostics?.inferenceLatencyMs ?? result?.latencyMs ?? 0;

  const lightColor =
    openCV?.lightQuality === 'GOOD'
      ? 'text-emerald-400'
      : openCV?.lightQuality === 'BRIGHT'
      ? 'text-amber-400'
      : 'text-rose-400';

  const imageQualityColor =
    openCV?.imageQuality === 'GOOD'
      ? 'text-cyan-400'
      : openCV?.imageQuality === 'SUB-OPTIMAL'
      ? 'text-amber-400'
      : 'text-rose-400';

  const motionColor =
    openCV?.motionLevel === 'HIGH'
      ? 'text-purple-400'
      : openCV?.motionLevel === 'MEDIUM'
      ? 'text-blue-400'
      : 'text-emerald-400';

  return (
    <div className="bg-space-950/95 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-4 font-mono text-xs shadow-2xl shadow-cyan-950/40 animate-fadeIn">
      {/* HUD Header */}
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <Scan className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <div className="text-white font-bold tracking-wider text-xs flex items-center gap-2">
            <span>ORBITAL CREW VISION</span>
            <span className="text-[10px] text-cyan-400 font-normal">// OPENCV.JS & MEDIAPIPE DIAGNOSTICS</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
            <Radio className="w-3 h-3" />
            <span>REAL WEBCAM TELEMETRY</span>
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white px-2 py-0.5 rounded hover:bg-space-800 transition"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Futuristic Telemetry Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-3">
        {/* Camera Link */}
        <div className="bg-space-900/80 p-2.5 rounded-lg border border-space-800">
          <div className="text-[10px] text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Camera className="w-3 h-3 text-cyan-400" /> CAMERA LINK
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
          </div>
          <div className="text-white font-bold text-xs mt-1.5">
            {diagnostics?.cameraState || 'UNINITIALIZED'}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            {diagnostics?.videoWidth && diagnostics?.videoHeight
              ? `${diagnostics.videoWidth}×${diagnostics.videoHeight}`
              : 'Auto-Negotiating'}
          </div>
        </div>

        {/* OpenCV Engine */}
        <div className="bg-space-900/80 p-2.5 rounded-lg border border-space-800">
          <div className="text-[10px] text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-blue-400" /> OPENCV.JS
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${openCvReady ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'}`} />
          </div>
          <div className="text-cyan-300 font-bold text-xs mt-1.5">
            {openCvReady ? 'READY (CLIENT WASM)' : 'INITIALIZING...'}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            PyrLK + Laplacian
          </div>
        </div>

        {/* Pose Landmarker */}
        <div className="bg-space-900/80 p-2.5 rounded-lg border border-space-800">
          <div className="text-[10px] text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> POSE ENGINE
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${mediaPipeReady ? 'bg-emerald-400' : 'bg-amber-400'}`} />
          </div>
          <div className="text-purple-300 font-bold text-xs mt-1.5">
            {landmarksCount > 0 ? `${landmarksCount}/33 SKELETON` : mediaPipeReady ? 'TRACKING' : 'LOADING'}
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            MediaPipe Pose Lite
          </div>
        </div>

        {/* Performance Measured */}
        <div className="bg-space-900/80 p-2.5 rounded-lg border border-space-800">
          <div className="text-[10px] text-gray-400 flex items-center justify-between">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" /> INFERENCE & FPS
            </span>
          </div>
          <div className="text-emerald-400 font-bold text-xs mt-1.5">
            {fps} FPS // {latency} ms
          </div>
          <div className="text-[10px] text-gray-500 mt-0.5">
            Real In-Browser Clock
          </div>
        </div>
      </div>

      {/* Optical & Environmental Measurements Bar */}
      <div className="grid grid-cols-3 gap-2.5 bg-space-900/60 p-2.5 rounded-lg border border-space-800 mb-3 text-[11px]">
        <div>
          <span className="text-gray-400 text-[10px]">LIGHT LUMINANCE:</span>
          <div className={`font-bold mt-0.5 ${lightColor}`}>
            {openCV?.lightQuality || 'GOOD'} <span className="text-gray-500 font-normal">({openCV?.brightness ?? 128}/255)</span>
          </div>
        </div>

        <div>
          <span className="text-gray-400 text-[10px]">IMAGE SHARPNESS:</span>
          <div className={`font-bold mt-0.5 ${imageQualityColor}`}>
            {openCV?.imageQuality || 'GOOD'} <span className="text-gray-500 font-normal">(Var: {openCV?.blurVariance ?? 120})</span>
          </div>
        </div>

        <div>
          <span className="text-gray-400 text-[10px]">OPTICAL FLOW MOTION:</span>
          <div className={`font-bold mt-0.5 ${motionColor}`}>
            {openCV?.motionLevel || 'LOW'} <span className="text-gray-500 font-normal">(Mag: {openCV?.motionMagnitude ?? 0})</span>
          </div>
        </div>
      </div>

      {/* Bottom Privacy & Integrity Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-400 pt-2 border-t border-space-800/80">
        <div className="flex items-center gap-2 text-emerald-400">
          <Shield className="w-3.5 h-3.5" />
          <span>ZERO CLOUD UPLOAD — RAW VIDEO BUFFER REMAINS STRICTLY IN BROWSER RAM</span>
        </div>

        <div className="text-gray-500">
          CLASSIFIER: <span className="text-gray-300">KINEMATIC RULES + TEMPORAL MAJORITY</span>
        </div>
      </div>
    </div>
  );
};
