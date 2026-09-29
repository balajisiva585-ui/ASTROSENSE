import {
  VisionActivityState,
  ActivityDetectionResult,
  PoseFeatures,
  WebcamCalibration,
  VisionLandmark,
} from '../../types';
import { PoseFeatureExtractor } from './PoseFeatureExtractor';
import { TemporalActivityBuffer } from './TemporalActivityBuffer';
import { OpenCVFrameMetrics } from './OpenCVVisionService';

export interface ClassifierConfig {
  confidenceThreshold: number; // 0 to 100 (default 70)
  inactivityThresholdSec: number; // default 15
  smoothingWindowSize: number; // default 10
}

export class ActivityClassifier {
  private buffer: TemporalActivityBuffer;
  private config: ClassifierConfig;
  private recentPredictions: Array<{ activity: VisionActivityState; confidence: number }> = [];
  private currentStableActivity: VisionActivityState = 'ANALYZING';
  private stableConfidence: number = 0;
  private stableReason: string = 'Initializing pose estimator...';
  private activityStartTime: number = Date.now();
  private prevFeatures: PoseFeatures | null = null;
  private lastFrameTimestamp: number = Date.now();

  constructor(config: Partial<ClassifierConfig> = {}) {
    this.buffer = new TemporalActivityBuffer(45);
    this.config = {
      confidenceThreshold: config.confidenceThreshold ?? 70,
      inactivityThresholdSec: config.inactivityThresholdSec ?? 15,
      smoothingWindowSize: config.smoothingWindowSize ?? 10,
    };
  }

  public reset(): void {
    this.buffer.clear();
    this.recentPredictions = [];
    this.currentStableActivity = 'ANALYZING';
    this.stableConfidence = 0;
    this.stableReason = 'Analyzing video stream...';
    this.activityStartTime = Date.now();
    this.prevFeatures = null;
  }

  public setConfidenceThreshold(threshold: number): void {
    this.config.confidenceThreshold = Math.max(40, Math.min(95, threshold));
  }

  /**
   * Process a single video frame's pose landmarks and classify activity
   */
  public classifyFrame(
    landmarks: VisionLandmark[] | null,
    multiplePeopleDetected: boolean = false,
    calibration: WebcamCalibration | null = null,
    latencyMs: number = 0,
    fps: number = 0,
    openCVMetrics?: OpenCVFrameMetrics
  ): ActivityDetectionResult {
    const now = Date.now();
    const dt = Math.max(0.016, (now - this.lastFrameTimestamp) / 1000);
    this.lastFrameTimestamp = now;

    // 1. Handle No Person Detected
    if (!landmarks || landmarks.length < 15) {
      this.buffer.clear();
      this.recentPredictions = [];
      this.currentStableActivity = 'NO_PERSON_DETECTED';
      this.stableConfidence = 0;
      this.stableReason = 'No human body pose landmarks detected in camera view.';
      this.prevFeatures = null;

      return {
        activity: 'NO_PERSON_DETECTED',
        displayedActivity: 'NO PERSON DETECTED',
        confidence: 0,
        isConfident: false,
        reason: this.stableReason,
        source: 'REAL_WEBCAM',
        detectionMode: 'POSE_LANDMARKS',
        latencyMs,
        fps,
        landmarksCount: 0,
        multiplePeopleDetected,
        isAnomaly: false,
        features: null,
        timestamp: now,
        durationMs: 0,
      };
    }

    // 2. Handle Multiple People in Frame
    if (multiplePeopleDetected) {
      return {
        activity: 'UNKNOWN',
        displayedActivity: 'MULTIPLE PEOPLE DETECTED',
        confidence: 50,
        isConfident: false,
        reason: 'Multiple subjects detected in optical field. Activity recognition requires single subject focus.',
        source: 'REAL_WEBCAM',
        detectionMode: 'POSE_LANDMARKS',
        latencyMs,
        fps,
        landmarksCount: landmarks.length,
        multiplePeopleDetected: true,
        isAnomaly: false,
        features: null,
        timestamp: now,
        durationMs: 0,
      };
    }

    // 3. Extract Biomechanical Features
    const features = PoseFeatureExtractor.extractFeatures(
      landmarks,
      this.prevFeatures,
      calibration,
      dt
    );

    if (!features) {
      return {
        activity: 'ANALYZING',
        displayedActivity: 'ANALYZING POSE',
        confidence: 40,
        isConfident: false,
        reason: 'Partial landmark visibility. Establishing key joint points...',
        source: 'REAL_WEBCAM',
        detectionMode: 'POSE_LANDMARKS',
        latencyMs,
        fps,
        landmarksCount: landmarks.length,
        multiplePeopleDetected: false,
        isAnomaly: false,
        features: null,
        timestamp: now,
        durationMs: 0,
      };
    }

    this.prevFeatures = features;
    this.buffer.push(features, now);

    // 4. Evaluate Temporal Rules (fusing MediaPipe Pose + OpenCV optical flow motion)
    const rawResult = this.evaluateRules(features, calibration, now, openCVMetrics);

    // 5. Apply Temporal Smoothing & Hysteresis
    this.applySmoothing(rawResult.candidateActivity, rawResult.confidence, rawResult.reason, now);

    const isAnomaly =
      this.currentStableActivity === 'FALL_ABNORMAL_MOVEMENT' ||
      this.currentStableActivity === 'LONG_INACTIVITY';

    const durationMs = now - this.activityStartTime;

    return {
      activity: this.currentStableActivity,
      displayedActivity: this.formatDisplayActivity(this.currentStableActivity),
      confidence: this.stableConfidence,
      isConfident: this.stableConfidence >= this.config.confidenceThreshold,
      reason: this.stableReason,
      source: 'REAL_WEBCAM',
      detectionMode: 'POSE_LANDMARKS',
      latencyMs,
      fps,
      landmarksCount: landmarks.length,
      multiplePeopleDetected: false,
      isAnomaly,
      anomalySeverity: isAnomaly ? 'CRITICAL' : undefined,
      features,
      timestamp: now,
      durationMs,
    };
  }

