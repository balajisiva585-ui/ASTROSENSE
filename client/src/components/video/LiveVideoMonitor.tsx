import React, { useState } from 'react';
import { useMission } from '../../context/MissionContext';
import { CameraFeed } from './CameraFeed';
import { RealWebcamFeed } from './RealWebcamFeed';
import { WebcamTestModal } from './WebcamTestModal';
import {
  Video,
  Grid,
  LayoutTemplate,
  Shield,
  Camera,
  Sparkles,
  Sliders,
  CheckCircle2,
  Lock,
  Eye,
  Activity,
  Layers,
  Info,
} from 'lucide-react';

export const LiveVideoMonitor: React.FC = () => {
  const { videoFeeds, activeCamId, setActiveCamId, updateVideoSource } = useMission();
  const [viewMode, setViewMode] = useState<'GRID' | 'SINGLE'>('GRID');
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);

  // Global mode derived from CAM-01 or active camera source
  const primaryFeed = videoFeeds.find((f) => f.id === 'CAM-01') || videoFeeds[0];
  const isRealWebcamMode = primaryFeed?.streamSource === 'WEBCAM';

  const selectedFeed = videoFeeds.find((f) => f.id === activeCamId) || videoFeeds[0];
  const secondaryFeeds = videoFeeds.filter((f) => f.id !== 'CAM-01');

  const handleModeSwitch = (mode: 'WEBCAM' | 'SIMULATED') => {
    if (mode === 'WEBCAM') {
      updateVideoSource('CAM-01', 'WEBCAM');
    } else {
      videoFeeds.forEach((f) => {
        if (f.streamSource !== 'SIMULATED') {
          updateVideoSource(f.id, 'SIMULATED');
        }
      });
    }
  };

  return (
    <div className="bg-space-950/90 border border-space-800/90 rounded-2xl p-4 md:p-5 shadow-2xl flex flex-col gap-4 relative overflow-hidden backdrop-blur-md">
      {/* Subtle Spacecraft Corner HUD accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/60 pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/60 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/60 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/60 pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-space-800/80 pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-hud-cyan">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm md:text-base font-bold text-white tracking-wider uppercase font-mono">
                ORBITAL CREW VISION // REAL-TIME HAR
              </h2>
              <span
                className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${
                  isRealWebcamMode
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-hud-cyan'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-hud-green'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full animate-pulse ${
                    isRealWebcamMode ? 'bg-cyan-400' : 'bg-emerald-400'
                  }`}
                />
                {isRealWebcamMode ? 'REAL WEBCAM MODE' : 'SIMULATION MODE'}
              </span>
            </div>
            <p className="text-xs text-gray-400 font-sans">
              {isRealWebcamMode
                ? 'Onboard Edge Vision // 33-Point MediaPipe Pose Landmark Inference & Temporal HAR'
                : 'Synthetic space station video telemetry & biomechanical microgravity simulation'}
            </p>
          </div>
        </div>

        {/* Master Source Switcher & View Mode Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Real Webcam vs Simulation Mode Master Toggle */}
          <div className="bg-space-900/90 p-1 rounded-xl border border-space-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => handleModeSwitch('WEBCAM')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                isRealWebcamMode
                  ? 'bg-gradient-to-r from-cyan-500/30 to-blue-500/30 text-cyan-300 border border-cyan-500/60 shadow-hud-cyan font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-cyan-400" />
              REAL WEBCAM
            </button>
            <button
              onClick={() => handleModeSwitch('SIMULATED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                !isRealWebcamMode
                  ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/50 shadow-hud-amber font-bold'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              SIMULATION
            </button>
          </div>

          {/* Test Real Webcam Modal Button */}
          <button
            onClick={() => setIsTestModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-950 to-blue-950 hover:from-cyan-900 hover:to-blue-900 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-semibold transition flex items-center gap-1.5 shadow-md"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            TEST REAL WEBCAM
          </button>

          {/* View Mode Switcher */}
          <div className="bg-space-900/90 p-1 rounded-xl border border-space-800 flex items-center gap-1 shadow-inner">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                viewMode === 'GRID'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              QUAD-VIEW
            </button>
            <button
              onClick={() => setViewMode('SINGLE')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center gap-1.5 transition ${
                viewMode === 'SINGLE'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-500/50'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              FOCUS VIEW
            </button>
          </div>
        </div>
      </div>

      {/* Camera Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {videoFeeds.map((feed) => {
          const isSelected = feed.id === activeCamId;
          const isAnomaly =
            feed.currentActivity === 'FALL_ABNORMAL_MOVEMENT' || feed.safetyStatus === 'CRITICAL';
          const isWebcam = feed.streamSource === 'WEBCAM';

          return (
            <button
              key={feed.id}
              onClick={() => setActiveCamId(feed.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.25)]'
                  : isAnomaly
                  ? 'bg-red-950/50 border-red-500/60 text-red-300 animate-pulse'
                  : 'bg-space-900/60 border-space-800 text-gray-400 hover:text-gray-200 hover:border-space-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isAnomaly ? 'bg-red-400' : isWebcam ? 'bg-cyan-400' : 'bg-amber-400'
                }`}
              />
              <span className="font-bold">{feed.id}</span>
              <span className="text-[11px] text-gray-400">({feed.module.replace(/_/g, ' ')})</span>
              {isWebcam && (
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.2 rounded text-[9px] font-bold">
                  REAL WEBCAM
                </span>
              )}
              {isAnomaly && (
                <span className="bg-red-500/30 text-red-300 px-1 rounded text-[10px]">HAZARD</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Video Viewports */}
      {isRealWebcamMode ? (
        /* Real Webcam Mode Layout: Hero Primary Webcam with Secondary Simulation Feeds */
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Primary Real Webcam Feed (2 Cols) */}
            <div className="lg:col-span-2">
              <RealWebcamFeed
                module={primaryFeed.module}
                astronautId={primaryFeed.assignedAstronautId}
                isExpanded={true}
                onSwitchToSimulation={() => handleModeSwitch('SIMULATED')}
              />
            </div>

            {/* Secondary Habitat Feeds (1 Col) */}
            <div className="flex flex-col gap-3">
              <div className="text-xs font-mono font-bold text-gray-300 flex items-center justify-between border-b border-space-800 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" />
                  SECONDARY HABITAT MODULES
                </span>
                <span className="text-[10px] text-amber-400 font-bold">SIMULATED SENSORS</span>
              </div>

              <div className="space-y-3">
                {secondaryFeeds.map((feed) => (
                  <div
                    key={feed.id}
                    onClick={() => setActiveCamId(feed.id)}
                    className="cursor-pointer"
                  >
                    <CameraFeed
                      feed={feed}
                      isSelected={feed.id === activeCamId}
                      onSelect={() => setActiveCamId(feed.id)}
                      onUpdateSource={(src) => updateVideoSource(feed.id, src)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Simulation Mode Layout: Standard Quad-View / Focus View for all 4 Simulated Feeds */
        viewMode === 'GRID' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {videoFeeds.map((feed) => (
              <CameraFeed
                key={feed.id}
                feed={feed}
                isSelected={feed.id === activeCamId}
                onSelect={() => setActiveCamId(feed.id)}
                onUpdateSource={(src) => updateVideoSource(feed.id, src)}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {selectedFeed && (
              <CameraFeed
                feed={selectedFeed}
                isSelected={true}
                isExpanded={true}
                onUpdateSource={(src) => updateVideoSource(selectedFeed.id, src)}
              />
            )}

            {/* Mini thumbnails selector */}
            <div className="grid grid-cols-4 gap-2">
              {videoFeeds.map((feed) => (
                <button
                  key={feed.id}
                  onClick={() => setActiveCamId(feed.id)}
                  className={`p-2.5 rounded-xl border text-left font-mono text-xs transition ${
                    feed.id === activeCamId
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-hud-cyan'
                      : 'bg-space-900/80 border-space-800 text-gray-400 hover:border-space-700'
                  }`}
                >
                  <div className="font-bold flex items-center justify-between">
                    <span>{feed.id}</span>
                    <span className="text-[9px] text-gray-500">{feed.streamSource}</span>
                  </div>
                  <div className="text-[10px] truncate text-gray-400 mt-1">{feed.currentActivity}</div>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* Subsystem Safety Footer Note */}
      <div className="bg-space-900/80 p-3 rounded-xl border border-space-800/90 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-gray-400 shadow-inner">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            {isRealWebcamMode
              ? 'ON-DEVICE VISION: REAL-TIME MEDIAPIPE POSE + TEMPORAL CLASSIFICATION ACTIVE'
              : 'ONBOARD EDGE VISION: 12-CLASS HAR SIMULATION ACTIVE'}
          </span>
        </div>
        <div className="text-gray-400 text-[10px] flex items-center gap-2">
          <span>DATA PROVENANCE:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded ${
              isRealWebcamMode
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
            }`}
          >
            {isRealWebcamMode
              ? 'LOCAL BROWSER WEBCAM (ZERO CLOUD VIDEO STREAMING)'
              : 'SIMULATED CAMERA FEEDS & LOCAL SENSORS'}
          </span>
        </div>
      </div>

      {/* Interactive Webcam Test Mode Modal */}
      <WebcamTestModal
        isOpen={isTestModalOpen}
        onClose={() => setIsTestModalOpen(false)}
      />
    </div>
  );
};
