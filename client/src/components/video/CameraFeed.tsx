import React, { useRef, useEffect, useState } from 'react';
import { CameraFeedState } from '../../types';
import {
  Camera,
  Maximize2,
  Video,
  Upload,
  AlertTriangle,
  ShieldCheck,
  Activity,
  Cpu,
} from 'lucide-react';

interface CameraFeedProps {
  feed: CameraFeedState;
  isSelected?: boolean;
  onSelect?: () => void;
  onUpdateSource?: (source: 'SIMULATED' | 'WEBCAM' | 'LOCAL_VIDEO') => void;
  isExpanded?: boolean;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({
  feed,
  isSelected = false,
  onSelect,
  onUpdateSource,
  isExpanded = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [localVideoUrl, setLocalVideoUrl] = useState<string | null>(null);

  // Handle Webcam streaming
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (feed.streamSource === 'WEBCAM') {
      navigator.mediaDevices?.getUserMedia({ video: { width: 640, height: 360 } })
        .then(s => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(console.error);
          }
          setWebcamError(null);
        })
        .catch(err => {
          console.warn('Webcam permission denied or unavailable:', err);
          setWebcamError('Webcam unavailable. Switching to simulated telemetry video.');
          onUpdateSource?.('SIMULATED');
        });
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [feed.streamSource, onUpdateSource]);

  // Handle Animated Canvas Simulation
  useEffect(() => {
    if (feed.streamSource !== 'SIMULATED') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let t = 0;

    const render = () => {
      t += 0.03;
      const w = canvas.width;
      const h = canvas.height;

      // Dark futuristic viewport background
      const bgGrad = ctx.createLinearGradient(0, 0, w, h);
      bgGrad.addColorStop(0, '#060d17');
      bgGrad.addColorStop(1, '#0a192f');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);

      // Microgravity gridlines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      const gridSize = 32;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      // Floating microgravity dust particles
      ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
      for (let i = 0; i < 12; i++) {
        const px = (Math.sin(t * 0.4 + i * 1.5) * 0.45 + 0.5) * w;
        const py = (Math.cos(t * 0.3 + i * 2.1) * 0.45 + 0.5) * h;
        ctx.beginPath();
        ctx.arc(px, py, (i % 3) + 1, 0, Math.PI * 2);
        ctx.fill();
      }

      // Simulated Astronaut Kinematics Skeleton
      const centerX = w * 0.5 + Math.sin(t * 0.8) * 15;
      const centerY = h * 0.5 + Math.cos(t * 0.5) * 8;
      const isAnomaly = feed.currentActivity === 'FALL_ABNORMAL_MOVEMENT' || feed.safetyStatus === 'CRITICAL';
      const poseColor = isAnomaly ? '#ef4444' : '#00f0ff';

      // Astronaut Helmet / Head
      const headY = isAnomaly ? centerY + 30 : centerY - 45;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(centerX, headY, 16, 0, Math.PI * 2);
      ctx.fill();

      // Visor reflection
      ctx.fillStyle = 'rgba(0, 240, 255, 0.6)';
      ctx.beginPath();
      ctx.arc(centerX + 3, headY - 2, 7, 0, Math.PI * 2);
      ctx.fill();

      // Torso & Limbs wireframe
      ctx.strokeStyle = poseColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(centerX, headY + 16);
      ctx.lineTo(centerX, centerY + 20); // spine

      // Arms
      const armSwing = Math.sin(t * 2) * 20;
      ctx.lineTo(centerX - 35, centerY - 5 + (isAnomaly ? 30 : armSwing));
      ctx.moveTo(centerX, headY + 25);
      ctx.lineTo(centerX + 35, centerY - 5 - (isAnomaly ? 30 : armSwing));

      // Legs / Pelvis
      ctx.moveTo(centerX, centerY + 20);
      ctx.lineTo(centerX - 22, centerY + 65 + (isAnomaly ? -10 : Math.cos(t * 2) * 15));
      ctx.moveTo(centerX, centerY + 20);
      ctx.lineTo(centerX + 22, centerY + 65 - (isAnomaly ? -10 : Math.cos(t * 2) * 15));
      ctx.stroke();

      // Biomechanical Edge AI Bounding Box
      const boxW = 120;
      const boxH = 150;
      const boxX = centerX - boxW / 2;
      const boxY = centerY - 65;

      ctx.strokeStyle = isAnomaly ? 'rgba(239, 68, 68, 0.85)' : 'rgba(0, 240, 255, 0.7)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([6, 4]);
      ctx.strokeRect(boxX, boxY, boxW, boxH);
      ctx.setLineDash([]);

      // Corner markers
      const cLen = 10;
      ctx.strokeStyle = isAnomaly ? '#ef4444' : '#00f0ff';
      ctx.lineWidth = 2.5;

      // Top-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + cLen);
      ctx.lineTo(boxX, boxY);
      ctx.lineTo(boxX + cLen, boxY);
      ctx.stroke();

      // Top-Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - cLen, boxY);
      ctx.lineTo(boxX + boxW, boxY);
      ctx.lineTo(boxX + boxW, boxY + cLen);
      ctx.stroke();

      // Bottom-Left
      ctx.beginPath();
      ctx.moveTo(boxX, boxY + boxH - cLen);
      ctx.lineTo(boxX, boxY + boxH);
      ctx.lineTo(boxX + cLen, boxY + boxH);
      ctx.stroke();

      // Bottom-Right
      ctx.beginPath();
      ctx.moveTo(boxX + boxW - cLen, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH);
      ctx.lineTo(boxX + boxW, boxY + boxH - cLen);
      ctx.stroke();

      // AI Bounding Label Tag
      ctx.fillStyle = isAnomaly ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 240, 255, 0.85)';
      ctx.fillRect(boxX, boxY - 18, boxW, 18);
      ctx.fillStyle = '#060d17';
      ctx.font = 'bold 10px monospace';
      ctx.fillText(`${feed.assignedAstronautId} [${feed.confidence.toFixed(1)}%]`, boxX + 6, boxY - 5);

      // Camera Scanline Effect
      const scanY = (t * 60) % h;
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.fillRect(0, scanY, w, 2);

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [feed.streamSource, feed.currentActivity, feed.safetyStatus, feed.assignedAstronautId, feed.confidence]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setLocalVideoUrl(url);
      onUpdateSource?.('LOCAL_VIDEO');
    }
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

