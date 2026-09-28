import React, { useState, useRef } from 'react';
import { Upload, Film, Play, Pause, CheckCircle } from 'lucide-react';
import { useMission } from '../../context/MissionContext';

export const VideoUploadAnalyzer: React.FC = () => {
  const { recordManualActivity } = useMission();
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('sample_station_transit.mp4');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setVideoName(file.name);
      setIsPlaying(true);
    }
  };

  const handleSampleSelect = (sampleName: string, activity: any, module: any) => {
    setVideoName(sampleName);
    recordManualActivity(activity, module);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="bg-space-900 border border-space-800 rounded-xl p-4 font-mono text-xs">
      <div className="flex items-center justify-between gap-2 mb-3 pb-2 border-b border-space-800">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200 uppercase tracking-wide">
            Local Video Stream Analyzer
          </span>
        </div>
        <span className="text-[10px] text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
          OFFLINE LOCAL PIPELINE
        </span>
      </div>

      {videoSrc ? (
        <div className="relative rounded-lg overflow-hidden border border-space-700 bg-black aspect-video flex items-center justify-center mb-3">
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />
          <button
            onClick={togglePlay}
            className="absolute bottom-3 right-3 p-2 rounded-full bg-space-950/80 hover:bg-cyan-500 text-white hover:text-space-950 transition-colors"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      ) : null}

      {/* File Upload Controls & Preset Clipse */}
      <div className="space-y-2.5">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            accept="video/mp4,video/webm,video/ogg"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-space-850 hover:bg-space-800 border border-space-700 text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <Upload className="w-4 h-4 text-cyan-400" />
            <span>Upload Local Spacecraft MP4</span>
          </button>
        </div>

        <div>
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
            Or Load Pre-recorded Mission Feeds:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
            <button
              onClick={() => handleSampleSelect('feed_science_lab.raw', 'WORKING', 'LABORATORY')}
              className="px-2.5 py-1.5 rounded bg-space-950 hover:bg-cyan-950/60 border border-space-800 hover:border-cyan-500/40 text-left text-slate-300 text-[11px] truncate"
            >
              🧪 Lab Glovebox Feed
            </button>
            <button
              onClick={() => handleSampleSelect('feed_gym_ared.raw', 'EXERCISING', 'EXERCISE_AREA')}
              className="px-2.5 py-1.5 rounded bg-space-950 hover:bg-cyan-950/60 border border-space-800 hover:border-cyan-500/40 text-left text-slate-300 text-[11px] truncate"
            >
              🏋️ Gym Ergometer Feed
            </button>
            <button
              onClick={() => handleSampleSelect('feed_corridor_transit.raw', 'WALKING', 'LABORATORY')}
              className="px-2.5 py-1.5 rounded bg-space-950 hover:bg-cyan-950/60 border border-space-800 hover:border-cyan-500/40 text-left text-slate-300 text-[11px] truncate"
            >
              🚶 Transit Corridor Feed
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-500 flex items-center gap-1.5 pt-1">
          <CheckCircle className="w-3 h-3 text-emerald-400" />
          <span>Local client-side decoding with zero external cloud upload.</span>
        </div>
      </div>
    </div>
  );
};
