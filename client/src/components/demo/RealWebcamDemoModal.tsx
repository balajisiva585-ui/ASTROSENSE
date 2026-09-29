import React, { useState } from 'react';
import { useMission } from '../../context/MissionContext';
import {
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  X,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  Layers,
  Database,
  Radio,
  Sparkles,
  Wifi,
  WifiOff,
  Eye,
  Activity,
} from 'lucide-react';

export interface RealWebcamDemoStep {
  stepNumber: number;
  title: string;
  stage: string;
  actionRequired: string;
  expectedResult: string;
  notes: string;
  commStatus: 'ONLINE' | 'OFFLINE';
  openCVFocus: string;
}

const WEBCAM_DEMO_STEPS: RealWebcamDemoStep[] = [
  {
    stepNumber: 1,
    title: 'Step 1: Start Mission Control Live Console',
    stage: 'MISSION_INITIALIZE',
    actionRequired: 'Verify AstroSense Mission Control UI and HUD subsystems are active.',
    expectedResult: 'Orbital status nominal, spacecraft orbit map running, telemetry initialized.',
    notes: 'Ground link active. All local database tables verified.',
    commStatus: 'ONLINE',
    openCVFocus: 'System Ready',
  },
  {
    stepNumber: 2,
    title: 'Step 2: Select REAL WEBCAM Mode',
    stage: 'WEBCAM_SELECT',
    actionRequired: 'Click REAL WEBCAM mode on the Live Video Monitor.',
    expectedResult: 'CAM-01 activates real browser video input (navigator.mediaDevices.getUserMedia).',
    notes: 'Secondary cameras switch to simulated habitat sensors.',
    commStatus: 'ONLINE',
    openCVFocus: 'Resolution Negotiation (1280x720)',
  },
  {
    stepNumber: 3,
    title: 'Step 3: Camera Permission & Link Acquisition',
    stage: 'CAMERA_PERMISSION',
    actionRequired: 'Allow camera access in browser prompt if requested.',
    expectedResult: 'Camera link established. Status shows OPTICAL LIVE with zero cloud streaming.',
    notes: 'Local browser RAM stream only. No raw frames uploaded to servers.',
    commStatus: 'ONLINE',
    openCVFocus: 'WebAssembly Initialization (/js/opencv.js)',
  },
  {
    stepNumber: 4,
    title: 'Step 4: 3-Second Optical Calibration',
    stage: 'CALIBRATION',
    actionRequired: 'Press CALIBRATE and stand upright in neutral balance for 3 seconds.',
    expectedResult: 'Countdown 3... 2... 1... establishes baseline torso height, shoulder width, and luminance.',
    notes: 'Calibration prevents baseline bias across different camera focal lengths.',
    commStatus: 'ONLINE',
    openCVFocus: 'Mean Luminance & Laplacian Blur Variance Baseline',
  },
  {
    stepNumber: 5,
    title: 'Step 5: MediaPipe 33-Point Pose Lock',
    stage: 'POSE_LOCK',
    actionRequired: 'Remain in frame as MediaPipe PoseLandmarker lite tracks joints.',
    expectedResult: 'HUD indicates 33/33 LANDMARKS ACQUIRED with green skeleton overlay.',
    notes: 'Inference running at ~25-30 FPS with ~28-35 ms latency.',
    commStatus: 'ONLINE',
    openCVFocus: 'Normalized ROI Preprocessing',
  },
  {
    stepNumber: 6,
    title: 'Step 6: Stand Upright (STANDING)',
    stage: 'STAND_TEST',
    actionRequired: 'Stand upright in camera frame with low body movement.',
    expectedResult: 'Temporal classifier locks STANDING (Torso tilt < 26°, knees extended > 138°, CV motion < 0.05).',
    notes: 'Requires majority vote over recent frames to prevent flickering.',
    commStatus: 'ONLINE',
    openCVFocus: 'Optical Flow Motion < 0.05 (Stationary Balance)',
  },
  {
    stepNumber: 7,
    title: 'Step 7: Sit Down (SITTING)',
    stage: 'SIT_TEST',
    actionRequired: 'Sit down on a chair or lower center of mass in camera view.',
    expectedResult: 'Classifier transitions to SITTING (Knee flexion ~70°-135°, lowered center of mass).',
    notes: 'Distinguishes normal seated posture from fall anomalies.',
    commStatus: 'ONLINE',
    openCVFocus: 'Low Kinetic Center of Mass Shift',
  },
  {
    stepNumber: 8,
    title: 'Step 8: Walk Across Frame (WALKING)',
    stage: 'WALK_TEST',
    actionRequired: 'Walk or take alternating steps in front of the camera.',
    expectedResult: 'Classifier confirms WALKING (Alternating leg trajectories + OpenCV optical flow motion > 0.08).',
    notes: 'Walking requires sustained kinematic movement and is never falsely assigned to still standing.',
    commStatus: 'ONLINE',
    openCVFocus: 'Lucas-Kanade Feature Trajectory Tracking',
  },
  {
    stepNumber: 9,
    title: 'Step 9: Perform Repetitive Movement (EXERCISING)',
    stage: 'EXERCISE_TEST',
    actionRequired: 'Perform squats, arm curls, or rhythmic body countermeasure movement.',
    expectedResult: 'Classifier locks EXERCISING (Kinetic energy > 0.30 + detected periodic cycle frequency).',
    notes: 'Validates microgravity daily 2-hour exercise countermeasure adherence.',
    commStatus: 'ONLINE',
    openCVFocus: 'Kinetic Energy Spike + Motion Periodicity Fourier Analysis',
  },
  {
    stepNumber: 10,
    title: 'Step 10: Cease Movement (Low Motion Hold)',
    stage: 'REST_HOLD',
    actionRequired: 'Stop moving and remain completely still in frame.',
    expectedResult: 'Motion drops below 0.04. System transitions to stationary monitoring.',
    notes: 'Inactivity timer begins tracking stationary duration.',
    commStatus: 'ONLINE',
    openCVFocus: 'Frame Difference absdiff delta near zero',
  },
  {
    stepNumber: 11,
    title: 'Step 11: Trigger Inactivity Alert (LONG INACTIVITY)',
    stage: 'INACTIVITY_TRIGGER',
    actionRequired: 'Remain completely still for > 15 seconds.',
    expectedResult: 'Safety alert triggers: LONG INACTIVITY (person visible but zero translation).',
    notes: 'Protects crew against sudden incapacitation or hypoxia in solo habitat modules.',
    commStatus: 'ONLINE',
    openCVFocus: 'Sustained Zero Kinetic Vector',
  },
  {
    stepNumber: 12,
    title: 'Step 12: Step Completely Out of Camera Frame',
    stage: 'LEAVE_FRAME',
    actionRequired: 'Step out of camera view so no person is visible.',
    expectedResult: 'MediaPipe detects 0 landmarks.',
    notes: 'System does NOT fabricate standing/walking when camera is empty.',
    commStatus: 'ONLINE',
    openCVFocus: 'Empty Scene Frame Differencing',
  },
  {
    stepNumber: 13,
    title: 'Step 13: Display NO PERSON DETECTED',
    stage: 'NO_PERSON',
    actionRequired: 'Observe the HUD while frame is unoccupied.',
    expectedResult: 'HUD clearly displays NO PERSON DETECTED (Confidence: 0%, Landmarks: 0).',
    notes: 'Scientific honesty: zero synthetic activity hallucination.',
    commStatus: 'ONLINE',
    openCVFocus: 'Background Stability Locked',
  },
  {
    stepNumber: 14,
    title: 'Step 14: Anomaly Rule Evaluation & Safety Logic',
    stage: 'ANOMALY_LOGIC',
    actionRequired: 'Review autonomous anomaly heuristic evaluation (Falls / Biomechanical breach).',
    expectedResult: 'Anomaly Center flags kinematic anomalies with severity ratings and audio-visual cues.',
    notes: 'Heuristic rules run purely client-side without cloud API reliance.',
    commStatus: 'ONLINE',
    openCVFocus: 'Rapid Vertical Acceleration Threshold Check',
  },
  {
    stepNumber: 15,
    title: 'Step 15: Commit Event to Local SQLite Onboard Database',
    stage: 'SQLITE_PERSIST',
    actionRequired: 'Inspect SQLite event ledger table in Database Setup & Status.',
    expectedResult: 'Real activity events committed to astrosense_local.sqlite with UTC timestamps.',
    notes: 'ACID transactional persistence on local spacecraft solid-state drive.',
    commStatus: 'ONLINE',
    openCVFocus: 'Event Metadata Serialization',
  },
  {
    stepNumber: 16,
    title: 'Step 16: Simulate Spacecraft Communication Loss',
    stage: 'COMM_LOSS',
    actionRequired: 'Toggle Communication Status to OFFLINE.',
    expectedResult: 'AUTONOMOUS ONBOARD MODE engages; events queue in local offline vault.',
    notes: 'Zero frames or activity recognitions are dropped during orbital occlusions.',
    commStatus: 'OFFLINE',
    openCVFocus: 'Autonomous Onboard Processing Uninterrupted',
  },
  {
    stepNumber: 17,
    title: 'Step 17: Restore Earth Link + Burst PostgreSQL Sync',
    stage: 'RESTORE_SYNC',
    actionRequired: 'Restore communication to ONLINE and trigger Sync Engine.',
    expectedResult: 'Sync Engine batch-uploads pending offline records to Ground PostgreSQL (0% -> 100%).',
    notes: 'Ground Mission Control timeline reconstructed with zero data loss.',
    commStatus: 'ONLINE',
    openCVFocus: 'Delay-Tolerant Re-Synchronization Completed',
  },
];

