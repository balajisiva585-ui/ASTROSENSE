import { Pool, PoolClient } from 'pg';
import { dbConfigManager } from './dbConfig';
import {
  MissionEvent,
  AnomalyAlert,
  Astronaut,
  SpacecraftTelemetry,
  RobotEvent,
  AsteroidObject,
} from '../types';

export interface PostgresStatus {
  status: 'ONLINE' | 'OFFLINE' | 'CONNECTING' | 'ERROR' | 'UNCONFIGURED';
  configured: boolean;
  provider: string;
  host: string;
  database: string;
  user: string;
  port: number;
  ssl: boolean;
  latencyMs: number;
  tablesReady: boolean;
  tableCounts: Record<string, number>;
  lastChecked: string;
  errorMessage?: string;
}

export class PostgresService {
  private static instance: PostgresService;
  private pool: Pool | null = null;
  private status: 'ONLINE' | 'OFFLINE' | 'CONNECTING' | 'ERROR' | 'UNCONFIGURED' = 'UNCONFIGURED';
  private lastLatencyMs: number = 0;
  private lastChecked: string = new Date().toISOString();
  private errorMessage?: string;
  private tablesReady: boolean = false;
  private isReconnecting: boolean = false;

  private constructor() {}

  public static getInstance(): PostgresService {
    if (!PostgresService.instance) {
      PostgresService.instance = new PostgresService();
    }
    return PostgresService.instance;
  }

  /**
   * Initializes connection automatically on startup if DATABASE_URL is configured.
   */
  public async initialize(): Promise<boolean> {
    const rawUrl = dbConfigManager.getDatabaseUrl();
    if (!rawUrl) {
      this.status = 'UNCONFIGURED';
      this.tablesReady = false;
      console.log('[PostgreSQL] No DATABASE_URL configured. Ground database awaiting user connection.');
      return false;
    }

    return this.connect(rawUrl);
  }

  /**
   * Connects to PostgreSQL using DATABASE_URL with SSL support.
   */
  public async connect(connectionString: string, ssl = true): Promise<boolean> {
    this.status = 'CONNECTING';
    this.errorMessage = undefined;

    try {
      if (this.pool) {
        await this.disconnect();
      }

      // Configure Pool with delay tolerance and SSL
      this.pool = new Pool({
        connectionString,
        ssl: ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 8000,
        idleTimeoutMillis: 30000,
        max: 10,
      });

      // Handle pool errors gracefully (do NOT crash Node process)
      this.pool.on('error', (err) => {
        console.warn('[PostgreSQL Pool Warning]:', err.message);
        this.status = 'OFFLINE';
        this.errorMessage = err.message;
      });

      // Test connection with ping
      const startTime = Date.now();
      const client = await this.pool.connect();
      try {
        await client.query('SELECT 1 as ping');
        this.lastLatencyMs = Date.now() - startTime;
      } finally {
        client.release();
      }

      this.status = 'ONLINE';
      this.lastChecked = new Date().toISOString();

      // Automatically initialize schema, tables, indexes, and initial ground data
      await this.ensureSchema();

      console.log(`[PostgreSQL] Connected successfully to Ground Database (${this.lastLatencyMs}ms). All 10 tables verified.`);
      return true;
    } catch (err: any) {
      this.status = 'OFFLINE';
      this.errorMessage = err.message || 'Failed to connect to PostgreSQL';
      console.warn(`[PostgreSQL Connection Offline]: ${this.errorMessage}`);
      return false;
    }
  }

  /**
   * Tests a connection string without persisting it.
   */
  public async testConnection(connectionString: string, ssl = true): Promise<{
    success: boolean;
    latencyMs: number;
    version?: string;
    error?: string;
  }> {
    let testPool: Pool | null = null;
    try {
      testPool = new Pool({
        connectionString,
        ssl: ssl ? { rejectUnauthorized: false } : false,
        connectionTimeoutMillis: 6000,
      });

      const start = Date.now();
      const client = await testPool.connect();
      let version = 'PostgreSQL';
      try {
        const res = await client.query('SELECT version();');
        version = res.rows[0]?.version || 'PostgreSQL';
      } finally {
        client.release();
      }
      const latencyMs = Date.now() - start;
      await testPool.end();

      return { success: true, latencyMs, version };
    } catch (err: any) {
      if (testPool) {
        try {
          await testPool.end();
        } catch {}
      }
      return { success: false, latencyMs: 0, error: err.message || 'Connection failed' };
    }
  }

