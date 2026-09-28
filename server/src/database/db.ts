import fs from 'fs';
import path from 'path';
import {
  Astronaut,
  MissionEvent,
  AnomalyAlert,
  MissionSession,
  SyncStatus,
  CommStatus,
  ActivityType,
  HabitatModule,
} from '../types';

interface DatabaseSchema {
  astronauts: Record<string, Astronaut>;
  mission_events: MissionEvent[];
  anomalies: AnomalyAlert[];
  sync_queue: Array<{
    id: string;
    eventId: string;
    entityType: 'EVENT' | 'ANOMALY' | 'VITALS';
    payload: any;
    queuedAt: string;
    status: SyncStatus;
    syncedAt?: string;
  }>;
  mission_sessions: Record<string, MissionSession>;
  sync_history: Array<{
    id: string;
    timestamp: string;
    batchSize: number;
    durationMs: number;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
  }>;
  robot_events?: Array<{
    id: string;
    robotId: string;
    robotName: string;
    timestamp: string;
    missionId: string;
    task: string;
    status: string;
    location: string;
    eventType: string;
    description: string;
    communicationStatus: CommStatus;
    syncStatus: SyncStatus;
  }>;
  crew_tasks?: Array<any>;
}

const DATA_DIR = path.resolve(__dirname, '../../../data');
const DB_FILE = path.join(DATA_DIR, 'astrosense_db.json');

const INITIAL_ASTRONAUT: Astronaut = {
  id: 'AST-01',
  name: 'Dr. Elena Vance',
  role: 'Payload Commander & Astrobiologist',
  mission: 'MISSION AURORA',
  missionDay: 42,
  currentModule: 'LABORATORY',
  currentActivity: 'WORKING',
  activityConfidence: 96.4,
  currentStatus: 'NORMAL',
  activityDurationSeconds: 145,
  lastActivity: 'WALKING',
  vitals: {
    heartRate: 74,
    spO2: 99,
    bodyTemp: 36.8,
    respiratoryRate: 15,
    metabolicKcalHour: 110,
  },
  stats: {
    totalActiveSeconds: 18400,
    totalInactiveSeconds: 12200,
    exerciseSeconds: 4200,
    workingSeconds: 11800,
    eatingDrinkingSeconds: 2400,
    sleepingSeconds: 28800,
    anomaliesDetected: 0,
    totalDetections: 48,
  },
};

const INITIAL_SESSION: MissionSession = {
  id: 'SESSION-AURORA-042',
  missionName: 'MISSION AURORA',
  astronautId: 'AST-01',
  missionDay: 42,
  missionElapsedTimeSeconds: 28540,
  startedAt: new Date(Date.now() - 28540 * 1000).toISOString(),
  commStatus: 'ONLINE',
  autonomousModeActive: false,
  unsyncedEventCount: 0,
  totalEventsCount: 0,
  syncProgress: 100,
  isSyncing: false,
  activeInputMode: 'SIMULATION',
  inactivityThresholdSeconds: 900,
  anomalySensitivity: 'MEDIUM',
  autoSyncOnRestore: true,
  totalOutageSeconds: 0,
};

class LocalDatabase {
  private data: DatabaseSchema;
  private isWriting: boolean = false;

  constructor() {
    this.ensureDataDirectory();
    this.data = this.loadDatabase();
    if (!this.data.astronauts['AST-01']) {
      this.seedInitialData();
    }
  }

