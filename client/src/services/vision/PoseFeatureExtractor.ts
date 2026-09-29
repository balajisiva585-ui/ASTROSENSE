import { VisionLandmark, PoseFeatures, WebcamCalibration } from '../../types';

export interface LandmarkPoints {
  nose?: VisionLandmark;
  leftShoulder?: VisionLandmark;
  rightShoulder?: VisionLandmark;
  leftElbow?: VisionLandmark;
  rightElbow?: VisionLandmark;
  leftWrist?: VisionLandmark;
  rightWrist?: VisionLandmark;
  leftHip?: VisionLandmark;
  rightHip?: VisionLandmark;
  leftKnee?: VisionLandmark;
  rightKnee?: VisionLandmark;
  leftAnkle?: VisionLandmark;
  rightAnkle?: VisionLandmark;
}

export class PoseFeatureExtractor {
  /**
   * MediaPipe Pose Landmark Indices:
   * 0: nose
   * 11: left_shoulder, 12: right_shoulder
   * 13: left_elbow, 14: right_elbow
   * 15: left_wrist, 16: right_wrist
   * 23: left_hip, 24: right_hip
   * 25: left_knee, 26: right_knee
   * 27: left_ankle, 28: right_ankle
   */

  /**
   * Calculate 2D angle at vertex B formed by points A-B-C in degrees (0 - 180)
   */
  public static calculateAngle(
    a: VisionLandmark,
    b: VisionLandmark,
    c: VisionLandmark
  ): number {
    const radians =
      Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
    let angle = Math.abs((radians * 180.0) / Math.PI);
    if (angle > 180.0) {
      angle = 360.0 - angle;
    }
    return Math.round(angle * 10) / 10;
  }

