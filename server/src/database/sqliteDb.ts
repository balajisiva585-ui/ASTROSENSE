import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import {
  Astronaut,
  MissionEvent,
  AnomalyAlert,
  MissionSession,
  SyncStatus,
  CommStatus,
} from '../types';

const DATA_DIR = path.resolve(__dirname, '../../../data');
const SQLITE_FILE = path.join(DATA_DIR, 'astrosense_local.sqlite');

export interface SqliteStatus {
  status: 'ONLINE' | 'ERROR';
  mode: 'PRIMARY_LOCAL_RESILIENT';
  path: string;
  tablesCount: number;
  totalRecordsCount: number;
  lastChecked: string;
  tableCounts: Record<string, number>;
}

export class SqliteService {
  private static instance: SqliteService;
  private db: DatabaseSync | null = null;
  private isInitialized = false;

  private constructor() {
    this.ensureDataDir();
    this.initDatabase();
  }

  public static getInstance(): SqliteService {
    if (!SqliteService.instance) {
      SqliteService.instance = new SqliteService();
    }
    return SqliteService.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private initDatabase(): void {
    try {
      this.ensureDataDir();
      this.db = new DatabaseSync(SQLITE_FILE);

      // Execute schema initialization
      this.db.exec(`
        -- 1. astronauts
        CREATE TABLE IF NOT EXISTS astronauts (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          role TEXT NOT NULL,
          mission TEXT NOT NULL,
          mission_day INTEGER NOT NULL DEFAULT 1,
          current_module TEXT NOT NULL,
          current_activity TEXT NOT NULL,
          activity_confidence REAL NOT NULL DEFAULT 95.0,
          current_status TEXT NOT NULL DEFAULT 'NORMAL',
          activity_duration_seconds INTEGER NOT NULL DEFAULT 0,
          last_activity TEXT NOT NULL,
          vitals_json TEXT NOT NULL DEFAULT '{}',
          stats_json TEXT NOT NULL DEFAULT '{}',
          updated_at TEXT NOT NULL
        );

        -- 2. activity_events
        CREATE TABLE IF NOT EXISTS activity_events (
          id TEXT PRIMARY KEY,
          astronaut_id TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          display_time TEXT NOT NULL,
          activity TEXT NOT NULL,
          confidence REAL NOT NULL,
          duration_seconds INTEGER NOT NULL DEFAULT 0,
          severity TEXT NOT NULL DEFAULT 'INFO',
          module TEXT NOT NULL,
          sync_status TEXT NOT NULL DEFAULT 'PENDING',
          source TEXT NOT NULL,
          processing_mode TEXT NOT NULL DEFAULT 'ONBOARD_EDGE_AI',
          details TEXT,
          synced_at TEXT,
          recommended_action TEXT
        );

        -- 3. anomaly_events
        CREATE TABLE IF NOT EXISTS anomaly_events (
          id TEXT PRIMARY KEY,
          astronaut_id TEXT,
          target_object TEXT,
          target_type TEXT,
          timestamp TEXT NOT NULL,
          display_time TEXT NOT NULL,
          title TEXT NOT NULL,
          category TEXT NOT NULL,
          severity TEXT NOT NULL,
          activity TEXT,
          module TEXT,
          description TEXT NOT NULL,
          recommended_action TEXT,
          resolved INTEGER NOT NULL DEFAULT 0,
          sync_status TEXT NOT NULL DEFAULT 'PENDING',
          synced_at TEXT
        );

        -- 4. telemetry
        CREATE TABLE IF NOT EXISTS telemetry (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          display_time TEXT NOT NULL,
          cabin_temperature REAL,
          cabin_pressure REAL,
          oxygen_pct REAL,
          co2_ppm REAL,
          humidity_pct REAL,
          radiation_rate REAL,
          orbit_altitude_km REAL,
          orbit_velocity_km_s REAL,
          battery_storage_pct REAL,
          power_generated_kw REAL,
          signal_strength_dbm REAL,
          day_night_cycle TEXT,
          ground_station TEXT,
          sync_status TEXT NOT NULL DEFAULT 'SYNCED',
          synced_at TEXT
        );

        -- 5. communication_events
        CREATE TABLE IF NOT EXISTS communication_events (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          event_type TEXT NOT NULL,
          previous_status TEXT NOT NULL,
          new_status TEXT NOT NULL,
          duration_seconds INTEGER DEFAULT 0,
          queued_events_count INTEGER DEFAULT 0,
          details TEXT,
          synced_at TEXT
        );

        -- 6. robot_events
        CREATE TABLE IF NOT EXISTS robot_events (
          id TEXT PRIMARY KEY,
          robot_id TEXT NOT NULL,
          robot_name TEXT NOT NULL,
          timestamp TEXT NOT NULL,
          mission_id TEXT NOT NULL,
          task TEXT NOT NULL,
          status TEXT NOT NULL,
          location TEXT NOT NULL,
          event_type TEXT NOT NULL,
          description TEXT NOT NULL,
          communication_status TEXT NOT NULL DEFAULT 'ONLINE',
          sync_status TEXT NOT NULL DEFAULT 'PENDING',
          synced_at TEXT
        );

        -- 7. sync_history
        CREATE TABLE IF NOT EXISTS sync_history (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          batch_size INTEGER NOT NULL,
          duration_ms INTEGER NOT NULL,
          status TEXT NOT NULL,
          details_json TEXT
        );

        -- 8. crew_routine_events
        CREATE TABLE IF NOT EXISTS crew_routine_events (
          id TEXT PRIMARY KEY,
          astronaut_id TEXT NOT NULL,
          time_slot TEXT NOT NULL,
          title TEXT NOT NULL,
          activity_type TEXT NOT NULL,
          category TEXT NOT NULL,
          module TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          notes TEXT,
          updated_at TEXT NOT NULL,
          sync_status TEXT NOT NULL DEFAULT 'SYNCED',
          synced_at TEXT
        );

        -- 9. asteroid_events
        CREATE TABLE IF NOT EXISTS asteroid_events (
          id TEXT PRIMARY KEY,
          asteroid_id TEXT NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          distance_ld REAL NOT NULL,
          relative_velocity_km_s REAL NOT NULL,
          risk_level TEXT NOT NULL,
          torino_scale INTEGER NOT NULL DEFAULT 0,
          observation_status TEXT NOT NULL,
          is_anomaly INTEGER NOT NULL DEFAULT 0,
          last_observation TEXT NOT NULL,
          details_json TEXT,
          sync_status TEXT NOT NULL DEFAULT 'SYNCED',
          synced_at TEXT
        );

        -- 10. missions
        CREATE TABLE IF NOT EXISTS missions (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          commander_id TEXT,
          day INTEGER NOT NULL DEFAULT 1,
          elapsed_seconds INTEGER NOT NULL DEFAULT 0,
          comm_status TEXT NOT NULL DEFAULT 'ONLINE',
          autonomous_mode INTEGER NOT NULL DEFAULT 0,
          started_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );

        -- 11. mission_sessions
        CREATE TABLE IF NOT EXISTS mission_sessions (
          id TEXT PRIMARY KEY,
          mission_name TEXT NOT NULL,
          astronaut_id TEXT NOT NULL,
          mission_day INTEGER NOT NULL,
          mission_elapsed_time_seconds INTEGER NOT NULL DEFAULT 0,
          started_at TEXT NOT NULL,
          comm_status TEXT NOT NULL DEFAULT 'ONLINE',
          autonomous_mode_active INTEGER NOT NULL DEFAULT 0,
          unsynced_event_count INTEGER NOT NULL DEFAULT 0,
          total_events_count INTEGER NOT NULL DEFAULT 0,
          sync_progress INTEGER NOT NULL DEFAULT 0,
          is_syncing INTEGER NOT NULL DEFAULT 0,
          active_input_mode TEXT NOT NULL DEFAULT 'SIMULATION',
          inactivity_threshold_seconds INTEGER NOT NULL DEFAULT 900,
          anomaly_sensitivity TEXT NOT NULL DEFAULT 'MEDIUM',
          auto_sync_on_restore INTEGER NOT NULL DEFAULT 1,
          total_outage_seconds INTEGER NOT NULL DEFAULT 0
        );

        -- Sync queue
        CREATE TABLE IF NOT EXISTS sync_queue (
          id TEXT PRIMARY KEY,
          event_id TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          payload_json TEXT NOT NULL,
          queued_at TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'PENDING',
          synced_at TEXT,
          retry_count INTEGER NOT NULL DEFAULT 0
        );

        -- Safe Indexes
        CREATE INDEX IF NOT EXISTS idx_sq_act_sync ON activity_events(sync_status);
        CREATE INDEX IF NOT EXISTS idx_sq_act_time ON activity_events(timestamp);
        CREATE INDEX IF NOT EXISTS idx_sq_anom_time ON anomaly_events(timestamp);
        CREATE INDEX IF NOT EXISTS idx_sq_anom_sync ON anomaly_events(sync_status);
        CREATE INDEX IF NOT EXISTS idx_sq_tel_time ON telemetry(timestamp);
        CREATE INDEX IF NOT EXISTS idx_sq_robot_time ON robot_events(timestamp);
        CREATE INDEX IF NOT EXISTS idx_sq_queue_status ON sync_queue(status);
      `);

      // Seed initial missions record safely
      this.db.prepare(`
        INSERT OR IGNORE INTO missions (id, name, commander_id, day, elapsed_seconds, comm_status, autonomous_mode, started_at, updated_at)
        VALUES ('SESSION-AURORA-042', 'MISSION AURORA', 'AST-01', 42, 28540, 'ONLINE', 0, datetime('now'), datetime('now'))
      `).run();

      this.isInitialized = true;
      console.log(`[SQLite] Local resilient database online at ${SQLITE_FILE}`);
    } catch (err) {
      console.error('[SQLite Init Error]:', err);
    }
  }

  public getStatus(): SqliteStatus {
    const tableNames = [
      'missions',
      'astronauts',
      'activity_events',
      'anomaly_events',
      'telemetry',
      'communication_events',
      'robot_events',
      'sync_history',
      'crew_routine_events',
      'asteroid_events',
      'mission_sessions',
      'sync_queue',
    ];

    const tableCounts: Record<string, number> = {};
    let totalRecords = 0;

    if (this.db) {
      for (const name of tableNames) {
        try {
          const row: any = this.db.prepare(`SELECT COUNT(*) as count FROM ${name}`).get();
          const count = row?.count || 0;
          tableCounts[name] = count;
          totalRecords += count;
        } catch {
          tableCounts[name] = 0;
        }
      }
    }

    return {
      status: this.isInitialized ? 'ONLINE' : 'ERROR',
      mode: 'PRIMARY_LOCAL_RESILIENT',
      path: SQLITE_FILE,
      tablesCount: tableNames.length,
      totalRecordsCount: totalRecords,
      lastChecked: new Date().toISOString(),
      tableCounts,
    };
  }

  public persistEvent(evt: MissionEvent): void {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO activity_events (
          id, astronaut_id, timestamp, display_time, activity, confidence,
          duration_seconds, severity, module, sync_status, source,
          processing_mode, details, synced_at, recommended_action
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        evt.id || `EVT-${Date.now()}`,
        evt.astronautId || 'AST-01',
        evt.timestamp || new Date().toISOString(),
        evt.displayTime || new Date().toTimeString().split(' ')[0],
        evt.activity || 'UNKNOWN',
        typeof evt.confidence === 'number' ? evt.confidence : 95.0,
        typeof evt.durationSeconds === 'number' ? evt.durationSeconds : 0,
        evt.severity || 'INFO',
        evt.module || 'LABORATORY',
        evt.syncStatus || 'PENDING',
        evt.source || 'ONBOARD_EDGE_AI',
        evt.processingMode || 'ONBOARD_EDGE_AI',
        evt.details || '',
        evt.syncedAt || null,
        evt.recommendedAction || null
      );
    } catch (err) {
      console.warn('[SQLite persistEvent Warning]:', err);
    }
  }

