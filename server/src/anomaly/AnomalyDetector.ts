import {
  ActivityType,
  AnomalyAlert,
  HabitatModule,
  MissionEvent,
  SyncStatus,
} from '../types';
import { db } from '../database/db';

export interface AnomalyEvaluationResult {
  isAnomaly: boolean;
  alert?: Omit<AnomalyAlert, 'id'>;
}

export class AnomalyDetector {
  private static instance: AnomalyDetector;

  private constructor() {}

  public static getInstance(): AnomalyDetector {
    if (!AnomalyDetector.instance) {
      AnomalyDetector.instance = new AnomalyDetector();
    }
    return AnomalyDetector.instance;
  }

  public evaluateActivity(
    astronautId: string,
    activity: ActivityType,
    confidence: number,
    durationSeconds: number,
    module: HabitatModule,
    commStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE',
    previousActivity?: ActivityType
  ): AnomalyEvaluationResult {
    const session = db.getSession();
    const now = new Date();
    const displayTime = now.toTimeString().split(' ')[0];
    const timestamp = now.toISOString();
    const syncStatus: SyncStatus = commStatus === 'ONLINE' ? 'SYNCED' : 'PENDING';

    const sensitivity = session.anomalySensitivity || 'MEDIUM';
    const inactivityThreshold = session.inactivityThresholdSeconds || 900; // default 15 min

    // 1. Fall / Sudden Abnormal Movement (Critical)
    if (activity === 'FALL_ABNORMAL_MOVEMENT') {
      return {
        isAnomaly: true,
        alert: {
          astronautId,
          timestamp,
          displayTime,
          title: 'CRITICAL: Possible Fall or Sudden Abnormal Movement',
          category: 'MISSION_SAFETY_ALERT',
          severity: 'CRITICAL',
          activity,
          module,
          description: `Abnormal rapid acceleration or loss of posture stability detected in ${module.replace('_', ' ')}. AI confidence ${confidence}%.`,
          recommendedAction: 'Immediate verbal check-in via intercom; verify vital biosensors and prepare autonomous medical protocols if no response within 60s.',
          resolved: false,
          syncStatus,
        },
      };
    }

    // 2. Long Inactivity Detection (Warning)
    const effectiveInactivityLimit = sensitivity === 'HIGH' ? inactivityThreshold * 0.6 : sensitivity === 'LOW' ? inactivityThreshold * 1.5 : inactivityThreshold;
    if (
      (activity === 'LONG_INACTIVITY' || activity === 'SITTING' || activity === 'STANDING') &&
      durationSeconds >= effectiveInactivityLimit
    ) {
      const minutes = Math.round(durationSeconds / 60);
      return {
        isAnomaly: true,
        alert: {
          astronautId,
          timestamp,
          displayTime,
          title: 'WARNING: Extended Crew Inactivity Detected',
          category: 'CREW_MONITORING_ALERT',
          severity: 'WARNING',
          activity,
          module,
          description: `Astronaut has remained stationary in ${module.replace('_', ' ')} for ${minutes} minutes exceeding safe non-sleep threshold.`,
          recommendedAction: 'Send automated auditory chime prompt to astronaut; cross-check CO2 sensor readings in current module.',
          resolved: false,
          syncStatus,
        },
      };
    }

    // 3. Module/Activity incongruence
    if (activity === 'SLEEPING_RESTING' && module === 'EXERCISE_AREA') {
      return {
        isAnomaly: true,
        alert: {
          astronautId,
          timestamp,
          displayTime,
          title: 'WARNING: Unexpected Resting Posture in Exercise Zone',
          category: 'ACTIVITY_ANOMALY',
          severity: 'WARNING',
          activity,
          module,
          description: 'Crew member detected in stationary resting/recumbent posture in Exercise Area instead of active cycle.',
          recommendedAction: 'Verify physical fatigue state or equipment disengagement.',
          resolved: false,
          syncStatus,
        },
      };
    }

    return { isAnomaly: false };
  }
}

export const anomalyDetector = AnomalyDetector.getInstance();