  private ensureDataDirectory(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const fileContent = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(fileContent);
      }
    } catch (err) {
      console.warn('Could not read existing database file, creating fresh store:', err);
    }
    return {
      astronauts: {},
      mission_events: [],
      anomalies: [],
      sync_queue: [],
      mission_sessions: {},
      sync_history: [],
    };
  }

  public persist(): void {
    try {
      this.ensureDataDirectory();
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database:', err);
    }
  }

  public seedInitialData(): void {
    const now = Date.now();
    const iso = (offsetMinutes: number) => new Date(now - offsetMinutes * 60 * 1000).toISOString();
    const timeStr = (offsetMinutes: number) => {
      const d = new Date(now - offsetMinutes * 60 * 1000);
      return d.toTimeString().split(' ')[0];
    };

    this.data.astronauts['AST-01'] = { ...INITIAL_ASTRONAUT };
    this.data.mission_sessions['SESSION-AURORA-042'] = { ...INITIAL_SESSION };

    // Initial baseline events (synced historical events)
    this.data.mission_events = [
      {
        id: 'EVT-001',
        astronautId: 'AST-01',
        timestamp: iso(60),
        displayTime: timeStr(60),
        activity: 'SLEEPING_RESTING',
        confidence: 99.2,
        durationSeconds: 1800,
        severity: 'INFO',
        module: 'CREW_QUARTERS',
        syncStatus: 'SYNCED',
        source: 'ONBOARD_BAS_CAMERA_CQ1',
        processingMode: 'ONBOARD_EDGE_AI',
        details: 'Crew wake cycle initiated according to flight plan.',
        syncedAt: iso(30),
      },
      {
        id: 'EVT-002',
        astronautId: 'AST-01',
        timestamp: iso(45),
        displayTime: timeStr(45),
        activity: 'EATING',
        confidence: 95.8,
        durationSeconds: 900,
        severity: 'INFO',
        module: 'CREW_QUARTERS',
        syncStatus: 'SYNCED',
        source: 'ONBOARD_BAS_CAMERA_CQ1',
        processingMode: 'ONBOARD_EDGE_AI',
        details: 'Nutrition and hydration intake logged.',
        syncedAt: iso(30),
      },
      {
        id: 'EVT-003',
        astronautId: 'AST-01',
        timestamp: iso(30),
        displayTime: timeStr(30),
        activity: 'WALKING',
        confidence: 97.4,
        durationSeconds: 120,
        severity: 'INFO',
        module: 'LABORATORY',
        syncStatus: 'SYNCED',
        source: 'ONBOARD_BAS_CAMERA_LAB',
        processingMode: 'ONBOARD_EDGE_AI',
        details: 'Transit from Crew Quarters to Science Module.',
        syncedAt: iso(25),
      },
      {
        id: 'EVT-004',
        astronautId: 'AST-01',
        timestamp: iso(15),
        displayTime: timeStr(15),
        activity: 'OPERATING_EQUIPMENT',
        confidence: 94.1,
        durationSeconds: 900,
        severity: 'INFO',
        module: 'LABORATORY',
        syncStatus: 'SYNCED',
        source: 'ONBOARD_BAS_CAMERA_LAB',
        processingMode: 'ONBOARD_EDGE_AI',
        details: 'Microgravity biological sample incubation setup.',
        syncedAt: iso(10),
      },
      {
        id: 'EVT-005',
        astronautId: 'AST-01',
        timestamp: iso(2),
        displayTime: timeStr(2),
        activity: 'WORKING',
        confidence: 96.4,
        durationSeconds: 145,
        severity: 'INFO',
        module: 'LABORATORY',
        syncStatus: 'SYNCED',
        source: 'ONBOARD_BAS_CAMERA_LAB',
        processingMode: 'ONBOARD_EDGE_AI',
        details: 'Active data logging and telemetry review.',
        syncedAt: iso(1),
      },
    ];

    this.data.anomalies = [];
    this.data.sync_queue = [];
    this.data.sync_history = [
      {
        id: 'SYNC-HIST-001',
        timestamp: iso(10),
        batchSize: 5,
        durationMs: 420,
        status: 'SUCCESS',
      },
    ];

    this.data.mission_sessions['SESSION-AURORA-042'].totalEventsCount = this.data.mission_events.length;
    this.data.mission_sessions['SESSION-AURORA-042'].unsyncedEventCount = 0;

    this.persist();
  }

  // Astronaut methods
  public getAstronaut(id = 'AST-01'): Astronaut {
    if (!this.data.astronauts[id]) {
      this.data.astronauts[id] = { ...INITIAL_ASTRONAUT, id };
      this.persist();
    }
    return this.data.astronauts[id];
  }

  public updateAstronaut(id: string, updates: Partial<Astronaut>): Astronaut {
    const astro = this.getAstronaut(id);
    this.data.astronauts[id] = {
      ...astro,
      ...updates,
      vitals: {
        ...astro.vitals,
        ...(updates.vitals || {}),
      },
      stats: {
        ...astro.stats,
        ...(updates.stats || {}),
      },
    };
    this.persist();
    return this.data.astronauts[id];
  }

  // Session methods
  public getSession(id = 'SESSION-AURORA-042'): MissionSession {
    if (!this.data.mission_sessions[id]) {
      this.data.mission_sessions[id] = { ...INITIAL_SESSION, id };
      this.persist();
    }
    // Update live counts
    const pendingCount = this.data.mission_events.filter(e => e.syncStatus === 'PENDING').length;
    this.data.mission_sessions[id].unsyncedEventCount = pendingCount;
    this.data.mission_sessions[id].totalEventsCount = this.data.mission_events.length;
    return this.data.mission_sessions[id];
  }

  public updateSession(id: string, updates: Partial<MissionSession>): MissionSession {
    const session = this.getSession(id);
    this.data.mission_sessions[id] = {
      ...session,
      ...updates,
    };
    this.persist();
    return this.data.mission_sessions[id];
  }

  // Events methods
  public getEvents(filter?: {
    syncStatus?: SyncStatus;
    severity?: string;
    limit?: number;
    activity?: ActivityType;
  }): MissionEvent[] {
    let events = [...this.data.mission_events];

    if (filter?.syncStatus) {
      events = events.filter(e => e.syncStatus === filter.syncStatus);
    }
    if (filter?.severity) {
      events = events.filter(e => e.severity === filter.severity);
    }
    if (filter?.activity) {
      events = events.filter(e => e.activity === filter.activity);
    }

    // Sort descending by timestamp
    events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (filter?.limit && filter.limit > 0) {
      return events.slice(0, filter.limit);
    }
    return events;
  }

  public addEvent(event: Omit<MissionEvent, 'id'> & { id?: string }): MissionEvent {
    const eventId = event.id || `EVT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;
    const newEvent: MissionEvent = {
      ...event,
      id: eventId,
    };

    this.data.mission_events.unshift(newEvent);

    // If pending sync, add to sync queue
    if (newEvent.syncStatus === 'PENDING') {
      this.data.sync_queue.push({
        id: `QUEUE-${eventId}`,
        eventId: newEvent.id,
        entityType: 'EVENT',
        payload: newEvent,
        queuedAt: newEvent.timestamp,
        status: 'PENDING',
      });
    }

    // Update session unsynced count
    const session = this.getSession();
    session.totalEventsCount = this.data.mission_events.length;
    session.unsyncedEventCount = this.data.mission_events.filter(e => e.syncStatus === 'PENDING').length;

    this.persist();
    return newEvent;
  }

  // Anomalies methods
  public getAnomalies(filter?: { severity?: string; resolved?: boolean; limit?: number }): AnomalyAlert[] {
    let anomalies = [...this.data.anomalies];
    if (filter?.severity) {
      anomalies = anomalies.filter(a => a.severity === filter.severity);
    }
    if (filter?.resolved !== undefined) {
      anomalies = anomalies.filter(a => a.resolved === filter.resolved);
    }
    anomalies.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    if (filter?.limit) {
      return anomalies.slice(0, filter.limit);
    }
    return anomalies;
  }

  public addAnomaly(anomaly: Omit<AnomalyAlert, 'id'> & { id?: string }): AnomalyAlert {
    const anomalyId = anomaly.id || `ANOM-${Date.now().toString(36).toUpperCase()}`;
    const newAnomaly: AnomalyAlert = {
      ...anomaly,
      id: anomalyId,
    };
    this.data.anomalies.unshift(newAnomaly);

    // Also add to sync queue if pending
    if (newAnomaly.syncStatus === 'PENDING') {
      this.data.sync_queue.push({
        id: `QUEUE-${anomalyId}`,
        eventId: newAnomaly.id,
        entityType: 'ANOMALY',
        payload: newAnomaly,
        queuedAt: newAnomaly.timestamp,
        status: 'PENDING',
      });
    }

    // Update astronaut stats
    const astro = this.getAstronaut(newAnomaly.astronautId);
    this.updateAstronaut(astro.id, {
      currentStatus: newAnomaly.severity === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      stats: {
        ...astro.stats,
        anomaliesDetected: astro.stats.anomaliesDetected + 1,
      },
    });

    this.persist();
    return newAnomaly;
  }

  public resolveAnomaly(id: string): boolean {
    const anomaly = this.data.anomalies.find(a => a.id === id);
    if (anomaly) {
      anomaly.resolved = true;
      const astro = this.getAstronaut(anomaly.astronautId);
      const remainingActive = this.data.anomalies.filter(a => !a.resolved && a.astronautId === astro.id);
      if (remainingActive.length === 0) {
        this.updateAstronaut(astro.id, { currentStatus: 'NORMAL' });
      } else if (remainingActive.some(a => a.severity === 'CRITICAL')) {
        this.updateAstronaut(astro.id, { currentStatus: 'CRITICAL' });
      } else {
        this.updateAstronaut(astro.id, { currentStatus: 'WARNING' });
      }
      this.persist();
      return true;
    }
    return false;
  }

  // Sync queue methods
  public getPendingSyncItems(): Array<{
    id: string;
    eventId: string;
    entityType: 'EVENT' | 'ANOMALY' | 'VITALS';
    payload: any;
    queuedAt: string;
    status: SyncStatus;
  }> {
    return this.data.sync_queue.filter(q => q.status === 'PENDING');
  }

  public markBatchSynced(eventIds: string[]): number {
    const nowIso = new Date().toISOString();
    let count = 0;

    for (const evt of this.data.mission_events) {
      if (eventIds.includes(evt.id) || eventIds.length === 0) {
        if (evt.syncStatus === 'PENDING') {
          evt.syncStatus = 'SYNCED';
          evt.syncedAt = nowIso;
          count++;
        }
      }
    }

    for (const anom of this.data.anomalies) {
      if (eventIds.includes(anom.id) || eventIds.length === 0) {
        if (anom.syncStatus === 'PENDING') {
          anom.syncStatus = 'SYNCED';
        }
      }
    }

    if (this.data.robot_events) {
      for (const rEvt of this.data.robot_events) {
        if (eventIds.includes(rEvt.id) || eventIds.length === 0) {
          if (rEvt.syncStatus === 'PENDING') {
            rEvt.syncStatus = 'SYNCED';
            count++;
          }
        }
      }
    }

    for (const queueItem of this.data.sync_queue) {
      if (eventIds.includes(queueItem.eventId) || eventIds.length === 0) {
        queueItem.status = 'SYNCED';
        queueItem.syncedAt = nowIso;
      }
    }

    // Record sync history
    this.data.sync_history.unshift({
      id: `SYNC-${Date.now()}`,
      timestamp: nowIso,
      batchSize: count,
      durationMs: 400 + Math.floor(Math.random() * 300),
      status: 'SUCCESS',
    });

    const session = this.getSession();
    session.unsyncedEventCount = this.data.mission_events.filter(e => e.syncStatus === 'PENDING').length;
    session.syncProgress = 100;
    session.isSyncing = false;

    this.persist();
    return count;
  }

  public addRobotEvent(evt: any): any {
    if (!this.data.robot_events) this.data.robot_events = [];
    this.data.robot_events.unshift(evt);
    this.persist();
    return evt;
  }

  public getRobotEvents(limit = 50): any[] {
    if (!this.data.robot_events) this.data.robot_events = [];
    return this.data.robot_events.slice(0, limit);
  }

  public getSyncHistory() {
    return this.data.sync_history;
  }

  public resetAll(): void {
    this.seedInitialData();
  }

  public getRawData(): DatabaseSchema {
    return this.data;
  }
}

export const db = new LocalDatabase();
