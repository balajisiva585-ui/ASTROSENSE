import React from 'react';
import { SpacecraftTelemetry, CommStatus } from '../../types';
import {
  Thermometer,
  Gauge,
  Wind,
  Droplets,
  Zap,
  BatteryCharging,
  Radio,
  Radiation,
  Compass,
  Activity,
  CheckCircle2,
} from 'lucide-react';

interface TelemetryPanelProps {
  telemetry: SpacecraftTelemetry | null;
  commStatus: CommStatus;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({ telemetry, commStatus }) => {
  if (!telemetry) {
    return (
      <div className="bg-space-900 border border-space-800 rounded-xl p-6 text-center text-slate-400 font-mono text-xs">
        <Activity className="w-6 h-6 text-cyan-400 animate-spin mx-auto mb-2" />
        LOADING ONBOARD SPACECRAFT TELEMETRY...
      </div>
    );
  }

  const {
    cabinTemperature,
    cabinPressure,
    oxygenPct,
    co2Ppm,
    humidityPct,
    radiationRate,
    orbitAltitudeKm,
    orbitVelocityKmS,
    powerGeneratedKw,
    batteryStoragePct,
    signalStrengthDbm,
  } = telemetry;

  return (
    <div className="bg-space-900 border border-space-800 rounded-xl overflow-hidden shadow-lg space-y-4 p-4 sm:p-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-space-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Activity className="w-5 h-5 text-cyan-400" />
          <h3 className="text-sm font-semibold font-mono tracking-wider text-slate-100 uppercase">
            LIVE SPACECRAFT SUBSYSTEM TELEMETRY
          </h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-400 border border-cyan-800/60">
            SIMULATED TELEMETRY (1 Hz)
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            ECLSS NOMINAL
          </span>
        </div>
      </div>

      {/* Grid of Gauges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {/* Cabin Temperature */}
        <div className="bg-space-950/80 border border-space-800 rounded-lg p-3 space-y-1.5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <Thermometer className="w-4 h-4 text-rose-400" />
              Cabin Temp
            </span>
            <span className="text-[10px] font-mono text-slate-500">21-23°C</span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-100">
            {cabinTemperature.toFixed(1)} <span className="text-xs font-normal text-slate-400">°C</span>
          </div>
          <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(10, ((cabinTemperature - 15) / 15) * 100))}%` }}
            />
          </div>
        </div>

        {/* Cabin Pressure */}
        <div className="bg-space-950/80 border border-space-800 rounded-lg p-3 space-y-1.5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <Gauge className="w-4 h-4 text-cyan-400" />
              Pressure
            </span>
            <span className="text-[10px] font-mono text-slate-500">101.3 kPa</span>
          </div>
          <div className="text-xl font-bold font-mono text-cyan-300">
            {cabinPressure.toFixed(1)} <span className="text-xs font-normal text-slate-400">kPa</span>
          </div>
          <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (cabinPressure / 110) * 100)}%` }}
            />
          </div>
        </div>

        {/* Oxygen (O2) */}
        <div className="bg-space-950/80 border border-space-800 rounded-lg p-3 space-y-1.5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <Wind className="w-4 h-4 text-emerald-400" />
              O2 Level
            </span>
            <span className="text-[10px] font-mono text-emerald-400">NOMINAL</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {oxygenPct.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
          </div>
          <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${(oxygenPct / 25) * 100}%` }}
            />
          </div>
        </div>

        {/* Carbon Dioxide (CO2) */}
        <div className="bg-space-950/80 border border-space-800 rounded-lg p-3 space-y-1.5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <Wind className="w-4 h-4 text-amber-400" />
              CO2 Level
            </span>
            <span className="text-[10px] font-mono text-slate-500">&lt;600 ppm</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            {co2Ppm.toFixed(0)} <span className="text-xs font-normal text-slate-400">ppm</span>
          </div>
          <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${(co2Ppm / 1000) * 100}%` }}
            />
          </div>
        </div>

        {/* Humidity */}
        <div className="bg-space-950/80 border border-space-800 rounded-lg p-3 space-y-1.5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <Droplets className="w-4 h-4 text-blue-400" />
              Rel Humidity
            </span>
            <span className="text-[10px] font-mono text-slate-500">40-60%</span>
          </div>
          <div className="text-xl font-bold font-mono text-blue-300">
            {humidityPct.toFixed(0)} <span className="text-xs font-normal text-slate-400">%</span>
          </div>
          <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-400 rounded-full transition-all duration-500"
              style={{ width: `${humidityPct}%` }}
            />
          </div>
        </div>

        {/* Radiation Dose */}
        <div className="bg-space-950/80 border border-space-800 rounded-lg p-3 space-y-1.5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <Radiation className="w-4 h-4 text-yellow-400" />
              Radiation
            </span>
            <span className="text-[10px] font-mono text-slate-500">Dosimeter</span>
          </div>
          <div className="text-xl font-bold font-mono text-yellow-300">
            {radiationRate.toFixed(1)} <span className="text-xs font-normal text-slate-400">µSv/h</span>
          </div>
          <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (radiationRate / 50) * 100)}%` }}
            />
          </div>
        </div>

        {/* Battery State of Charge */}
        <div className="bg-space-950/80 border border-space-800 rounded-lg p-3 space-y-1.5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <BatteryCharging className="w-4 h-4 text-emerald-400" />
              Battery SOC
            </span>
            <span className="text-[10px] font-mono text-slate-500">Li-Ion Bus</span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            {batteryStoragePct.toFixed(1)} <span className="text-xs font-normal text-slate-400">%</span>
          </div>
          <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${batteryStoragePct}%` }}
            />
          </div>
        </div>

        {/* Solar Generation */}
        <div className="bg-space-950/80 border border-space-800 rounded-lg p-3 space-y-1.5 hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="flex items-center gap-1.5 font-mono">
              <Zap className="w-4 h-4 text-amber-400" />
              Solar Array
            </span>
            <span className="text-[10px] font-mono text-slate-500">Generation</span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            {powerGeneratedKw.toFixed(1)} <span className="text-xs font-normal text-slate-400">kW</span>
          </div>
          <div className="w-full bg-space-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (powerGeneratedKw / 100) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Orbit & RF Link Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="bg-space-950/90 border border-space-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Compass className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Orbital Parameters</div>
              <div className="text-xs font-mono font-semibold text-slate-200">
                Alt: {orbitAltitudeKm.toFixed(1)} km • Vel: {orbitVelocityKmS.toFixed(2)} km/s • Inc: 51.64°
              </div>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/40">
            LEO 51.6°
          </span>
        </div>

        <div className="bg-space-950/90 border border-space-800 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Radio className="w-4 h-4 text-cyan-400" />
            <div>
              <div className="text-[10px] uppercase font-mono text-slate-400">Telemetry RF Link</div>
              <div className="text-xs font-mono font-semibold text-slate-200">
                {commStatus === 'ONLINE' ? (
                  <span>Signal: {signalStrengthDbm.toFixed(0)} dBm • Carrier Locked</span>
                ) : (
                  <span className="text-amber-400">Carrier Interrupted • Onboard Buffering</span>
                )}
              </div>
            </div>
          </div>
          <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
            commStatus === 'ONLINE'
              ? 'bg-emerald-950 text-emerald-400 border-emerald-800/40'
              : 'bg-amber-950 text-amber-400 border-amber-800/40'
          }`}>
            {commStatus}
          </span>
        </div>
      </div>
    </div>
  );
};
