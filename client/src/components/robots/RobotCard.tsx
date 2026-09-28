import React from 'react';
import { RobotState, RobotId, HabitatModule } from '../../types';
import {
  Bot,
  Battery,
  BatteryCharging,
  MapPin,
  Activity,
  Play,
  Pause,
  RotateCcw,
  Compass,
  Search,
  LifeBuoy,
  Info,
  Shield,
  Zap,
} from 'lucide-react';

interface RobotCardProps {
  robot: RobotState;
  onAction: (action: 'START' | 'PAUSE' | 'RETURN' | 'PATROL' | 'INSPECT' | 'ASSIST' | 'STATUS', module?: HabitatModule) => void;
  isLoading?: boolean;
}

export const RobotCard: React.FC<RobotCardProps> = ({ robot, onAction, isLoading = false }) => {
  const isAres = robot.id === 'ARES-1';
  const accentColor = isAres ? 'cyan' : 'indigo';

  const getStatusBadge = () => {
    switch (robot.status) {
      case 'ONLINE':
      case 'PATROLLING':
      case 'INSPECTING':
      case 'ASSISTING':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'AUTONOMOUS':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30 animate-pulse';
      case 'STANDBY':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div
      className={`bg-space-900 border rounded-2xl p-5 shadow-xl flex flex-col justify-between transition-all duration-300 ${
        isAres
          ? 'border-cyan-500/30 hover:border-cyan-500/60 shadow-[0_0_20px_rgba(0,240,255,0.08)]'
          : 'border-indigo-500/30 hover:border-indigo-500/60 shadow-[0_0_20px_rgba(99,102,241,0.08)]'
      }`}
    >
      {/* Top Details */}
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
                isAres
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                  : 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
              }`}
            >
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold font-mono text-white tracking-wider">
                  {robot.name}
                </h3>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${getStatusBadge()}`}>
                  ● {robot.status}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{robot.role}</p>
            </div>
          </div>

          {/* Battery Indicator */}
          <div className="flex items-center gap-1.5 bg-space-950 px-2.5 py-1 rounded-lg border border-space-800 text-xs font-mono">
            <Battery className={`w-4 h-4 ${robot.batteryPct > 20 ? 'text-emerald-400' : 'text-red-400'}`} />
            <span className="font-bold text-white">{robot.batteryPct}%</span>
          </div>
        </div>

        {/* Location & Current Task Matrix */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="bg-space-950/70 p-2.5 rounded-xl border border-space-800 flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-400" /> LOCATION
            </span>
            <span className="text-gray-200 font-semibold truncate">{robot.location.replace(/_/g, ' ')}</span>
          </div>

          <div className="bg-space-950/70 p-2.5 rounded-xl border border-space-800 flex flex-col gap-1">
            <span className="text-[10px] text-gray-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-amber-400" /> CURRENT TASK
            </span>
            <span className="text-cyan-300 font-semibold truncate">{robot.currentTask}</span>
          </div>
        </div>

        {/* Personality & Responsibilities */}
        <div className="bg-space-950/50 p-3 rounded-xl border border-space-800/80 flex flex-col gap-1.5 text-xs font-mono">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-gray-400">PERSONALITY:</span>
            <span className="text-cyan-400 font-medium">
              {isAres ? 'Calm • Helpful • Crew-focused' : 'Technical • Analytical • Telemetry-focused'}
            </span>
          </div>
          <div className="text-[11px] text-gray-400 italic">
            {isAres
              ? '"AST-01 has completed scheduled lab block. Routine wellness check nominal."'
              : '"Telemetry check complete. All monitored subsystem values within nominal ranges."'}
          </div>
        </div>
      </div>

      {/* Action Control Buttons */}
      <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-space-800">
        <div className="text-[10px] font-mono text-gray-400 flex items-center justify-between">
          <span>SIMULATED AUTONOMOUS COMMANDS:</span>
          <span className="text-amber-400 text-[9px]">SIMULATED ROBOT ACTION</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 text-xs font-mono">
          <button
            onClick={() => onAction('PATROL', robot.location)}
            disabled={isLoading}
            className="p-2 rounded-lg bg-space-950 hover:bg-cyan-950 border border-space-800 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 transition flex flex-col items-center justify-center gap-1"
          >
            <Compass className="w-3.5 h-3.5" />
            <span className="text-[10px]">PATROL</span>
          </button>

          <button
            onClick={() => onAction('INSPECT', robot.location)}
            disabled={isLoading}
            className="p-2 rounded-lg bg-space-950 hover:bg-cyan-950 border border-space-800 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 transition flex flex-col items-center justify-center gap-1"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="text-[10px]">INSPECT</span>
          </button>

          <button
            onClick={() => onAction('ASSIST', robot.location)}
            disabled={isLoading}
            className="p-2 rounded-lg bg-space-950 hover:bg-cyan-950 border border-space-800 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 transition flex flex-col items-center justify-center gap-1"
          >
            <LifeBuoy className="w-3.5 h-3.5" />
            <span className="text-[10px]">ASSIST</span>
          </button>

          <button
            onClick={() => onAction('RETURN', 'HABITAT' as any)}
            disabled={isLoading}
            className="p-2 rounded-lg bg-space-950 hover:bg-cyan-950 border border-space-800 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-300 transition flex flex-col items-center justify-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px]">RETURN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