  const isAnomaly = feed.currentActivity === 'FALL_ABNORMAL_MOVEMENT' || feed.safetyStatus === 'CRITICAL';

  return (
    <div
      ref={containerRef}
      onClick={onSelect}
      className={`relative group rounded-xl overflow-hidden border transition-all duration-300 bg-space-950 flex flex-col ${
        isSelected
          ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,240,255,0.35)] ring-1 ring-cyan-400'
          : isAnomaly
          ? 'border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse'
          : 'border-space-800 hover:border-space-700'
      } ${isExpanded ? 'h-96 md:h-[480px]' : 'h-64'}`}
    >
      {/* Video Viewport */}
      <div className="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
        {feed.streamSource === 'SIMULATED' && (
          <canvas
            ref={canvasRef}
            width={640}
            height={360}
            className="w-full h-full object-cover"
          />
        )}

        {feed.streamSource === 'WEBCAM' && (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover mirror"
          />
        )}

        {feed.streamSource === 'LOCAL_VIDEO' && localVideoUrl && (
          <video
            src={localVideoUrl}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}

        {/* Top-Left Camera ID & Location Overlay */}
        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
          <div className="flex items-center gap-1.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded border border-cyan-500/30 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="font-bold text-cyan-400">{feed.id}</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-200">{feed.module.replace(/_/g, ' ')}</span>
            <span className="px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 text-[10px] rounded font-semibold">
              LIVE
            </span>
          </div>

          <div className="bg-black/60 px-2 py-0.5 rounded text-[10px] font-mono text-gray-400 border border-white/5">
            {feed.label}
          </div>
        </div>

        {/* Top-Right Simulated Data Badge & Controls */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1.5">
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono font-bold px-2 py-0.5 rounded tracking-wider">
            SIMULATED CAMERA FEED
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFullscreen();
            }}
            className="p-1 bg-black/70 hover:bg-cyan-500/30 text-gray-300 hover:text-cyan-400 rounded transition border border-white/10"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Anomaly Banner Overlay */}
        {isAnomaly && (
          <div className="absolute inset-x-0 top-12 z-20 bg-red-600/90 text-white py-1 px-3 text-xs font-mono font-bold flex items-center justify-center gap-2 animate-bounce shadow-lg">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span>⚠ ABNORMAL MOVEMENT / FALL DETECTED IN {feed.module.replace(/_/g, ' ')}</span>
          </div>
        )}

        {/* Bottom Real-Time AI Activity Overlay */}
        <div className="absolute bottom-2 inset-x-2 z-10 bg-black/85 backdrop-blur-md rounded-lg p-2 border border-cyan-500/30 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-cyan-400">
              <Cpu className="w-3.5 h-3.5" />
              <span className="font-bold">{feed.assignedAstronautId}</span>
            </div>
            <div className="text-gray-300">
              ACTIVITY: <span className={`font-bold ${isAnomaly ? 'text-red-400' : 'text-cyan-300'}`}>{feed.currentActivity.replace(/_/g, ' ')}</span>
            </div>
            <div className="text-gray-400">
              CONF: <span className="text-emerald-400 font-bold">{feed.confidence.toFixed(1)}%</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                isAnomaly
                  ? 'bg-red-500/30 text-red-300 border border-red-500/50'
                  : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {isAnomaly ? '⚠ HAZARD' : 'SAFE'}
            </span>
          </div>
        </div>
      </div>

      {/* Camera Control Footer */}
      <div className="px-3 py-2 bg-space-900/90 border-t border-space-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-[11px] font-mono">SOURCE:</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSource?.('SIMULATED');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
              feed.streamSource === 'SIMULATED'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                : 'bg-space-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            SIMULATED
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateSource?.('WEBCAM');
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
              feed.streamSource === 'WEBCAM'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                : 'bg-space-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            WEBCAM
          </button>
          <label
            onClick={(e) => e.stopPropagation()}
            className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer transition flex items-center gap-1 ${
              feed.streamSource === 'LOCAL_VIDEO'
                ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                : 'bg-space-800 text-gray-400 hover:text-gray-200'
            }`}
          >
            <Upload className="w-2.5 h-2.5" />
            FILE
            <input type="file" accept="video/*" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>

        <div className="text-[10px] font-mono text-gray-400">
          {feed.resolution} @ {feed.fps} FPS
        </div>
      </div>
    </div>
  );
};
