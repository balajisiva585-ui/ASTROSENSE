import React, { useRef, useEffect, useState, useCallback } from 'react';
import {
  VisionLandmark,
  ActivityDetectionResult,
  WebcamCalibration,
  HabitatModule,
  ActivityType,
} from '../../types';
import {
  PoseDetectionService,
  CameraDiagnostics,
} from '../../services/vision/PoseDetectionService';
import { PoseOverlay } from './PoseOverlay';
import { ActivityDetectionHUD } from './ActivityDetectionHUD';
import { api } from '../../services/api';
import {
  Camera,
  CameraOff,
  RefreshCw,
  Maximize2,
  Sliders,
  Sparkles,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle2,
  Lock,
  Terminal,
  Activity,
  Cpu,
  ShieldCheck,
} from 'lucide-react';

interface RealWebcamFeedProps {
  module?: HabitatModule;
  astronautId?: string;
  isExpanded?: boolean;
  onActivityDetected?: (result: ActivityDetectionResult) => void;
  onSwitchToSimulation?: () => void;
}

export const RealWebcamFeed: React.FC<RealWebcamFeedProps> = ({
  module = 'LABORATORY',
  astronautId = 'AST-01',
  isExpanded = false,
  onActivityDetected,
  onSwitchToSimulation,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraStatus, setCameraStatus] = useState<
    'UNINITIALIZED' | 'REQUESTING' | 'CONNECTING' | 'LIVE' | 'DENIED' | 'NOT_FOUND' | 'ERROR' | 'DISCONNECTED'
  >('UNINITIALIZED');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [rawLandmarks, setRawLandmarks] = useState<VisionLandmark[][] | null>(null);
  const [detectionResult, setDetectionResult] = useState<ActivityDetectionResult | null>(null);
  const [calibration, setCalibration] = useState<WebcamCalibration | null>(null);
  const [diagnostics, setDiagnostics] = useState<CameraDiagnostics | null>(null);

  const [showSkeleton, setShowSkeleton] = useState<boolean>(true);
  const [showAngles, setShowAngles] = useState<boolean>(true);
  const [showDebug, setShowDebug] = useState<boolean>(false);
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(70);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Persistence tracking to prevent fast repeated writes
  const lastRecordedActivityRef = useRef<string | null>(null);
  const lastRecordedTimeRef = useRef<number>(0);

  const poseService = PoseDetectionService.getInstance();

  /**
   * Request browser camera access and attach to HTMLVideoElement
   */
  const startWebcam = useCallback(async () => {
    setCameraStatus('REQUESTING');
    setErrorMessage(null);

    // Stop existing stream tracks
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraStatus('ERROR');
        setErrorMessage('Browser does not support navigator.mediaDevices.getUserMedia API.');
        return;
      }

      setCameraStatus('CONNECTING');

      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
        audio: false,
      });

      // Track stream ended / disabled events
      mediaStream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setCameraStatus('DISCONNECTED');
          setErrorMessage('Camera track ended or disconnected.');
        };
      });

      setStream(mediaStream);

      const video = videoRef.current;
      if (video) {
        video.srcObject = mediaStream;
        video.muted = true;

        // Explicitly wait for loadedmetadata
        await new Promise<void>((resolve) => {
          if (video.readyState >= 1) {
            resolve();
          } else {
            video.onloadedmetadata = () => {
              resolve();
            };
          }
        });

        try {
          await video.play();
        } catch (playErr) {
          console.warn('Video auto-play warning:', playErr);
        }

        setCameraStatus('LIVE');

        // Start pose inference
        await poseService.start(video, {
          onResult: (res, lms) => {
            setDetectionResult(res);
            setRawLandmarks(lms);
            setCalibration(poseService.getCalibration());
            onActivityDetected?.(res);

            // Persist confident activity to SQLite
            if (
              res.isConfident &&
              res.activity !== 'UNKNOWN' &&
              res.activity !== 'ANALYZING' &&
              res.activity !== 'NO_PERSON_DETECTED' &&
              res.activity !== 'CALIBRATING'
            ) {
              const now = Date.now();
              const actStr = res.activity as string;
              if (
                lastRecordedActivityRef.current !== actStr ||
                now - lastRecordedTimeRef.current >= 10000
              ) {
                lastRecordedActivityRef.current = actStr;
                lastRecordedTimeRef.current = now;

                api
                  .recordActivity(res.activity as ActivityType, module, res.confidence)
                  .catch((err) => console.warn('Webcam activity auto-record skipped:', err));
              }
            }
          },
          onDiagnostics: (diag) => {
            setDiagnostics(diag);
          },
          onError: (err) => {
            console.warn('Pose Landmarker runtime notice:', err);
          },
        });
      }
    } catch (err: any) {
      console.error('Webcam access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraStatus('DENIED');
        setErrorMessage('Camera access was denied by browser permission settings.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraStatus('NOT_FOUND');
        setErrorMessage('No physical video input device was found on this system.');
      } else {
        setCameraStatus('ERROR');
        setErrorMessage(err.message || 'Failed to initialize webcam.');
      }
    }
  }, [module, onActivityDetected, poseService]);

  // Start webcam on initial mount
  useEffect(() => {
    startWebcam();

    return () => {
      poseService.stop();
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleStartCalibration = () => {
    poseService.startCalibration();
    setCalibration(poseService.getCalibration());
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  const isAnomaly = detectionResult?.isAnomaly ?? false;
  const isStreaming = cameraStatus === 'LIVE';

  return (
    <div
      ref={containerRef}
      className={`relative group rounded-xl overflow-hidden border transition-all duration-300 bg-space-950 flex flex-col ${
        isAnomaly
          ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.45)] ring-1 ring-red-500'
          : 'border-cyan-500/50 shadow-[0_0_25px_rgba(0,240,255,0.25)] ring-1 ring-cyan-500/40'
      } ${isExpanded ? 'h-96 md:h-[540px]' : 'h-80'}`}
    >
      {/* Viewport: Video (bottom) + Transparent Pose Canvas (middle) + HUD (top) */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {/* Real HTML Video Feed */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`w-full h-full object-cover mirror z-0 transition-opacity duration-300 ${
            isStreaming ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ transform: 'scaleX(-1)' }}
        />

        {/* Real Pose Skeleton Overlay Canvas */}
        {isStreaming && (
          <PoseOverlay
            landmarks={rawLandmarks}
            result={detectionResult}
            showSkeleton={showSkeleton}
            showAngles={showAngles}
            mirror={true}
          />
        )}

        {/* Top-Left Camera Identification HUD */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 pointer-events-none">
          <div className="flex items-center gap-2 bg-space-950/85 backdrop-blur-md px-3 py-1.5 rounded-lg border border-cyan-500/50 text-xs font-mono shadow-md">
            <span
              className={`w-2 h-2 rounded-full ${
                isStreaming ? 'bg-cyan-400 animate-ping' : 'bg-amber-400'
              }`}
            />
            <span className="font-bold text-cyan-300 tracking-wider">
              CAM-01 // PRIMARY REAL WEBCAM
            </span>
            <span className="text-cyan-600">|</span>
            <span className="text-gray-200">{module.replace(/_/g, ' ')}</span>
            <span
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                isStreaming
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {isStreaming ? 'OPTICAL LIVE' : cameraStatus}
            </span>
          </div>
        </div>

        {/* Top-Right Control Actions */}
        <div className="absolute top-2.5 right-2.5 z-20 flex items-center gap-1.5">
          <button
            onClick={handleStartCalibration}
            disabled={!isStreaming}
            className="px-2.5 py-1 bg-space-950/85 hover:bg-cyan-500/30 text-cyan-300 hover:text-white rounded-lg text-[10px] font-mono border border-cyan-500/40 flex items-center gap-1 transition shadow-md"
            title="Calibrate 3-second neutral posture baseline"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>CALIBRATE</span>
          </button>

          <button
            onClick={() => setShowDebug(!showDebug)}
            className={`p-1.5 rounded-lg transition border text-xs ${
              showDebug
                ? 'bg-cyan-500/30 text-cyan-300 border-cyan-400'
                : 'bg-space-950/80 text-gray-400 border-white/10 hover:text-gray-200'
            }`}
            title="Toggle Live Camera Diagnostics"
          >
            <Terminal className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowSkeleton(!showSkeleton)}
            className={`p-1.5 rounded-lg transition border text-xs ${
              showSkeleton
                ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500/60'
                : 'bg-space-950/80 text-gray-400 border-white/10 hover:text-gray-200'
            }`}
            title="Toggle Skeleton Overlay"
          >
            {showSkeleton ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded-lg transition border text-xs ${
              showSettings
                ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500/60'
                : 'bg-space-950/80 text-gray-400 border-white/10 hover:text-gray-200'
            }`}
            title="Vision Settings"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 bg-space-950/80 hover:bg-cyan-500/30 text-gray-300 hover:text-cyan-400 rounded-lg transition border border-white/10"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Calibration In-Progress Countdown Overlay */}
        {calibration?.calibrating && (
          <div className="absolute inset-0 z-30 bg-space-950/85 backdrop-blur-md flex flex-col items-center justify-center gap-3 font-mono text-center p-4">
            <Sparkles className="w-10 h-10 text-cyan-400 animate-spin" />
            <div className="text-cyan-300 font-bold text-base tracking-wide">
              CALIBRATING NEUTRAL POSTURE BASELINE
            </div>
            <p className="text-xs text-gray-300 max-w-sm font-sans">
              Stand upright in camera frame for 3 seconds to establish height & joint baselines...
            </p>
            <div className="w-56 bg-space-900 rounded-full h-2.5 overflow-hidden border border-cyan-500/40">
              <div
                className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-200"
                style={{ width: `${calibration.progress}%` }}
              />
            </div>
            <div className="text-xs font-bold text-cyan-400">{calibration.progress}%</div>
          </div>
        )}

        {/* Live Diagnostics Drawer */}
        {showDebug && (
          <div className="absolute top-12 left-2.5 z-25 bg-space-950/95 backdrop-blur-md p-3.5 rounded-xl border border-cyan-500/50 font-mono text-[11px] shadow-2xl w-80 space-y-2">
            <div className="text-cyan-300 font-bold border-b border-space-800 pb-1 flex items-center justify-between">
              <span>CAMERA & POSE DIAGNOSTICS</span>
              <span className="text-[9px] text-emerald-400 bg-emerald-500/20 px-1.5 rounded">
                LIVE BROWSER
              </span>
            </div>

            <div className="space-y-1 text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Camera Status:</span>
                <span className="text-cyan-300 font-bold">{cameraStatus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Stream Active:</span>
                <span className={stream?.active ? 'text-emerald-400' : 'text-red-400'}>
                  {stream?.active ? 'true' : 'false'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Video Resolution:</span>
                <span className="text-white">
                  {videoRef.current?.videoWidth || 0} x {videoRef.current?.videoHeight || 0}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Video ReadyState:</span>
                <span className="text-white">{videoRef.current?.readyState ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Video Paused:</span>
                <span className="text-white">{videoRef.current?.paused ? 'true' : 'false'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Tracks:</span>
                <span className="text-white">{stream?.getVideoTracks().length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Track State:</span>
                <span className="text-emerald-400">
                  {stream?.getVideoTracks()[0]?.readyState || 'none'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Pose Model:</span>
                <span className="text-cyan-300">{poseService.getModelStatus()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Inference FPS:</span>
                <span className="text-white font-bold">{detectionResult?.fps ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Inference Latency:</span>
                <span className="text-white font-bold">{detectionResult?.latencyMs ?? 0} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Landmarks Count:</span>
                <span className="text-cyan-300 font-bold">
                  {detectionResult?.landmarksCount ?? 0}/33 POINTS
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Error / Permission Denied State */}
        {cameraStatus === 'DENIED' && (
          <div className="absolute inset-0 z-30 bg-space-950/95 flex flex-col items-center justify-center gap-3 font-mono text-center p-6">
            <div className="w-12 h-12 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400">
              <CameraOff className="w-6 h-6" />
            </div>
            <div className="text-red-300 font-bold text-sm tracking-wide">
              CAMERA ACCESS DENIED
            </div>
            <p className="text-xs text-gray-400 max-w-md font-sans">
              ASTROSENSE requires physical optical access for real-time on-device human activity
              recognition. Please enable camera permissions in your browser.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <button
                onClick={startWebcam}
                className="px-3.5 py-1.5 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-500 text-cyan-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                ENABLE CAMERA
              </button>
              {onSwitchToSimulation && (
                <button
                  onClick={onSwitchToSimulation}
                  className="px-3.5 py-1.5 bg-space-900 hover:bg-space-800 border border-space-700 text-gray-300 rounded-lg text-xs transition"
                >
                  USE SIMULATED FALLBACK
                </button>
              )}
            </div>
          </div>
        )}

        {cameraStatus === 'NOT_FOUND' && (
          <div className="absolute inset-0 z-30 bg-space-950/95 flex flex-col items-center justify-center gap-3 font-mono text-center p-6">
            <CameraOff className="w-8 h-8 text-amber-400" />
            <div className="text-amber-300 font-bold text-sm">NO WEBCAM DETECTED</div>
            <p className="text-xs text-gray-400 max-w-md font-sans">
              No hardware video input device was found. You can connect a camera or switch to the
              simulated telemetry feed.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={startWebcam}
                className="px-3.5 py-1.5 bg-cyan-500/30 hover:bg-cyan-500/40 border border-cyan-500 text-cyan-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                RETRY
              </button>
              {onSwitchToSimulation && (
                <button
                  onClick={onSwitchToSimulation}
                  className="px-3.5 py-1.5 bg-space-900 hover:bg-space-800 border border-space-700 text-gray-300 rounded-lg text-xs transition"
                >
                  SWITCH TO SIMULATION
                </button>
              )}
            </div>
          </div>
        )}

        {/* Connecting / Requesting State */}
        {(cameraStatus === 'REQUESTING' || cameraStatus === 'CONNECTING') && (
          <div className="absolute inset-0 z-25 bg-space-950/85 backdrop-blur-sm flex flex-col items-center justify-center gap-3 font-mono text-center p-6">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <div className="text-cyan-300 font-bold text-sm tracking-wide">
              {cameraStatus === 'REQUESTING' ? 'CAMERA REQUESTING...' : 'CAMERA CONNECTING...'}
            </div>
            <p className="text-xs text-gray-400 max-w-sm font-sans">
              Accessing browser video input stream and initializing on-device pose estimator...
            </p>
          </div>
        )}

        {/* Anomaly / Fall Alert Overlay */}
        {isAnomaly && (
          <div className="absolute inset-x-0 top-12 z-20 bg-red-600/90 text-white py-1.5 px-3 text-xs font-mono font-bold flex items-center justify-center gap-2 animate-bounce shadow-lg">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>
              ⚠ KINETIC ANOMALY / FALL DETECTED IN {module.replace(/_/g, ' ')}
            </span>
          </div>
        )}

        {/* Settings Drawer */}
        {showSettings && (
          <div className="absolute top-12 right-2.5 z-25 bg-space-950/95 backdrop-blur-md p-3.5 rounded-xl border border-cyan-500/50 font-mono text-xs shadow-2xl flex flex-col gap-2.5 w-68">
            <div className="text-cyan-300 font-bold border-b border-space-800 pb-1 flex items-center justify-between">
              <span>VISION SETTINGS</span>
              <span className="text-[10px] text-gray-400">ON-DEVICE</span>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-gray-400 text-[10px]">
                CONFIDENCE THRESHOLD: {confidenceThreshold}%
              </label>
              <input
                type="range"
                min={50}
                max={90}
                value={confidenceThreshold}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setConfidenceThreshold(val);
                  poseService.getClassifier().setConfidenceThreshold(val);
                }}
                className="accent-cyan-400 w-full cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-[11px]">Show Joint Angles</span>
              <input
                type="checkbox"
                checked={showAngles}
                onChange={(e) => setShowAngles(e.target.checked)}
                className="accent-cyan-400 cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-[11px]">Skeleton Overlay</span>
              <input
                type="checkbox"
                checked={showSkeleton}
                onChange={(e) => setShowSkeleton(e.target.checked)}
                className="accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Bottom Telemetry HUD Bar */}
        <div className="absolute bottom-2.5 inset-x-2.5 z-20">
          <ActivityDetectionHUD
            result={detectionResult}
            calibration={calibration}
            compact={!isExpanded}
          />
        </div>
      </div>
    </div>
  );
};
