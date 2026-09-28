import React from 'react';
import { TelemetryCard } from '../components/common/TelemetryCard';
import { BookOpen, ExternalLink, ShieldCheck, Globe } from 'lucide-react';

interface ReferenceItem {
  title: string;
  source: string;
  url: string;
  category: 'SPACE_AGENCY' | 'EDGE_AI' | 'SPACE_PROTOCOLS';
  description: string;
}

const VERIFIED_REFERENCES: ReferenceItem[] = [
  {
    title: 'NASA Human Research Program (HRP)',
    source: 'National Aeronautics and Space Administration (NASA)',
    url: 'https://www.nasa.gov/hrp',
    category: 'SPACE_AGENCY',
    description:
      'Official NASA research portfolio dedicated to understanding and mitigating human health and performance risks on long-duration exploration missions.',
  },
  {
    title: 'ISRO Human Space Flight Centre (HSFC) & Gaganyaan Programme',
    source: 'Indian Space Research Organisation (ISRO)',
    url: 'https://www.isro.gov.in',
    category: 'SPACE_AGENCY',
    description:
      'Official documentation and mission parameters for Indian crewed spaceflight, astronaut training, and onboard environmental control and life support systems.',
  },
  {
    title: 'ESA Human and Robotic Exploration',
    source: 'European Space Agency (ESA)',
    url: 'https://www.esa.int',
    category: 'SPACE_AGENCY',
    description:
      'European Space Agency research on ISS astronaut behavioral science, countermeasure physiology, and autonomous Columbus module operations.',
  },
  {
    title: 'ONNX Runtime Edge & Mobile Inference Engine',
    source: 'ONNX Runtime / Linux Foundation',
    url: 'https://onnxruntime.ai',
    category: 'EDGE_AI',
    description:
      'Cross-platform, high-performance scoring engine for Open Neural Network Exchange models, supporting INT8 quantization on embedded space hardware.',
  },
  {
    title: 'TensorFlow Lite for Microcontrollers & Edge NPUs',
    source: 'TensorFlow / Google',
    url: 'https://www.tensorflow.org/lite',
    category: 'EDGE_AI',
    description:
      'Lightweight runtime designed for executing machine learning models on microcontrollers and embedded DSPs with zero operating system dependencies.',
  },
  {
    title: 'Google MediaPipe Pose Landmarker',
    source: 'Google AI Edge Documentation',
    url: 'https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker',
    category: 'EDGE_AI',
    description:
      'High-fidelity, real-time 33 3D-landmark human pose estimation pipeline optimized for edge CPU/GPU execution without cloud telemetry.',
  },
  {
    title: 'CCSDS Space Communications & Bundle Protocol Standards',
    source: 'Consultative Committee for Space Data Systems (CCSDS)',
    url: 'https://public.ccsds.org',
    category: 'SPACE_PROTOCOLS',
    description:
      'International standards for delay-tolerant space networking, packet telemetry, and asynchronous interplanetary ground synchronization.',
  },
  {
    title: 'Delay-Tolerant Networking Bundle Protocol (RFC 5050)',
    source: 'Internet Engineering Task Force (IETF)',
    url: 'https://datatracker.ietf.org/doc/html/rfc5050',
    category: 'SPACE_PROTOCOLS',
    description:
      'Official RFC specification for store-and-forward communication across intermittent, high-latency deep space radio links.',
  },
];

export const ReferencesPage: React.FC = () => {
  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header Banner */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wider">
              VERIFIED TECHNICAL REFERENCES & STANDARDS
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Curated official documentation from space agencies and edge AI architectures.
            </p>
          </div>
        </div>
      </div>

      {/* Notice on Verified URLs */}
      <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center gap-3">
        <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0" />
        <p className="text-xs text-cyan-200/90 font-sans">
          All external citations link exclusively to verified, official documentation and official space agency repositories. Core AstroSense functionality is completely self-contained and operates without requiring internet access.
        </p>
      </div>

      {/* References Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {VERIFIED_REFERENCES.map((ref, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl bg-space-900 border border-space-800 flex flex-col justify-between gap-3 hover:border-cyan-500/40 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-[10px] uppercase font-bold text-cyan-400">
                  {ref.category.replace(/_/g, ' ')}
                </span>
                <span className="text-[10px] text-slate-500">{ref.source}</span>
              </div>
              <h3 className="font-bold text-slate-100 text-sm mb-1">{ref.title}</h3>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {ref.description}
              </p>
            </div>

            <a
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold pt-2 border-t border-space-800 group"
            >
              <span>View Verified Official Source</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
