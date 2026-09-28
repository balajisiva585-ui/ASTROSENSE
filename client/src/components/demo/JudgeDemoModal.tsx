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
  Cpu,
  Database,
  RefreshCw,
} from 'lucide-react';
import { DemoStep } from '../../types';

const DEMO_STEPS: DemoStep[] = [
  {
    stepNumber: 1,
    title: 'Step 1: Routine Transit (Walking)',
    description: 'Astronaut AST-01 transitions from Crew Quarters to Science Module.',
    activity: 'WALKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Ground link active. Normal telemetry downlink.',
  },
  {
    stepNumber: 2,
    title: 'Step 2: Microgravity Research (Working)',
    description: 'Conducting Biological & Activity Surveillance (BAS) incubation experiment.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Real-time Edge AI inference classifying fine motor manipulation.',
  },
  {
    stepNumber: 3,
    title: 'Step 3: Spacecraft Communication Blackout',
    description: 'Orbital geometry causes Deep Space / Ground Tracking Loss.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Earth Mission Control link severed. Zero cloud AI access.',
  },
  {
    stepNumber: 4,
    title: 'Step 4: Autonomous Onboard Mode Activated',
    description: 'AstroSense switches seamlessly to local edge intelligence mode.',
    activity: 'WORKING',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Local neural network inference continues at 24ms latency.',
  },
  {
    stepNumber: 5,
    title: 'Step 5: Edge AI Activity Recognition Continues',
    description: 'Operating station telemetry systems with zero external dependencies.',
    activity: 'OPERATING_EQUIPMENT',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Events stored in local offline queue. Unsynced counter increases.',
  },
  {
    stepNumber: 6,
    title: 'Step 6: Countermeasure Aerobic Workout',
    description: 'Mandatory microgravity bone density & cardiovascular workout.',
    activity: 'EXERCISING',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Vitals tracking heart rate spike to 142 bpm. Local classification 98.2%.',
  },
  {
    stepNumber: 7,
    title: 'Step 7: Sudden Kinetic Disruption / Abnormal Movement',
    description: 'High kinetic acceleration vector and sudden body tilt detected.',
    activity: 'FALL_ABNORMAL_MOVEMENT',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    notes: 'Anomaly engine triggers local rule-based safety classifier.',
  },
  {
    stepNumber: 8,
    title: 'Step 8: Critical Mission Safety Alert Triggered',
    description: 'Onboard audio/visual alert sounds inside habitat module.',
    activity: 'FALL_ABNORMAL_MOVEMENT',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    notes: 'Alert logged locally. No cloud needed for astronaut life safety.',
  },
  {
    stepNumber: 9,
    title: 'Step 9: Local Persistence & Unsynced Event Queueing',
    description: 'Events batched with timestamp for later sync.',
    activity: 'SITTING',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Unsynced queue holds all telemetry events safely on edge drive.',
  },
  {
    stepNumber: 10,
    title: 'Step 10: Ground Communication Link Restored',
    description: 'Spacecraft re-acquires TDRS / Ground Deep Space Network antenna.',
    activity: 'WALKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'AstroSense detects uplink availability. Sync engine alerts ready.',
  },
  {
    stepNumber: 11,
    title: 'Step 11: Autonomous Synchronization In Progress',
    description: 'Streaming pending event batches (0% -> 25% -> 50% -> 100%).',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Delay-tolerant synchronization reconciles mission timeline on Earth.',
  },
  {
    stepNumber: 12,
    title: 'Step 12: Mission Synchronization Complete',
    description: 'All local events marked SYNCED. Ground timeline fully reconstructed.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Unsynced queue returns to 0. Mission history verified.',
  },
  {
    stepNumber: 13,
    title: 'Step 13: Final Mission Aurora Telemetry Report',
    description: 'Comprehensive activity distribution, safety metrics, and audit log.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Ready for flight doctor review and data export (CSV/JSON).',
  },
];