  /**
   * Euclidean distance between two landmarks
   */
  public static distance(a: VisionLandmark, b: VisionLandmark): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = (a.z ?? 0) - (b.z ?? 0);
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Midpoint between two landmarks
   */
  public static midpoint(a: VisionLandmark, b: VisionLandmark): VisionLandmark {
    return {
      x: (a.x + b.x) / 2,
      y: (a.y + b.y) / 2,
      z: ((a.z ?? 0) + (b.z ?? 0)) / 2,
      visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1),
    };
  }

  /**
   * Extract comprehensive biomechanical pose features from a raw landmark array
   */
  public static extractFeatures(
    landmarks: VisionLandmark[],
    previousFeatures: PoseFeatures | null = null,
    calibration: WebcamCalibration | null = null,
    deltaTimeSec: number = 0.066
  ): PoseFeatures | null {
    if (!landmarks || landmarks.length < 25) {
      return null;
    }

    const ls = landmarks[11]; // left shoulder
    const rs = landmarks[12]; // right shoulder
    const le = landmarks[13]; // left elbow
    const re = landmarks[14]; // right elbow
    const lw = landmarks[15]; // left wrist
    const rw = landmarks[16]; // right wrist
    const lh = landmarks[23]; // left hip
    const rh = landmarks[24]; // right hip
    const lk = landmarks[25] || lh; // left knee
    const rk = landmarks[26] || rh; // right knee
    const la = landmarks[27] || lk; // left ankle
    const ra = landmarks[28] || rk; // right ankle

    if (!ls || !rs || !lh || !rh) {
      return null;
    }

    // Mean visibility score for upper & lower body landmarks
    const keyPoints = [ls, rs, le, re, lw, rw, lh, rh, lk, rk, la, ra];
    const visibilitySum = keyPoints.reduce(
      (acc, p) => acc + (p?.visibility ?? 0.8),
      0
    );
    const visibilityScore = Math.round((visibilitySum / keyPoints.length) * 100) / 100;

    // Joint Angles
    const leftKneeAngle =
      lk && la && lh
        ? this.calculateAngle(lh, lk, la)
        : 170;
    const rightKneeAngle =
      rk && ra && rh
        ? this.calculateAngle(rh, rk, ra)
        : 170;
    const avgKneeAngle = Math.round(((leftKneeAngle + rightKneeAngle) / 2) * 10) / 10;

    const leftElbowAngle =
      le && lw && ls
        ? this.calculateAngle(ls, le, lw)
        : 160;
    const rightElbowAngle =
      re && rw && rs
        ? this.calculateAngle(rs, re, rw)
        : 160;
    const avgElbowAngle = Math.round(((leftElbowAngle + rightElbowAngle) / 2) * 10) / 10;

    // Midpoints
    const midShoulder = this.midpoint(ls, rs);
    const midHip = this.midpoint(lh, rh);

    // Torso Height & Widths
    const torsoHeight = this.distance(midShoulder, midHip);
    const shoulderWidth = this.distance(ls, rs);
    const hipWidth = this.distance(lh, rh);

    // Torso Tilt (Angle vs Vertical Line)
    // Vertical reference vector points down: (0, 1)
    const spineDx = midHip.x - midShoulder.x;
    const spineDy = midHip.y - midShoulder.y;
    const spineLength = Math.sqrt(spineDx * spineDx + spineDy * spineDy) || 0.0001;
    // Dot product with vertical vector (0, 1) -> spineDy / spineLength
    const cosTilt = Math.max(-1, Math.min(1, spineDy / spineLength));
    const torsoTiltAngle = Math.round(((Math.acos(cosTilt) * 180.0) / Math.PI) * 10) / 10;

    // Center of Mass (CoM) is estimated as 60% spine distance from shoulders towards hips
    const centerOfMassX = midShoulder.x + spineDx * 0.6;
    const centerOfMassY = midShoulder.y + spineDy * 0.6;

    // Total Bounding Box
    let minX = 1;
    let maxX = 0;
    let minY = 1;
    let maxY = 0;
    for (const p of landmarks) {
      if ((p.visibility ?? 1) > 0.4) {
        minX = Math.min(minX, p.x);
        maxX = Math.max(maxX, p.x);
        minY = Math.min(minY, p.y);
        maxY = Math.max(maxY, p.y);
      }
    }
    const bboxWidth = Math.max(0.01, maxX - minX);
    const bboxHeight = Math.max(0.01, maxY - minY);
    const aspectRatio = Math.round((bboxHeight / bboxWidth) * 100) / 100;

    // Total body height ratio relative to torso or calibrated baseline
    let bodyHeightRatio = bboxHeight / (calibration?.baselineStandingHeight || 0.7);
    if (!calibration?.isCalibrated) {
      bodyHeightRatio = bboxHeight;
    }

    // Kinetic Energy & Instantaneous Velocities
    const dt = Math.max(0.02, deltaTimeSec);
    let verticalVelocity = 0;
    let horizontalVelocity = 0;
    let wristKineticEnergy = 0;
    let ankleKineticEnergy = 0;

    if (previousFeatures) {
      // CoM velocities (normalized units / second)
      horizontalVelocity = (centerOfMassX - previousFeatures.centerOfMassX) / dt;
      verticalVelocity = (centerOfMassY - previousFeatures.centerOfMassY) / dt; // positive means moving downward

      // Wrist velocity
      if (lw && rw) {
        wristKineticEnergy = (Math.abs(horizontalVelocity) + Math.abs(verticalVelocity)) * 0.8;
      }
    }

    const totalKineticEnergy = Math.round(
      (Math.abs(horizontalVelocity) * 1.2 + Math.abs(verticalVelocity) * 1.5 + wristKineticEnergy) * 1000
    ) / 1000;

    // Posture flags
    // Recumbent: torso tilt > 60° (lying down / flat)
    const isRecumbent = torsoTiltAngle > 60;
    // Upright: torso tilt < 25°
    const isUpright = torsoTiltAngle < 25;
    // Knees bent: knee angle < 135°
    const isKneesBent = avgKneeAngle < 135;
    // Legs alternating (distance between ankles varying or ankle height diff)
    const isLegsAlternating = la && ra ? Math.abs(la.y - ra.y) > 0.04 : false;

    return {
      leftKneeAngle,
      rightKneeAngle,
      avgKneeAngle,
      leftElbowAngle,
      rightElbowAngle,
      avgElbowAngle,
      torsoTiltAngle,
      torsoHeight,
      shoulderWidth,
      hipWidth,
      aspectRatio,
      centerOfMassX,
      centerOfMassY,
      bodyHeightRatio,
      wristKineticEnergy,
      ankleKineticEnergy,
      totalKineticEnergy,
      verticalVelocity,
      horizontalVelocity,
      isRecumbent,
      isUpright,
      isKneesBent,
      isLegsAlternating,
      motionPeriodicity: 0,
      timeSinceLastMovementSec: 0,
      visibilityScore,
    };
  }
}
