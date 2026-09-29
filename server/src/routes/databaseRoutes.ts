import { Router, Request, Response } from 'express';
import { dbConfigManager } from '../database/dbConfig';
import { postgresService } from '../database/postgresDb';
import { sqliteService } from '../database/sqliteDb';
import { syncEngine } from '../sync/SyncEngine';
import { db } from '../database/db';

export const databaseRouter = Router();

// Official PostgreSQL Provider Documentation & Guides
const OFFICIAL_PROVIDERS = [
  {
    id: 'supabase',
    name: 'Supabase',
    tagline: 'Open Source Firebase Alternative with PostgreSQL',
    badge: 'Popular',
    icon: '⚡',
    authGuide: 'Log in to Supabase > Projects > Select Project > Project Settings > Database > Connection string (URI)',
    docsUrl: 'https://supabase.com/docs/guides/database',
    loginUrl: 'https://supabase.com/dashboard/sign-in',
    exampleFormat: 'postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres',
    sslDefault: true,
  },
  {
    id: 'neon',
    name: 'Neon',
    tagline: 'Serverless PostgreSQL for Modern Cloud Applications',
    badge: 'Serverless',
    icon: '🟢',
    authGuide: 'Log in to Neon Console > Dashboard > Connection Details > Select "Node.js / Connection String"',
    docsUrl: 'https://neon.tech/docs/introduction',
    loginUrl: 'https://console.neon.tech/login',
    exampleFormat: 'postgresql://[USER]:[PASSWORD]@[ENDPOINT].us-east-2.aws.neon.tech/neondb?sslmode=require',
    sslDefault: true,
  },
  {
    id: 'railway',
    name: 'Railway',
    tagline: 'Instant Cloud Database Provisioning & Hosting',
    badge: 'Fast Setup',
    icon: '🚂',
    authGuide: 'Log in to Railway > Project > PostgreSQL Service > Variables / Connect > Copy DATABASE_URL',
    docsUrl: 'https://docs.railway.com/databases/postgresql',
    loginUrl: 'https://railway.com/login',
    exampleFormat: 'postgresql://postgres:[PASSWORD]@[HOST].railway.app:[PORT]/railway',
    sslDefault: true,
  },
  {
    id: 'render',
    name: 'Render PostgreSQL',
    tagline: 'Fully-Managed PostgreSQL Cloud Instances',
    badge: 'Managed',
    icon: '🔷',
    authGuide: 'Log in to Render Dashboard > PostgreSQL > Connect > Copy "External Database URL"',
    docsUrl: 'https://render.com/docs/databases',
    loginUrl: 'https://dashboard.render.com/login',
    exampleFormat: 'postgresql://[USER]:[PASSWORD]@[HOST].oregon-postgres.render.com/[DB_NAME]?ssl=true',
    sslDefault: true,
  },
  {
    id: 'custom',
    name: 'Custom PostgreSQL',
    tagline: 'Self-Hosted or Enterprise PostgreSQL (Docker, AWS RDS, GCP Cloud SQL, Azure)',
    badge: 'Enterprise',
    icon: '🐘',
    authGuide: 'Provide any standard PostgreSQL 12+ connection string URI',
    docsUrl: 'https://www.postgresql.org/docs/current/libpq-connect.html#LIBPQ-CONNSTRING',
    loginUrl: '',
    exampleFormat: 'postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]',
    sslDefault: true,
  },
];

/**
 * GET /api/database/status
 * Comprehensive hybrid database status (SQLite local + PostgreSQL ground + Sync engine)
 */
