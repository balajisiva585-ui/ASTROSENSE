import { AsteroidObject } from '../types';
import { db } from '../database/db';

export class AsteroidMonitor {
  private static instance: AsteroidMonitor;
  private asteroids: AsteroidObject[] = [];

  private constructor() {
    this.seedAsteroids();
  }

  public static getInstance(): AsteroidMonitor {
    if (!AsteroidMonitor.instance) {
      AsteroidMonitor.instance = new AsteroidMonitor();
    }
    return AsteroidMonitor.instance;
  }

  private seedAsteroids(): void {
    const now = new Date();
    this.asteroids = [
      {
        id: 'ASTEROID-A01',
        name: '2026-XF9 (Apollo NEO)',
        type: 'NEO',
        distanceLd: 3.42,
        distanceKm: 1314648,
        relativeVelocityKmS: 18.4,
        estimatedDiameterM: 180,
        riskLevel: 'NONE',
        torinoScale: 0,
        observationStatus: 'TRACKING',
        lastObservation: new Date(now.getTime() - 12 * 60 * 1000).toISOString(),
        nextPass: '2026-11-14T08:30:00Z',
        trajectoryVector: { x: 0.24, y: -0.88, z: 0.41 },
        isAnomaly: false,
      },
      {
        id: 'ASTEROID-B07',
        name: '99942 Apophis-Sim (Atens)',
        type: 'PHA',
        distanceLd: 1.84,
        distanceKm: 707296,
        relativeVelocityKmS: 30.7,
        estimatedDiameterM: 370,
        riskLevel: 'LOW',
        torinoScale: 1,
        observationStatus: 'RADAR_LOCKED',
        lastObservation: new Date(now.getTime() - 4 * 60 * 1000).toISOString(),
        nextPass: '2029-04-13T21:46:00Z',
        trajectoryVector: { x: -0.62, y: 0.74, z: 0.25 },
        isAnomaly: false,
      },
      {
        id: 'NEO-SIM-01',
        name: 'PHA-Alpha (Simulated Object)',
        type: 'PHA',
        distanceLd: 0.95,
        distanceKm: 365180,
        relativeVelocityKmS: 22.1,
        estimatedDiameterM: 420,
        riskLevel: 'MEDIUM',
        torinoScale: 2,
        observationStatus: 'ACQUIRING',
        lastObservation: new Date(now.getTime() - 1 * 60 * 1000).toISOString(),
        nextPass: '2026-10-02T14:15:00Z',
        trajectoryVector: { x: 0.81, y: 0.35, z: -0.46 },
        isAnomaly: false,
      },
      {
        id: 'COMET-C03',
        name: 'C/2026 Aurora (Hyperbolic)',
        type: 'COMETARY',
        distanceLd: 14.8,
        distanceKm: 5689120,
        relativeVelocityKmS: 46.2,
        estimatedDiameterM: 1200,
        riskLevel: 'NONE',
        torinoScale: 0,
        observationStatus: 'TRACKING',
        lastObservation: new Date(now.getTime() - 35 * 60 * 1000).toISOString(),
        nextPass: '2027-02-18T19:00:00Z',
        trajectoryVector: { x: -0.15, y: -0.92, z: 0.36 },
        isAnomaly: false,
      },
    ];
  }

  public getAsteroids(): AsteroidObject[] {
    return this.asteroids;
  }

  public tick(): void {
    // Subtle realistic orbital dynamics simulation
    this.asteroids.forEach(ast => {
      const deltaKm = (Math.random() - 0.5) * 12;
      ast.distanceKm = Math.round(ast.distanceKm + deltaKm);
      ast.distanceLd = Math.round((ast.distanceKm / 384400) * 100) / 100;
    });
  }

  public triggerAsteroidAnomaly(id = 'ASTEROID-B07'): AsteroidObject | null {
    const ast = this.asteroids.find(a => a.id === id);
    if (!ast) return null;

    const now = new Date();
    const iso = now.toISOString();
    const displayTime = now.toTimeString().split(' ')[0];

    ast.isAnomaly = true;
    ast.observationStatus = 'ANOMALY_DETECTED';
    ast.riskLevel = 'HIGH';
    ast.torinoScale = 3;
    ast.anomalyDetails = {
      title: `🚨 ASTEROID MONITORING ALERT: ${ast.name} Trajectory Variance`,
      description: `Radar telemetry indicates unexpected delta-V vector variance of +0.08 km/s, shifting closest approach trajectory envelope closer by 0.12 LD.`,
      detectedAt: iso,
      evidence: `Doppler frequency offset deviation (+48 Hz); Goldstone Radar observation timestamp: ${displayTime} UTC.`,
      aiRecommendation: `1. Cross-verify Doppler telemetry with ESA Optical Ground Station (Tenerife).\n2. Request automated secondary radar sweep.\n3. Recalculate 48-hour ephemeris covariance matrix.\n4. Escalate to Planetary Defense Officer review. (AI-generated decision support – human verification required).`,
    };

    // Also register in main anomalies database
    const session = db.getSession();
    db.addAnomaly({
      targetObject: ast.id,
      targetType: 'ASTEROID',
      astronautId: 'GROUND_RADAR',
      timestamp: iso,
      displayTime,
      title: `ASTEROID ALERT: ${ast.name} Trajectory Deviation`,
      category: 'ASTEROID_MONITORING_ALERT',
      severity: 'WARNING',
      module: 'CONTROL_MODULE',
      description: ast.anomalyDetails.description,
      telemetryEvidence: ast.anomalyDetails.evidence,
      aiAnalysis: 'Simulated radar telemetry indicates orbital vector variance exceeding nominal 3-sigma confidence bounds.',
      recommendedAction: ast.anomalyDetails.aiRecommendation,
      resolved: false,
      syncStatus: session.commStatus === 'ONLINE' ? 'SYNCED' : 'PENDING',
    });

    return ast;
  }

  public resolveAsteroidAnomaly(id: string): boolean {
    const ast = this.asteroids.find(a => a.id === id);
    if (ast && ast.isAnomaly) {
      ast.isAnomaly = false;
      ast.observationStatus = 'RADAR_LOCKED';
      ast.riskLevel = 'LOW';
      ast.torinoScale = 1;
      ast.anomalyDetails = undefined;
      return true;
    }
    return false;
  }
}

export const asteroidMonitor = AsteroidMonitor.getInstance();
