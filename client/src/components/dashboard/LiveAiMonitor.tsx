import React, { useState, useRef, useEffect } from 'react';
import { useMission } from '../../context/MissionContext';
import { PoseSkeletonOverlay } from '../ai/PoseSkeletonOverlay';
import { ActivityConfidenceGauge } from '../ai/ActivityConfidenceGauge';
import { VideoUploadAnalyzer } from '../ai/VideoUploadAnalyzer';
import {
  Camera,
  Film,
  PlaySquare,
  Radio,
  Eye,
  Zap,
  Activity as ActivityIcon,
  Maximize2,
  Shield,
  Layers,
} from 'lucide-react';

export const LiveAiMonitor: React.FC = () => {
  const { astronaut, session, inputMode, setInputMode } = useMission();
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const currentActivity = astronaut?.currentActivity || 'WORKING';
  const confidence = astronaut?.activityConfidence || 96.4;
  const duration = astronaut?.activityDurationSeconds || 0;
  const currentModule = astronaut?.currentModule || 'LABORATORY';

  // Manage webcam stream when in CAMERA mode
  useEffect(() => {
    let stream: MediaStream | null = null;

    if (inputMode === 'CAMERA') {
      navigator.mediaDevices
        ?.getUserMedia({ video: { width: 640, height: 360 } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
          setWebcamActive(true);
          setWebcamError(null);
        })
        .catch(err => {
          console.warn('Webcam not available or permission denied:', err);
          setWebcamError('Webcam access unavailable. Using synthetic Edge sensor fallback.');
          setWebcamActive(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setWebcamActive(false);
      setWebcamError(null);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [inputMode]);

  return (
    <div className="bg-space-900 border border-space-800 rounded-2xl p-4 lg:p-5 flex flex-col gap-4 shadow-xl">
      {/* Top Header: Feed Selection Mode Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-space-800">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Eye className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <span>LIVE ONBOARD AI VISION FEED</span>
              <span className="text-[10px] bg-cyan-950/80 text-cyan-300 px-2 py-0.5 rounded border border-cyan-800/60">
                MODULE: {currentModule.replace(/_/g, ' ')}
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Spatial-Temporal Graph Convolution Pose Classifier (Zero Cloud Link)
            </p>
          </div>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center bg-space-950 p-1 rounded-lg border border-space-800 text-xs font-mono">
          <button
            onClick={() => setInputMode('SIMULATION')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              inputMode === 'SIMULATION'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <PlaySquare className="w-3.5 h-3.5" />
            <span>Mission Sim</span>
          </button>

          <button
            onClick={() => setInputMode('CAMERA')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              inputMode === 'CAMERA'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Webcam</span>
          </button>

          <button
            onClick={() => setInputMode('VIDEO')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
              inputMode === 'VIDEO'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            <span>Local Video</span>
          </button>
        </div>
      </div>

      {/* Main Viewport Container */}
      <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-space-950 border border-space-800 flex items-center justify-center shadow-inner group">
        {/* Background Atmosphere / Habitat Visual Grid */}
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

        {/* HUD Targeting Watermark & Telemetry Overlay */}
        <div className="absolute top-3 left-3 z-30 font-mono text-[11px] text-cyan-400/90 bg-space-950/80 px-2.5 py-1 rounded border border-cyan-900/50 backdrop-blur-sm flex items-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>CAM: BAS-{currentModule.substring(0, 3)}-01</span>
          <span className="text-slate-500">|</span>
          <span>FPS: 30.0</span>
          <span className="text-slate-500">|</span>
          <span>RES: 640x360</span>
        </div>

        <div className="absolute top-3 right-3 z-30 font-mono text-[11px] text-slate-300 bg-space-950/80 px-2.5 py-1 rounded border border-space-800 backdrop-blur-sm flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-cyan-300 font-semibold">ONBOARD EDGE AI</span>
        </div>

        {/* Live Camera Mode video tag */}
        {inputMode === 'CAMERA' && (
          <video
            ref={videoRef}
            playsInline
            muted
            autoPlay
            className={`w-full h-full object-cover transform -scale-x-100 ${webcamActive ? 'opacity-80' : 'opacity-0'}`}
          />
        )}

        {/* Fallback Habitat Graphic for SIMULATION or when webcam unavailable */}
        {(inputMode === 'SIMULATION' || (inputMode === 'CAMERA' && !webcamActive)) && (
          <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-b from-space-950 via-space-900 to-space-950">
            {/* Microgravity habitat interior lines */}
            <svg className="w-full h-full opacity-30 absolute inset-0" preserveAspectRatio="none" viewBox="0 0 640 360">
              <path d="M 0,0 L 200,120 L 440,120 L 640,0" fill="none" stroke="#00f2fe" strokeWidth="0.5" />
              <path d="M 0,360 L 200,240 L 440,240 L 640,360" fill="none" stroke="#00f2fe" strokeWidth="0.5" />
              <line x1="200" y1="120" x2="200" y2="240" stroke="#00f2fe" strokeWidth="0.5" />
              <line x1="440" y1="120" x2="440" y2="240" stroke="#00f2fe" strokeWidth="0.5" />
              <circle cx="320" cy="180" r="90" fill="none" stroke="#3b82f6" strokeWidth="0.5" strokeDasharray="4 4" />
            </svg>

            {/* Simulated astronaut silhouette graphic behind pose */}
            <div className="text-center z-10 select-none pointer-events-none">
              <span className="text-xs font-mono uppercase tracking-widest text-slate-500 block mb-1">
                {currentModule.replace(/_/g, ' ')} OPTICAL SENSOR
              </span>
              <span className="text-2xl font-bold font-mono tracking-wider text-slate-300/40">
                ASTRONAUT AST-01
              </span>
              {webcamError && (
                <p className="text-[11px] text-amber-400/90 font-mono mt-2 bg-amber-950/60 px-3 py-1 rounded border border-amber-800/40 max-w-sm mx-auto">
                  {webcamError}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Live Biomechanical Skeleton Overlay */}
        <PoseSkeletonOverlay activity={currentActivity} confidence={confidence} />

        {/* Bottom Left Frame Coordinate HUD */}
        <div className="absolute bottom-3 left-3 z-30 font-mono text-[10px] text-slate-400 bg-space-950/80 px-2.5 py-1 rounded border border-space-800">
          <span>LATENCY: </span>
          <span className="text-amber-300 font-bold">24.5 ms</span>
          <span className="text-slate-600 mx-1.5">|</span>
          <span>NPU: </span>
          <span className="text-emerald-300 font-bold">ACTIVE (INT8)</span>
        </div>

        {/* Bottom Right Optical Mode HUD */}
        <div className="absolute bottom-3 right-3 z-30 font-mono text-[10px] text-cyan-400 bg-space-950/80 px-2.5 py-1 rounded border border-space-800">
          <span>PIPELINE: ST-GCN + CONVLSTM</span>
        </div>
      </div>

      {/* Video Mode Uploader (if Video mode selected) */}
      {inputMode === 'VIDEO' && <VideoUploadAnalyzer />}

      {/* Confidence & Telemetry Bottom Card */}
      <ActivityConfidenceGauge
        activity={currentActivity}
        confidence={confidence}
        durationSeconds={duration}
        inferenceLatencyMs={24.5}
      />
    </div>
  );
};
