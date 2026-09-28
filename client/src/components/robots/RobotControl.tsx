import React, { useState } from 'react';
import { useMission } from '../../context/MissionContext';
import { RobotCard } from './RobotCard';
import { RobotCommunicationLog } from './RobotCommunicationLog';
import { Bot, Shield, Zap, RefreshCw, Cpu, Radio, Sparkles } from 'lucide-react';

export const RobotControl: React.FC = () => {
  const { robots, sendRobotAction, session } = useMission();
  const [loadingRobot, setLoadingRobot] = useState<string | null>(null);

  const handleAction = async (robotId: 'ARES-1' | 'NOVA-2', action: any, module?: any) => {
    setLoadingRobot(robotId);
    try {
      await sendRobotAction(robotId, action, module);
    } finally {
      setLoadingRobot(null);
    }
  };

  const ares = robots.find(r => r.id === 'ARES-1');
  const nova = robots.find(r => r.id === 'NOVA-2');

  const isAutonomous = session?.commStatus === 'OFFLINE' || session?.autonomousModeActive;

  return (
    <div className="flex flex-col gap-6">
      {/* Autonomous Mode Banner */}
      {isAutonomous && (
        <div className="bg-purple-950/80 border border-purple-500/50 rounded-2xl p-4 flex items-center justify-between shadow-[0_0_30px_rgba(168,85,247,0.2)] animate-pulse">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold font-mono text-white tracking-wider">
                  AUTONOMOUS ROBOT MODE ACTIVE
                </h3>
                <span className="bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[10px] font-mono px-2 py-0.5 rounded">
                  GROUND COMM OFFLINE
                </span>
              </div>
              <p className="text-xs text-purple-300/80">
                ARES-1 maintains crew routine and wellness monitoring; NOVA-2 maintains continuous subsystem telemetry logging.
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-purple-300">
            <span className="font-bold text-white">DECENTRALIZED EDGE AUTONOMY</span>
          </div>
        </div>
      )}

      {/* Two Robots Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {ares && (
          <RobotCard
            robot={ares}
            onAction={(action, mod) => handleAction('ARES-1', action, mod)}
            isLoading={loadingRobot === 'ARES-1'}
          />
        )}
        {nova && (
          <RobotCard
            robot={nova}
            onAction={(action, mod) => handleAction('NOVA-2', action, mod)}
            isLoading={loadingRobot === 'NOVA-2'}
          />
        )}
      </div>

      {/* Robot Communication Bus Log */}
      <RobotCommunicationLog />
    </div>
  );
};