  /**
   * Rule-based biomechanical inference on 12-class ASTROSENSE taxonomy
   */
  private evaluateRules(
    f: PoseFeatures,
    cal: WebcamCalibration | null,
    now: number,
    openCV?: OpenCVFrameMetrics
  ): { candidateActivity: VisionActivityState; confidence: number; reason: string } {
    // Check Fall / Abnormal Movement first
    const fallCheck = this.buffer.detectFallPattern();
    if (fallCheck.isFall) {
      return {
        candidateActivity: 'FALL_ABNORMAL_MOVEMENT',
        confidence: Math.round(fallCheck.confidence * 100),
        reason: fallCheck.reason,
      };
    }

    const avgKinetic = this.buffer.getAverageKineticEnergy(15);
    const avgTilt = this.buffer.getAverageTorsoTilt(15);
    const avgKnee = this.buffer.getAverageKneeAngle(15);
    const inactivitySec = this.buffer.getInactivityDurationSec(now);
    const periodicMotion = this.buffer.detectPeriodicMotion();
    const cvMotion = openCV ? openCV.motionMagnitude : avgKinetic;

    // Check Long Inactivity (Low joint kinetics + low OpenCV optical flow)
    const isStationary = cvMotion < 0.05 && avgKinetic < 0.06;
    if (inactivitySec >= this.config.inactivityThresholdSec && f.visibilityScore > 0.5 && isStationary) {
      return {
        candidateActivity: 'LONG_INACTIVITY',
        confidence: Math.min(96, Math.round(75 + inactivitySec * 1.5)),
        reason: `Zero kinetic translation detected for ${Math.round(inactivitySec)}s (threshold: ${this.config.inactivityThresholdSec}s, OpenCV motion: ${cvMotion.toFixed(2)}).`,
      };
    }

    // Check Sleeping / Resting (Recumbent posture + low kinetic energy)
    if (avgTilt > 60 && avgKinetic < 0.08 && cvMotion < 0.08) {
      return {
        candidateActivity: 'SLEEPING_RESTING',
        confidence: 88,
        reason: `Recumbent body axis (${avgTilt}° tilt from vertical) in low kinetic rest state.`,
      };
    }

    // Check Exercising (High kinetic energy + periodic movement rhythm OR OpenCV motion spike with periodicity)
    const isAerobicKinetics = (avgKinetic > 0.30 || cvMotion > 0.22) && periodicMotion.isPeriodic;
    if (isAerobicKinetics || avgKinetic > 0.45) {
      const conf = Math.round((0.80 + periodicMotion.score * 0.15) * 100);
      return {
        candidateActivity: 'EXERCISING',
        confidence: Math.min(96, conf),
        reason: `High kinetic aerobic velocity (Kinetic: ${avgKinetic.toFixed(2)}, CV Motion: ${cvMotion.toFixed(2)}) with ${periodicMotion.frequencyHz}Hz rhythmic countermeasure cycle.`,
      };
    }

    // Check Walking / Transit (Upright torso + alternating leg motion + real translational motion)
    const hasWalkingMotion = cvMotion > 0.07 || Math.abs(f.horizontalVelocity) > 0.03 || f.isLegsAlternating;
    if (
      avgTilt < 28 &&
      avgKinetic > 0.07 &&
      avgKinetic <= 0.40 &&
      hasWalkingMotion
    ) {
      return {
        candidateActivity: 'WALKING',
        confidence: 87,
        reason: `Upright translation (${avgTilt}° tilt) with bipedal stride dynamics (CV Motion: ${cvMotion.toFixed(2)}).`,
      };
    }

    // Check Sitting / Workstation Console (Bent knees ~ 70°-135°, lowered center of mass, upright torso, low motion)
    const isSittingByKnees = avgKnee < 135 && avgKnee > 60;
    const isSittingByCal = cal?.isCalibrated
      ? f.centerOfMassY > cal.baselineCenterOfMassY + 0.06
      : false;

    if ((isSittingByKnees || isSittingByCal) && avgTilt < 42 && avgKinetic < 0.10 && cvMotion < 0.12) {
      return {
        candidateActivity: 'SITTING',
        confidence: 89,
        reason: `Flexed lower limbs (Knee angle: ${avgKnee}°) in stable seated workstation posture.`,
      };
    }

    // Check Standing / Station Watch (Upright torso, straight knees > 138°, low kinetic energy, low OpenCV motion)
    if (avgTilt < 26 && avgKnee >= 138 && avgKinetic < 0.08 && cvMotion < 0.08) {
      return {
        candidateActivity: 'STANDING',
        confidence: 93,
        reason: `Erect posture (${avgTilt}° tilt, ${avgKnee}° knees) in stationary neutral balance (CV Motion: ${cvMotion.toFixed(2)}).`,
      };
    }

    // Conservative Rule for Object/Context-Dependent Activities:
    // (EATING, DRINKING, WORKING, OPERATING_EQUIPMENT, PICKING_CARRYING)
    // We do NOT guess these from pose alone to preserve scientific truthfulness.
    if (avgKinetic >= 0.04 && avgKinetic <= 0.25) {
      return {
        candidateActivity: 'UNKNOWN',
        confidence: 55,
        reason: 'Insufficient visual evidence (Context or tool interaction required for fine motor classification).',
      };
    }

    // Default analyzing / unknown
    return {
      candidateActivity: 'ANALYZING',
      confidence: 45,
      reason: 'Evaluating body orientation, optical flow, and kinetic stability vector...',
    };
  }

