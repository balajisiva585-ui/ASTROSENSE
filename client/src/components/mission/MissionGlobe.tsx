import React, { useEffect, useRef } from 'react';
import { SpacecraftTelemetry, CommStatus } from '../../types';
import { Globe, Radio, Shield, Compass, Navigation, Sun, Moon } from 'lucide-react';

interface MissionGlobeProps {
  telemetry: SpacecraftTelemetry | null;
  commStatus: CommStatus;
}

export const MissionGlobe: React.FC<MissionGlobeProps> = ({ telemetry, commStatus }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const currentLat = telemetry?.latitude || 28.5;
  const currentLon = telemetry?.longitude || -80.6;
  const isEclipse = telemetry?.dayNightCycle === 'ECLIPSE';
  const altitude = telemetry?.orbitAltitudeKm || 418.5;
  const velocity = telemetry?.orbitVelocityKmS || 7.67;
  const groundStation = telemetry?.groundStationInView || 'DSN Goldstone (USA)';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Clear
      ctx.fillStyle = '#050B14';
      ctx.fillRect(0, 0, width, height);

      // Draw Grid / Lat-Lon Lines
      ctx.strokeStyle = '#0e2538';
      ctx.lineWidth = 1;

      for (let lat = -80; lat <= 80; lat += 20) {
        const y = ((90 - lat) / 180) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      for (let lon = -180; lon <= 180; lon += 30) {
        const x = ((lon + 180) / 360) * width;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Draw Continents Silhouette approximation
      ctx.fillStyle = '#0c2233';
      ctx.strokeStyle = '#164e63';
      ctx.lineWidth = 1.2;

      // North America
      ctx.beginPath();
      ctx.ellipse(width * 0.22, height * 0.32, width * 0.12, height * 0.15, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // South America
      ctx.beginPath();
      ctx.ellipse(width * 0.3, height * 0.65, width * 0.08, height * 0.18, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Europe & Asia
      ctx.beginPath();
      ctx.ellipse(width * 0.65, height * 0.32, width * 0.22, height * 0.16, -0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Africa
      ctx.beginPath();
      ctx.ellipse(width * 0.52, height * 0.55, width * 0.09, height * 0.19, 0.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Australia
      ctx.beginPath();
      ctx.ellipse(width * 0.82, height * 0.72, width * 0.08, height * 0.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Ground Stations
      const stations = [
        { name: 'Goldstone (USA)', lon: -116.8, lat: 35.4 },
        { name: 'Madrid (Spain)', lon: -4.2, lat: 40.4 },
        { name: 'Canberra (Aus)', lon: 149.1, lat: -35.3 },
        { name: 'Bangalore (IN)', lon: 77.5, lat: 13.0 },
      ];

      stations.forEach(st => {
        const sx = ((st.lon + 180) / 360) * width;
        const sy = ((90 - st.lat) / 180) * height;

        // Ground coverage radius
        ctx.strokeStyle = 'rgba(6, 182, 212, 0.18)';
        ctx.fillStyle = 'rgba(6, 182, 212, 0.04)';
        ctx.beginPath();
        ctx.arc(sx, sy, 35, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Station Point
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(sx, sy, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#64748b';
        ctx.font = '9px monospace';
        ctx.fillText(st.name, sx + 5, sy - 4);
      });

      // Orbital Path (Sine curve simulating 51.6 deg inclination)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();

      const period = width * 0.9;
      const amplitude = height * 0.28;

      for (let x = 0; x <= width; x += 5) {
        const y = height / 2 + Math.sin((x / period) * Math.PI * 2 + 1.2) * amplitude;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Spacecraft Position
      const scX = ((currentLon + 180) / 360) * width;
      const scY = ((90 - currentLat) / 180) * height;

      // Comm beam line to nearest station if ONLINE
      if (commStatus === 'ONLINE') {
        const activeStation = stations[0];
        const astX = ((activeStation.lon + 180) / 360) * width;
        const astY = ((90 - activeStation.lat) / 180) * height;

        const grad = ctx.createLinearGradient(scX, scY, astX, astY);
        grad.addColorStop(0, 'rgba(34, 197, 94, 0.8)');
        grad.addColorStop(1, 'rgba(56, 189, 248, 0.2)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(scX, scY);
        ctx.lineTo(astX, astY);
        ctx.stroke();
      }

      // Spacecraft Pulse Beacon
      const pulseTime = Date.now() / 600;
      const pulseRadius = 8 + (Math.sin(pulseTime) + 1) * 6;

      ctx.strokeStyle = commStatus === 'ONLINE' ? 'rgba(56, 189, 248, 0.7)' : 'rgba(245, 158, 11, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(scX, scY, pulseRadius, 0, Math.PI * 2);
      ctx.stroke();

      // Center Spacecraft Marker
      ctx.fillStyle = commStatus === 'ONLINE' ? '#38bdf8' : '#fbbf24';
      ctx.beginPath();
      ctx.arc(scX, scY, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Satellite Crossbars
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(scX - 8, scY);
      ctx.lineTo(scX + 8, scY);
      ctx.moveTo(scX, scY - 8);
      ctx.lineTo(scX, scY + 8);
      ctx.stroke();

      // Label
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 10px monospace';
      ctx.fillText('ASTROSENSE-01 (BAS NODE)', scX + 10, scY + 3);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px monospace';
      ctx.fillText(
        `ALT: ${altitude.toFixed(1)}km | VEL: ${velocity.toFixed(2)}km/s`,
        scX + 10,
        scY + 15
      );
    };

    render();
    const interval = setInterval(render, 1000);

    return () => clearInterval(interval);
  }, [currentLat, currentLon, commStatus, altitude, velocity]);

  return (
    <div className="bg-space-900 border border-space-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top Banner */}
      <div className="p-3.5 border-b border-space-800 bg-space-950/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold font-mono tracking-wide text-slate-100">
            SPACECRAFT ORBITAL TRACK & GROUND STATION LINK
          </h3>
          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 font-mono">
            SIMULATED MISSION TELEMETRY
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-600/40 text-amber-300 font-mono">
            DEMO / SIMULATION
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            {isEclipse ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isEclipse ? 'ORBITAL NIGHT (ECLIPSE)' : 'DAYLIGHT PASS'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-cyan-300">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            <span>LINK: {groundStation}</span>
          </div>
        </div>
      </div>

      {/* Canvas Visualizer */}
      <div className="relative w-full aspect-[2/1] min-h-[280px] bg-space-950">
        <canvas
          ref={canvasRef}
          width={800}
          height={400}
          className="w-full h-full object-cover"
        />

        {/* Floating Telemetry Coordinates */}
        <div className="absolute bottom-3 left-3 bg-space-950/85 backdrop-blur-md border border-space-800/80 rounded-lg p-2.5 text-xs font-mono space-y-1">
          <div className="flex items-center gap-2 text-slate-300">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            <span>SUB-SATELLITE POSITION:</span>
            <span className="text-cyan-300 font-bold">
              {currentLat >= 0 ? `${currentLat.toFixed(2)}°N` : `${Math.abs(currentLat).toFixed(2)}°S`},{' '}
              {currentLon >= 0 ? `${currentLon.toFixed(2)}°E` : `${Math.abs(currentLon).toFixed(2)}°W`}
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>ALTITUDE: <strong className="text-slate-200">{altitude.toFixed(1)} km</strong></span>
            <span>VELOCITY: <strong className="text-slate-200">{velocity.toFixed(2)} km/s</strong></span>
            <span>INCLINATION: <strong className="text-slate-200">51.64°</strong></span>
          </div>
        </div>

        {/* Comm Blackout Indicator overlay if offline */}
        {commStatus === 'OFFLINE' && (
          <div className="absolute top-3 right-3 bg-amber-950/90 border border-amber-500/70 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 shadow-lg animate-pulse">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>COMMUNICATION BLACKOUT • ONBOARD AUTONOMOUS BUFFERING</span>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-2.5 bg-space-950/90 border-t border-space-800 text-[11px] font-mono text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <span>ORBIT REGIME: Low Earth Orbit (LEO) • Period: 92.8 min</span>
        <span className="text-slate-500">Notice: Trajectory displayed is synthetic simulation for technology validation.</span>
      </div>
    </div>
  );
};
