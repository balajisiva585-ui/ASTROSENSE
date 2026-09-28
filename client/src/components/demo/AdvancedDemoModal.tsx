import React, { useState } from 'react';
import { useMission } from '../../context/MissionContext';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  X,
  Sparkles,
  Bot,
  Video,
  Radio,
  Zap,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  FileText,
} from 'lucide-react';

export const ADVANCED_DEMO_STEPS_CLIENT = [
  {
    stepNumber: 1,
    title: 'Step 1: Open Mission Monitor',
    description: 'Launch the unified Mission Monitor dashboard combining live video, telemetry, crew, robots, and timeline.',
    badge: 'MISSION MONITOR',
  },
  {
    stepNumber: 2,
    title: 'Step 2: Simulated Live Video & HAR Vision',
    description: 'Surveillance feeds (CAM-01 to CAM-04) stream live with human activity recognition bounding boxes and confidence overlays.',
    badge: 'LIVE VIDEO',
  },
  {
    stepNumber: 3,
    title: 'Step 3: Multi-Crew Activity Monitoring',
    description: 'Simultaneous behavioral tracking of 4 astronauts across habitat modules with vitals and movement states.',
    badge: 'CREW STATUS',
  },
  {
    stepNumber: 4,
    title: 'Step 4: ARES-1 Crew Support Robot Active',
    description: 'ARES-1 autonomous crew support robot monitors crew wellbeing and daily activity schedules in Laboratory.',
    badge: 'ARES-1',
  },
  {
    stepNumber: 5,
    title: 'Step 5: NOVA-2 Engineering Robot Active',
    description: 'NOVA-2 engineering robot runs 1Hz diagnostics across power bus, ECLSS atmosphere, and asteroid radar.',
    badge: 'NOVA-2',
  },
  {
    stepNumber: 6,
    title: 'Step 6: Voice Assistant Mission Status Query',
    description: 'Operator issues voice command: "What is the mission status?" -> Voice assistant synthesizes local status.',
    badge: 'VOICE ASSISTANT',
  },
  {
    stepNumber: 7,
    title: 'Step 7: Crew Routine Schedule Reminder',
    description: 'ARES-1 broadcasts acoustic routine reminder: "Attention crew: Scheduled nutrition period is approaching."',
    badge: 'CREW ROUTINE',
  },
  {
    stepNumber: 8,
    title: 'Step 8: Trigger Simulated Kinetic Anomaly',
    description: 'Simulate unexpected acceleration spike and loss of vertical posture for AST-01 in Module A.',
    badge: 'ANOMALY DETECTED',
  },
  {
    stepNumber: 9,
    title: 'Step 9: ARES-1 Autonomous Safety Response',
    description: 'ARES-1 detects fall anomaly and begins local crew verification protocol with acoustic confirmation.',
    badge: 'ARES-1 ASSIST',
  },
  {
    stepNumber: 10,
    title: 'Step 10: NOVA-2 Secondary Telemetry Sweep',
    description: 'NOVA-2 cross-correlates habitat accelerometers and life support pressure to rule out hull impact.',
    badge: 'NOVA-2 DIAGNOSTIC',
  },
  {
    stepNumber: 11,
    title: 'Step 11: Spacecraft Communication Blackout',
    description: 'Ground DSN connection drops to OFFLINE. Earth Mission Control displays COMMUNICATION UNAVAILABLE.',
    badge: 'COMM LOSS',
  },
  {
    stepNumber: 12,
    title: 'Step 12: Autonomous Robot Mode Sustained',
    description: 'Both ARES-1 and NOVA-2 continue autonomous patrols, telemetry logging, and inter-robot messaging.',
    badge: 'AUTONOMOUS MODE',
  },
  {
    stepNumber: 13,
    title: 'Step 13: Local ACID Event & Robot Storage',
    description: 'All crew activities, routine completions, and robot diagnostic events are buffered in local SQLite store.',
    badge: 'LOCAL EVENT VAULT',
  },
  {
    stepNumber: 14,
    title: 'Step 14: Ground Communication Link Restored',
    description: 'Spacecraft re-acquires DSN tracking carrier. Link status switches to ONLINE.',
    badge: 'COMM RESTORED',
  },
  {
    stepNumber: 15,
    title: 'Step 15: Synchronize Robot & Crew Events',
    description: 'Burst-synchronize all buffered offline events and robot logs to Earth Ground Mission Control (0% -> 100%).',
    badge: 'SYNC COMPLETE',
  },
  {
    stepNumber: 16,
    title: 'Step 16: Comprehensive Mission Report & Export',
    description: 'Review final multi-subsystem mission audit report with robot diagnostics and export to CSV/JSON.',
    badge: 'MISSION REPORT',
  },
];

