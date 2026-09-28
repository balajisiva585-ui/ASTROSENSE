import React, { useState, useEffect } from 'react';
import { useMission } from '../../context/MissionContext';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  X,
  CheckCircle2,
  FileText,
  Wifi,
  WifiOff,
  ShieldAlert,
  Sparkles,
  Bot,
  Compass,
  Users,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { DemoStep } from '../../types';

const EXTENDED_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: 'Step 1: Open Dashboard & System Overview',
    description: 'Verify all nominal spacecraft subsystems, habitat layout, and active mission baseline.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Ground link active. Live HAR telemetry stream nominal.',
  },
  {
    stepNumber: 2,
    title: 'Step 2: AI Mission Assistant Query',
    description: 'Query offline Space Assistant: "What is happening on the mission right now?"',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Local NLP searches JSON/SQLite space knowledge base + real-time crew context with zero cloud APIs.',
  },
  {
    stepNumber: 3,
    title: 'Step 3: Live Mission Telemetry & Orbit Track',
    description: 'Monitor live cabin environment (Temp, Pressure, O2, CO2, Radiation) and 51.6° LEO orbit ground track.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Continuous 1 Hz telemetry loop simulates ECLSS, power bus, and DSN ground station passes.',
  },
  {
    stepNumber: 4,
    title: 'Step 4: Multi-Crew Live Monitoring',
    description: 'Simultaneous surveillance of 4 astronauts (AST-01 through AST-04) with vitals and module tracking.',
    activity: 'EXERCISING',
    module: 'EXERCISE_AREA',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Multi-stream HAR classifier detects concurrent activities (Commander, Engineer, Specialist, Payload).',
  },
  {
    stepNumber: 5,
    title: 'Step 5: Trigger Communication Blackout',
    description: 'Simulate orbital ground station occlusion. Deep-space telemetry link drops to OFFLINE.',
    activity: 'WORKING',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Earth Mission Control displays COMMUNICATION UNAVAILABLE. Onboard system stays 100% operational.',
  },
  {
    stepNumber: 6,
    title: 'Step 6: Onboard Autonomous Mode Active',
    description: 'Edge AI inference, local SQLite event logging, and delay-tolerant buffering run autonomously.',
    activity: 'OPERATING_EQUIPMENT',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Pending sync count increments. Zero reliance on Earth or cloud servers.',
  },
  {
    stepNumber: 7,
    title: 'Step 7: Trigger Astronaut Anomaly',
    description: 'Simulate sudden acceleration anomaly and abnormal kinematic movement for AST-01 in Module A.',
    activity: 'FALL_ABNORMAL_MOVEMENT',
    module: 'LABORATORY',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    notes: 'Local anomaly detector raises instant audio-visual alert and logs critical event.',
  },
  {
    stepNumber: 8,
    title: 'Step 8: AI Anomaly Analysis & Recommendation',
    description: 'Space Assistant synthesizes root-cause hypothesis and 4-step clinical safety checklist.',
    activity: 'SITTING',
    module: 'LABORATORY',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    notes: 'Explicit safety boundary: AI decision support provides non-authoritative recommendations for human flight crew.',
  },
  {
    stepNumber: 9,
    title: 'Step 9: Deep Space / Asteroid Monitor',
    description: 'Autonomous radar tracking of Near-Earth Asteroids (2026-XF9, Apophis-Sim, PHA-Alpha).',
    activity: 'WORKING',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Polar radar displays synthetic ephemeris vectors and relative approach velocities.',
  },
  {
    stepNumber: 10,
    title: 'Step 10: Trigger Asteroid Trajectory Anomaly',
    description: 'Simulate unexpected radial velocity delta (+0.42 km/s) on asteroid 2026-XF9.',
    activity: 'WORKING',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    notes: 'Proximity anomaly alerts crew of deviation without automatic thruster actuation.',
  },
  {
    stepNumber: 11,
    title: 'Step 11: AI Deep Space Decision Support',
    description: 'AI assistant formulates radar recalibration protocol and optical cross-check schedule.',
    activity: 'WORKING',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    notes: 'Standardized protocols prevent false alarms and organize secondary verification.',
  },
  {
    stepNumber: 12,
    title: 'Step 12: Restore Communication Link',
    description: 'Spacecraft re-acquires Goldstone DSN tracking station. Uplink verified.',
    activity: 'WALKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Ground link green. Sync engine automatically triggers handshake.',
  },
  {
    stepNumber: 13,
    title: 'Step 13: Synchronize Stored Local Events',
    description: 'Burst-sync all offline accumulated mission events (0% -> 25% -> 50% -> 75% -> 100%).',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Earth Mission Control database seamlessly backfills full chronological timeline without loss.',
  },
  {
    stepNumber: 14,
    title: 'Step 14: Mission Report & Audit Export',
    description: 'Generate comprehensive Mission Aurora log with activity distribution, anomaly audit, and CSV/JSON export.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Final validation of autonomous edge space architecture for hackathon evaluation.',
  },
];

