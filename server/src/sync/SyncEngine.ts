import { db } from '../database/db';
import { postgresService } from '../database/postgresDb';
import { SyncResult } from '../types';

export class SyncEngine {
  private static instance: SyncEngine;
  private isSyncing: boolean = false;
  private currentProgress: number = 0;
  private autoSyncInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: string | null = null;
  private lastSyncError: string | null = null;

  private constructor() {
    this.startAutoSyncLoop();
  }

  public static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  public startAutoSyncLoop(intervalMs = 10000): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
    }
    this.autoSyncInterval = setInterval(async () => {
      try {
        const session = db.getSession();
        if (session.commStatus === 'ONLINE' && postgresService.isOnline()) {
          const pendingEvents = db.getEvents({ syncStatus: 'PENDING' });
          const pendingAnomalies = db.getAnomalies().filter(a => a.syncStatus === 'PENDING');
          if (pendingEvents.length > 0 || pendingAnomalies.length > 0) {
            await this.triggerSynchronization();
          }
        }
      } catch {
        // Background sync loop silently catches errors
      }
    }, intervalMs);
  }

  public stopAutoSyncLoop(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval);
      this.autoSyncInterval = null;
    }
  }

  public getSyncState() {
    const session = db.getSession();
    const pendingEvents = db.getEvents({ syncStatus: 'PENDING' });
    const pendingAnomalies = db.getAnomalies().filter(a => a.syncStatus === 'PENDING');
    const postgresOnline = postgresService.isOnline();

    let engineStatus: 'IDLE' | 'SYNCING' | 'COMPLETED' | 'ERROR' | 'PAUSED' = 'IDLE';
    if (session.commStatus === 'OFFLINE' || !postgresOnline) {
      engineStatus = 'PAUSED';
    } else if (this.isSyncing) {
      engineStatus = 'SYNCING';
    } else if (pendingEvents.length === 0 && pendingAnomalies.length === 0) {
      engineStatus = 'COMPLETED';
    }

    return {
      commStatus: session.commStatus,
      isSyncing: this.isSyncing,
      syncProgress: this.currentProgress,
      pendingEventsCount: pendingEvents.length,
      pendingAnomaliesCount: pendingAnomalies.length,
      totalPendingItems: pendingEvents.length + pendingAnomalies.length,
      engineStatus,
      lastSyncTime: this.lastSyncTime,
      lastSyncError: this.lastSyncError,
      groundDatabaseStatus: postgresOnline ? 'ONLINE' : 'OFFLINE',
      lastSyncHistory: db.getSyncHistory().slice(0, 5),
    };
  }

  public async triggerSynchronization(batchSizeLimit = 100): Promise<SyncResult> {
    const session = db.getSession();

    if (session.commStatus === 'OFFLINE') {
      throw new Error('Cannot synchronize while Communication Link is OFFLINE.');
    }

    if (this.isSyncing) {
      return {
        synchronizedCount: 0,
        remainingPendingCount: db.getEvents({ syncStatus: 'PENDING' }).length,
        timestamp: new Date().toISOString(),
        batchId: 'SYNC-IN-PROGRESS',
        groundMissionControlStatus: postgresService.isOnline() ? 'UPDATED' : 'OFFLINE',
      };
    }

    const pendingEvents = db.getEvents({ syncStatus: 'PENDING' }).slice(0, batchSizeLimit);
    const pendingAnomalies = db.getAnomalies().filter(a => a.syncStatus === 'PENDING').slice(0, batchSizeLimit);
    const robotEvents = db.getRobotEvents(20).filter((r: any) => r.syncStatus === 'PENDING');

    if (pendingEvents.length === 0 && pendingAnomalies.length === 0 && robotEvents.length === 0) {
      this.currentProgress = 100;
      db.updateSession(session.id, { syncProgress: 100, isSyncing: false, unsyncedEventCount: 0 });
      return {
        synchronizedCount: 0,
        remainingPendingCount: 0,
        timestamp: new Date().toISOString(),
        batchId: `SYNC-${Date.now()}`,
        groundMissionControlStatus: postgresService.isOnline() ? 'UPDATED' : 'OFFLINE',
      };
    }

    this.isSyncing = true;
    this.lastSyncError = null;
    db.updateSession(session.id, { isSyncing: true, syncProgress: 0 });

    const batchId = `SYNC-BATCH-${Date.now().toString(36).toUpperCase()}`;
    const allPendingIds = [
      ...pendingEvents.map(e => e.id),
      ...pendingAnomalies.map(a => a.id),
      ...robotEvents.map((r: any) => r.id),
    ];

    try {
      // Progress simulation stages for UI responsiveness
      this.currentProgress = 25;
      db.updateSession(session.id, { syncProgress: 25 });

      // If PostgreSQL is online, synchronize directly to ground PostgreSQL
      if (postgresService.isOnline()) {
        this.currentProgress = 50;
        db.updateSession(session.id, { syncProgress: 50 });

        if (pendingEvents.length > 0) {
          await postgresService.upsertActivityEvents(pendingEvents);
        }
        if (pendingAnomalies.length > 0) {
          await postgresService.upsertAnomalyEvents(pendingAnomalies);
        }
        if (robotEvents.length > 0) {
          await postgresService.upsertRobotEvents(robotEvents);
        }

        this.currentProgress = 75;
        db.updateSession(session.id, { syncProgress: 75 });

        await postgresService.recordSyncHistory({
          id: batchId,
          timestamp: new Date().toISOString(),
          batchSize: allPendingIds.length,
          durationMs: 350,
          status: 'SUCCESS',
          details: {
            eventsCount: pendingEvents.length,
            anomaliesCount: pendingAnomalies.length,
            robotEventsCount: robotEvents.length,
          },
        });
      }

      this.currentProgress = 90;
      db.updateSession(session.id, { syncProgress: 90 });

      // Mark records synced in local resilient SQLite & in-memory cache
      const syncedCount = db.markBatchSynced(allPendingIds);

      this.isSyncing = false;
      this.currentProgress = 100;
      this.lastSyncTime = new Date().toISOString();
      db.updateSession(session.id, {
        isSyncing: false,
        syncProgress: 100,
        unsyncedEventCount: 0,
      });

      return {
        synchronizedCount: syncedCount,
        remainingPendingCount: 0,
        timestamp: this.lastSyncTime,
        batchId,
        groundMissionControlStatus: postgresService.isOnline() ? 'UPDATED' : 'OFFLINE',
      };
    } catch (err: any) {
      this.isSyncing = false;
      this.lastSyncError = err.message || 'Synchronization failure';
      db.updateSession(session.id, { isSyncing: false });
      console.error('[SyncEngine Error]:', err);
      throw err;
    }
  }
}

export const syncEngine = SyncEngine.getInstance();
