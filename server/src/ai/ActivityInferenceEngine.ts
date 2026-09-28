import {
  ActivityType,
  InferencePrediction,
  HabitatModule,
  ProcessingMode,
} from '../types';

export interface ModelMetadata {
  modelName: string;
  version: string;
  architecture: string;
  targetRuntime: 'ONNX_RUNTIME' | 'TFLITE_MICRO' | 'MEDIAPIPE' | 'DEMO_INFERENCE_ENGINE';
  inputResolution: [number, number];
  quantization: 'INT8' | 'FP16' | 'FP32' | 'SIMULATED';
  onboardEdgeHardware: string;
  inferenceLatencyTargetMs: number;
  classesCount: number;
  classesList: ActivityType[];
  accuracyBenchmark: number; // e.g. 95.8%
}

export interface FrameInput {
  frameId?: number;
  timestamp?: number;
  imageUrl?: string;
  rawBuffer?: Buffer;
  keypoints?: Array<{ x: number; y: number; score: number; name: string }>;
  sensorTelemetry?: {
    accelerometer?: [number, number, number];
    gyroscope?: [number, number, number];
    opticalFlow?: number;
  };
  context?: {
    currentModule: HabitatModule;
    astronautId: string;
    missionDay: number;
  };
}

export interface IActivityInferenceEngine {
  initializeModel(): Promise<boolean>;
  processFrame(input: FrameInput): Promise<InferencePrediction>;
  predictActivity(input: FrameInput): Promise<InferencePrediction>;
  getConfidence(): number;
  detectAnomaly(
    activity: ActivityType,
    durationSeconds: number,
    previousActivity?: ActivityType,
    context?: any
  ): {
    isAnomaly: boolean;
    severity?: 'WARNING' | 'CRITICAL';
    category?: 'MISSION_SAFETY_ALERT' | 'ACTIVITY_ANOMALY' | 'CREW_MONITORING_ALERT';
    description?: string;
    recommendedAction?: string;
  };
  getModelMetadata(): ModelMetadata;
}
