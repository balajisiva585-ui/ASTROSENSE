import { db } from '../database/db';
import { SyncResult } from '../types';

export class SyncEngine {
  private static instance: SyncEngine;
  private isSyncing: boolean = false;
  private currentProgress: number = 0;

  private constructor() {}

  public static getInstance(): SyncEngine {
    if (!SyncEngine.instance) {
      SyncEngine.instance = new SyncEngine();
    }
    return SyncEngine.instance;
  }

  public getSyncState() {
    const session = db.getSession();
    const pendingEvents = db.getEvents({ syncStatus: 'PENDING' });
    const pendingAnomalies = db.getAnomalies().filter(a => a.syncStatus === 'PENDING');

    return {
      commStatus: session.commStatus,
      isSyncing: this.isSyncing,
      syncProgress: this.currentProgress,
      pendingEventsCount: pendingEvents.length,
      pendingAnomaliesCount: pendingAnomalies.length,
      totalPendingItems: pendingEvents.length + pendingAnomalies.length,
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
        groundMissionControlStatus: 'UPDATED',
      };
    }

    const pendingEvents = db.getEvents({ syncStatus: 'PENDING' });
    const pendingAnomalies = db.getAnomalies().filter(a => a.syncStatus === 'PENDING');

    if (pendingEvents.length === 0 && pendingAnomalies.length === 0) {
      this.currentProgress = 100;
      db.updateSession(session.id, { syncProgress: 100, isSyncing: false, unsyncedEventCount: 0 });
      return {
        synchronizedCount: 0,
        remainingPendingCount: 0,
        timestamp: new Date().toISOString(),
        batchId: `SYNC-${Date.now()}`,
        groundMissionControlStatus: 'UPDATED',
      };
    }

    this.isSyncing = true;
    db.updateSession(session.id, { isSyncing: true, syncProgress: 0 });

    const batchId = `SYNC-BATCH-${Date.now().toString(36).toUpperCase()}`;
    const allPendingIds = [
      ...pendingEvents.map(e => e.id),
      ...pendingAnomalies.map(a => a.id),
    ];

    // Simulate multi-stage synchronization transmission
    const stages = [25, 50, 75, 100];
    for (const stage of stages) {
      this.currentProgress = stage;
      db.updateSession(session.id, { syncProgress: stage });
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    const syncedCount = db.markBatchSynced(allPendingIds);

    this.isSyncing = false;
    this.currentProgress = 100;
    db.updateSession(session.id, {
      isSyncing: false,
      syncProgress: 100,
      unsyncedEventCount: 0,
    });

    return {
      synchronizedCount: syncedCount,
      remainingPendingCount: 0,
      timestamp: new Date().toISOString(),
      batchId,
      groundMissionControlStatus: 'UPDATED',
    };
  }
}

export const syncEngine = SyncEngine.getInstance();