export const ExtendedDemoModal: React.FC = () => {
  const {
    isExtendedDemoOpen,
    closeExtendedDemo,
    setTab,
    openReportModal,
    openAssistant,
    stepExtendedDemo,
    startExtendedDemo,
    stopExtendedDemo,
    extendedDemoStatus,
  } = useMission();

  const [speed, setSpeed] = useState<number>(1);
  const isRunning = extendedDemoStatus?.isRunning || false;
  const currentStepIndex = extendedDemoStatus?.currentStepIndex || 0;
  const currentStep = EXTENDED_STEPS[currentStepIndex] || EXTENDED_STEPS[0];

  const handleStepClick = async (idx: number) => {
    await stepExtendedDemo(idx);
    if (idx === 0) setTab('dashboard');
    if (idx === 1) openAssistant();
    if (idx === 2) setTab('live-mission');
    if (idx === 3) setTab('crew');
    if (idx === 4 || idx === 5 || idx === 6 || idx === 7) setTab('anomalies');
    if (idx === 8 || idx === 9 || idx === 10) setTab('asteroids');
    if (idx === 11 || idx === 12) setTab('mission-control');
    if (idx === 13) {
      closeExtendedDemo();
      openReportModal();
    }
  };

  if (!isExtendedDemoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-4xl bg-space-900 border border-cyan-500/60 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-space-800 bg-space-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/50">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-wider">
                ASTROSENSE | EXTENDED SPACE DEMO (3–5 MIN)
              </h2>
              <p className="text-xs text-slate-400 font-sans">
                Comprehensive 14-Step Spacecraft Intelligence & Multi-Subsystem Scenario
              </p>
            </div>
          </div>
          <button
            onClick={closeExtendedDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6 no-scrollbar">
          {/* Step Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-cyan-400">
                STEP {currentStepIndex + 1} OF {EXTENDED_STEPS.length}
              </span>
              <span>{Math.round(((currentStepIndex + 1) / EXTENDED_STEPS.length) * 100)}% COMPLETE</span>
            </div>
            <div className="w-full bg-space-950 h-2.5 rounded-full overflow-hidden border border-space-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / EXTENDED_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step Spotlight Card */}
          <div className="p-5 rounded-xl bg-space-950 border border-cyan-500/40 space-y-4 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-cyan-300">
                {currentStep.title}
              </h3>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2.5 py-1 rounded border font-semibold ${
                  currentStep.commStatus === 'OFFLINE'
                    ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                    : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                }`}>
                  {currentStep.commStatus}
                </span>
                {currentStep.isAnomaly && (
                  <span className="text-[11px] px-2.5 py-1 rounded border bg-rose-950/80 border-rose-500 text-rose-300 font-bold animate-pulse">
                    ANOMALY
                  </span>
                )}
              </div>
            </div>

            <p className="text-sm text-slate-200 leading-relaxed font-sans">
              {currentStep.description}
            </p>

            <div className="p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200 font-sans italic">
              <strong>Technical Highlight:</strong> {currentStep.notes}
            </div>
          </div>

          {/* Step Selector Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {EXTENDED_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                onClick={() => handleStepClick(idx)}
                className={`p-2 rounded-lg text-left text-xs border transition-all ${
                  idx === currentStepIndex
                    ? 'bg-cyan-500/25 border-cyan-400 text-cyan-300 font-bold shadow-hud-cyan'
                    : idx < currentStepIndex
                    ? 'bg-space-950 border-emerald-800/50 text-emerald-400/80'
                    : 'bg-space-950 border-space-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="text-[10px] uppercase font-bold">Step {s.stepNumber}</div>
                <div className="truncate text-[10px] mt-0.5">{s.title.split(':')[1]?.trim() || s.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-space-800 bg-space-950/90 text-xs">
          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Speed:</span>
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  if (isRunning) startExtendedDemo(s);
                }}
                className={`px-2.5 py-1 rounded border font-bold ${
                  speed === s
                    ? 'bg-cyan-500 text-space-950 border-cyan-400'
                    : 'bg-space-900 border-space-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {isRunning ? (
              <button
                onClick={stopExtendedDemo}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => startExtendedDemo(speed)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold transition-all shadow-hud-cyan"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Auto Play Extended Demo</span>
              </button>
            )}

            <button
              onClick={() => {
                const nextIdx = Math.min(EXTENDED_STEPS.length - 1, currentStepIndex + 1);
                handleStepClick(nextIdx);
              }}
              disabled={currentStepIndex >= EXTENDED_STEPS.length - 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-space-900 hover:bg-space-850 border border-space-750 text-slate-300 disabled:opacity-40"
            >
              <span>Next Step</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {currentStepIndex === EXTENDED_STEPS.length - 1 && (
              <button
                onClick={() => {
                  closeExtendedDemo();
                  openReportModal();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-hud-green"
              >
                <FileText className="w-4 h-4" />
                <span>View Final Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
