import { db } from '../database/db';
import { inferenceEngine } from '../ai/DemoInferenceEngine';
import { anomalyDetector } from '../anomaly/AnomalyDetector';
import { syncEngine } from '../sync/SyncEngine';
import { telemetrySimulator } from '../telemetry/TelemetrySimulator';
import { asteroidMonitor } from '../asteroid/AsteroidMonitor';
import { crewManager } from '../mission/CrewManager';
import { robotManager } from '../robots/RobotManager';
import { crewRoutineManager } from '../crew/CrewRoutineManager';
import {
  ActivityType,
  AstronautStatus,
  CommStatus,
  HabitatModule,
  MissionEvent,
  SyncStatus,
  LiveEventStreamItem,
  RobotId,
} from '../types';

export interface MissionDemoStep {
  stepNumber: number;
  title: string;
  description: string;
  activity: ActivityType;
  module: HabitatModule;
  commStatus: CommStatus;
  isAnomaly: boolean;
  notes: string;
  actionHook?: string;
}

export const DEMO_SCRIPT_STEPS: MissionDemoStep[] = [
  {
    stepNumber: 1,
    title: 'Step 1: Routine Transit (Walking)',
    description: 'Astronaut AST-01 transitions from Crew Quarters to Science Module.',
    activity: 'WALKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Ground link active. Normal telemetry downlink.',
  },
  {
    stepNumber: 2,
    title: 'Step 2: Microgravity Research (Working)',
    description: 'Conducting Biological & Activity Surveillance (BAS) incubation experiment.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Real-time Edge AI inference classifying fine motor manipulation.',
  },
  {
    stepNumber: 3,
    title: 'Step 3: Spacecraft Communication Blackout',
    description: 'Orbital geometry causes Deep Space / Ground Tracking Loss.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Earth Mission Control link severed. Zero cloud AI access.',
  },
  {
    stepNumber: 4,
    title: 'Step 4: Autonomous Onboard Mode Activated',
    description: 'AstroSense switches seamlessly to local edge intelligence mode.',
    activity: 'WORKING',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Local neural network inference continues at 24ms latency.',
  },
  {
    stepNumber: 5,
    title: 'Step 5: Edge AI Activity Recognition Continues',
    description: 'Operating station telemetry systems with zero external dependencies.',
    activity: 'OPERATING_EQUIPMENT',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Events stored in local offline queue. Unsynced counter increases.',
  },
  {
    stepNumber: 6,
    title: 'Step 6: Countermeasure Aerobic Workout',
    description: 'Mandatory microgravity bone density & cardiovascular workout.',
    activity: 'EXERCISING',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Vitals tracking heart rate spike to 142 bpm. Local classification 98.2%.',
  },
  {
    stepNumber: 7,
    title: 'Step 7: Sudden Kinetic Disruption / Abnormal Movement',
    description: 'High kinetic acceleration vector and sudden body tilt detected.',
    activity: 'FALL_ABNORMAL_MOVEMENT',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    notes: 'Anomaly engine triggers local rule-based safety classifier.',
  },
  {
    stepNumber: 8,
    title: 'Step 8: Critical Mission Safety Alert Triggered',
    description: 'Onboard audio/visual alert sounds inside habitat module.',
    activity: 'FALL_ABNORMAL_MOVEMENT',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    notes: 'Alert logged locally. No cloud needed for astronaut life safety.',
  },
  {
    stepNumber: 9,
    title: 'Step 9: Local SQLite Persistence & Unsynced Event Queueing',
    description: 'Events batched with cryptographic hash & timestamp for later sync.',
    activity: 'SITTING',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Unsynced queue holds all telemetry events safely on edge drive.',
  },
  {
    stepNumber: 10,
    title: 'Step 10: Ground Communication Link Restored',
    description: 'Spacecraft re-acquires TDRS / Ground Deep Space Network antenna.',
    activity: 'WALKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'AstroSense detects uplink availability. Sync engine alerts ready.',
  },
  {
    stepNumber: 11,
    title: 'Step 11: Autonomous Synchronization In Progress',
    description: 'Streaming pending event batches (0% -> 25% -> 50% -> 100%).',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Delay-tolerant synchronization reconciles mission timeline on Earth.',
  },
  {
    stepNumber: 12,
    title: 'Step 12: Mission Synchronization Complete',
    description: 'All local events marked SYNCED. Ground timeline fully reconstructed.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Unsynced queue returns to 0. Mission history verified.',
  },
  {
    stepNumber: 13,
    title: 'Step 13: Final Mission Aurora Telemetry Report',
    description: 'Comprehensive activity distribution, safety metrics, and audit log.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Ready for flight doctor review and data export (CSV/JSON).',
  },
];

