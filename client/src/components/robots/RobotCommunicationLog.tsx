import React from 'react';
import { useMission } from '../../context/MissionContext';
import { Radio, MessageSquare, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

export const RobotCommunicationLog: React.FC = () => {
  const { robotLogs, session } = useMission();

  return (
    <div className="bg-space-900 border border-space-800 rounded-2xl p-5 shadow-xl flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-space-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold font-mono text-white tracking-wider uppercase">
                ROBOT-TO-ROBOT COMMUNICATION BUS (ARES-1 ↔ NOVA-2)
              </h3>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                LOCAL MESH
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Autonomous onboard coordination & cross-subsystem telemetry handshakes
            </p>
          </div>
        </div>

        <div className="text-[10px] font-mono text-gray-400 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          COMMUNICATION STATUS:{' '}
          <span className={session?.commStatus === 'ONLINE' ? 'text-emerald-400' : 'text-purple-400 font-bold'}>
            {session?.commStatus === 'ONLINE' ? 'GROUND SYNCED' : 'AUTONOMOUS LOCAL MODE'}
          </span>
        </div>
      </div>

      {/* Message List */}
      <div className="flex flex-col gap-2.5 max-h-72 overflow-y-auto pr-1">
        {robotLogs.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-xs font-mono">
            No inter-robot communication logs recorded yet.
          </div>
        ) : (
          robotLogs.map((log) => {
            const isCritical = log.priority === 'CRITICAL';
            const isAresSender = log.from === 'ARES-1';

            return (
              <div
                key={log.id}
                className={`p-3 rounded-xl border text-xs font-mono transition flex flex-col gap-1.5 ${
                  isCritical
                    ? 'bg-red-950/40 border-red-500/40 text-red-200'
                    : 'bg-space-950/80 border-space-800 text-gray-300 hover:border-space-700'
                }`}
              >
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2 font-bold">
                    <span className={isAresSender ? 'text-cyan-400' : 'text-indigo-400'}>
                      {log.from}
                    </span>
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                    <span className={!isAresSender ? 'text-cyan-400' : 'text-indigo-400'}>
                      {log.to}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                    <span>{log.displayTime} UTC</span>
                    {isCritical && (
                      <span className="bg-red-500/30 text-red-300 px-1.5 py-0.2 rounded font-bold">
                        CRITICAL
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-xs text-gray-200 pl-2 border-l-2 border-cyan-500/40">
                  "{log.message}"
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Provenance note */}
      <div className="text-[10px] font-mono text-gray-400 text-right">
        AUTONOMOUS SOFTWARE AGENTS • HUMAN VERIFICATION REQUIRED FOR DANGEROUS COMMANDS
      </div>
    </div>
  );
};
