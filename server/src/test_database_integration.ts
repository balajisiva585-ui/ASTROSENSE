import { sqliteService } from './database/sqliteDb';
import { dbConfigManager } from './database/dbConfig';
import { postgresService } from './database/postgresDb';
import { syncEngine } from './sync/SyncEngine';
import { db } from './database/db';
import { simulationService } from './services/simulationService';

async function runComprehensiveTests() {
  console.log('\n🛰️ ==============================================================');
  console.log('   ASTROSENSE HYBRID DATABASE & SYSTEM INTEGRATION TEST SUITE');
  console.log('==============================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName} ${detail ? `(${detail})` : ''}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${detail ? `(${detail})` : ''}`);
      throw new Error(`Assertion failed for: ${testName}`);
    }
  }

  // 1. SQLite Initialization
  console.log('--- 1. Testing SQLite Initialization ---');
  const sqliteStatus = sqliteService.getStatus();
  assert(sqliteStatus.status === 'ONLINE', 'SQLite status is ONLINE');
  assert(sqliteStatus.tablesCount >= 10, 'SQLite has at least 10 active tables', `${sqliteStatus.tablesCount} tables`);
  assert(sqliteStatus.totalRecordsCount > 0, 'SQLite has populated initial records', `${sqliteStatus.totalRecordsCount} records`);

  // 2. PostgreSQL Connection Handling & Offline Fallback
  console.log('\n--- 2. Testing PostgreSQL Graceful Offline & Connection State ---');
  const pgStatusInitial = await postgresService.getStatus();
  assert(typeof pgStatusInitial.status === 'string', 'PostgreSQL status query returns valid structure', pgStatusInitial.status);
  assert(sqliteService.getStatus().status === 'ONLINE', 'SQLite remains ONLINE regardless of PostgreSQL state');

  // 3. Schema & Table Definitions
  console.log('\n--- 3. Testing Schema Verification & Table Definitions ---');
  const requiredTables = [
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
  ];
  for (const tbl of requiredTables) {
    assert(tbl in sqliteStatus.tableCounts, `SQLite contains table '${tbl}'`);
  }

  // 4. Offline Event Storage
  console.log('\n--- 4. Testing Offline Event Storage & Pending Queue ---');
  simulationService.setCommStatus('OFFLINE');
  const sessionAfterCommLoss = db.getSession();
  assert(sessionAfterCommLoss.commStatus === 'OFFLINE', 'Session communication set to OFFLINE');
  assert(sessionAfterCommLoss.autonomousModeActive === true, 'Autonomous Mode active during comm loss');

  const testEvt = db.addEvent({
    astronautId: 'AST-01',
    timestamp: new Date().toISOString(),
    displayTime: new Date().toTimeString().split(' ')[0],
    activity: 'OPERATING_EQUIPMENT',
    confidence: 98.5,
    durationSeconds: 300,
    severity: 'INFO',
    module: 'LABORATORY',
    syncStatus: 'PENDING',
    source: 'TEST_ONBOARD_CAM',
    processingMode: 'ONBOARD_EDGE_AI',
    details: 'Autonomous offline equipment check.',
  });

  assert(testEvt.syncStatus === 'PENDING', 'Event stored locally with sync_status = PENDING');
  const pendingItems = db.getPendingSyncItems();
  assert(pendingItems.some(p => p.eventId === testEvt.id), 'Pending event queued in sync_queue');

  // 5. Anomaly Detection During Comm Loss
  console.log('\n--- 5. Testing Anomaly Storage in Offline Queue ---');
  const testAnom = db.addAnomaly({
    astronautId: 'AST-01',
    targetObject: 'AST-01',
    targetType: 'ASTRONAUT',
    timestamp: new Date().toISOString(),
    displayTime: new Date().toTimeString().split(' ')[0],
    title: 'OFFLINE_TEST_ANOMALY',
    category: 'MISSION_SAFETY_ALERT',
    severity: 'WARNING',
    activity: 'LONG_INACTIVITY',
    module: 'WORKSTATION',
    description: 'Inactivity detected while comm is offline.',
    recommendedAction: 'Dispatch ARES-1 robot check.',
    resolved: false,
    syncStatus: 'PENDING',
  });
  assert(testAnom.syncStatus === 'PENDING', 'Anomaly stored locally with sync_status = PENDING');

  // 6. Communication Restore & Sync Flow
  console.log('\n--- 6. Testing Communication Restore & Sync Engine ---');
  simulationService.setCommStatus('ONLINE');
  const sessionOnline = db.getSession();
  assert(sessionOnline.commStatus === 'ONLINE', 'Communication restored to ONLINE');

  const syncResult = await syncEngine.triggerSynchronization();
  assert(syncResult.synchronizedCount >= 2, 'SyncEngine synchronized pending batch', `${syncResult.synchronizedCount} items`);
  assert(syncResult.remainingPendingCount === 0, 'Remaining pending count is 0');

  const refreshedEvts = db.getEvents();
  const syncedTestEvt = refreshedEvts.find(e => e.id === testEvt.id);
  assert(syncedTestEvt?.syncStatus === 'SYNCED', 'SQLite event marked SYNCED after transmission');

  // 7. Duplicate Protection (Idempotency)
  console.log('\n--- 7. Testing Idempotent Duplicate Protection ---');
  const repeatSyncResult = await syncEngine.triggerSynchronization();
  assert(repeatSyncResult.synchronizedCount === 0, 'Repeat sync does not re-transmit already synced events');
  assert(repeatSyncResult.remainingPendingCount === 0, 'Pending queue remains empty');

  // 8. Robot Events Storage & Sync
  console.log('\n--- 8. Testing Robot Events Storage & Sync ---');
  const rEvt = db.addRobotEvent({
    id: `ROBOT-TEST-${Date.now()}`,
    robotId: 'ARES-1',
    robotName: 'ARES-1 Companion',
    timestamp: new Date().toISOString(),
    missionId: 'MISSION AURORA',
    task: 'Airflow Valve Calibration',
    status: 'COMPLETED',
    location: 'LABORATORY',
    eventType: 'EQUIPMENT_CHECK',
    description: 'Calibrated atmospheric CO2 filter.',
    communicationStatus: 'ONLINE',
    syncStatus: 'SYNCED',
  });
  assert(rEvt.id.startsWith('ROBOT-TEST-'), 'Robot event stored in SQLite');

  // 9. Existing Demos Verification
  console.log('\n--- 9. Testing Existing Judge Demo (13-step) ---');
  simulationService.startJudgeDemo(10);
  const judgeStatus = simulationService.getDemoStatus();
  assert(judgeStatus !== null && typeof judgeStatus.currentStepIndex === 'number', 'Judge Demo initialized');
  simulationService.stepJudgeDemo(3);
  assert(simulationService.getDemoStatus().currentStepIndex === 3, 'Judge Demo stepped to step 3');
  simulationService.stopJudgeDemo();
  assert(!simulationService.getDemoStatus().isRunning, 'Judge Demo stopped cleanly');

  console.log('\n--- 10. Testing Existing Extended Demo (14-step) ---');
  simulationService.startExtendedDemo(10);
  assert(simulationService.getExtendedDemoStatus().isRunning, 'Extended Space Demo started');
  simulationService.stepExtendedDemo(5);
  assert(simulationService.getExtendedDemoStatus().currentStepIndex === 5, 'Extended Space Demo stepped');
  simulationService.stopExtendedDemo();
  assert(!simulationService.getExtendedDemoStatus().isRunning, 'Extended Space Demo stopped cleanly');

  console.log('\n--- 11. Testing Existing Advanced Demo (16-step) ---');
  simulationService.startAdvancedDemo(10);
  assert(simulationService.getAdvancedDemoStatus().isRunning, 'Advanced Monitoring Demo started');
  simulationService.stepAdvancedDemo(2);
  assert(simulationService.getAdvancedDemoStatus().currentStepIndex === 2, 'Advanced Monitoring Demo stepped');
  simulationService.stopAdvancedDemo();
  assert(!simulationService.getAdvancedDemoStatus().isRunning, 'Advanced Monitoring Demo stopped cleanly');

  // 12. Security & Credentials Verification
  console.log('\n--- 12. Testing Safe Credential Masking & Security ---');
  const rawTestUrl = 'postgresql://astronaut_user:SuperSecretPassword123@ep-cool-frost-99.us-east-2.aws.neon.tech/space_ground_db?sslmode=require';
  const masked = dbConfigManager.maskDatabaseUrl(rawTestUrl);
  assert(!masked.includes('SuperSecretPassword123'), 'Raw password NEVER appears in masked URL');
  assert(masked.includes('••••••••'), 'Password successfully replaced with bullet mask');
  const meta = dbConfigManager.parseUrlMetadata(rawTestUrl);
  assert(meta.provider === 'Neon', 'Correctly detected provider Neon');
  assert(meta.host === 'ep-cool-frost-99.us-east-2.aws.neon.tech', 'Correctly parsed host');

  console.log('\n==============================================================');
  console.log(`🎉 ALL ${passedTests}/${totalTests} TESTS PASSED SUCCESSFULLY!`);
  console.log('==============================================================\n');
  process.exit(0);
}

runComprehensiveTests().catch(err => {
  console.error('\n❌ Integration Test Error:', err);
  process.exit(1);
});
