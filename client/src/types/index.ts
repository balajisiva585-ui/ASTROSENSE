export type ActivityType =
  | 'WALKING'
  | 'STANDING'
  | 'SITTING'
  | 'SLEEPING_RESTING'
  | 'EATING'
  | 'DRINKING'
  | 'EXERCISING'
  | 'WORKING'
  | 'OPERATING_EQUIPMENT'
  | 'PICKING_CARRYING'
  | 'FALL_ABNORMAL_MOVEMENT'
  | 'LONG_INACTIVITY';

export type AstronautStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export type CommStatus = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export type ProcessingMode = 'ONBOARD_EDGE_AI' | 'LOCAL_FALLBACK' | 'SIMULATION';

export type SyncStatus = 'PENDING' | 'SYNCED';

export type HabitatModule =
  | 'CREW_QUARTERS'
  | 'LABORATORY'
  | 'EXERCISE_AREA'
  | 'WORKSTATION'
  | 'STORAGE'
  | 'CONTROL_MODULE';

export interface VitalsTelemetry {
  heartRate: number;
  spO2: number;
  bodyTemp: number;
  respiratoryRate: number;
  metabolicKcalHour: number;
}

export interface ActivityStats {
  totalActiveSeconds: number;
  totalInactiveSeconds: number;
  exerciseSeconds: number;
  workingSeconds: number;
  eatingDrinkingSeconds: number;
  sleepingSeconds: number;
  anomaliesDetected: number;
  totalDetections: number;
}

export interface Astronaut {
  id: string;
  name: string;
  role: string;
  mission: string;
  missionDay: number;
  currentModule: HabitatModule;
  currentActivity: ActivityType;
  activityConfidence: number;
  currentStatus: AstronautStatus;
  activityDurationSeconds: number;
  lastActivity: ActivityType;
  movementState?: 'STATIONARY' | 'TRANSLATING' | 'HIGH_KINETIC' | 'ERRATIC';
  assignedTask?: string;
  vitals: VitalsTelemetry;
  stats: ActivityStats;
}

export interface MissionEvent {
  id: string;
  astronautId: string;
  timestamp: string; // ISO format
  displayTime: string; // HH:mm:ss
  activity: ActivityType;
  confidence: number;
  durationSeconds: number;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  module: HabitatModule;
  syncStatus: SyncStatus;
  source: string;
  processingMode: ProcessingMode;
  details: string;
  syncedAt?: string;
  telemetrySnapshot?: Partial<SpacecraftTelemetry>;
  recommendedAction?: string;
}

export interface AnomalyAlert {
  id: string;
  astronautId?: string;
  targetObject?: string;
  targetType?: 'ASTRONAUT' | 'SPACECRAFT' | 'ASTEROID' | 'ROBOT';
  timestamp: string;
  displayTime: string;
  title: string;
  category: 'MISSION_SAFETY_ALERT' | 'ACTIVITY_ANOMALY' | 'CREW_MONITORING_ALERT' | 'ASTEROID_MONITORING_ALERT' | 'SYSTEM_TELEMETRY_ALERT' | 'ROBOTIC_ALERT';
  severity: 'WARNING' | 'CRITICAL';
  activity?: ActivityType;
  module?: HabitatModule;
  description: string;
  telemetryEvidence?: string;
  aiAnalysis?: string;
  recommendedAction: string;
  resolved: boolean;
  syncStatus: SyncStatus;
}

export interface MissionSession {
  id: string;
  missionName: string;
  astronautId: string;
  missionDay: number;
  missionElapsedTimeSeconds: number;
  startedAt: string;
  commStatus: CommStatus;
  autonomousModeActive: boolean;
  unsyncedEventCount: number;
  totalEventsCount: number;
  syncProgress: number;
  isSyncing: boolean;
  activeInputMode: 'SIMULATION' | 'CAMERA' | 'VIDEO';
  inactivityThresholdSeconds: number;
  anomalySensitivity: 'LOW' | 'MEDIUM' | 'HIGH';
  autoSyncOnRestore: boolean;
  commLossTimestamp?: string;
  commRestoreTimestamp?: string;
  totalOutageSeconds: number;
}

