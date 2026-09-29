import { FilesetResolver, PoseLandmarker } from '@mediapipe/tasks-vision';
import { VisionLandmark, ActivityDetectionResult, WebcamCalibration } from '../../types';
import { ActivityClassifier } from './ActivityClassifier';
import { openCVVisionService, OpenCVFrameMetrics } from './OpenCVVisionService';

export interface CameraDiagnostics {
  cameraState: 'UNINITIALIZED' | 'REQUESTING' | 'LIVE' | 'ERROR' | 'DENIED' | 'NOT_FOUND';
  streamActive: boolean;
  videoWidth: number;
  videoHeight: number;
  videoReadyState: number;
  videoPaused: boolean;
  trackCount: number;
  trackState: string;
  modelStatus: 'NOT_LOADED' | 'LOADING' | 'READY' | 'ERROR';
  openCVReady: boolean;
  poseDetectionActive: boolean;
  inferenceFps: number;
  inferenceLatencyMs: number;
  landmarksCount: number;
  primaryPersonDetected: boolean;
  multiplePeople: boolean;
  openCVMetrics: OpenCVFrameMetrics;
  errorMessage?: string | null;
}

export interface PoseDetectionCallbacks {
  onResult: (result: ActivityDetectionResult, rawLandmarks: VisionLandmark[][] | null) => void;
  onDiagnostics?: (diagnostics: CameraDiagnostics) => void;
  onError?: (error: Error | string) => void;
  onStatusChange?: (status: 'INITIALIZING' | 'MODEL_LOADING' | 'READY' | 'STREAMING' | 'STOPPED' | 'ERROR') => void;
}

export class PoseDetectionService {
  private static instance: PoseDetectionService | null = null;
  private poseLandmarker: PoseLandmarker | null = null;
  private classifier: ActivityClassifier;
  private modelStatus: 'NOT_LOADED' | 'LOADING' | 'READY' | 'ERROR' = 'NOT_LOADED';
  private isRunning: boolean = false;
  private animFrameId: number | null = null;
  private lastInferenceTime: number = 0;
  private targetInferenceIntervalMs: number = 40; // ~25 FPS inference
  private fpsCalculationTimestamps: number[] = [];
  private measuredFps: number = 0;
  private lastLatencyMs: number = 0;
  private currentCalibration: WebcamCalibration | null = null;
  private calibrationCountdownStart: number | null = null;
  private calibrationSamples: Array<{ torsoHeight: number; shoulderWidth: number; comY: number; bodyHeight: number }> = [];

  private videoElement: HTMLVideoElement | null = null;
  private callbacks: PoseDetectionCallbacks | null = null;
  private lastLandmarksCount: number = 0;
  private lastErrorMessage: string | null = null;

  private constructor() {
    this.classifier = new ActivityClassifier();
  }

  public static getInstance(): PoseDetectionService {
    if (!PoseDetectionService.instance) {
      PoseDetectionService.instance = new PoseDetectionService();
    }
    return PoseDetectionService.instance;
  }

  public getClassifier(): ActivityClassifier {
    return this.classifier;
  }

  public getModelStatus(): 'NOT_LOADED' | 'LOADING' | 'READY' | 'ERROR' {
    return this.modelStatus;
  }

