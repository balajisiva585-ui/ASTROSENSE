import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Cpu, Radio } from 'lucide-react';

interface VoiceStatusProps {
  status: 'IDLE' | 'LISTENING' | 'PROCESSING' | 'SPEAKING' | 'UNAVAILABLE';
  isListening?: boolean;
  isSpeaking?: boolean;
  transcript?: string;
  hasSpeechRecognition: boolean;
}

export const VoiceStatus: React.FC<VoiceStatusProps> = ({
  status,
  isListening,
  isSpeaking,
  transcript,
  hasSpeechRecognition,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'LISTENING':
        return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/40 animate-pulse';
      case 'PROCESSING':
        return 'text-amber-400 bg-amber-500/20 border-amber-500/40 animate-pulse';
      case 'SPEAKING':
        return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40 animate-pulse';
      case 'UNAVAILABLE':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/40';
      default:
        return 'text-gray-300 bg-space-950 border-space-800';
    }
  };

  const getStatusDot = () => {
    switch (status) {
      case 'LISTENING':
        return 'bg-cyan-400 animate-ping';
      case 'PROCESSING':
        return 'bg-amber-400 animate-ping';
      case 'SPEAKING':
        return 'bg-emerald-400 animate-pulse';
      case 'UNAVAILABLE':
        return 'bg-gray-500';
      default:
        return 'bg-cyan-500';
    }
  };

  return (
    <div className="flex flex-col gap-2 p-3 bg-space-950/80 rounded-xl border border-space-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full relative flex items-center justify-center">
            <span className={`absolute w-full h-full rounded-full ${getStatusDot()}`} />
            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDot()}`} />
          </span>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-gray-200">
            VOICE MODE: <span className="text-cyan-300">{status}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
          {hasSpeechRecognition ? (
            <span className="text-emerald-400 flex items-center gap-1">
              <Mic className="w-3 h-3" /> SPEECH-TO-TEXT READY
            </span>
          ) : (
            <span className="text-amber-400 flex items-center gap-1">
              <MicOff className="w-3 h-3" /> TEXT FALLBACK MODE
            </span>
          )}
        </div>
      </div>

      {transcript && (
        <div className="bg-black/60 rounded-lg p-2 text-xs font-mono text-cyan-300 border border-cyan-500/20">
          <span className="text-gray-400 text-[10px] block">DETECTED UTTERANCE:</span>
          "{transcript}"
        </div>
      )}
    </div>
  );
};