export interface InferencePrediction {
  activity: ActivityType;
  confidence: number;
  processingMode: ProcessingMode;
  inferenceTimeMs: number;
  astronautId: string;
  module: HabitatModule;
  isAnomaly: boolean;
  anomalyDetails?: {
    severity: 'WARNING' | 'CRITICAL';
    category: 'MISSION_SAFETY_ALERT' | 'ACTIVITY_ANOMALY' | 'CREW_MONITORING_ALERT';
    description: string;
  };
  keypoints?: Array<{ x: number; y: number; score: number; name: string }>;
}

export interface SyncState {
  commStatus: CommStatus;
  isSyncing: boolean;
  syncProgress: number;
  pendingEventsCount: number;
  pendingAnomaliesCount: number;
  totalPendingItems: number;
  lastSyncHistory: Array<{
    id: string;
    timestamp: string;
    batchSize: number;
    durationMs: number;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  }>;
}

export interface DemoStep {
  stepNumber: number;
  title: string;
  description: string;
  activity: ActivityType;
  module: HabitatModule;
  commStatus: CommStatus;
  isAnomaly: boolean;
  notes: string;
}

export interface MissionSummaryReport {
  generatedAt: string;
  mission: string;
  astronautId: string;
  astronautName: string;
  missionDay: number;
  missionDurationFormatted: string;
  totalDetections: number;
  activityBreakdown: Record<ActivityType, number>;
  totalActiveTimeFormatted: string;
  totalInactiveTimeFormatted: string;
  exerciseDurationFormatted: string;
  workingDurationFormatted: string;
  anomaliesDetectedCount: number;
  criticalAlertsCount: number;
  warningAlertsCount: number;
  communicationOutagesCount: number;
  totalOutageDurationFormatted: string;
  eventsStoredLocallyCount: number;
  eventsSynchronizedCount: number;
  systemAvailabilityPercentage: number;
  aiProcessingMode: string;
  autonomousPerformanceRating: string;
  conclusions: string[];
}

export interface SpacecraftTelemetry {
  timestamp: string;
  displayTime: string;
  cabinTemperature: number;
  cabinPressure: number;
  oxygenPct: number;
  co2Ppm: number;
  humidityPct: number;
  radiationRate: number;
  orbitAltitudeKm: number;
  orbitVelocityKmS: number;
  latitude: number;
  longitude: number;
  powerGeneratedKw: number;
  batteryStoragePct: number;
  signalStrengthDbm: number;
  solarFluxWm2: number;
  orbitalPeriodMins: number;
  dayNightCycle: 'DAYLIGHT' | 'ECLIPSE';
  groundStationInView: string;
}

export interface AsteroidObject {
  id: string;
  name: string;
  type: 'NEO' | 'PHA' | 'MAIN_BELT' | 'COMETARY';
  distanceLd: number;
  distanceKm: number;
  relativeVelocityKmS: number;
  estimatedDiameterM: number;
  riskLevel: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  torinoScale: number;
  observationStatus: 'TRACKING' | 'ACQUIRING' | 'RADAR_LOCKED' | 'ANOMALY_DETECTED';
  lastObservation: string;
  nextPass: string;
  trajectoryVector: { x: number; y: number; z: number };
  isAnomaly: boolean;
  anomalyDetails?: {
    title: string;
    description: string;
    detectedAt: string;
    evidence: string;
    aiRecommendation: string;
  };
}

export interface SpaceKnowledgeItem {
  id: string;
  category:
    | 'SPACE_BASICS'
    | 'MICROGRAVITY'
    | 'ASTRONAUT_SAFETY'
    | 'SPACECRAFT_SYSTEMS'
    | 'SATELLITES'
    | 'ORBIT'
    | 'COMMUNICATION'
    | 'SPACE_WEATHER'
    | 'SOLAR_ACTIVITY'
    | 'ASTEROIDS'
    | 'EARTH_OBSERVATION'
    | 'MISSION_OPERATIONS'
    | 'HUMAN_ACTIVITY_RECOGNITION'
    | 'EMERGENCY_PROCEDURES';
  keywords: string[];
  title: string;
  summary: string;
  content: string;
  source: string;
  verified: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'USER' | 'ASSISTANT' | 'SYSTEM' | 'ARES-1' | 'NOVA-2';
  text: string;
  timestamp: string;
  category?: string;
  sources?: Array<{
    title: string;
    category: string;
    type: 'VERIFIED_KNOWLEDGE' | 'SIMULATED_TELEMETRY' | 'AI_RECOMMENDATION' | 'SIMULATED_ROBOT' | 'SIMULATED_SCHEDULE';
  }>;
  recommendedAction?: string;
  isDecisionSupport?: boolean;
}