export const JudgeDemoModal: React.FC = () => {
  const {
    isJudgeDemoOpen,
    closeJudgeDemo,
    demoStatus,
    startJudgeDemo,
    stopJudgeDemo,
    stepJudgeDemo,
    openReportModal,
  } = useMission();

  const [speed, setSpeed] = useState<number>(1);
  const isRunning = demoStatus?.isRunning || false;
  const currentStepIndex = demoStatus?.currentStepIndex || 0;
  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0];

  if (!isJudgeDemoOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/80 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-3xl bg-space-900 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-space-800 bg-space-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 tracking-wider">
                ASTROSENSE | JUDGE PRESENTATION MODE
              </h2>
              <p className="text-xs text-slate-400">
                13-Step Automated End-to-End Mission Scenario Walkthrough
              </p>
            </div>
          </div>
          <button
            onClick={closeJudgeDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-space-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Step Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-bold text-cyan-400">
                STEP {currentStepIndex + 1} OF {DEMO_STEPS.length}
              </span>
              <span>{Math.round(((currentStepIndex + 1) / DEMO_STEPS.length) * 100)}% COMPLETE</span>
            </div>
            <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden border border-space-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${((currentStepIndex + 1) / DEMO_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step Spotlight Card */}
          <div className="p-5 rounded-xl bg-space-950 border border-cyan-500/30 space-y-4">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs">
              <div className="bg-space-900 p-2.5 rounded-lg border border-space-800">
                <span className="text-[10px] text-slate-500 uppercase block">Simulated Activity:</span>
                <span className="font-bold text-slate-200">{currentStep.activity}</span>
              </div>
              <div className="bg-space-900 p-2.5 rounded-lg border border-space-800">
                <span className="text-[10px] text-slate-500 uppercase block">Module Location:</span>
                <span className="font-bold text-cyan-400">{currentStep.module.replace(/_/g, ' ')}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-800/40 text-xs text-cyan-200/90 font-sans italic">
              <strong>Judge Note:</strong> {currentStep.notes}
            </div>
          </div>

          {/* Stepper Navigator Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {DEMO_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                onClick={() => stepJudgeDemo(idx)}
                className={`p-2 rounded-lg text-left text-xs border transition-all ${
                  idx === currentStepIndex
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-hud-cyan'
                    : idx < currentStepIndex
                    ? 'bg-space-950 border-emerald-800/50 text-emerald-400/80'
                    : 'bg-space-950 border-space-800 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="text-[10px] uppercase">Step {s.stepNumber}</div>
                <div className="truncate text-[11px] mt-0.5">{s.title.split(':')[1]?.trim() || s.title}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-space-800 bg-space-950/90 text-xs">
          {/* Speed Selector */}
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Speed:</span>
            {[1, 2, 4].map(s => (
              <button
                key={s}
                onClick={() => {
                  setSpeed(s);
                  if (isRunning) startJudgeDemo(s);
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

          {/* Playback Controls */}
          <div className="flex items-center gap-3">
            {isRunning ? (
              <button
                onClick={stopJudgeDemo}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-bold transition-all"
              >
                <Pause className="w-4 h-4" />
                <span>Pause</span>
              </button>
            ) : (
              <button
                onClick={() => startJudgeDemo(speed)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold transition-all shadow-hud-cyan"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Auto Play Demo</span>
              </button>
            )}

            <button
              onClick={() => {
                const nextIdx = Math.min(DEMO_STEPS.length - 1, currentStepIndex + 1);
                stepJudgeDemo(nextIdx);
              }}
              disabled={currentStepIndex >= DEMO_STEPS.length - 1}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-space-900 hover:bg-space-850 border border-space-750 text-slate-300 disabled:opacity-40"
            >
              <span>Next</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            {currentStepIndex === DEMO_STEPS.length - 1 && (
              <button
                onClick={() => {
                  closeJudgeDemo();
                  openReportModal();
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-hud-green"
              >
                <FileText className="w-4 h-4" />
                <span>View Mission Report</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
