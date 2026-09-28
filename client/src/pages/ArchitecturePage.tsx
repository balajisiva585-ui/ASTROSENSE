import React from 'react';
import { TelemetryCard } from '../components/common/TelemetryCard';
import {
  Layers,
  Cpu,
  Eye,
  Activity,
  ShieldAlert,
  Database,
  Radio,
  Globe2,
  CheckCircle2,
  ArrowDown,
  HardDrive,
  Zap,
} from 'lucide-react';

export const ArchitecturePage: React.FC = () => {
  const pipelineSteps = [
    {
      id: 'step1',
      title: '1. SENSORS & OPTICAL SENSING LAYER',
      subtitle: 'Spacecraft Cabin Multi-Camera Network',
      icon: Eye,
      color: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
      description:
        'Radiation-shielded Basler/FLIR high-speed CMOS optical sensors and low-light IR arrays capturing pressurized cabin modules at 30 FPS. Transmits raw video frames directly to the onboard edge processing bus.',
    },
    {
      id: 'step2',
      title: '2. ONBOARD EDGE AI & SKELETAL EXTRACTION',
      subtitle: 'Quantized Neural Inference Engine (Zero Cloud)',
      icon: Cpu,
      color: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
      description:
        'Local neural pipeline (MediaPipe/TFLite/ONNX quantized INT8) extracts 17 COCO-standard biomechanical joint coordinates in 24.5ms without external data transmission, ensuring total astronaut visual privacy.',
    },
    {
      id: 'step3',
      title: '3. SPATIAL-TEMPORAL HAR CLASSIFICATION',
      subtitle: 'ST-GCN + ConvLSTM Temporal Classification',
      icon: Activity,
      color: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
      description:
        'Classifies continuous kinetic trajectories into 12 mission-critical astronaut activity classes: Walking, Standing, Sitting, Sleeping, Eating, Drinking, Exercising, Working, Operating Equipment, Picking Cargo, Sudden Abnormal Movement/Fall, and Long Inactivity.',
    },
    {
      id: 'step4',
      title: '4. MISSION SAFETY & ANOMALY DETECTION ENGINE',
      subtitle: 'Deterministic Local Rule-Based Safety Classifier',
      icon: ShieldAlert,
      color: 'border-rose-500/40 bg-rose-950/20 text-rose-300',
      description:
        'Evaluates real-time classified activities against flight safety envelopes. Detects sudden kinetic acceleration spikes (falls), prolonged non-sleep inactivity, and module schedule deviations. Emits local audio-visual alerts immediately on station.',
    },
    {
      id: 'step5',
      title: '5. RESILIENT LOCAL PERSISTENCE & OFFLINE QUEUE',
      subtitle: 'ACID-Compliant Local SQLite Storage',
      icon: Database,
      color: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      description:
        'Stores all telemetry records locally with microsecond timestamps and sync flags. During communications blackouts (orbital shadow, Mars conjunction), events accumulate safely in the offline queue.',
    },
    {
      id: 'step6',
      title: '6. DELAY-TOLERANT SYNCHRONIZATION ENGINE',
      subtitle: 'Bundle Protocol (CCSDS / RFC 5050) Ground Link',
      icon: Globe2,
      color: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      description:
        'Upon Deep Space Network (DSN) RF carrier acquisition, the sync engine autonomously batches and compresses pending events, updating Ground Mission Control without duplicating records or dropping telemetry frames.',
    },
  ];

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Top Title Banner */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <Layers className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wider">
              ASTROSENSE SYSTEM ARCHITECTURE
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Autonomous Edge AI Pipeline for Microgravity Behavioral & Activity Surveillance (BAS)
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Pipeline Architecture Flow */}
      <div className="space-y-3">
        {pipelineSteps.map((step, idx) => {
          const Icon = step.icon;
          return (
            <React.Fragment key={step.id}>
              <div className={`p-4 rounded-xl border ${step.color} transition-all hover:scale-[1.01]`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-space-950 border border-space-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{step.title}</h3>
                      <span className="text-[11px] text-slate-400">{step.subtitle}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-space-950/80 border border-space-800 text-slate-300">
                    STAGE 0{idx + 1}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed pl-0 sm:pl-12">
                  {step.description}
                </p>
              </div>

              {idx < pipelineSteps.length - 1 && (
                <div className="flex justify-center py-0.5">
                  <ArrowDown className="w-4 h-4 text-cyan-500/60 animate-bounce" />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Cloud-Dependent vs Edge-Autonomous Comparison Table */}
      <TelemetryCard
        title="EDGE AI VS TRADITIONAL CLOUD ARCHITECTURE FOR SPACE MISSIONS"
        subtitle="Critical Technical Comparison for Deep Space Exploration"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse font-sans text-xs">
            <thead>
              <tr className="border-b border-space-800 font-mono text-[10px] text-slate-400 uppercase">
                <th className="py-2.5 px-3">Architecture Metric</th>
                <th className="py-2.5 px-3 text-rose-400">Traditional Cloud AI (Earth-Bound)</th>
                <th className="py-2.5 px-3 text-cyan-400 font-bold">ASTROSENSE Onboard Edge AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-space-850">
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-slate-200">Earth Comm Blackout</td>
                <td className="py-3 px-3 text-rose-300">Complete failure (Zero functionality)</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">100% Continuous Autonomous Operation</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-slate-200">Decision Latency</td>
                <td className="py-3 px-3 text-slate-400">2.6s (Moon) to 44 mins round-trip (Mars)</td>
                <td className="py-3 px-3 text-cyan-300 font-mono font-bold">24.5 ms (Instant local response)</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-slate-200">Bandwidth Consumption</td>
                <td className="py-3 px-3 text-slate-400">Continuous 4K/1080p high bitrate video stream</td>
                <td className="py-3 px-3 text-cyan-300">Zero video uplink; compressed event bundles only</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-slate-200">Crew Video Privacy</td>
                <td className="py-3 px-3 text-slate-400">Raw video transmitted outside habitat</td>
                <td className="py-3 px-3 text-emerald-400">Processed in local RAM; video never leaves module</td>
              </tr>
              <tr>
                <td className="py-3 px-3 font-mono font-bold text-slate-200">Safety Critical Alarms</td>
                <td className="py-3 px-3 text-rose-300">Delayed by orbital radio propagation</td>
                <td className="py-3 px-3 text-emerald-400 font-bold">Immediate local audio/visual crew alert</td>
              </tr>
            </tbody>
          </table>
        </div>
      </TelemetryCard>

      {/* Edge Hardware Flight Deployment Blueprint */}
      <TelemetryCard
        title="TARGET HARDWARE & FLIGHT EMBEDDED INTEGRATION ROADMAP"
        subtitle="Radiation-Tolerant Space Edge Computing Specifications"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-sans text-xs">
          <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 space-y-1.5">
            <div className="flex items-center gap-2 text-cyan-400 font-mono font-bold text-xs">
              <Zap className="w-4 h-4" />
              <span>Unibap SpaceCloud / Jetson Orin</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Industrial space-grade Edge AI platform running INT8 TensorRT/ONNX Runtime with 200+ TOPS inference capabilities at under 45 Watts.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 space-y-1.5">
            <div className="flex items-center gap-2 text-purple-400 font-mono font-bold text-xs">
              <HardDrive className="w-4 h-4" />
              <span>Radiation-Hardened Flash Storage</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Triple modular redundancy (TMR) NVMe storage maintaining local SQLite WAL journals resilient against single-event upsets (SEU).
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 space-y-1.5">
            <div className="flex items-center gap-2 text-emerald-400 font-mono font-bold text-xs">
              <Radio className="w-4 h-4" />
              <span>CCSDS Delay-Tolerant Router</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Autonomous ION-DTN router managing opportunistic contact windows with TDRS, Lunar Gateway, or Mars Deep Space Relay orbiters.
            </p>
          </div>
        </div>
      </TelemetryCard>
    </div>
  );
};
