import React, { useState, useEffect, useRef } from 'react';
import { AsteroidObject } from '../../types';
import { api } from '../../services/api';
import { AsteroidCard } from './AsteroidCard';
import {
  Compass,
  Radio,
  AlertTriangle,
  Eye,
  Shield,
  Bot,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

export const AsteroidMonitor: React.FC = () => {
  const [asteroids, setAsteroids] = useState<AsteroidObject[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAsteroid, setSelectedAsteroid] = useState<AsteroidObject | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const fetchAsteroids = async () => {
    try {
      const data = await api.getAsteroids();
      setAsteroids(data);
      if (!selectedAsteroid && data.length > 0) {
        setSelectedAsteroid(data[0]);
      } else if (selectedAsteroid) {
        const updated = data.find(a => a.id === selectedAsteroid.id);
        if (updated) setSelectedAsteroid(updated);
      }
    } catch (err) {
      console.error('Failed to load asteroids', err);
    }
  };

  useEffect(() => {
    fetchAsteroids();
    const interval = setInterval(fetchAsteroids, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerAnomaly = async (id: string) => {
    try {
      setLoading(true);
      const res = await api.triggerAsteroidAnomaly(id);
      setActionNotice(`SIMULATED ANOMALY TRIGGERED FOR ${id}: Trajectory variance alert dispatched`);
      await fetchAsteroids();
      setTimeout(() => setActionNotice(null), 6000);
    } catch (err) {
      console.error('Failed to trigger anomaly', err);
    } finally {
      setLoading(false);
    }
  };

  // Radar canvas render
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cx = width / 2;
    const cy = height / 2;
    const maxRadius = Math.min(cx, cy) - 25;

    // Clear
    ctx.fillStyle = '#050B14';
    ctx.fillRect(0, 0, width, height);

    // Radar Rings
    ctx.strokeStyle = '#0e2538';
    ctx.lineWidth = 1;
    for (let r = 1; r <= 4; r++) {
      const rad = (maxRadius / 4) * r;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#475569';
      ctx.font = '9px monospace';
      ctx.fillText(`${(r * 5).toFixed(0)} LD`, cx + 4, cy - rad + 10);
    }

    // Crosshairs
    ctx.strokeStyle = '#1e293b';
    ctx.beginPath();
    ctx.moveTo(cx, cy - maxRadius);
    ctx.lineTo(cx, cy + maxRadius);
    ctx.moveTo(cx - maxRadius, cy);
    ctx.lineTo(cx + maxRadius, cy);
    ctx.stroke();

    // Earth Center
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.arc(cx, cy, 7, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'bold 9px monospace';
    ctx.fillText('EARTH', cx - 14, cy + 18);

    // Sweep line
    const sweepAngle = (Date.now() / 1500) % (Math.PI * 2);
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + Math.cos(sweepAngle) * maxRadius, cy + Math.sin(sweepAngle) * maxRadius);
    ctx.stroke();

    // Plot Asteroids
    asteroids.forEach((ast, idx) => {
      const angle = (idx * (Math.PI * 2 / Math.max(1, asteroids.length))) + 0.5;
      const normalizedDist = Math.min(1, ast.distanceLd / 20);
      const rad = normalizedDist * maxRadius;
      const x = cx + Math.cos(angle) * rad;
      const y = cy + Math.sin(angle) * rad;

      // Anomaly halo
      if (ast.isAnomaly) {
        ctx.strokeStyle = 'rgba(244, 63, 94, 0.8)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 9, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Marker
      ctx.fillStyle = ast.isAnomaly ? '#f43f5e' : ast.riskLevel === 'HIGH' || ast.riskLevel === 'CRITICAL' ? '#fbbf24' : '#38bdf8';
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      // Label
      ctx.fillStyle = '#cbd5e1';
      ctx.font = '9px monospace';
      ctx.fillText(ast.id, x + 6, y - 2);
    });
  }, [asteroids]);

  const activeAnomalyObject = asteroids.find(a => a.isAnomaly) || selectedAsteroid;

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-cyan-950/80 border border-cyan-700/60 text-cyan-400">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold font-mono text-slate-100 uppercase tracking-wider">
              DEEP SPACE / ASTEROID MONITORING SUBSYSTEM
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Autonomous Deep-Space Radar Tracking, Orbit Determination & Proximity Anomaly Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300 font-semibold">
            SIMULATED ASTEROID MONITORING DATA
          </span>
          <button
            onClick={fetchAsteroids}
            className="p-2 rounded bg-space-800 hover:bg-space-700 text-slate-300 transition-colors"
            title="Refresh Asteroid Telemetry"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 bg-amber-950/80 border border-amber-500/70 text-amber-200 rounded-lg text-xs font-mono flex items-center gap-2 shadow-lg animate-pulse">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Main Grid: Radar on Left, Cards on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Polar Visualizer */}
        <div className="lg:col-span-5 bg-space-900 border border-space-800 rounded-xl p-4 flex flex-col justify-between shadow-lg">
          <div className="flex items-center justify-between border-b border-space-800 pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 font-semibold">
              <Radio className="w-4 h-4" />
              <span>SYNTHETIC POLAR RADAR PROJECTION</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Range: 20 Lunar Distances</span>
          </div>

          <div className="relative aspect-square max-w-[340px] mx-auto w-full">
            <canvas ref={canvasRef} width={340} height={340} className="w-full h-full rounded-full border border-space-800 shadow-inner" />
          </div>

          <div className="mt-3 p-2.5 bg-space-950 border border-space-800 rounded-lg text-[11px] font-mono text-slate-400 space-y-1">
            <div className="flex items-center justify-between">
              <span>TRACKED OBJECTS: <strong className="text-slate-200">{asteroids.length}</strong></span>
              <span>POTENTIALLY HAZARDOUS: <strong className="text-amber-400">{asteroids.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL').length}</strong></span>
            </div>
            <div className="text-[10px] text-slate-500">
              Simulation Notice: Trajectory and ephemeris data are synthetic models for autonomous detection benchmarking.
            </div>
          </div>
        </div>

        {/* Asteroid Cards List */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {asteroids.map(ast => (
            <AsteroidCard
              key={ast.id}
              asteroid={ast}
              onTriggerAnomaly={handleTriggerAnomaly}
            />
          ))}
        </div>
      </div>

      {/* AI Response & Decision Support Panel */}
      <div className="bg-space-900 border border-space-800 rounded-xl p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-space-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-cyan-950 border border-cyan-700/60 text-cyan-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold font-mono text-slate-100 uppercase tracking-wider">
                ASTROSENSE AI – DEEP-SPACE ANOMALY DECISION SUPPORT
              </h3>
              <p className="text-xs text-slate-400 font-sans">
                Real-time AI diagnostic reasoning and structured human-in-the-loop recommendation
              </p>
            </div>
          </div>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950/80 border border-amber-600/60 text-amber-300 font-semibold">
            AI DECISION SUPPORT – HUMAN VERIFICATION REQUIRED
          </span>
        </div>

        {activeAnomalyObject?.isAnomaly ? (
          <div className="bg-space-950/90 border border-rose-800/80 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-rose-300 font-mono text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>ACTIVE ANOMALY DETECTED ON {activeAnomalyObject.id} ({activeAnomalyObject.name})</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
              <div className="bg-space-900/80 p-2.5 rounded border border-space-800">
                <div className="text-[10px] text-slate-400">Problem Detected</div>
                <div className="text-slate-100 font-semibold mt-1">Unexpected Trajectory Deviation / Radar Delta</div>
              </div>
              <div className="bg-space-900/80 p-2.5 rounded border border-space-800">
                <div className="text-[10px] text-slate-400">Telemetry Evidence</div>
                <div className="text-slate-200 mt-1">
                  Radial velocity variance +0.42 km/s outside 3-sigma covariance envelope.
                </div>
              </div>
              <div className="bg-space-900/80 p-2.5 rounded border border-space-800">
                <div className="text-[10px] text-slate-400">Severity Assessment</div>
                <div className="text-amber-400 font-bold mt-1">WARNING / HIGH PRIORITY REVIEW</div>
              </div>
            </div>

            {/* Recommended Next Steps */}
            <div className="bg-space-900/90 p-3 rounded-lg border border-space-800 space-y-2">
              <div className="text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                RECOMMENDED OPERATIONAL NEXT STEPS (NON-AUTHORITATIVE):
              </div>
              <ol className="list-decimal list-inside text-xs font-sans text-slate-300 space-y-1.5 pl-1">
                <li><strong className="text-slate-100">Verify Sensor Calibration:</strong> Cross-check onboard X-band radar doppler gate with optical astrometry payload.</li>
                <li><strong className="text-slate-100">Request Secondary Observation:</strong> Queue automated optical observation on next orbital daylight pass (+14 min).</li>
                <li><strong className="text-slate-100">Compare Historical Ephemeris:</strong> Validate against previous 48-hour state vector baseline in local SQLite store.</li>
                <li><strong className="text-slate-100">Prepare DSN Escalation Packet:</strong> Queue formatted trajectory discrepancy report for Earth Mission Control synchronization.</li>
              </ol>
            </div>

            <div className="text-[11px] font-mono text-slate-400 bg-space-900/60 p-2 rounded flex items-center justify-between">
              <span>Safety Constraint: Autonomous spacecraft actuation prohibited. Human Flight Director approval required.</span>
              <span className="text-cyan-400">Protocol: NASA-STD-8719 / ESA-ECSS-E-ST-10C</span>
            </div>
          </div>
        ) : (
          <div className="bg-space-950/70 border border-space-800 rounded-xl p-4 text-xs font-mono text-slate-400 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All {asteroids.length} tracked deep space objects are operating within nominal 3-sigma trajectory limits.</span>
            </div>
            <span className="text-slate-500">Autonomous Monitoring Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
