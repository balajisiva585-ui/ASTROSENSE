import React from 'react';
import { TelemetryCard } from '../components/common/TelemetryCard';
import {
  HelpCircle,
  AlertOctagon,
  WifiOff,
  Cpu,
  ShieldAlert,
  CheckCircle2,
  Rocket,
  Compass,
} from 'lucide-react';

export const ProblemStatementPage: React.FC = () => {
  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <HelpCircle className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wider">
              PROBLEM STATEMENT & OPERATIONAL CONTEXT
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              AI Human Activity Recognition for On-board BAS (Behavioral & Activity Surveillance) Experiments
            </p>
          </div>
        </div>
      </div>

      {/* The Core Space Problem */}
      <TelemetryCard
        title="1. THE PROBLEM: PHYSICAL REALITIES OF DEEP SPACE COMMUNICATION"
        subtitle="Why Cloud AI Architectures Are Structurally Incompatible with Space Exploration"
      >
        <div className="space-y-4 font-sans text-xs text-slate-300 leading-relaxed">
          <p>
            In space exploration missions—ranging from the International Space Station (ISS) in Low Earth Orbit to upcoming long-duration missions to the Moon (Artemis Gateway) and Mars—spacecraft and planetary habitats operate under severe communication constraints:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs pt-1">
            <div className="p-3 rounded-xl bg-space-950 border border-space-800">
              <span className="text-amber-400 font-bold block mb-1">1. Communication Blackouts</span>
              <p className="text-slate-400 text-[11px] font-sans">
                Orbital occultation, planetary body shadowing, solar conjunctions, and plasma ionization during atmospheric re-entry create complete loss of signal (LOS).
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-950 border border-space-800">
              <span className="text-amber-400 font-bold block mb-1">2. Extreme Latency</span>
              <p className="text-slate-400 text-[11px] font-sans">
                Speed-of-light radio delay: 1.34 seconds for Moon, and between 3 to 22 minutes (one-way) for Mars. Round-trip safety queries would take up to 44 minutes.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-space-950 border border-space-800">
              <span className="text-amber-400 font-bold block mb-1">3. Bandwidth Bottlenecks</span>
              <p className="text-slate-400 text-[11px] font-sans">
                Deep Space Network (DSN) uplink/downlink bandwidth is precious and heavily contended; streaming multiple raw 4K cabin video feeds is impossible.
              </p>
            </div>
          </div>
        </div>
      </TelemetryCard>

      {/* Why BAS Experiments Matter */}
      <TelemetryCard
        title="2. BAS EXPERIMENTS (BEHAVIORAL & ACTIVITY SURVEILLANCE)"
        subtitle="Monitoring Astronaut Physical & Mental Well-being in Microgravity"
      >
        <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
          <p>
            Microgravity induces progressive musculoskeletal degradation, bone mineral density loss (up to 1-1.5% per month), fluid shifts, and cognitive fatigue. Space agency flight medical protocols mandate:
          </p>
          <ul className="list-disc list-inside space-y-1.5 text-slate-300 pl-2">
            <li><strong>Mandatory Daily Aerobic & Resistive Countermeasures:</strong> Minimum 2 hours per crew member on ARED/cycle devices.</li>
            <li><strong>Circadian Rhythm & Rest Surveillance:</strong> Detecting sleep disruptions or abnormal microgravity disorientation.</li>
            <li><strong>Immediate Fall & Kinetic Collision Detection:</strong> In microgravity and reduced-gravity lunar/Martian environments, rapid deceleration or loss of posture stability can indicate acute incapacitation or cabin hazards.</li>
          </ul>
        </div>
      </TelemetryCard>

      {/* The AstroSense Solution */}
      <TelemetryCard
        title="3. THE ASTROSENSE INNOVATION: AUTONOMOUS ONBOARD EDGE AI"
        subtitle="Decoupling Astronaut Safety from Earth Ground Connectivity"
        glow="cyan"
      >
        <div className="space-y-3 font-sans text-xs text-slate-300 leading-relaxed">
          <p>
            ASTROSENSE eliminates the dependency on Earth by embedding an ultra-lightweight, quantized neural inference engine directly onto spacecraft hardware. All 12 vital activities and safety anomalies are classified locally in real-time (24.5 ms latency).
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-mono text-xs pt-2">
            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Zero Internet / Cloud Dependency</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                The entire recognition and alert pipeline executes entirely within the spacecraft local area network.
              </p>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-500/40">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span>Delay-Tolerant Event Synchronization</span>
              </div>
              <p className="text-slate-300 text-[11px] font-sans">
                When ground connectivity is restored, cached local events synchronize seamlessly to Mission Control without data loss.
              </p>
            </div>
          </div>
        </div>
      </TelemetryCard>

      {/* Technical Honesty & Limitations */}
      <TelemetryCard
        title="4. PROTOTYPE SCOPE & TECHNICAL HONESTY"
        subtitle="Prototype Classification & Non-Medical Declaration"
      >
        <div className="p-3.5 rounded-xl bg-space-950 border border-space-800 space-y-2 font-sans text-xs text-slate-400 leading-relaxed">
          <div className="flex items-center gap-2 text-amber-400 font-mono font-bold text-xs">
            <AlertOctagon className="w-4 h-4" />
            <span>HACKATHON PROTOTYPE DECLARATION</span>
          </div>
          <p>
            This software project is an operational prototype designed for Space Technology hackathon evaluation. The current build implements a high-fidelity synthetic & demo inference engine that simulates onboard neural weights and camera feeds. Alerts are generated as <strong>Mission Safety Alerts</strong> and <strong>Crew Monitoring Alerts</strong> and do not constitute certified clinical medical diagnostic devices.
          </p>
        </div>
      </TelemetryCard>
    </div>
  );
};
