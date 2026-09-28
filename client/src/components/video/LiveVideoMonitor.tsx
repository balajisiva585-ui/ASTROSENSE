import React, { useState } from 'react';
import { useMission } from '../../context/MissionContext';
import { CameraFeed } from './CameraFeed';
import { Video, Grid, LayoutTemplate, Shield, AlertOctagon, Activity, Radio } from 'lucide-react';

export const LiveVideoMonitor: React.FC = () => {
  const { videoFeeds, activeCamId, setActiveCamId, updateVideoSource } = useMission();
  const [viewMode, setViewMode] = useState<'GRID' | 'SINGLE'>('GRID');

  const selectedFeed = videoFeeds.find(f => f.id === activeCamId) || videoFeeds[0];

  return (
    <div className="bg-space-900 border border-space-800 rounded-xl p-4 shadow-xl flex flex-col gap-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-space-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
                LIVE VIDEO MONITOR & HUMAN ACTIVITY RECOGNITION
              </h2>
              <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                4 FEEDS ONLINE
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Autonomous multi-module optical pose estimation & kinetic safety monitoring
            </p>
          </div>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <div className="bg-space-950 p-1 rounded-lg border border-space-800 flex items-center gap-1">
            <button
              onClick={() => setViewMode('GRID')}
              className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition ${
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
              className={`px-2.5 py-1 rounded text-xs font-mono flex items-center gap-1.5 transition ${
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
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {videoFeeds.map((feed) => {
          const isSelected = feed.id === activeCamId;
          const isAnomaly = feed.currentActivity === 'FALL_ABNORMAL_MOVEMENT' || feed.safetyStatus === 'CRITICAL';

          return (
            <button
              key={feed.id}
              onClick={() => {
                setActiveCamId(feed.id);
                if (viewMode === 'SINGLE') {
                  // Switch focus
                }
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center gap-2 shrink-0 border ${
                isSelected
                  ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                  : isAnomaly
                  ? 'bg-red-950/50 border-red-500/60 text-red-300 animate-pulse'
                  : 'bg-space-950/60 border-space-800 text-gray-400 hover:text-gray-200 hover:border-space-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAnomaly ? 'bg-red-400' : 'bg-cyan-400'}`} />
              <span className="font-bold">{feed.id}</span>
              <span className="text-[11px] text-gray-400">({feed.module.replace(/_/g, ' ')})</span>
              {isAnomaly && (
                <span className="bg-red-500/30 text-red-300 px-1 rounded text-[10px]">HAZARD</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Video Presentation Grid */}
      {viewMode === 'GRID' ? (
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
                className={`p-2 rounded-lg border text-left font-mono text-xs transition ${
                  feed.id === activeCamId
                    ? 'bg-cyan-950/50 border-cyan-400 text-cyan-300'
                    : 'bg-space-950 border-space-800 text-gray-400 hover:border-space-700'
                }`}
              >
                <div className="font-bold">{feed.id}</div>
                <div className="text-[10px] truncate text-gray-400">{feed.currentActivity}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Subsystem Safety Footer Note */}
      <div className="bg-space-950 p-2.5 rounded-lg border border-space-800/80 flex items-center justify-between text-xs font-mono text-gray-400">
        <div className="flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>ONBOARD EDGE VISION: 12-CLASS HAR INFERENCE ACTIVE (24ms LATENCY)</span>
        </div>
        <div className="text-gray-400 text-[10px]">
          DATA PROVENANCE: <span className="text-amber-400 font-bold">SIMULATED CAMERA FEEDS & LOCAL SENSORS</span>
        </div>
      </div>
    </div>
  );
};