export const EXTENDED_DEMO_SCRIPT_STEPS: MissionDemoStep[] = [
  {
    stepNumber: 1,
    title: 'Step 1: Mission Dashboard Overview',
    description: 'AstroSense initializes on Mission Aurora Day 042 with ground communication online.',
    activity: 'WALKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Nominal habitat telemetry streaming to Earth Ground Station.',
  },
  {
    stepNumber: 2,
    title: 'Step 2: AI Space Assistant Query',
    description: 'Querying local assistant: "What is happening on the mission right now?"',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Local Assistant synthesizes live telemetry and crew activity states.',
  },
  {
    stepNumber: 3,
    title: 'Step 3: Live Mission Telemetry & Orbital Track',
    description: 'Spacecraft telemetry tracking at 418.6 km altitude and 7.67 km/s velocity over DSN Goldstone.',
    activity: 'WORKING',
    module: 'WORKSTATION',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'ECLSS atmosphere (O2 20.9%, CO2 482 ppm, Pressure 101.3 kPa) nominal.',
  },
  {
    stepNumber: 4,
    title: 'Step 4: Multi-Crew Activity Monitoring',
    description: 'Real-time multi-astronaut monitoring for AST-01, AST-02, AST-03, and AST-04 across all modules.',
    activity: 'OPERATING_EQUIPMENT',
    module: 'CONTROL_MODULE',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Individual movement states, assigned tasks, and vitals tracked in real-time.',
  },
  {
    stepNumber: 5,
    title: 'Step 5: Communication Loss Blackout Triggered',
    description: 'Orbital tracking geometry severs Ground DSN connection. Signal level drops to blackout.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Earth Mission Control displays COMMUNICATION UNAVAILABLE.',
  },
  {
    stepNumber: 6,
    title: 'Step 6: Autonomous Onboard Mode Sustained',
    description: 'AstroSense edge intelligence maintains continuous activity recognition with zero cloud dependency.',
    activity: 'EXERCISING',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Events and telemetry snapshots are committed to local ACID SQLite storage.',
  },
  {
    stepNumber: 7,
    title: 'Step 7: Astronaut Kinetic Anomaly Detected',
    description: 'Sudden acceleration and loss of posture detected in microgravity exercise zone.',
    activity: 'FALL_ABNORMAL_MOVEMENT',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    notes: 'CRITICAL Mission Safety Alert sounds locally inside station module.',
  },
  {
    stepNumber: 8,
    title: 'Step 8: AI Decision Support Analysis',
    description: 'AI Mission Assistant generates structured evidence breakdown and recommended crew procedure.',
    activity: 'SITTING',
    module: 'EXERCISE_AREA',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Human-in-the-loop decision support provided without automated dangerous control.',
  },
  {
    stepNumber: 9,
    title: 'Step 9: Deep Space & Asteroid Radar Observation',
    description: 'AstroSense tracks 4 Near-Earth Objects (NEOs/PHAs) including 99942 Apophis-Sim.',
    activity: 'SITTING',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Radar Doppler metrics and distance vectors evaluated for orbital variance.',
  },
  {
    stepNumber: 10,
    title: 'Step 10: Asteroid Trajectory Anomaly Triggered',
    description: 'Simulated radar telemetry flags delta-V trajectory variance (+0.08 km/s) on ASTEROID-B07.',
    activity: 'OPERATING_EQUIPMENT',
    module: 'CONTROL_MODULE',
    commStatus: 'OFFLINE',
    isAnomaly: true,
    actionHook: 'ASTEROID_ANOMALY',
    notes: 'Alert logged to Live Anomaly Center with cross-verification recommendations.',
  },
  {
    stepNumber: 11,
    title: 'Step 11: Structured Decision-Support Recommendation',
    description: 'AI Assistant formulates step-by-step verification protocol for flight director review.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Human verification required tag explicitly preserved.',
  },
  {
    stepNumber: 12,
    title: 'Step 12: Ground Communication Link Restored',
    description: 'Spacecraft re-acquires DSN Madrid antenna; uplink/downlink carrier locked.',
    activity: 'WALKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Delay-Tolerant Synchronization Engine detects pending offline event batch.',
  },
  {
    stepNumber: 13,
    title: 'Step 13: Delay-Tolerant Ground Synchronization',
    description: 'Streaming multi-stage event bundle (0% -> 25% -> 50% -> 75% -> 100%).',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Earth Mission Control reconstructs mission timeline without data loss.',
  },
  {
    stepNumber: 14,
    title: 'Step 14: Final Mission Telemetry Report & Export',
    description: 'Comprehensive activity distributions, blackout resilience audit, and CSV/JSON downloads.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Mission verified: 100% autonomous edge safety continuity achieved.',
  },
];