  public persistAnomaly(anom: AnomalyAlert): void {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO anomaly_events (
          id, astronaut_id, target_object, target_type, timestamp, display_time,
          title, category, severity, activity, module, description,
          recommended_action, resolved, sync_status, synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        anom.id,
        anom.astronautId || null,
        anom.targetObject || anom.astronautId || 'AST-01',
        anom.targetType || 'ASTRONAUT',
        anom.timestamp,
        anom.displayTime || '',
        anom.title,
        anom.category,
        anom.severity,
        anom.activity || null,
        anom.module || null,
        anom.description,
        anom.recommendedAction || null,
        anom.resolved ? 1 : 0,
        anom.syncStatus || 'PENDING',
        null
      );
    } catch (err) {
      console.warn('[SQLite persistAnomaly Warning]:', err);
    }
  }

  public persistRobotEvent(evt: any): void {
    if (!this.db) return;
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO robot_events (
          id, robot_id, robot_name, timestamp, mission_id, task,
          status, location, event_type, description, communication_status, sync_status, synced_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      stmt.run(
        evt.id,
        evt.robotId || 'ARES-1',
        evt.robotName || 'ARES-1 Companion',
        evt.timestamp || new Date().toISOString(),
        evt.missionId || 'MISSION AURORA',
        evt.task || 'Autonomous Patrol',
        evt.status || 'ONLINE',
        evt.location || 'LABORATORY',
        evt.eventType || 'SAFETY_DISPATCH',
        evt.description || '',
        evt.communicationStatus || 'ONLINE',
        evt.syncStatus || 'PENDING',
        null
      );
    } catch (err) {
      console.warn('[SQLite persistRobotEvent Warning]:', err);
    }
  }

  public markSynced(eventIds: string[]): void {
    if (!this.db) return;
    try {
      const now = new Date().toISOString();
      if (eventIds.length === 0) {
        this.db.prepare(`UPDATE activity_events SET sync_status = 'SYNCED', synced_at = ? WHERE sync_status = 'PENDING'`).run(now);
        this.db.prepare(`UPDATE anomaly_events SET sync_status = 'SYNCED', synced_at = ? WHERE sync_status = 'PENDING'`).run(now);
        this.db.prepare(`UPDATE robot_events SET sync_status = 'SYNCED', synced_at = ? WHERE sync_status = 'PENDING'`).run(now);
        this.db.prepare(`UPDATE sync_queue SET status = 'SYNCED', synced_at = ? WHERE status = 'PENDING'`).run(now);
      } else {
        const actStmt = this.db.prepare(`UPDATE activity_events SET sync_status = 'SYNCED', synced_at = ? WHERE id = ?`);
        const anomStmt = this.db.prepare(`UPDATE anomaly_events SET sync_status = 'SYNCED', synced_at = ? WHERE id = ?`);
        const robotStmt = this.db.prepare(`UPDATE robot_events SET sync_status = 'SYNCED', synced_at = ? WHERE id = ?`);
        const queueStmt = this.db.prepare(`UPDATE sync_queue SET status = 'SYNCED', synced_at = ? WHERE event_id = ?`);

        for (const id of eventIds) {
          actStmt.run(now, id);
          anomStmt.run(now, id);
          robotStmt.run(now, id);
          queueStmt.run(now, id);
        }
      }
    } catch (err) {
      console.warn('[SQLite markSynced Warning]:', err);
    }
  }

  public recordSyncHistory(entry: {
    id: string;
    timestamp: string;
    batchSize: number;
    durationMs: number;
    status: string;
  }): void {
    if (!this.db) return;
    try {
      this.db.prepare(`
        INSERT OR REPLACE INTO sync_history (id, timestamp, batch_size, duration_ms, status, details_json)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(entry.id, entry.timestamp, entry.batchSize, entry.durationMs, entry.status, '{}');
    } catch (err) {
      console.warn('[SQLite recordSyncHistory Warning]:', err);
    }
  }
}

export const sqliteService = SqliteService.getInstance();
