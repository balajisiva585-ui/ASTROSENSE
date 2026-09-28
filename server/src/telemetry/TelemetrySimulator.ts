import { SpacecraftTelemetry, CommStatus } from '../types';

export class TelemetrySimulator {
  private static instance: TelemetrySimulator;
  private current: SpacecraftTelemetry;
  private history: SpacecraftTelemetry[] = [];
  private orbitPhase: number = 0; // 0 to 2*PI

  private constructor() {
    this.current = this.generateInitialTelemetry();
    this.history.push(this.current);
  }

  public static getInstance(): TelemetrySimulator {
    if (!TelemetrySimulator.instance) {
      TelemetrySimulator.instance = new TelemetrySimulator();
    }
    return TelemetrySimulator.instance;
  }

  private generateInitialTelemetry(): SpacecraftTelemetry {
    const now = new Date();
    return {
      timestamp: now.toISOString(),
      displayTime: now.toTimeString().split(' ')[0],
      cabinTemperature: 22.4,
      cabinPressure: 101.32,
      oxygenPct: 20.94,
      co2Ppm: 482,
      humidityPct: 45.2,
      radiationRate: 18.5,
      orbitAltitudeKm: 418.6,
      orbitVelocityKmS: 7.67,
      latitude: 28.5,
      longitude: -80.6,
      powerGeneratedKw: 84.5,
      batteryStoragePct: 94.8,
      signalStrengthDbm: -76,
      solarFluxWm2: 1361.2,
      orbitalPeriodMins: 92.8,
      dayNightCycle: 'DAYLIGHT',
      groundStationInView: 'DSN Goldstone (USA)',
    };
  }

  public tick(commStatus: CommStatus = 'ONLINE'): SpacecraftTelemetry {
    const now = new Date();
    const iso = now.toISOString();
    const displayTime = now.toTimeString().split(' ')[0];

    // Progress orbital phase (~92.8 min orbit = ~5568s)
    this.orbitPhase += (2 * Math.PI) / 1200; // faster simulation for interactive UI
    if (this.orbitPhase > 2 * Math.PI) {
      this.orbitPhase -= 2 * Math.PI;
    }

    // Orbital ground track (inclination ~51.6 degrees)
    const lat = Math.sin(this.orbitPhase) * 51.6;
    let lon = (((this.orbitPhase * 180) / Math.PI * 2.5) % 360) - 180;

    // Day/Night orbital terminator
    const isDaylight = Math.sin(this.orbitPhase) > -0.2;
    const dayNightCycle: 'DAYLIGHT' | 'ECLIPSE' = isDaylight ? 'DAYLIGHT' : 'ECLIPSE';

    // Solar generation & battery
    const powerGeneratedKw = isDaylight ? 82.0 + Math.random() * 5.0 : 0.0;
    let batteryPct = this.current.batteryStoragePct;
    if (isDaylight) {
      batteryPct = Math.min(99.5, batteryPct + 0.05);
    } else {
      batteryPct = Math.max(82.0, batteryPct - 0.08);
    }

    // Ground Station tracking
    let station = 'None (Deep Space Relay)';
    if (lon > -120 && lon < -60 && lat > 15 && lat < 45) {
      station = 'DSN Goldstone (USA)';
    } else if (lon > -15 && lon < 35 && lat > 30 && lat < 55) {
      station = 'DSN Madrid (Spain)';
    } else if (lon > 115 && lon < 165 && lat < -15 && lat > -45) {
      station = 'DSN Canberra (Australia)';
    }

    // Signal strength based on commStatus
    let signalStrengthDbm = -74 + Math.floor(Math.random() * 6);
    if (commStatus === 'DEGRADED') signalStrengthDbm = -102 - Math.floor(Math.random() * 8);
    if (commStatus === 'OFFLINE') signalStrengthDbm = -130;

    // Environmental micro-variations
    const cabinTemp = Math.round((22.3 + Math.sin(this.orbitPhase) * 0.4 + (Math.random() - 0.5) * 0.1) * 10) / 10;
    const cabinPressure = Math.round((101.3 + (Math.random() - 0.5) * 0.05) * 100) / 100;
    const oxygenPct = Math.round((20.92 + (Math.random() - 0.5) * 0.03) * 100) / 100;
    const co2Ppm = Math.round(480 + Math.sin(this.orbitPhase * 2) * 15 + Math.random() * 5);
    const humidityPct = Math.round((45.0 + Math.sin(this.orbitPhase) * 1.5) * 10) / 10;
    const radiation = Math.round((18.4 + (Math.abs(lat) > 45 ? 4.2 : 0) + Math.random() * 0.5) * 10) / 10;

    this.current = {
      timestamp: iso,
      displayTime,
      cabinTemperature: cabinTemp,
      cabinPressure,
      oxygenPct,
      co2Ppm,
      humidityPct,
      radiationRate: radiation,
      orbitAltitudeKm: Math.round((418.5 + Math.sin(this.orbitPhase * 3) * 0.8) * 10) / 10,
      orbitVelocityKmS: 7.67,
      latitude: Math.round(lat * 100) / 100,
      longitude: Math.round(lon * 100) / 100,
      powerGeneratedKw: Math.round(powerGeneratedKw * 10) / 10,
      batteryStoragePct: Math.round(batteryPct * 10) / 10,
      signalStrengthDbm,
      solarFluxWm2: isDaylight ? 1361.2 : 0.0,
      orbitalPeriodMins: 92.8,
      dayNightCycle,
      groundStationInView: station,
    };

    this.history.unshift(this.current);
    if (this.history.length > 50) {
      this.history.pop();
    }

    return this.current;
  }

  public getCurrentTelemetry(): SpacecraftTelemetry {
    return this.current;
  }

  public getTelemetryHistory(limit = 20): SpacecraftTelemetry[] {
    return this.history.slice(0, limit);
  }
}

export const telemetrySimulator = TelemetrySimulator.getInstance();