  /**
   * Initialize MediaPipe PoseLandmarker model assets
   * Prioritizes local static assets in /wasm and /models with CDN fallback
   */
  public async initModel(): Promise<boolean> {
    // 0. Trigger OpenCV.js loading in background concurrently
    openCVVisionService.loadOpenCV().catch((e) => console.warn('OpenCV background init warning:', e));

    if (this.poseLandmarker && this.modelStatus === 'READY') return true;
    if (this.modelStatus === 'LOADING') return false;

    this.modelStatus = 'LOADING';
    this.callbacks?.onStatusChange?.('MODEL_LOADING');

    try {
      let vision: any = null;

      // 1. Try local wasm folder first
      try {
        vision = await FilesetResolver.forVisionTasks('/wasm');
      } catch (localWasmErr) {
        console.warn('Local wasm failed, trying CDN wasm resolver:', localWasmErr);
        vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.18/wasm'
        );
      }

      // 2. Try local model asset first with CDN fallback
      const localModelPath = '/models/pose_landmarker_lite.task';
      const remoteModelPath =
        'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

      let modelAssetPath = localModelPath;

      // Check if local model can be reached
      try {
        const checkRes = await fetch(localModelPath, { method: 'HEAD' });
        if (!checkRes.ok) {
          modelAssetPath = remoteModelPath;
        }
      } catch {
        modelAssetPath = remoteModelPath;
      }

      // Create landmarker with GPU or CPU fallback
      try {
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 2,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      } catch (gpuError) {
        console.warn('GPU delegate unavailable, using CPU delegate:', gpuError);
        this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath,
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numPoses: 2,
          minPoseDetectionConfidence: 0.5,
          minPosePresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });
      }

      this.modelStatus = 'READY';
      this.lastErrorMessage = null;
      this.callbacks?.onStatusChange?.('READY');
      return true;
    } catch (err: any) {
      console.error('Failed to load MediaPipe PoseLandmarker:', err);
      this.modelStatus = 'ERROR';
      this.lastErrorMessage = err.message || 'Model initialization error';
      this.callbacks?.onError?.(`MediaPipe Model Initialization Error: ${this.lastErrorMessage}`);
      this.callbacks?.onStatusChange?.('ERROR');
      return false;
    }
  }

  /**
   * Start processing video frames from HTMLVideoElement
   */
  public async start(
    video: HTMLVideoElement,
    callbacks: PoseDetectionCallbacks
  ): Promise<void> {
    this.videoElement = video;
    this.callbacks = callbacks;
    this.classifier.reset();

    const modelReady = await this.initModel();
    if (!modelReady && !this.poseLandmarker) {
      callbacks.onError?.('Pose detection model could not be initialized.');
      return;
    }

    this.isRunning = true;
    this.fpsCalculationTimestamps = [];
    callbacks.onStatusChange?.('STREAMING');

    this.runInferenceLoop();
  }

  /**
   * Stop inference loop
   */
  public stop(): void {
    this.isRunning = false;
    if (this.animFrameId) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    openCVVisionService.cleanup();
    this.callbacks?.onStatusChange?.('STOPPED');
  }

  /**
   * Start 3-second baseline calibration
   */
  public startCalibration(): void {
    this.calibrationCountdownStart = Date.now();
    this.calibrationSamples = [];
    this.currentCalibration = {
      isCalibrated: false,
      calibrating: true,
      progress: 0,
      baselineTorsoHeight: 0.35,
      baselineShoulderWidth: 0.25,
      baselineCenterOfMassY: 0.5,
      baselineStandingHeight: 0.7,
    };
  }

  public getCalibration(): WebcamCalibration | null {
    return this.currentCalibration;
  }

  public getDiagnostics(cameraStatus: 'UNINITIALIZED' | 'REQUESTING' | 'LIVE' | 'ERROR' | 'DENIED' | 'NOT_FOUND'): CameraDiagnostics {
    const video = this.videoElement;
    const mediaStream = (video?.srcObject as MediaStream) || null;
    const track = mediaStream?.getVideoTracks()?.[0] || null;

    return {
      cameraState: cameraStatus,
      streamActive: !!mediaStream && mediaStream.active,
      videoWidth: video?.videoWidth || 0,
      videoHeight: video?.videoHeight || 0,
      videoReadyState: video?.readyState || 0,
      videoPaused: video ? video.paused : true,
      trackCount: mediaStream?.getVideoTracks()?.length || 0,
      trackState: track?.readyState || 'none',
      modelStatus: this.modelStatus,
      openCVReady: openCVVisionService.isOpenCVReady(),
      poseDetectionActive: this.isRunning && !!this.poseLandmarker,
      inferenceFps: this.measuredFps,
      inferenceLatencyMs: this.lastLatencyMs,
      landmarksCount: this.lastLandmarksCount,
      primaryPersonDetected: this.lastLandmarksCount > 0,
      multiplePeople: false,
      openCVMetrics: openCVVisionService.getLastMetrics(),
      errorMessage: this.lastErrorMessage,
    };
  }

  /**
   * Continuous inference loop using requestAnimationFrame
   */
  private runInferenceLoop = (): void => {
    if (!this.isRunning) return;

    const now = performance.now();

    if (
      this.videoElement &&
      this.videoElement.readyState >= 2 &&
      this.videoElement.videoWidth > 0 &&
      !this.videoElement.paused &&
      this.poseLandmarker &&
      now - this.lastInferenceTime >= this.targetInferenceIntervalMs
    ) {
      this.lastInferenceTime = now;

      // Calculate real measured FPS
      this.fpsCalculationTimestamps.push(now);
      if (this.fpsCalculationTimestamps.length > 20) {
        this.fpsCalculationTimestamps.shift();
      }
      if (this.fpsCalculationTimestamps.length > 1) {
        const timeDiff =
          (this.fpsCalculationTimestamps[this.fpsCalculationTimestamps.length - 1] -
            this.fpsCalculationTimestamps[0]) /
          1000;
        this.measuredFps =
          Math.round(((this.fpsCalculationTimestamps.length - 1) / timeDiff) * 10) / 10;
      }

      const tStart = performance.now();
      let latencyMs = 0;

      try {
        // 1. Run client-side OpenCV.js frame preprocessing & motion estimation
        const openCVMetrics = openCVVisionService.processVideoFrame(this.videoElement);

        // 2. Run real client-side PoseLandmarker detection
        const detectionResult = this.poseLandmarker.detectForVideo(
          this.videoElement,
          now
        );
        const tEnd = performance.now();
        latencyMs = Math.round((tEnd - tStart) * 10) / 10;
        this.lastLatencyMs = latencyMs;

        const allLandmarks = (detectionResult.landmarks || []) as VisionLandmark[][];
        const primaryPersonLandmarks = allLandmarks.length > 0 ? allLandmarks[0] : null;
        const multiplePeople = allLandmarks.length > 1;
        this.lastLandmarksCount = primaryPersonLandmarks ? primaryPersonLandmarks.length : 0;

        // Handle calibration if in progress
        if (this.currentCalibration?.calibrating && primaryPersonLandmarks) {
          this.handleCalibrationTick(primaryPersonLandmarks);
        }

        // 3. Run rule-based temporal classifier combining Pose landmarks and OpenCV motion
        const activityResult = this.classifier.classifyFrame(
          primaryPersonLandmarks,
          multiplePeople,
          this.currentCalibration,
          latencyMs,
          this.measuredFps,
          openCVMetrics
        );

        this.callbacks?.onResult(activityResult, allLandmarks);

        if (this.callbacks?.onDiagnostics) {
          this.callbacks.onDiagnostics(this.getDiagnostics('LIVE'));
        }
      } catch (err: any) {
        console.warn('Frame inference cycle dropped:', err);
      }
    }

    this.animFrameId = requestAnimationFrame(this.runInferenceLoop);
  };

  private handleCalibrationTick(landmarks: VisionLandmark[]): void {
    if (!this.calibrationCountdownStart || !this.currentCalibration) return;

    const elapsed = Date.now() - this.calibrationCountdownStart;
    const progress = Math.min(100, Math.round((elapsed / 3000) * 100));
    this.currentCalibration.progress = progress;

    const ls = landmarks[11];
    const rs = landmarks[12];
    const lh = landmarks[23];
    const rh = landmarks[24];

    if (ls && rs && lh && rh) {
      const shoulderWidth = Math.abs(ls.x - rs.x);
      const torsoHeight = Math.abs((ls.y + rs.y) / 2 - (lh.y + rh.y) / 2);
      const comY = (ls.y + rs.y + lh.y + rh.y) / 4;
      let maxY = 0;
      let minY = 1;
      for (const p of landmarks) {
        if ((p.visibility ?? 1) > 0.4) {
          minY = Math.min(minY, p.y);
          maxY = Math.max(maxY, p.y);
        }
      }
      this.calibrationSamples.push({
        shoulderWidth,
        torsoHeight,
        comY,
        bodyHeight: Math.max(0.1, maxY - minY),
      });
    }

    if (elapsed >= 3000 && this.calibrationSamples.length > 5) {
      const avgTorso =
        this.calibrationSamples.reduce((a, b) => a + b.torsoHeight, 0) /
        this.calibrationSamples.length;
      const avgShoulder =
        this.calibrationSamples.reduce((a, b) => a + b.shoulderWidth, 0) /
        this.calibrationSamples.length;
      const avgComY =
        this.calibrationSamples.reduce((a, b) => a + b.comY, 0) /
        this.calibrationSamples.length;
      const avgBodyHeight =
        this.calibrationSamples.reduce((a, b) => a + b.bodyHeight, 0) /
        this.calibrationSamples.length;

      this.currentCalibration = {
        isCalibrated: true,
        calibrating: false,
        progress: 100,
        baselineTorsoHeight: Math.round(avgTorso * 100) / 100,
        baselineShoulderWidth: Math.round(avgShoulder * 100) / 100,
        baselineCenterOfMassY: Math.round(avgComY * 100) / 100,
        baselineStandingHeight: Math.round(avgBodyHeight * 100) / 100,
      };
      this.calibrationCountdownStart = null;
    }
  }
}
