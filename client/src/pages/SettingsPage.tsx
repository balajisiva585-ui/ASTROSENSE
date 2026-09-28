import React, { useState, useEffect } from 'react';
import { useMission } from '../context/MissionContext';
import { TelemetryCard } from '../components/common/TelemetryCard';
import { api } from '../services/api';
import {
  Settings as SettingsIcon,
  Save,
  RotateCcw,
  Volume2,
  VolumeX,
  Sliders,
  Shield,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const {
    session,
    astronaut,
    soundEnabled,
    toggleSound,
    refreshAll,
  } = useMission();

  const [inactivityThreshold, setInactivityThreshold] = useState<number>(900);
  const [anomalySensitivity, setAnomalySensitivity] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [autoSync, setAutoSync] = useState<boolean>(true);
  const [astronautName, setAstronautName] = useState<string>('Dr. Elena Vance');
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      setInactivityThreshold(session.inactivityThresholdSeconds || 900);
      setAnomalySensitivity(session.anomalySensitivity || 'MEDIUM');
      setAutoSync(session.autoSyncOnRestore ?? true);
    }
    if (astronaut) {
      setAstronautName(astronaut.name);
    }
  }, [session, astronaut]);

  const handleSave = async () => {
    try {
      await api.saveSettings({
        inactivityThresholdSeconds: inactivityThreshold,
        anomalySensitivity,
        autoSyncOnRestore: autoSync,
        astronautName,
      });
      setSavedMessage('Settings saved to local storage.');
      setTimeout(() => setSavedMessage(null), 3000);
      await refreshAll();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all onboard telemetry and mission events to initial baseline?')) {
      await api.resetAstronaut();
      await refreshAll();
      setSavedMessage('Telemetry reset to baseline.');
      setTimeout(() => setSavedMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6 font-mono text-xs">
      {/* Header */}
      <div className="bg-space-900 border border-space-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <SettingsIcon className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 tracking-wider">
              ONBOARD SUBSYSTEM SETTINGS
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Configure Mission Parameters, Anomaly Engine Thresholds, and Local Persistence
            </p>
          </div>
        </div>
      </div>

      {savedMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mission & Crew Configuration */}
        <TelemetryCard
          title="MISSION & CREW PROFILE"
          subtitle="Spacecraft Crew Registry & Identification"
        >
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                Astronaut Full Name:
              </label>
              <input
                type="text"
                value={astronautName}
                onChange={e => setAstronautName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                  Astronaut ID:
                </label>
                <input
                  type="text"
                  disabled
                  value="AST-01"
                  className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                  Mission Code:
                </label>
                <input
                  type="text"
                  disabled
                  value="MISSION AURORA"
                  className="w-full px-3 py-2 rounded-lg bg-space-950 border border-space-800 text-slate-500 font-mono text-xs cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </TelemetryCard>

        {/* AI & Anomaly Engine Configuration */}
        <TelemetryCard
          title="AI & ANOMALY SENSITIVITY"
          subtitle="Safety Envelope Triggers and Thresholds"
        >
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[10px] text-slate-400 uppercase tracking-wider">
                  Inactivity Alert Threshold (Seconds):
                </label>
                <span className="text-cyan-400 font-bold">{inactivityThreshold}s ({Math.round(inactivityThreshold / 60)} min)</span>
              </div>
              <input
                type="range"
                min="60"
                max="1800"
                step="60"
                value={inactivityThreshold}
                onChange={e => setInactivityThreshold(parseInt(e.target.value, 10))}
                className="w-full accent-cyan-500"
              />
              <span className="text-[10px] text-slate-500 block mt-1">
                Generates a warning alert if crew remains motionless outside sleep quarters.
              </span>
            </div>

            <div>
              <label className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1.5">
                Kinetic Anomaly Sensitivity:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map(sens => (
                  <button
                    key={sens}
                    onClick={() => setAnomalySensitivity(sens)}
                    className={`py-2 rounded-lg border font-bold text-xs transition-all ${
                      anomalySensitivity === sens
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-space-950 border-space-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {sens}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </TelemetryCard>

        {/* Sync & Audio Preferences */}
        <TelemetryCard
          title="SYNCHRONIZATION & AUDIO TELEMETRY"
          subtitle="Delay-Tolerant Behavior & Sound Synthesizer"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-space-950 border border-space-800">
              <div>
                <span className="font-bold text-slate-200 block text-xs">Auto-Sync on Ground Re-acquisition</span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Automatically start batch transmission when RF link becomes ONLINE.
                </span>
              </div>
              <input
                type="checkbox"
                checked={autoSync}
                onChange={e => setAutoSync(e.target.checked)}
                className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-space-950 border border-space-800">
              <div>
                <span className="font-bold text-slate-200 block text-xs">Web Audio Telemetry Chimes</span>
                <span className="text-[11px] text-slate-400 font-sans">
                  Subtle synthesized audio feedback on alarms, comm changes, and syncs.
                </span>
              </div>
              <button
                onClick={toggleSound}
                className={`p-2 rounded-lg border transition-colors ${
                  soundEnabled
                    ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                    : 'bg-space-900 border-space-800 text-slate-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </TelemetryCard>

        {/* Database Management & Actions */}
        <TelemetryCard
          title="DATABASE RECOVERY & ACTIONS"
          subtitle="Local Persistence Management"
        >
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-space-950 border border-space-800 text-slate-400 font-sans text-xs leading-relaxed">
              Resetting restores the initial Day 042 baseline events and clears any temporary test anomalies.
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-space-950 font-bold transition-all shadow-hud-cyan"
              >
                <Save className="w-4 h-4" />
                <span>SAVE SETTINGS</span>
              </button>

              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-950/70 hover:bg-rose-900 border border-rose-500/60 text-rose-200 font-bold transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>RESET ALL DATA</span>
              </button>
            </div>
          </div>
        </TelemetryCard>
      </div>
    </div>
  );
};