export interface LiveEventStreamItem {
  id: string;
  timestamp: string;
  displayTime: string;
  category: 'CREW' | 'TELEMETRY' | 'ANOMALY' | 'ASTEROID' | 'SYSTEM' | 'SYNC' | 'ROBOT';
  entityId: string;
  severity: 'NORMAL' | 'INFO' | 'WARNING' | 'CRITICAL';
  message: string;
  syncStatus: SyncStatus;
}

// === ADVANCED CREW & ROBOTIC ASSISTANT UPGRADE TYPES ===

export type RobotId = 'ARES-1' | 'NOVA-2';

export interface RobotState {
  id: RobotId;
  name: string;
  role: string;
  type: 'CREW_SUPPORT' | 'ENGINEERING_SUPPORT';
  status: 'ONLINE' | 'STANDBY' | 'PATROLLING' | 'INSPECTING' | 'ASSISTING' | 'AUTONOMOUS';
  batteryPct: number;
  location: HabitatModule;
  currentTask: string;
  mode: 'NORMAL' | 'AUTONOMOUS' | 'DIAGNOSTIC';
  subsystemHealth: 'OPTIMAL' | 'DEGRADED' | 'ATTENTION_REQUIRED';
  lastActionTime: string;
  actionsHistory: string[];
  personalityStyle: 'CALM_CREW_FOCUSED' | 'TECHNICAL_ANALYTICAL';
}

export interface RobotCommunicationMessage {
  id: string;
  timestamp: string;
  displayTime: string;
  from: RobotId;
  to: RobotId | 'CREW' | 'MISSION_CONTROL';
  message: string;
  priority: 'ROUTINE' | 'ELEVATED' | 'CRITICAL';
}

export interface RobotEvent {
  id: string;
  robotId: RobotId;
  robotName: string;
  timestamp: string;
  missionId: string;
  task: string;
  status: string;
  location: string;
  eventType: 'CREW_REMINDER' | 'TELEMETRY_ALERT' | 'EQUIPMENT_CHECK' | 'ROUTINE_ANNOUNCEMENT' | 'SAFETY_DISPATCH';
  description: string;
  communicationStatus: CommStatus;
  syncStatus: SyncStatus;
}

export interface CrewRoutineTask {
  id: string;
  astronautId: string;
  timeSlot: string;
  title: string;
  activityType: ActivityType;
  category: 'WORK' | 'EXERCISE' | 'MEAL' | 'REST' | 'SLEEP' | 'MISSION_TASK' | 'EQUIPMENT_OPERATION';
  module: HabitatModule;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  notes?: string;
}

export interface CrewScheduleOverview {
  astronautId: string;
  astronautName: string;
  currentActivity: string;
  nextActivity: string;
  nextWindowTime: string;
  laterActivity: string;
  laterWindowTime: string;
  tasks: CrewRoutineTask[];
}

export interface RoutineAnnouncement {
  id: string;
  timestamp: string;
  displayTime: string;
  astronautId?: string;
  announcementText: string;
  category: 'MEAL' | 'EXERCISE' | 'REST' | 'WORK' | 'INSPECTION' | 'GENERAL';
  sourceRobot: RobotId | 'VOICE_SYSTEM';
  spoken: boolean;
}

export interface CameraFeedState {
  id: 'CAM-01' | 'CAM-02' | 'CAM-03' | 'CAM-04';
  name: string;
  module: HabitatModule;
  label: string;
  isLive: boolean;
  assignedAstronautId: string;
  currentActivity: ActivityType;
  confidence: number;
  safetyStatus: 'NORMAL' | 'WARNING' | 'CRITICAL';
  movementState: 'STATIONARY' | 'TRANSLATING' | 'HIGH_KINETIC' | 'ERRATIC';
  fps: number;
  resolution: string;
  streamSource: 'SIMULATED' | 'WEBCAM' | 'LOCAL_VIDEO';
}

export interface VoiceCommandResult {
  transcript: string;
  understood: boolean;
  intent: string;
  responseText: string;
  spokenText: string;
  category: string;
  dataPayload?: any;
}

export interface AdvancedDemoStep {
  stepNumber: number;
  title: string;
  description: string;
  commStatus: CommStatus;
  activeRobot: RobotId;
  robotAction: string;
  crewActivity: string;
  notes: string;
}