  /**
   * Smooth predictions across a temporal sliding window to avoid jitter
   */
  private applySmoothing(
    candidate: VisionActivityState,
    confidence: number,
    reason: string,
    now: number
  ): void {
    this.recentPredictions.push({ activity: candidate, confidence });
    if (this.recentPredictions.length > this.config.smoothingWindowSize) {
      this.recentPredictions.shift();
    }

    // Count occurrences of each candidate in recent window
    const counts: Record<string, { count: number; totalConf: number; lastReason: string }> = {};
    for (const p of this.recentPredictions) {
      if (!counts[p.activity]) {
        counts[p.activity] = { count: 0, totalConf: 0, lastReason: reason };
      }
      counts[p.activity].count += 1;
      counts[p.activity].totalConf += p.confidence;
    }

    // Find dominant candidate
    let dominantActivity: VisionActivityState = candidate;
    let maxCount = 0;
    let avgConf = confidence;

    for (const [act, data] of Object.entries(counts)) {
      if (data.count > maxCount) {
        maxCount = data.count;
        dominantActivity = act as VisionActivityState;
        avgConf = Math.round(data.totalConf / data.count);
      }
    }

    // Require majority (e.g., > 50% of smoothing window) to change stable activity
    const requiredThreshold = Math.ceil(this.config.smoothingWindowSize * 0.5);

    if (maxCount >= requiredThreshold && dominantActivity !== this.currentStableActivity) {
      this.currentStableActivity = dominantActivity;
      this.activityStartTime = now;
      this.stableConfidence = avgConf;
      this.stableReason = counts[dominantActivity].lastReason;
    } else if (dominantActivity === this.currentStableActivity) {
      this.stableConfidence = avgConf;
      this.stableReason = reason;
    }
  }

  private formatDisplayActivity(act: VisionActivityState): string {
    switch (act) {
      case 'WALKING':
        return 'WALKING';
      case 'STANDING':
        return 'STANDING';
      case 'SITTING':
        return 'SITTING';
      case 'SLEEPING_RESTING':
        return 'SLEEPING / RESTING';
      case 'EXERCISING':
        return 'EXERCISING';
      case 'FALL_ABNORMAL_MOVEMENT':
        return 'FALL / ABNORMAL MOVEMENT';
      case 'LONG_INACTIVITY':
        return 'LONG INACTIVITY';
      case 'NO_PERSON_DETECTED':
        return 'NO PERSON DETECTED';
      case 'CALIBRATING':
        return 'CALIBRATING BASELINE';
      case 'ANALYZING':
        return 'ANALYZING';
      case 'UNKNOWN':
      default:
        return 'UNKNOWN';
    }
  }
}