export interface AdvancedMonitoringDemoStep {
  stepNumber: number;
  title: string;
  description: string;
  activity: ActivityType;
  module: HabitatModule;
  commStatus: CommStatus;
  isAnomaly: boolean;
  activeRobot?: RobotId;
  robotAction?: string;
  announcement?: string;
  actionHook?: string;
  notes: string;
}

export const ADVANCED_DEMO_SCRIPT_STEPS: AdvancedMonitoringDemoStep[] = [
  {
    stepNumber: 1,
    title: 'Step 1: Open Mission Monitor',
    description: 'Launch the unified Mission Monitor dashboard combining live video, telemetry, crew, robots, and timeline.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Real-time multi-subsystem control panel initialized.',
  },
  {
    stepNumber: 2,
    title: 'Step 2: Simulated Live Video & HAR Vision',
    description: 'Surveillance feeds (CAM-01 to CAM-04) stream live with human activity recognition bounding boxes and confidence overlays.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Camera feed labeled SIMULATED CAMERA FEED with real-time pose classification.',
  },
  {
    stepNumber: 3,
    title: 'Step 3: Multi-Crew Activity Monitoring',
    description: 'Simultaneous behavioral tracking of 4 astronauts (Elena, Marcus, Sarah, Kenji) across habitat modules.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Live vitals, movement states, and module locations synchronized.',
  },
  {
    stepNumber: 4,
    title: 'Step 4: ARES-1 Crew Support Robot Active',
    description: 'ARES-1 autonomous crew support robot monitors crew wellbeing and daily activity schedules in Laboratory.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    activeRobot: 'ARES-1',
    robotAction: 'PATROL',
    notes: 'ARES-1 logs routine posture and hydration reminders.',
  },
  {
    stepNumber: 5,
    title: 'Step 5: NOVA-2 Engineering Robot Active',
    description: 'NOVA-2 engineering robot runs 1Hz diagnostics across power distribution bus, ECLSS atmosphere, and asteroid radar.',
    activity: 'OPERATING_EQUIPMENT',
    module: 'CONTROL_MODULE',
    commStatus: 'ONLINE',
    isAnomaly: false,
    activeRobot: 'NOVA-2',
    robotAction: 'INSPECT',
    notes: 'NOVA-2 verifies 28V DC bus stability and radar track on 4 NEOs.',
  },
  {
    stepNumber: 6,
    title: 'Step 6: Voice Assistant Mission Status Query',
    description: 'Operator issues voice command: "What is the mission status?" -> Voice assistant synthesizes local status.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: '100% offline speech recognition and synthesis operating with local context.',
  },
  {
    stepNumber: 7,
    title: 'Step 7: Crew Routine Schedule Reminder',
    description: 'ARES-1 broadcasts acoustic routine reminder: "Attention crew: Scheduled nutrition period is approaching."',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    announcement: 'Attention crew. AST-01 scheduled nutrition window approaches at 12:30 UTC.',
    notes: 'Non-medical routine timetable optimization and crew circadian alignment.',
  },
  {
    stepNumber: 8,
    title: 'Step 8: Trigger Simulated Kinetic Anomaly',
    description: 'Simulate unexpected acceleration spike and loss of vertical posture for AST-01 in Module A.',
    activity: 'FALL_ABNORMAL_MOVEMENT',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: true,
    actionHook: 'TRIGGER_FALL',
    notes: 'Local anomaly detector triggers immediate habitat safety alert.',
  },
  {
    stepNumber: 9,
    title: 'Step 9: ARES-1 Autonomous Safety Response',
    description: 'ARES-1 detects fall anomaly and begins local crew verification protocol with acoustic confirmation.',
    activity: 'SITTING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: true,
    activeRobot: 'ARES-1',
    robotAction: 'ASSIST',
    notes: 'ARES-1 initiates verbal safety check without automated dangerous physical actuation.',
  },
  {
    stepNumber: 10,
    title: 'Step 10: NOVA-2 Secondary Telemetry Sweep',
    description: 'NOVA-2 cross-correlates habitat accelerometers and life support pressure to rule out hull impact.',
    activity: 'SITTING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: true,
    activeRobot: 'NOVA-2',
    robotAction: 'INSPECT',
    notes: 'Secondary telemetry confirmed nominal; anomaly isolated to crew kinetic slip.',
  },
  {
    stepNumber: 11,
    title: 'Step 11: Spacecraft Communication Blackout',
    description: 'Ground DSN connection drops to OFFLINE. Earth Mission Control displays COMMUNICATION UNAVAILABLE.',
    activity: 'WORKING',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Onboard node switches seamlessly to AUTONOMOUS ROBOT MODE ACTIVE.',
  },
  {
    stepNumber: 12,
    title: 'Step 12: Autonomous Robot Mode Sustained',
    description: 'Both ARES-1 and NOVA-2 continue autonomous patrols, telemetry logging, and inter-robot messaging.',
    activity: 'OPERATING_EQUIPMENT',
    module: 'WORKSTATION',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    activeRobot: 'NOVA-2',
    robotAction: 'PATROL',
    notes: 'Inter-robot communication log records local coordination messages.',
  },
  {
    stepNumber: 13,
    title: 'Step 13: Local ACID Event & Robot Storage',
    description: 'All crew activities, routine completions, and robot diagnostic events are buffered in local SQLite store.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'OFFLINE',
    isAnomaly: false,
    notes: 'Zero data loss during communication blackout. Pending sync counter increments.',
  },
  {
    stepNumber: 14,
    title: 'Step 14: Ground Communication Link Restored',
    description: 'Spacecraft re-acquires DSN tracking carrier. Link status switches to ONLINE.',
    activity: 'WALKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Delay-tolerant sync engine alerts ready to stream stored telemetry packets.',
  },
  {
    stepNumber: 15,
    title: 'Step 15: Synchronize Robot & Crew Events',
    description: 'Burst-synchronize all buffered offline events and robot logs to Earth Ground Mission Control (0% -> 100%).',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    actionHook: 'TRIGGER_SYNC',
    notes: 'Earth Mission Control database fully reconciled with zero gaps.',
  },
  {
    stepNumber: 16,
    title: 'Step 16: Comprehensive Mission Report & Export',
    description: 'Review final multi-subsystem mission audit report with robot diagnostics and export to CSV/JSON.',
    activity: 'WORKING',
    module: 'LABORATORY',
    commStatus: 'ONLINE',
    isAnomaly: false,
    notes: 'Complete demonstration of autonomous crew and robotic assistant architecture.',
  },
];

