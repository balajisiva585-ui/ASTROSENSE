import React, { useEffect, useState } from 'react';
import {
  Compass,
  Radio,
  Globe,
  Navigation,
  Activity,
  Zap,
  RotateCw,
  Layers,
  Sparkles,
} from 'lucide-react';

interface OrbitalMapProps {
  altitudeKm?: number;
  velocityKmS?: number;
  orbitPeriodMins?: number;
  commStatus?: 'ONLINE' | 'OFFLINE' | 'DEGRADED';
  compact?: boolean;
}

export const OrbitalMap: React.FC<OrbitalMapProps> = ({
  altitudeKm = 418.4,
  velocityKmS = 7.66,
  orbitPeriodMins = 92.8,
  commStatus = 'ONLINE',
  compact = false,
}) => {
  const [angle, setAngle] = useState<number>(45);

  useEffect(() => {
    const interval = setInterval(() => {
      setAngle((prev) => (prev + 0.8) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const rad = (angle * Math.PI) / 180;
  // Elliptical orbit projection
  const centerX = 160;
  const centerY = 110;
  const radiusX = 110;
  const radiusY = 55;

  const satX = centerX + radiusX * Math.cos(rad);
  const satY = centerY + radiusY * Math.sin(rad);

  const groundStationX = centerX - 15;
  const groundStationY = centerY + 10;

  const isEclipsed = satY < centerY - 20;

  return (
    <div className="bg-space-950/90 backdrop-blur-md rounded-xl border border-cyan-500/20 p-4 font-mono text-xs shadow-xl relative overflow-hidden">
      {/* Background Star Speckles */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-space-800 pb-2.5 mb-3 relative z-10">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-cyan-400 animate-spin-slow" />
          <div className="text-white font-bold tracking-wider text-xs flex items-center gap-2">
            <span>AURORA-01</span>
            <span className="text-[10px] text-cyan-400 font-normal">// ORBITAL TRAJECTORY MAP</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
            SIMULATED ORBIT TELEMETRY
          </span>
        </div>
      </div>

      {/* Orbit Canvas / SVG */}
      <div className="relative w-full flex justify-center py-2">
        <svg viewBox="0 0 320 220" className="w-full max-w-[340px] h-auto select-none">
          <defs>
            <radialGradient id="earthGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#0284c7" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.0" />
            </radialGradient>
            <linearGradient id="commBeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#22c55e" stopOpacity="0.2" />
            </linearGradient>
          </defs>

          {/* Deep Space Background Grid */}
          <line x1="20" y1="110" x2="300" y2="110" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.8" />
          <line x1="160" y1="20" x2="160" y2="200" stroke="#1e293b" strokeDasharray="3 3" strokeWidth="0.8" />

          {/* Earth Body */}
          <circle cx={centerX} cy={centerY} r="38" fill="url(#earthGlow)" />
          <circle cx={centerX} cy={centerY} r="32" fill="#0f172a" stroke="#0284c7" strokeWidth="1.5" />
          {/* Earth Continents Abstract Lines */}
          <path
            d="M 145 95 Q 160 88 175 100 Q 170 120 150 125 Z"
            fill="#0369a1"
            opacity="0.5"
          />
          <text x={centerX} y={centerY + 3} textAnchor="middle" fill="#93c5fd" fontSize="8" fontWeight="bold" fontFamily="monospace">
            EARTH (LEO)
          </text>

          {/* Lunar Distance Reference Marker */}
          <circle cx="280" cy="40" r="8" fill="#334155" stroke="#64748b" strokeWidth="1" />
          <text x="280" y="55" textAnchor="middle" fill="#64748b" fontSize="6" fontFamily="monospace">
            MOON REF
          </text>

          {/* Orbital Ellipse Trajectory */}
          <ellipse
            cx={centerX}
            cy={centerY}
            rx={radiusX}
            ry={radiusY}
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="1.2"
            strokeDasharray="4 3"
            opacity="0.75"
          />

          {/* Communication Tracking Vector Beam */}
          {commStatus === 'ONLINE' && (
            <line
              x1={satX}
              y1={satY}
              x2={groundStationX}
              y2={groundStationY}
              stroke="url(#commBeam)"
              strokeWidth="1.5"
              strokeDasharray="2 2"
              className="animate-pulse"
            />
          )}

          {/* Ground Station Dot */}
          <circle cx={groundStationX} cy={groundStationY} r="3" fill="#22c55e" />
          <text x={groundStationX} y={groundStationY + 12} textAnchor="middle" fill="#22c55e" fontSize="6" fontFamily="monospace">
            DSN-MADRID
          </text>

          {/* Spacecraft Aurora-01 Position Marker */}
          <g transform={`translate(${satX}, ${satY})`}>
            {/* Thruster Halo */}
            <circle cx="0" cy="0" r="7" fill="#38bdf8" opacity="0.3" className="animate-ping" />
            <circle cx="0" cy="0" r="4.5" fill="#38bdf8" stroke="#ffffff" strokeWidth="1.2" />
            {/* Spacecraft Solar Panels */}
            <rect x="-8" y="-1.5" width="4" height="3" fill="#0284c7" />
            <rect x="4" y="-1.5" width="4" height="3" fill="#0284c7" />
            <text x="0" y="-8" textAnchor="middle" fill="#38bdf8" fontSize="7" fontWeight="bold" fontFamily="monospace">
              AURORA-01
            </text>
          </g>
        </svg>
      </div>

      {/* Orbit Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-space-800 text-[11px] relative z-10">
        <div className="bg-space-900/60 p-2 rounded border border-space-800">
          <div className="text-[10px] text-gray-400">◌ ALTITUDE</div>
          <div className="text-white font-bold">{altitudeKm.toFixed(1)} km</div>
          <div className="text-[9px] text-emerald-400">Stable LEO</div>
        </div>

        <div className="bg-space-900/60 p-2 rounded border border-space-800">
          <div className="text-[10px] text-gray-400">◈ VELOCITY</div>
          <div className="text-cyan-300 font-bold">{velocityKmS.toFixed(2)} km/s</div>
          <div className="text-[9px] text-gray-400">27,576 km/h</div>
        </div>

        <div className="bg-space-900/60 p-2 rounded border border-space-800">
          <div className="text-[10px] text-gray-400">⊙ CYCLE</div>
          <div className="text-white font-bold">{orbitPeriodMins} min</div>
          <div className={`text-[9px] font-semibold ${isEclipsed ? 'text-amber-400' : 'text-cyan-400'}`}>
            {isEclipsed ? 'UMBRA ECLIPSE' : 'SOLAR DAYLIGHT'}
          </div>
        </div>

        <div className="bg-space-900/60 p-2 rounded border border-space-800">
          <div className="text-[10px] text-gray-400">⌁ DSN LINK</div>
          <div className={`font-bold ${commStatus === 'ONLINE' ? 'text-emerald-400' : 'text-rose-400'}`}>
            {commStatus === 'ONLINE' ? 'CARRIER LOCK' : 'SIGNAL LOST'}
          </div>
          <div className="text-[9px] text-gray-400">Ku-Band Direct</div>
        </div>
      </div>
    </div>
  );
};