export const AdvancedDemoModal: React.FC = () => {
  const {
    isAdvancedDemoOpen,
    closeAdvancedDemo,
    advancedDemoStatus,
    startAdvancedDemo,
    stopAdvancedDemo,
    stepAdvancedDemo,
    openReportModal,
    setTab,
  } = useMission();

  const [speed, setSpeed] = useState<number>(1);

  if (!isAdvancedDemoOpen) return null;

  const isRunning = advancedDemoStatus?.isRunning || false;
  const currentStepIndex = advancedDemoStatus?.currentStepIndex || 0;
  const currentStep = ADVANCED_DEMO_STEPS_CLIENT[currentStepIndex] || ADVANCED_DEMO_STEPS_CLIENT[0];

  const handleStepClick = async (idx: number) => {
    await stepAdvancedDemo(idx);
    if (idx === 0) setTab('mission-monitor');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl bg-space-900 border border-cyan-500/40 rounded-2xl shadow-[0_0_60px_rgba(0,240,255,0.25)] flex flex-col overflow-hidden max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-space-950 border-b border-space-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold font-mono text-white tracking-wider uppercase">
                  ADVANCED MISSION MONITORING DEMO (16 STEPS)
                </h2>
                <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                  FULL AUTONOMY PIPELINE
                </span>
              </div>
              <p className="text-xs text-gray-400">
                End-to-end evaluation of Multi-Cam HAR, ARES-1 & NOVA-2 robots, Voice Assistant, Comm Blackout & Sync
              </p>
            </div>
          </div>

          <button
            onClick={closeAdvancedDemo}
            className="p-2 rounded-lg bg-space-900 border border-space-800 text-gray-400 hover:text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body: Timeline & Active Step Card */}
        <div className="flex-1 p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Left Column: 16 Step Timeline */}
          <div className="md:col-span-1 bg-space-950 p-3.5 rounded-xl border border-space-800 flex flex-col gap-2 max-h-[420px] overflow-y-auto">
            <span className="text-[10px] font-mono text-gray-400 font-bold uppercase tracking-wider mb-1">
              DEMO WORKFLOW EXECUTION
            </span>
            {ADVANCED_DEMO_STEPS_CLIENT.map((step, idx) => {
              const isCurrent = idx === currentStepIndex;
              const isDone = idx < currentStepIndex;

              return (
                <button
                  key={step.stepNumber}
                  onClick={() => handleStepClick(idx)}
                  className={`p-2.5 rounded-lg text-left text-xs font-mono transition flex items-center gap-2.5 border ${
                    isCurrent
                      ? 'bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(0,240,255,0.2)]'
                      : isDone
                      ? 'bg-space-900/80 border-space-800 text-emerald-400'
                      : 'bg-space-950/40 border-space-800/60 text-gray-400 hover:border-space-700'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isCurrent
                        ? 'bg-cyan-400 text-black animate-pulse'
                        : isDone
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-space-800 text-gray-400'
                    }`}
                  >
                    {isDone ? '✓' : step.stepNumber}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold truncate text-[11px]">{step.title}</div>
                    <div className="text-[9px] text-gray-400 truncate">{step.badge}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Right Column: Detailed Viewport for Current Step */}
          <div className="md:col-span-2 bg-space-950 p-5 rounded-xl border border-space-800 flex flex-col justify-between gap-4">
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-space-800 pb-3">
                <span className="text-xs font-mono text-cyan-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  CURRENT ACTIVE STEP {currentStepIndex + 1} OF 16
                </span>
                <span className="bg-cyan-500/20 text-cyan-300 text-[10px] font-mono px-2.5 py-0.5 rounded border border-cyan-500/30">
                  {currentStep.badge}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-bold font-mono text-white">{currentStep.title}</h3>
                <p className="text-sm text-gray-300 font-mono mt-2 leading-relaxed">
                  {currentStep.description}
                </p>
              </div>

              {/* Step Context Indicators */}
              <div className="grid grid-cols-2 gap-3 mt-2 font-mono text-xs">
                <div className="bg-space-900 p-3 rounded-lg border border-space-800">
                  <span className="text-[10px] text-gray-400 block mb-1">DATA PROVENANCE:</span>
                  <span className="text-emerald-400 font-bold">100% LOCAL / SIMULATED</span>
                </div>
                <div className="bg-space-900 p-3 rounded-lg border border-space-800">
                  <span className="text-[10px] text-gray-400 block mb-1">MISSION CONTROL SYNC:</span>
                  <span className="text-cyan-300 font-bold">
                    {currentStepIndex >= 10 && currentStepIndex < 13 ? 'BLACKOUT (OFFLINE)' : 'ONLINE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions for Current Step */}
            <div className="flex items-center justify-between pt-3 border-t border-space-800">
              <div className="text-xs font-mono text-gray-400">
                {currentStepIndex === 15 ? (
                  <button
                    onClick={() => {
                      closeAdvancedDemo();
                      openReportModal();
                    }}
                    className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black rounded-lg border border-emerald-500/40 text-xs font-mono font-bold transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    VIEW FINAL MISSION REPORT
                  </button>
                ) : (
                  <span>Click Next to advance step sequence</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleStepClick(Math.max(0, currentStepIndex - 1))}
                  disabled={currentStepIndex === 0}
                  className="px-3 py-1.5 bg-space-900 hover:bg-space-800 text-gray-300 rounded-lg text-xs font-mono disabled:opacity-30 border border-space-800 transition flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> PREV
                </button>
                <button
                  onClick={() => handleStepClick(Math.min(ADVANCED_DEMO_STEPS_CLIENT.length - 1, currentStepIndex + 1))}
                  disabled={currentStepIndex === ADVANCED_DEMO_STEPS_CLIENT.length - 1}
                  className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black rounded-lg text-xs font-mono font-bold disabled:opacity-30 transition flex items-center gap-1 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
                >
                  NEXT <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Playback Control Bar Footer */}
        <div className="p-4 bg-space-950 border-t border-space-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {isRunning ? (
              <button
                onClick={() => stopAdvancedDemo()}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition"
              >
                <Pause className="w-4 h-4" /> PAUSE AUTO-PLAY
              </button>
            ) : (
              <button
                onClick={() => startAdvancedDemo(speed)}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-[0_0_20px_rgba(0,240,255,0.3)]"
              >
                <Play className="w-4 h-4" /> START AUTO DEMO
              </button>
            )}

            <button
              onClick={() => handleStepClick(0)}
              className="p-2 bg-space-900 hover:bg-space-800 text-gray-300 border border-space-800 rounded-xl transition"
              title="Reset to Step 1"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Speed Selector */}
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-gray-400 text-[11px]">SPEED:</span>
            {[1, 1.5, 2, 3].map((s) => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className={`px-2.5 py-1 rounded-lg border text-xs transition ${
                  speed === s
                    ? 'bg-cyan-500/30 text-cyan-300 border-cyan-500/50'
                    : 'bg-space-900 border-space-800 text-gray-400 hover:text-gray-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