export class SimulationService {
  private static instance: SimulationService;
  private timerId: NodeJS.Timeout | null = null;
  private currentDemoStepIndex: number = 0;
  private isDemoRunning: boolean = false;
  private demoIntervalId: NodeJS.Timeout | null = null;
  private demoSpeedMultiplier: number = 1;

  // Extended Demo State
  private isExtendedDemoRunning: boolean = false;
  private currentExtendedStepIndex: number = 0;
  private extendedDemoIntervalId: NodeJS.Timeout | null = null;
  private extendedSpeedMultiplier: number = 1;

  // Advanced Monitoring Demo State (16 Steps)
  private isAdvancedDemoRunning: boolean = false;
  private currentAdvancedStepIndex: number = 0;
  private advancedDemoIntervalId: NodeJS.Timeout | null = null;
  private advancedSpeedMultiplier: number = 1;

  // Live rolling event stream cache
  private liveEventStream: LiveEventStreamItem[] = [];

  private constructor() {
    this.seedLiveEventStream();
    this.startBackgroundHeartbeat();
  }

  public static getInstance(): SimulationService {
    if (!SimulationService.instance) {
      SimulationService.instance = new SimulationService();
    }
    return SimulationService.instance;
  }

  private seedLiveEventStream(): void {
    const now = Date.now();
    const timeStr = (offsetSec: number) => new Date(now - offsetSec * 1000).toTimeString().split(' ')[0];

    this.liveEventStream = [
      {
        id: 'STREAM-01',
        timestamp: new Date(now - 120 * 1000).toISOString(),
        displayTime: timeStr(120),
        category: 'CREW',
        entityId: 'AST-01',
        severity: 'NORMAL',
        message: 'AST-01 → WORKING in Laboratory (Bio-Incubation)',
        syncStatus: 'SYNCED',
      },
      {
        id: 'STREAM-02',
        timestamp: new Date(now - 90 * 1000).toISOString(),
        displayTime: timeStr(90),
        category: 'TELEMETRY',
        entityId: 'TELEMETRY',
        severity: 'INFO',
        message: 'TELEMETRY → Cabin Atmosphere Nominal (101.3 kPa, 20.9% O2)',
        syncStatus: 'SYNCED',
      },
      {
        id: 'STREAM-03',
        timestamp: new Date(now - 60 * 1000).toISOString(),
        displayTime: timeStr(60),
        category: 'CREW',
        entityId: 'AST-04',
        severity: 'NORMAL',
        message: 'AST-04 → EXERCISING in Exercise Area (Cycle Ergometer)',
        syncStatus: 'SYNCED',
      },
      {
        id: 'STREAM-04',
        timestamp: new Date(now - 30 * 1000).toISOString(),
        displayTime: timeStr(30),
        category: 'ASTEROID',
        entityId: 'ASTEROID-B07',
        severity: 'INFO',
        message: 'ASTEROID → Radar lock acquired on 99942 Apophis-Sim (1.84 LD)',
        syncStatus: 'SYNCED',
      },
    ];
  }

