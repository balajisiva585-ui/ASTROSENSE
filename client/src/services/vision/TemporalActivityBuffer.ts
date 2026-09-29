import { PoseFeatures } from '../../types';

export interface BufferedFrame {
  features: PoseFeatures;
  timestamp: number;
}

export class TemporalActivityBuffer {
  private readonly maxFrames: number;
  private frames: BufferedFrame[] = [];
  private lastMovementTimestamp: number = Date.now();
  private movementThreshold: number = 0.08;

  constructor(maxFrames: number = 45) {
    this.maxFrames = maxFrames;
  }

  public push(features: PoseFeatures, timestamp: number = Date.now()): void {
    this.frames.push({ features, timestamp });
    if (this.frames.length > this.maxFrames) {
      this.frames.shift();
    }

    if (features.totalKineticEnergy > this.movementThreshold) {
      this.lastMovementTimestamp = timestamp;
    }
  }

  public clear(): void {
    this.frames = [];
    this.lastMovementTimestamp = Date.now();
  }

  public get count(): number {
    return this.frames.length;
  }

  public getHistory(): BufferedFrame[] {
    return [...this.frames];
  }

  public getLatest(): PoseFeatures | null {
    if (this.frames.length === 0) return null;
    return this.frames[this.frames.length - 1].features;
  }

  /**
   * Average kinetic energy over the last N frames
   */
  public getAverageKineticEnergy(windowSize: number = 15): number {
    if (this.frames.length === 0) return 0;
    const slice = this.frames.slice(-windowSize);
    const sum = slice.reduce((acc, f) => acc + f.features.totalKineticEnergy, 0);
    return Math.round((sum / slice.length) * 1000) / 1000;
  }

  /**
   * Average torso tilt angle over the last N frames
   */
  public getAverageTorsoTilt(windowSize: number = 15): number {
    if (this.frames.length === 0) return 0;
    const slice = this.frames.slice(-windowSize);
    const sum = slice.reduce((acc, f) => acc + f.features.torsoTiltAngle, 0);
    return Math.round((sum / slice.length) * 10) / 10;
  }

  /**
   * Average knee angle over the last N frames
   */
  public getAverageKneeAngle(windowSize: number = 15): number {
    if (this.frames.length === 0) return 170;
    const slice = this.frames.slice(-windowSize);
    const sum = slice.reduce((acc, f) => acc + f.features.avgKneeAngle, 0);
    return Math.round((sum / slice.length) * 10) / 10;
  }

  /**
   * Inactivity duration in seconds based on low kinetic energy
   */
  public getInactivityDurationSec(currentTime: number = Date.now()): number {
    return Math.max(0, (currentTime - this.lastMovementTimestamp) / 1000);
  }

  /**
   * Detect rhythmic / periodic oscillations in upper/lower body (exercises)
   */
  public detectPeriodicMotion(): { isPeriodic: boolean; frequencyHz: number; score: number } {
    if (this.frames.length < 20) {
      return { isPeriodic: false, frequencyHz: 0, score: 0 };
    }

    const kineticSignals = this.frames.map(f => f.features.totalKineticEnergy);
    let peaks = 0;
    for (let i = 1; i < kineticSignals.length - 1; i++) {
      if (
        kineticSignals[i] > 0.15 &&
        kineticSignals[i] > kineticSignals[i - 1] &&
        kineticSignals[i] > kineticSignals[i + 1]
      ) {
        peaks++;
      }
    }

    const totalDurationSec =
      (this.frames[this.frames.length - 1].timestamp - this.frames[0].timestamp) / 1000 || 1.5;
    const frequencyHz = Math.round((peaks / totalDurationSec) * 10) / 10;
    const isPeriodic = peaks >= 2 && frequencyHz >= 0.4 && frequencyHz <= 3.5;
    const score = isPeriodic ? Math.min(0.95, 0.5 + (peaks * 0.15)) : 0;

    return { isPeriodic, frequencyHz, score };
  }

  /**
   * Multi-stage Fall / Sudden Abnormal Movement Detection:
   * 1. Person detected in previous frames.
   * 2. High downward vertical velocity (> 0.45 norm/sec) or sudden center of mass drop.
   * 3. Torso orientation changes rapidly to recumbent (> 55° tilt).
   * 4. Person remains in low / prone position without immediately standing back up.
   */
  public detectFallPattern(): {
    isFall: boolean;
    isPossibleAnomaly: boolean;
    confidence: number;
    reason: string;
  } {
    if (this.frames.length < 15) {
      return { isFall: false, isPossibleAnomaly: false, confidence: 0, reason: '' };
    }

    // Check maximum downward velocity in the window
    let maxDownwardVelocity = 0;
    let maxTiltChange = 0;
    const initialTilt = this.frames[0].features.torsoTiltAngle;

    for (let i = 0; i < this.frames.length; i++) {
      const v = this.frames[i].features.verticalVelocity;
      if (v > maxDownwardVelocity) {
        maxDownwardVelocity = v;
      }
      const tiltDelta = Math.abs(this.frames[i].features.torsoTiltAngle - initialTilt);
      if (tiltDelta > maxTiltChange) {
        maxTiltChange = tiltDelta;
      }
    }

    const latest = this.frames[this.frames.length - 1].features;
    const isCurrentlyRecumbent = latest.torsoTiltAngle > 55;
    const isStationaryGround = latest.totalKineticEnergy < 0.12 && isCurrentlyRecumbent;

    // Strict multi-signal condition for Fall
    if (maxDownwardVelocity > 0.5 && maxTiltChange > 40 && isCurrentlyRecumbent && isStationaryGround) {
      return {
        isFall: true,
        isPossibleAnomaly: true,
        confidence: 0.88,
        reason: 'Sudden vertical drop vector followed by persistent horizontal recumbence.',
      };
    }

    // Intermediate trigger: Rapid tumble / possible anomaly
    if (maxDownwardVelocity > 0.45 && maxTiltChange > 30) {
      return {
        isFall: false,
        isPossibleAnomaly: true,
        confidence: 0.65,
        reason: 'Possible abnormal kinetic velocity spike - verification recommended.',
      };
    }

    return { isFall: false, isPossibleAnomaly: false, confidence: 0, reason: '' };
  }
}
