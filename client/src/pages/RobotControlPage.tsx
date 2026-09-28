import React from 'react';
import { useMission } from '../context/MissionContext';
import { RobotControl } from '../components/robots/RobotControl';
import { Bot, Shield, Zap, Radio, RefreshCw, Cpu, Sparkles } from 'lucide-react';

export const RobotControlPage: React.FC = () => {
  const { session, robots } = useMission();

  const isAutonomous = session?.commStatus === 'OFFLINE';

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      {/* Page Header */}
      <div className="bg-space-950 border border-indigo-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-mono text-white tracking-wider uppercase">
                AUTONOMOUS MISSION ROBOT CONTROL CENTER
              </h1>
              <span className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                SIMULATED ROBOTS
              </span>
            </div>
            <p className="text-xs text-gray-400">
              ARES-1 (Crew Support & Wellness) & NOVA-2 (Engineering & Telemetry Diagnostics)
            </p>
          </div>
        </div>

        {/* Safety Attribution & Human Verification Banner */}
        <div className="bg-space-900/90 px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>AI DECISION SUPPORT • HUMAN VERIFICATION REQUIRED • SIMULATED FLIGHT ROBOTICS</span>
        </div>
      </div>

      {/* Main Robots Component */}
      <RobotControl />
    </div>
  );
};