  public getLiveEventStream(): LiveEventStreamItem[] {
    return this.liveEventStream.slice(0, 30);
  }

  public pushLiveStreamItem(item: Omit<LiveEventStreamItem, 'id' | 'timestamp' | 'displayTime'>): void {
    const now = new Date();
    const fullItem: LiveEventStreamItem = {
      ...item,
      id: `STREAM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: now.toISOString(),
      displayTime: now.toTimeString().split(' ')[0],
    };
    this.liveEventStream.unshift(fullItem);
    if (this.liveEventStream.length > 50) {
      this.liveEventStream.pop();
    }
  }

  private startBackgroundHeartbeat(): void {
    if (this.timerId) clearInterval(this.timerId);

    this.timerId = setInterval(() => {
      this.tick();
    }, 1000);
  }

  private tick(): void {
    const astro = db.getAstronaut('AST-01');
    const session = db.getSession();

    // 1. Tick telemetry simulator
    telemetrySimulator.tick(session.commStatus);

    // 2. Tick multi-crew manager
    crewManager.tick();

    // 3. Tick asteroid monitor
    asteroidMonitor.tick();

    // 4. Tick autonomous robots (ARES-1 & NOVA-2)
    robotManager.tick(session.commStatus === 'OFFLINE');

    // Increment elapsed time
    const newElapsedTime = session.missionElapsedTimeSeconds + 1;
    const newDuration = astro.activityDurationSeconds + 1;

    let outageSeconds = session.totalOutageSeconds;
    if (session.commStatus === 'OFFLINE') {
      outageSeconds += 1;
    }

    // Micro vital fluctuations based on activity
    let baseHr = 72;
    if (astro.currentActivity === 'EXERCISING') baseHr = 138 + Math.floor(Math.random() * 8);
    else if (astro.currentActivity === 'WALKING') baseHr = 92 + Math.floor(Math.random() * 6);
    else if (astro.currentActivity === 'FALL_ABNORMAL_MOVEMENT') baseHr = 118 + Math.floor(Math.random() * 10);
    else if (astro.currentActivity === 'SLEEPING_RESTING') baseHr = 58 + Math.floor(Math.random() * 4);
    else baseHr = 72 + Math.floor(Math.random() * 5);

    // Update astronaut stats
    const stats = { ...astro.stats };
    if (astro.currentActivity === 'EXERCISING') stats.exerciseSeconds += 1;
    else if (astro.currentActivity === 'WORKING' || astro.currentActivity === 'OPERATING_EQUIPMENT') stats.workingSeconds += 1;
    else if (astro.currentActivity === 'SLEEPING_RESTING') stats.sleepingSeconds += 1;
    else if (astro.currentActivity === 'EATING' || astro.currentActivity === 'DRINKING') stats.eatingDrinkingSeconds += 1;

    if (['WALKING', 'EXERCISING', 'WORKING', 'OPERATING_EQUIPMENT', 'PICKING_CARRYING'].includes(astro.currentActivity)) {
      stats.totalActiveSeconds += 1;
    } else {
      stats.totalInactiveSeconds += 1;
    }

    db.updateAstronaut(astro.id, {
      activityDurationSeconds: newDuration,
      vitals: {
        ...astro.vitals,
        heartRate: baseHr,
        metabolicKcalHour: Math.round(baseHr * 1.6),
      },
      stats,
    });

    db.updateSession(session.id, {
      missionElapsedTimeSeconds: newElapsedTime,
      totalOutageSeconds: outageSeconds,
    });
  }

  public setCommStatus(status: CommStatus): { commStatus: CommStatus; autonomousModeActive: boolean } {
    const session = db.getSession();
    const astro = db.getAstronaut();
    const now = new Date();
    const iso = now.toISOString();
    const displayTime = now.toTimeString().split(' ')[0];

    const autonomousModeActive = status === 'OFFLINE';

    db.updateSession(session.id, {
      commStatus: status,
      autonomousModeActive,
      commLossTimestamp: status === 'OFFLINE' ? iso : session.commLossTimestamp,
      commRestoreTimestamp: status === 'ONLINE' ? iso : session.commRestoreTimestamp,
    });

    // Record system event in timeline
    db.addEvent({
      astronautId: astro.id,
      timestamp: iso,
      displayTime,
      activity: astro.currentActivity,
      confidence: 100,
      durationSeconds: 0,
      severity: status === 'OFFLINE' ? 'WARNING' : 'INFO',
      module: astro.currentModule,
      syncStatus: status === 'ONLINE' ? 'SYNCED' : 'PENDING',
      source: 'ONBOARD_COMMS_SUBSYSTEM',
      processingMode: 'ONBOARD_EDGE_AI',
      details: status === 'OFFLINE'
        ? 'GROUND COMMUNICATION LOST - Switched to Autonomous Onboard Mode.'
        : 'GROUND LINK RESTORED - Earth telemetry synchronization available.',
    });

    this.pushLiveStreamItem({
      category: 'SYSTEM',
      entityId: 'COMMS',
      severity: status === 'OFFLINE' ? 'WARNING' : 'INFO',
      message: status === 'OFFLINE' ? 'COMMUNICATION LOST → Autonomous Mode Active' : 'COMMUNICATION RESTORED → Downlink Ready',
      syncStatus: status === 'ONLINE' ? 'SYNCED' : 'PENDING',
    });

    // Auto sync on restore if enabled
    if (status === 'ONLINE' && session.autoSyncOnRestore && session.unsyncedEventCount > 0) {
      setTimeout(() => {
        syncEngine.triggerSynchronization().catch(console.error);
      }, 500);
    }

    return { commStatus: status, autonomousModeActive };
  }

  public async recordActivity(
    activity: ActivityType,
    module?: HabitatModule,
    customConfidence?: number
  ): Promise<MissionEvent> {
    const astro = db.getAstronaut('AST-01');
    const session = db.getSession();
    const now = new Date();
    const iso = now.toISOString();
    const displayTime = now.toTimeString().split(' ')[0];

    const targetModule = module || astro.currentModule;
    const confidence = customConfidence || 94.0 + Math.round(Math.random() * 55) / 10;
    const syncStatus: SyncStatus = session.commStatus === 'ONLINE' ? 'SYNCED' : 'PENDING';

    const previousActivity = astro.currentActivity;

    // Check for anomaly
    const anomalyEval = anomalyDetector.evaluateActivity(
      astro.id,
      activity,
      confidence,
      0,
      targetModule,
      session.commStatus,
      previousActivity
    );

    let eventSeverity: 'INFO' | 'WARNING' | 'CRITICAL' = 'INFO';
    if (anomalyEval.isAnomaly && anomalyEval.alert) {
      eventSeverity = anomalyEval.alert.severity;
      db.addAnomaly(anomalyEval.alert);
      robotManager.onAnomalyDetected(anomalyEval.alert);
    }

    // Update astronaut
    db.updateAstronaut(astro.id, {
      currentActivity: activity,
      lastActivity: previousActivity,
      currentModule: targetModule,
      activityConfidence: confidence,
      activityDurationSeconds: 0,
      currentStatus: eventSeverity === 'CRITICAL' ? 'CRITICAL' : eventSeverity === 'WARNING' ? 'WARNING' : 'NORMAL',
    });

    // Log Mission Event
    const event = db.addEvent({
      astronautId: astro.id,
      timestamp: iso,
      displayTime,
      activity,
      confidence,
      durationSeconds: 0,
      severity: eventSeverity,
      module: targetModule,
      syncStatus,
      source: `ONBOARD_BAS_CAMERA_${targetModule.substring(0, 4)}`,
      processingMode: 'ONBOARD_EDGE_AI',
      details: anomalyEval.isAnomaly
        ? `[ALERT] ${anomalyEval.alert?.title}: ${anomalyEval.alert?.description}`
        : `Edge AI identified ${activity} with ${confidence}% confidence.`,
    });

    this.pushLiveStreamItem({
      category: anomalyEval.isAnomaly ? 'ANOMALY' : 'CREW',
      entityId: astro.id,
      severity: eventSeverity,
      message: `${astro.id} → ${activity.replace(/_/g, ' ')} in ${targetModule.replace(/_/g, ' ')}`,
      syncStatus,
    });

    return event;
  }

  // Original Judge Demo Runner (2-3 Minutes)
  public getDemoStatus() {
    return {
      isRunning: this.isDemoRunning,
      currentStepIndex: this.currentDemoStepIndex,
      totalSteps: DEMO_SCRIPT_STEPS.length,
      currentStep: DEMO_SCRIPT_STEPS[this.currentDemoStepIndex] || null,
      speedMultiplier: this.demoSpeedMultiplier,
    };
  }

  public startJudgeDemo(speedMultiplier = 1): void {
    this.stopJudgeDemo();
    this.stopExtendedDemo();
    this.isDemoRunning = true;
    this.currentDemoStepIndex = 0;
    this.demoSpeedMultiplier = speedMultiplier;

    this.executeDemoStep(0);

    const stepIntervalMs = Math.max(1500, Math.round(5000 / this.demoSpeedMultiplier));

    this.demoIntervalId = setInterval(() => {
      this.currentDemoStepIndex += 1;
      if (this.currentDemoStepIndex >= DEMO_SCRIPT_STEPS.length) {
        this.stopJudgeDemo();
        return;
      }
      this.executeDemoStep(this.currentDemoStepIndex);
    }, stepIntervalMs);
  }

  public stepJudgeDemo(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < DEMO_SCRIPT_STEPS.length) {
      this.currentDemoStepIndex = stepIndex;
      this.executeDemoStep(stepIndex);
    }
  }

  public stopJudgeDemo(): void {
    if (this.demoIntervalId) {
      clearInterval(this.demoIntervalId);
      this.demoIntervalId = null;
    }
    this.isDemoRunning = false;
  }

  private executeDemoStep(index: number): void {
    const step = DEMO_SCRIPT_STEPS[index];
    if (!step) return;

    // Apply comm status
    const session = db.getSession();
    if (session.commStatus !== step.commStatus) {
      this.setCommStatus(step.commStatus);
    }

    // Record the activity
    this.recordActivity(step.activity, step.module);

    // If step is Step 11 (Syncing), trigger sync
    if (step.stepNumber === 11) {
      syncEngine.triggerSynchronization().catch(console.error);
    }
  }

  // Extended Space Demo Runner (3-5 Minutes)
  public getExtendedDemoStatus() {
    return {
      isRunning: this.isExtendedDemoRunning,
      currentStepIndex: this.currentExtendedStepIndex,
      totalSteps: EXTENDED_DEMO_SCRIPT_STEPS.length,
      currentStep: EXTENDED_DEMO_SCRIPT_STEPS[this.currentExtendedStepIndex] || null,
      speedMultiplier: this.extendedSpeedMultiplier,
    };
  }

  public startExtendedDemo(speedMultiplier = 1): void {
    this.stopJudgeDemo();
    this.stopExtendedDemo();
    this.isExtendedDemoRunning = true;
    this.currentExtendedStepIndex = 0;
    this.extendedSpeedMultiplier = speedMultiplier;

    this.executeExtendedStep(0);

    const stepIntervalMs = Math.max(2000, Math.round(6000 / this.extendedSpeedMultiplier));

    this.extendedDemoIntervalId = setInterval(() => {
      this.currentExtendedStepIndex += 1;
      if (this.currentExtendedStepIndex >= EXTENDED_DEMO_SCRIPT_STEPS.length) {
        this.stopExtendedDemo();
        return;
      }
      this.executeExtendedStep(this.currentExtendedStepIndex);
    }, stepIntervalMs);
  }

  public stepExtendedDemo(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < EXTENDED_DEMO_SCRIPT_STEPS.length) {
      this.currentExtendedStepIndex = stepIndex;
      this.executeExtendedStep(stepIndex);
    }
  }

  public stopExtendedDemo(): void {
    if (this.extendedDemoIntervalId) {
      clearInterval(this.extendedDemoIntervalId);
      this.extendedDemoIntervalId = null;
    }
    this.isExtendedDemoRunning = false;
  }

  private executeExtendedStep(index: number): void {
    const step = EXTENDED_DEMO_SCRIPT_STEPS[index];
    if (!step) return;

    const session = db.getSession();
    if (session.commStatus !== step.commStatus) {
      this.setCommStatus(step.commStatus);
    }

    if (step.actionHook === 'ASTEROID_ANOMALY') {
      asteroidMonitor.triggerAsteroidAnomaly('ASTEROID-B07');
    }

    this.recordActivity(step.activity, step.module);

    if (step.stepNumber === 13) {
      syncEngine.triggerSynchronization().catch(console.error);
    }
  }

  // Advanced Monitoring Demo Runner (16 Steps)
  public getAdvancedDemoStatus() {
    return {
      isRunning: this.isAdvancedDemoRunning,
      currentStepIndex: this.currentAdvancedStepIndex,
      totalSteps: ADVANCED_DEMO_SCRIPT_STEPS.length,
      currentStep: ADVANCED_DEMO_SCRIPT_STEPS[this.currentAdvancedStepIndex] || null,
      speedMultiplier: this.advancedSpeedMultiplier,
    };
  }

  public startAdvancedDemo(speedMultiplier = 1): void {
    this.stopJudgeDemo();
    this.stopExtendedDemo();
    this.stopAdvancedDemo();
    this.isAdvancedDemoRunning = true;
    this.currentAdvancedStepIndex = 0;
    this.advancedSpeedMultiplier = speedMultiplier;

    this.executeAdvancedStep(0);

    const stepIntervalMs = Math.max(2000, Math.round(5500 / this.advancedSpeedMultiplier));

    this.advancedDemoIntervalId = setInterval(() => {
      this.currentAdvancedStepIndex += 1;
      if (this.currentAdvancedStepIndex >= ADVANCED_DEMO_SCRIPT_STEPS.length) {
        this.stopAdvancedDemo();
        return;
      }
      this.executeAdvancedStep(this.currentAdvancedStepIndex);
    }, stepIntervalMs);
  }

  public stepAdvancedDemo(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < ADVANCED_DEMO_SCRIPT_STEPS.length) {
      this.currentAdvancedStepIndex = stepIndex;
      this.executeAdvancedStep(stepIndex);
    }
  }

  public stopAdvancedDemo(): void {
    if (this.advancedDemoIntervalId) {
      clearInterval(this.advancedDemoIntervalId);
      this.advancedDemoIntervalId = null;
    }
    this.isAdvancedDemoRunning = false;
  }

  private executeAdvancedStep(index: number): void {
    const step = ADVANCED_DEMO_SCRIPT_STEPS[index];
    if (!step) return;

    const session = db.getSession();
    if (session.commStatus !== step.commStatus) {
      this.setCommStatus(step.commStatus);
    }

    if (step.activeRobot && step.robotAction) {
      const validActions = ['START', 'PAUSE', 'RETURN', 'PATROL', 'INSPECT', 'ASSIST', 'STATUS'] as const;
      const action = validActions.includes(step.robotAction as any) ? (step.robotAction as any) : 'PATROL';
      robotManager.sendRobotAction(step.activeRobot, action, step.module);
    }

    if (step.announcement) {
      crewRoutineManager.triggerAnnouncement(step.announcement, 'GENERAL');
    }

    if (step.actionHook === 'TRIGGER_FALL') {
      this.recordActivity('FALL_ABNORMAL_MOVEMENT', step.module);
    } else if (step.actionHook === 'TRIGGER_SYNC') {
      syncEngine.triggerSynchronization().catch(console.error);
    } else {
      this.recordActivity(step.activity, step.module);
    }
  }
}

export const simulationService = SimulationService.getInstance();