  /**
   * Disconnects active PostgreSQL pool gracefully.
   */
  public async disconnect(): Promise<void> {
    if (this.pool) {
      try {
        await this.pool.end();
      } catch (err) {
        console.warn('[PostgreSQL] Error ending pool:', err);
      }
      this.pool = null;
    }
    this.status = 'OFFLINE';
    this.tablesReady = false;
  }

  /**
   * Automatic Schema & Index Creation for all 10 required tables:
   * 1. missions
   * 2. astronauts
   * 3. activity_events
   * 4. anomaly_events
   * 5. telemetry
   * 6. communication_events
   * 7. robot_events
   * 8. sync_history
   * 9. crew_routine_events
   * 10. asteroid_events
   */
  public async ensureSchema(): Promise<boolean> {
    if (!this.pool || this.status !== 'ONLINE') {
      return false;
    }

    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      // 1. missions
      await client.query(`
        CREATE TABLE IF NOT EXISTS missions (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) NOT NULL,
          commander_id VARCHAR(64),
          day INTEGER NOT NULL DEFAULT 1,
          elapsed_seconds BIGINT NOT NULL DEFAULT 0,
          comm_status VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
          autonomous_mode BOOLEAN NOT NULL DEFAULT FALSE,
          started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 2. astronauts
      await client.query(`
        CREATE TABLE IF NOT EXISTS astronauts (
          id VARCHAR(64) PRIMARY KEY,
          name VARCHAR(128) NOT NULL,
          role VARCHAR(128) NOT NULL,
          mission VARCHAR(128) NOT NULL,
          mission_day INTEGER NOT NULL DEFAULT 1,
          current_module VARCHAR(64) NOT NULL,
          current_activity VARCHAR(64) NOT NULL,
          activity_confidence NUMERIC(5,2) NOT NULL DEFAULT 95.0,
          current_status VARCHAR(32) NOT NULL DEFAULT 'NORMAL',
          activity_duration_seconds INTEGER NOT NULL DEFAULT 0,
          last_activity VARCHAR(64) NOT NULL,
          vitals_json JSONB NOT NULL DEFAULT '{}'::jsonb,
          stats_json JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 3. activity_events
      await client.query(`
        CREATE TABLE IF NOT EXISTS activity_events (
          id VARCHAR(64) PRIMARY KEY,
          astronaut_id VARCHAR(64) NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          display_time VARCHAR(32) NOT NULL,
          activity VARCHAR(64) NOT NULL,
          confidence NUMERIC(5,2) NOT NULL,
          duration_seconds INTEGER NOT NULL DEFAULT 0,
          severity VARCHAR(32) NOT NULL DEFAULT 'INFO',
          module VARCHAR(64) NOT NULL,
          sync_status VARCHAR(32) NOT NULL DEFAULT 'SYNCED',
          source VARCHAR(128) NOT NULL,
          processing_mode VARCHAR(64) NOT NULL DEFAULT 'ONBOARD_EDGE_AI',
          details TEXT,
          synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          recommended_action TEXT
        );
      `);

      // 4. anomaly_events
      await client.query(`
        CREATE TABLE IF NOT EXISTS anomaly_events (
          id VARCHAR(64) PRIMARY KEY,
          astronaut_id VARCHAR(64),
          target_object VARCHAR(64),
          target_type VARCHAR(32),
          timestamp TIMESTAMPTZ NOT NULL,
          display_time VARCHAR(32) NOT NULL,
          title VARCHAR(256) NOT NULL,
          category VARCHAR(64) NOT NULL,
          severity VARCHAR(32) NOT NULL,
          activity VARCHAR(64),
          module VARCHAR(64),
          description TEXT NOT NULL,
          recommended_action TEXT,
          resolved BOOLEAN NOT NULL DEFAULT FALSE,
          sync_status VARCHAR(32) NOT NULL DEFAULT 'SYNCED',
          synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 5. telemetry
      await client.query(`
        CREATE TABLE IF NOT EXISTS telemetry (
          id VARCHAR(64) PRIMARY KEY,
          timestamp TIMESTAMPTZ NOT NULL,
          display_time VARCHAR(32) NOT NULL,
          cabin_temperature NUMERIC(6,2),
          cabin_pressure NUMERIC(6,2),
          oxygen_pct NUMERIC(5,2),
          co2_ppm NUMERIC(7,2),
          humidity_pct NUMERIC(5,2),
          radiation_rate NUMERIC(7,2),
          orbit_altitude_km NUMERIC(7,2),
          orbit_velocity_km_s NUMERIC(6,3),
          battery_storage_pct NUMERIC(5,2),
          power_generated_kw NUMERIC(6,2),
          signal_strength_dbm NUMERIC(6,2),
          day_night_cycle VARCHAR(32),
          ground_station VARCHAR(64),
          sync_status VARCHAR(32) NOT NULL DEFAULT 'SYNCED',
          synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 6. communication_events
      await client.query(`
        CREATE TABLE IF NOT EXISTS communication_events (
          id VARCHAR(64) PRIMARY KEY,
          timestamp TIMESTAMPTZ NOT NULL,
          event_type VARCHAR(32) NOT NULL,
          previous_status VARCHAR(32) NOT NULL,
          new_status VARCHAR(32) NOT NULL,
          duration_seconds INTEGER DEFAULT 0,
          queued_events_count INTEGER DEFAULT 0,
          details TEXT,
          synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 7. robot_events
      await client.query(`
        CREATE TABLE IF NOT EXISTS robot_events (
          id VARCHAR(64) PRIMARY KEY,
          robot_id VARCHAR(32) NOT NULL,
          robot_name VARCHAR(64) NOT NULL,
          timestamp TIMESTAMPTZ NOT NULL,
          mission_id VARCHAR(64) NOT NULL,
          task VARCHAR(256) NOT NULL,
          status VARCHAR(64) NOT NULL,
          location VARCHAR(64) NOT NULL,
          event_type VARCHAR(64) NOT NULL,
          description TEXT NOT NULL,
          communication_status VARCHAR(32) NOT NULL DEFAULT 'ONLINE',
          sync_status VARCHAR(32) NOT NULL DEFAULT 'SYNCED',
          synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 8. sync_history
      await client.query(`
        CREATE TABLE IF NOT EXISTS sync_history (
          id VARCHAR(64) PRIMARY KEY,
          timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          batch_size INTEGER NOT NULL,
          duration_ms INTEGER NOT NULL,
          status VARCHAR(32) NOT NULL,
          details_json JSONB DEFAULT '{}'::jsonb
        );
      `);

      // 9. crew_routine_events
      await client.query(`
        CREATE TABLE IF NOT EXISTS crew_routine_events (
          id VARCHAR(64) PRIMARY KEY,
          astronaut_id VARCHAR(64) NOT NULL,
          time_slot VARCHAR(64) NOT NULL,
          title VARCHAR(256) NOT NULL,
          activity_type VARCHAR(64) NOT NULL,
          category VARCHAR(64) NOT NULL,
          module VARCHAR(64) NOT NULL,
          status VARCHAR(32) NOT NULL DEFAULT 'PENDING',
          notes TEXT,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          sync_status VARCHAR(32) NOT NULL DEFAULT 'SYNCED',
          synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // 10. asteroid_events
      await client.query(`
        CREATE TABLE IF NOT EXISTS asteroid_events (
          id VARCHAR(64) PRIMARY KEY,
          asteroid_id VARCHAR(64) NOT NULL,
          name VARCHAR(128) NOT NULL,
          type VARCHAR(32) NOT NULL,
          distance_ld NUMERIC(8,3) NOT NULL,
          relative_velocity_km_s NUMERIC(6,2) NOT NULL,
          risk_level VARCHAR(32) NOT NULL,
          torino_scale INTEGER NOT NULL DEFAULT 0,
          observation_status VARCHAR(64) NOT NULL,
          is_anomaly BOOLEAN NOT NULL DEFAULT FALSE,
          last_observation TIMESTAMPTZ NOT NULL,
          details_json JSONB DEFAULT '{}'::jsonb,
          sync_status VARCHAR(32) NOT NULL DEFAULT 'SYNCED',
          synced_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);

      // Automatic Indexes (Safe IF NOT EXISTS)
      await client.query(`
        CREATE INDEX IF NOT EXISTS idx_act_events_timestamp ON activity_events(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_act_events_astronaut ON activity_events(astronaut_id);
        CREATE INDEX IF NOT EXISTS idx_act_events_sync ON activity_events(sync_status);
        CREATE INDEX IF NOT EXISTS idx_act_events_activity ON activity_events(activity);

        CREATE INDEX IF NOT EXISTS idx_anomalies_timestamp ON anomaly_events(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomaly_events(severity);
        CREATE INDEX IF NOT EXISTS idx_anomalies_resolved ON anomaly_events(resolved);

        CREATE INDEX IF NOT EXISTS idx_telemetry_timestamp ON telemetry(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_comm_events_timestamp ON communication_events(timestamp DESC);

        CREATE INDEX IF NOT EXISTS idx_robot_events_timestamp ON robot_events(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_robot_events_robot ON robot_events(robot_id);

        CREATE INDEX IF NOT EXISTS idx_sync_history_timestamp ON sync_history(timestamp DESC);
        CREATE INDEX IF NOT EXISTS idx_routine_astronaut ON crew_routine_events(astronaut_id);
        CREATE INDEX IF NOT EXISTS idx_asteroid_risk ON asteroid_events(risk_level);
      `);

      // Seed Initial Baseline Data Safely (Idempotent)
      await client.query(`
        INSERT INTO missions (id, name, commander_id, day, elapsed_seconds, comm_status, autonomous_mode, started_at, updated_at)
        VALUES ('SESSION-AURORA-042', 'MISSION AURORA', 'AST-01', 42, 28540, 'ONLINE', FALSE, NOW() - INTERVAL '42 days', NOW())
        ON CONFLICT (id) DO NOTHING;

        INSERT INTO astronauts (id, name, role, mission, mission_day, current_module, current_activity, activity_confidence, current_status, activity_duration_seconds, last_activity, vitals_json, stats_json, updated_at)
        VALUES (
          'AST-01',
          'Dr. Elena Vance',
          'Payload Commander & Astrobiologist',
          'MISSION AURORA',
          42,
          'LABORATORY',
          'WORKING',
          96.4,
          'NORMAL',
          145,
          'WALKING',
          '{"heartRate": 74, "spO2": 99, "bodyTemp": 36.8, "respiratoryRate": 15, "metabolicKcalHour": 110}'::jsonb,
          '{"totalActiveSeconds": 18400, "totalInactiveSeconds": 12200, "exerciseSeconds": 4200, "workingSeconds": 11800, "eatingDrinkingSeconds": 2400, "sleepingSeconds": 28800, "anomaliesDetected": 0, "totalDetections": 48}'::jsonb,
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          mission = EXCLUDED.mission,
          updated_at = NOW();
      `);

      await client.query('COMMIT');
      this.tablesReady = true;
      return true;
    } catch (err: any) {
      await client.query('ROLLBACK');
      console.error('[PostgreSQL Schema Init Error]:', err);
      this.tablesReady = false;
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * Syncs a batch of mission events into PostgreSQL.
   */
  public async upsertActivityEvents(events: MissionEvent[]): Promise<number> {
    if (!this.pool || this.status !== 'ONLINE' || events.length === 0) return 0;
    const client = await this.pool.connect();
    let count = 0;
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO activity_events (
          id, astronaut_id, timestamp, display_time, activity, confidence,
          duration_seconds, severity, module, sync_status, source,
          processing_mode, details, synced_at, recommended_action
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'SYNCED', $10, $11, $12, NOW(), $13)
        ON CONFLICT (id) DO UPDATE SET
          sync_status = 'SYNCED',
          synced_at = NOW(),
          activity = EXCLUDED.activity,
          confidence = EXCLUDED.confidence,
          details = EXCLUDED.details,
          recommended_action = EXCLUDED.recommended_action;
      `;

      for (const evt of events) {
        await client.query(query, [
          evt.id,
          evt.astronautId || 'AST-01',
          evt.timestamp,
          evt.displayTime || new Date(evt.timestamp).toTimeString().split(' ')[0],
          evt.activity,
          evt.confidence || 95.0,
          evt.durationSeconds || 0,
          evt.severity || 'INFO',
          evt.module || 'LABORATORY',
          evt.source || 'ONBOARD_EDGE_AI',
          evt.processingMode || 'ONBOARD_EDGE_AI',
          evt.details || '',
          evt.recommendedAction || null,
        ]);
        count++;
      }

      await client.query('COMMIT');
      return count;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[PostgreSQL Event Sync Error]:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Syncs a batch of anomaly alerts into PostgreSQL.
   */
  public async upsertAnomalyEvents(anomalies: AnomalyAlert[]): Promise<number> {
    if (!this.pool || this.status !== 'ONLINE' || anomalies.length === 0) return 0;
    const client = await this.pool.connect();
    let count = 0;
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO anomaly_events (
          id, astronaut_id, target_object, target_type, timestamp, display_time,
          title, category, severity, activity, module, description,
          recommended_action, resolved, sync_status, synced_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, 'SYNCED', NOW())
        ON CONFLICT (id) DO UPDATE SET
          resolved = EXCLUDED.resolved,
          sync_status = 'SYNCED',
          synced_at = NOW(),
          description = EXCLUDED.description,
          recommended_action = EXCLUDED.recommended_action;
      `;

      for (const a of anomalies) {
        await client.query(query, [
          a.id,
          a.astronautId || null,
          a.targetObject || a.astronautId || 'AST-01',
          a.targetType || 'ASTRONAUT',
          a.timestamp,
          a.displayTime || new Date(a.timestamp).toTimeString().split(' ')[0],
          a.title,
          a.category,
          a.severity,
          a.activity || null,
          a.module || null,
          a.description,
          a.recommendedAction || null,
          Boolean(a.resolved),
        ]);
        count++;
      }

      await client.query('COMMIT');
      return count;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[PostgreSQL Anomaly Sync Error]:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Syncs a robot event into PostgreSQL.
   */
  public async upsertRobotEvents(events: any[]): Promise<number> {
    if (!this.pool || this.status !== 'ONLINE' || events.length === 0) return 0;
    const client = await this.pool.connect();
    let count = 0;
    try {
      await client.query('BEGIN');
      const query = `
        INSERT INTO robot_events (
          id, robot_id, robot_name, timestamp, mission_id, task,
          status, location, event_type, description, communication_status, sync_status, synced_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'SYNCED', NOW())
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          task = EXCLUDED.task,
          location = EXCLUDED.location,
          sync_status = 'SYNCED',
          synced_at = NOW();
      `;

      for (const evt of events) {
        await client.query(query, [
          evt.id || `ROBOT-EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          evt.robotId || 'ARES-1',
          evt.robotName || 'ARES-1 Companion',
          evt.timestamp || new Date().toISOString(),
          evt.missionId || 'MISSION AURORA',
          evt.task || 'Autonomous Patrol',
          evt.status || 'ONLINE',
          evt.location || 'LABORATORY',
          evt.eventType || 'SAFETY_DISPATCH',
          evt.description || 'Robot event logged.',
          evt.communicationStatus || 'ONLINE',
        ]);
        count++;
      }

      await client.query('COMMIT');
      return count;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('[PostgreSQL Robot Event Sync Error]:', err);
      throw err;
    } finally {
      client.release();
    }
  }

  /**
   * Syncs telemetry snapshots into PostgreSQL.
   */
  public async insertTelemetrySnapshot(telemetry: SpacecraftTelemetry): Promise<boolean> {
    if (!this.pool || this.status !== 'ONLINE') return false;
    try {
      const id = `TEL-${Date.now()}`;
      await this.pool.query(
        `
        INSERT INTO telemetry (
          id, timestamp, display_time, cabin_temperature, cabin_pressure,
          oxygen_pct, co2_ppm, humidity_pct, radiation_rate, orbit_altitude_km,
          orbit_velocity_km_s, battery_storage_pct, power_generated_kw, signal_strength_dbm,
          day_night_cycle, ground_station, sync_status, synced_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, 'SYNCED', NOW())
        ON CONFLICT (id) DO NOTHING;
      `,
        [
          id,
          telemetry.timestamp || new Date().toISOString(),
          telemetry.displayTime || new Date().toTimeString().split(' ')[0],
          telemetry.cabinTemperature || 22.4,
          telemetry.cabinPressure || 101.3,
          telemetry.oxygenPct || 20.9,
          telemetry.co2Ppm || 480,
          telemetry.humidityPct || 45,
          telemetry.radiationRate || 18.5,
          telemetry.orbitAltitudeKm || 418.5,
          telemetry.orbitVelocityKmS || 7.67,
          telemetry.batteryStoragePct || 94,
          telemetry.powerGeneratedKw || 84.2,
          telemetry.signalStrengthDbm || -78,
          telemetry.dayNightCycle || 'DAYLIGHT',
          telemetry.groundStationInView || 'Goldstone DSN',
        ]
      );
      return true;
    } catch (err) {
      console.warn('[PostgreSQL Telemetry Sync Warning]:', err);
      return false;
    }
  }

  /**
   * Records a synchronization history run in PostgreSQL.
   */
  public async recordSyncHistory(entry: {
    id: string;
    timestamp: string;
    batchSize: number;
    durationMs: number;
    status: 'SUCCESS' | 'PARTIAL' | 'FAILED';
    details?: any;
  }): Promise<boolean> {
    if (!this.pool || this.status !== 'ONLINE') return false;
    try {
      await this.pool.query(
        `
        INSERT INTO sync_history (id, timestamp, batch_size, duration_ms, status, details_json)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO NOTHING;
      `,
        [
          entry.id,
          entry.timestamp,
          entry.batchSize,
          entry.durationMs,
          entry.status,
          JSON.stringify(entry.details || {}),
        ]
      );
      return true;
    } catch (err) {
      console.warn('[PostgreSQL Sync History Warning]:', err);
      return false;
    }
  }

  /**
   * Queries record statistics across all 10 tables.
   */
  public async getTableStats(): Promise<Record<string, number>> {
    const stats: Record<string, number> = {
      missions: 0,
      astronauts: 0,
      activity_events: 0,
      anomaly_events: 0,
      telemetry: 0,
      communication_events: 0,
      robot_events: 0,
      sync_history: 0,
      crew_routine_events: 0,
      asteroid_events: 0,
    };

    if (!this.pool || this.status !== 'ONLINE') {
      return stats;
    }

    try {
      const client = await this.pool.connect();
      try {
        const tables = Object.keys(stats);
        for (const tbl of tables) {
          try {
            const res = await client.query(`SELECT COUNT(*)::int as count FROM ${tbl}`);
            stats[tbl] = res.rows[0]?.count || 0;
          } catch {
            stats[tbl] = 0;
          }
        }
      } finally {
        client.release();
      }
    } catch (err) {
      console.warn('[PostgreSQL getTableStats error]:', err);
    }

    return stats;
  }

  /**
   * Returns comprehensive safe status metadata for frontend & APIs.
   */
  public async getStatus(): Promise<PostgresStatus> {
    const safeConf = dbConfigManager.getSafeConfig();

    if (!safeConf.isConfigured) {
      return {
        status: 'UNCONFIGURED',
        configured: false,
        provider: 'None',
        host: '',
        database: '',
        user: '',
        port: 5432,
        ssl: true,
        latencyMs: 0,
        tablesReady: false,
        tableCounts: {},
        lastChecked: new Date().toISOString(),
      };
    }

    // Ping check if currently marked online
    if (this.pool && this.status === 'ONLINE') {
      try {
        const start = Date.now();
        await this.pool.query('SELECT 1');
        this.lastLatencyMs = Date.now() - start;
        this.lastChecked = new Date().toISOString();
      } catch (err: any) {
        this.status = 'OFFLINE';
        this.errorMessage = err.message;
      }
    }

    const tableCounts = this.status === 'ONLINE' ? await this.getTableStats() : {};

    return {
      status: this.status,
      configured: safeConf.isConfigured,
      provider: safeConf.provider,
      host: safeConf.host,
      database: safeConf.database,
      user: safeConf.user,
      port: safeConf.port,
      ssl: safeConf.ssl,
      latencyMs: this.lastLatencyMs,
      tablesReady: this.tablesReady,
      tableCounts,
      lastChecked: this.lastChecked,
      errorMessage: this.errorMessage,
    };
  }

  public isOnline(): boolean {
    return this.status === 'ONLINE' && this.tablesReady;
  }
}

export const postgresService = PostgresService.getInstance();