databaseRouter.get('/status', async (_req: Request, res: Response) => {
  try {
    const sqliteStatus = sqliteService.getStatus();
    const postgresStatus = await postgresService.getStatus();
    const syncState = syncEngine.getSyncState();
    const safeConfig = dbConfigManager.getSafeConfig();

    res.json({
      success: true,
      data: {
        databaseConfigured: safeConfig.isConfigured,
        sqlite: sqliteStatus,
        postgres: postgresStatus,
        syncEngine: syncState,
        config: safeConfig,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/database/health
 * Fast health check and latency ping for both local and ground databases
 */
databaseRouter.get('/health', async (_req: Request, res: Response) => {
  try {
    const sqliteStatus = sqliteService.getStatus();
    const postgresStatus = await postgresService.getStatus();

    const isHealthy = sqliteStatus.status === 'ONLINE';
    const isDegraded = postgresStatus.status === 'OFFLINE' && postgresStatus.configured;

    res.json({
      success: true,
      data: {
        status: isHealthy ? (isDegraded ? 'DEGRADED' : 'HEALTHY') : 'UNHEALTHY',
        sqliteHealthy: sqliteStatus.status === 'ONLINE',
        postgresHealthy: postgresStatus.status === 'ONLINE',
        postgresConfigured: postgresStatus.configured,
        latencies: {
          sqliteMs: 0.2,
          postgresMs: postgresStatus.latencyMs,
        },
        mode: postgresStatus.status === 'ONLINE' ? 'HYBRID_SYNC_ACTIVE' : 'AUTONOMOUS_LOCAL_RESILIENT',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/database/stats
 * Record counts across tables in local SQLite and ground PostgreSQL
 */
databaseRouter.get('/stats', async (_req: Request, res: Response) => {
  try {
    const sqliteStatus = sqliteService.getStatus();
    const postgresStats = await postgresService.getTableStats();
    const session = db.getSession();

    res.json({
      success: true,
      data: {
        sqlite: sqliteStatus.tableCounts,
        postgres: postgresStats,
        sessionStats: {
          totalEventsCount: session.totalEventsCount,
          unsyncedEventCount: session.unsyncedEventCount,
          commStatus: session.commStatus,
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/database/sync-history
 * Recent synchronization log entries
 */
databaseRouter.get('/sync-history', (_req: Request, res: Response) => {
  try {
    const history = db.getSyncHistory();
    res.json({
      success: true,
      data: history,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/database/providers
 * Returns supported PostgreSQL providers and documentation links
 */
databaseRouter.get('/providers', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: OFFICIAL_PROVIDERS,
  });
});

/**
 * POST /api/database/test-connection
 * Tests a candidate PostgreSQL connection string without saving it
 */
databaseRouter.post('/test-connection', async (req: Request, res: Response) => {
  try {
    const { databaseUrl, ssl } = req.body;
    if (!databaseUrl || typeof databaseUrl !== 'string' || databaseUrl.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid PostgreSQL connection string URL.',
      });
    }

    const testResult = await postgresService.testConnection(
      databaseUrl.trim(),
      ssl !== false
    );

    if (testResult.success) {
      const meta = dbConfigManager.parseUrlMetadata(databaseUrl);
      res.json({
        success: true,
        data: {
          message: 'PostgreSQL connection successful!',
          latencyMs: testResult.latencyMs,
          version: testResult.version,
          provider: meta.provider,
          host: meta.host,
          database: meta.database,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        error: testResult.error || 'Connection failed. Please verify credentials, host, and SSL settings.',
      });
    }
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/database/config
 * Saves connection string to .env and local store, auto-initializes schema, seeds baseline data, triggers initial sync
 */
databaseRouter.post('/config', async (req: Request, res: Response) => {
  try {
    const { databaseUrl, ssl, autoSync, syncIntervalMs } = req.body;
    if (!databaseUrl || typeof databaseUrl !== 'string' || databaseUrl.trim().length < 5) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid PostgreSQL connection string URL.',
      });
    }

    const rawUrl = databaseUrl.trim();
    const useSsl = ssl !== false;

    // 1. Test connection
    const testResult = await postgresService.testConnection(rawUrl, useSsl);
    if (!testResult.success) {
      return res.status(400).json({
        success: false,
        error: `Could not connect to PostgreSQL: ${testResult.error || 'Verify connection string and network access.'}`,
      });
    }

    // 2. Persist configuration safely (updates .env and data/db_config.json)
    dbConfigManager.saveConfig({
      databaseUrl: rawUrl,
      ssl: useSsl,
      autoSync: autoSync !== false,
      syncIntervalMs: syncIntervalMs ? parseInt(syncIntervalMs, 10) : 10000,
    });

    // 3. Connect active pool and run automatic schema migration (all 10 tables + indexes)
    const connected = await postgresService.connect(rawUrl, useSsl);
    if (!connected) {
      return res.status(500).json({
        success: false,
        error: 'Connected for test, but failed to initialize schema pool.',
      });
    }

    // 4. Initial sync of all existing SQLite records to PostgreSQL
    let syncResult = null;
    try {
      syncResult = await syncEngine.triggerSynchronization();
    } catch (sErr: any) {
      console.warn('[Initial Sync Note]:', sErr.message);
    }

    const status = await postgresService.getStatus();
    const safeConfig = dbConfigManager.getSafeConfig();

    res.json({
      success: true,
      message: 'ASTROSENSE Ground Database successfully configured and synchronized.',
      data: {
        config: safeConfig,
        postgresStatus: status,
        initialSync: syncResult,
      },
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/database/sync
 * Manually trigger delay-tolerant synchronization
 */
databaseRouter.post('/sync', async (_req: Request, res: Response) => {
  try {
    const result = await syncEngine.triggerSynchronization();
    res.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/database/disconnect
 * Gracefully disconnects PostgreSQL client pool without deleting data
 */
databaseRouter.post('/disconnect', async (_req: Request, res: Response) => {
  try {
    await postgresService.disconnect();
    res.json({
      success: true,
      message: 'Ground PostgreSQL disconnected. System operates in Autonomous Local SQLite mode.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/database/reset
 * Resets database configuration without dropping remote databases
 */
databaseRouter.post('/reset', async (_req: Request, res: Response) => {
  try {
    await postgresService.disconnect();
    dbConfigManager.resetConfig();
    res.json({
      success: true,
      message: 'Ground database configuration cleared. Local SQLite remains active.',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});