interface RealWebcamDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RealWebcamDemoModal: React.FC<RealWebcamDemoModalProps> = ({ isOpen, onClose }) => {
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);
  const [autoPlay, setAutoPlay] = useState<boolean>(false);
  const { toggleCommStatus, session, triggerSyncNow } = useMission();

  if (!isOpen) return null;

  const step = WEBCAM_DEMO_STEPS[currentStepIdx] || WEBCAM_DEMO_STEPS[0];

  const handleNext = () => {
    if (currentStepIdx < WEBCAM_DEMO_STEPS.length - 1) {
      const nextIdx = currentStepIdx + 1;
      setCurrentStepIdx(nextIdx);

      // Auto-toggle communication if step requires it
      if (WEBCAM_DEMO_STEPS[nextIdx].commStatus !== session?.commStatus) {
        toggleCommStatus();
      }
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(currentStepIdx - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-space-950/85 backdrop-blur-md animate-fade-in font-mono">
      <div className="relative w-full max-w-4xl bg-space-900 border border-cyan-500/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-space-800 bg-space-950/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shadow-hud-cyan">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wider">
                  REAL WEBCAM + OPENCV.JS DEMO LAB
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold">
                  17-STEP OFFICIAL VERIFICATION
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans">
                Interactive real-camera biomechanical validation & delay-tolerant hybrid database sync
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-space-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs text-gray-400">
              <span className="font-bold text-cyan-400">
                STEP {step.stepNumber} OF {WEBCAM_DEMO_STEPS.length} // {step.stage}
              </span>
              <span>{Math.round(((currentStepIdx + 1) / WEBCAM_DEMO_STEPS.length) * 100)}% COMPLETE</span>
            </div>
            <div className="w-full bg-space-950 h-2 rounded-full overflow-hidden border border-space-800">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-emerald-400 transition-all duration-300"
                style={{ width: `${((currentStepIdx + 1) / WEBCAM_DEMO_STEPS.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Current Step Main Spotlight Card */}
          <div className="p-5 rounded-xl bg-space-950 border border-cyan-500/30 space-y-4 shadow-lg">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                <span>{step.title}</span>
              </h3>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[11px] px-2.5 py-1 rounded border font-semibold ${
                    step.commStatus === 'OFFLINE'
                      ? 'bg-amber-950/80 border-amber-500 text-amber-300'
                      : 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                  }`}
                >
                  LINK: {step.commStatus}
                </span>
              </div>
            </div>

            {/* Action Required Box */}
            <div className="bg-space-900/90 p-3 rounded-lg border border-cyan-500/20">
              <span className="text-[10px] text-cyan-400 font-bold uppercase block mb-1">
                👉 ACTION FOR JUDGE / OPERATOR:
              </span>
              <p className="text-sm text-white font-sans font-semibold">
                {step.actionRequired}
              </p>
            </div>

            {/* Expected Result Box */}
            <div className="bg-space-900/90 p-3 rounded-lg border border-space-800">
              <span className="text-[10px] text-emerald-400 font-bold uppercase block mb-1">
                ✅ EXPECTED REAL-TIME RESULT:
              </span>
              <p className="text-xs text-gray-300 font-sans">
                {step.expectedResult}
              </p>
            </div>

            {/* OpenCV Focus & System Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-space-900/60 p-2.5 rounded-lg border border-space-800">
                <span className="text-[10px] text-purple-400 font-bold uppercase block">
                  OPENCV.JS & VISION FOCUS:
                </span>
                <span className="text-purple-200 mt-0.5 block">{step.openCVFocus}</span>
              </div>

              <div className="bg-space-900/60 p-2.5 rounded-lg border border-space-800">
                <span className="text-[10px] text-gray-400 font-bold uppercase block">
                  SCIENTIFIC INTEGRITY NOTE:
                </span>
                <span className="text-gray-300 mt-0.5 block italic">{step.notes}</span>
              </div>
            </div>
          </div>

          {/* Stepper Grid of 17 steps */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
            {WEBCAM_DEMO_STEPS.map((s, idx) => (
              <button
                key={s.stepNumber}
                onClick={() => setCurrentStepIdx(idx)}
                className={`p-2 rounded-lg text-left text-xs border transition-all ${
                  idx === currentStepIdx
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold shadow-hud-cyan'
                    : idx < currentStepIdx
                    ? 'bg-space-950 border-emerald-800/50 text-emerald-400/80'
                    : 'bg-space-950 border-space-800 text-gray-500 hover:text-gray-300'
                }`}
              >
                <div className="text-[10px] uppercase font-bold">Step {s.stepNumber}</div>
                <div className="truncate text-[10px] mt-0.5">{s.stage.replace(/_/g, ' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-space-800 bg-space-950/90 text-xs">
          <div className="flex items-center gap-2 text-gray-400">
            <span>Step {currentStepIdx + 1} of 17</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStepIdx === 0}
              className="px-3 py-1.5 rounded-lg bg-space-900 hover:bg-space-800 border border-space-700 text-gray-300 disabled:opacity-40"
            >
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={currentStepIdx >= WEBCAM_DEMO_STEPS.length - 1}
              className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold flex items-center gap-1.5 shadow-hud-cyan disabled:opacity-40"
            >
              <span>Next Step</span>
              <SkipForward className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-space-800 hover:bg-space-700 text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
