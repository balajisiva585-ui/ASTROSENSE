import { AresRobot } from './AresRobot';
import { NovaRobot } from './NovaRobot';
import {
  RobotState,
  RobotId,
  RobotCommunicationMessage,
  RobotEvent,
  HabitatModule,
  CommStatus,
} from '../types';
import { db } from '../database/db';

export class RobotManager {
  private static instance: RobotManager;
  private ares: AresRobot;
  private nova: NovaRobot;
  private commLogs: RobotCommunicationMessage[] = [];
  private lastCoordinationTime: number = 0;

  private constructor() {
    this.ares = new AresRobot();
    this.nova = new NovaRobot();
    this.seedInitialCommLogs();
  }

  public static getInstance(): RobotManager {
    if (!RobotManager.instance) {
      RobotManager.instance = new RobotManager();
    }
    return RobotManager.instance;
  }

  private seedInitialCommLogs(): void {
    const now = Date.now();
    const iso = (minsAgo: number) => new Date(now - minsAgo * 60 * 1000).toISOString();
    const timeStr = (minsAgo: number) => new Date(now - minsAgo * 60 * 1000).toTimeString().split(' ')[0];

    this.commLogs = [
      {
        id: 'RCOMM-001',
        timestamp: iso(22),
        displayTime: timeStr(22),
        from: 'ARES-1',
        to: 'NOVA-2',
        message: 'AST-01 has initiated scheduled biological incubation assay in Laboratory.',
        priority: 'ROUTINE',
      },
      {
        id: 'RCOMM-002',
        timestamp: iso(21),
        displayTime: timeStr(21),
        from: 'NOVA-2',
        to: 'ARES-1',
        message: 'Laboratory incubator temperature and power draw are nominal (22.3°C, 320W).',
        priority: 'ROUTINE',
      },
      {
        id: 'RCOMM-003',
        timestamp: iso(14),
        displayTime: timeStr(14),
        from: 'ARES-1',
        to: 'NOVA-2',
        message: 'AST-04 has started cardiovascular countermeasure on exercise cycle.',
        priority: 'ROUTINE',
      },
      {
        id: 'RCOMM-004',
        timestamp: iso(13),
        displayTime: timeStr(13),
        from: 'NOVA-2',
        to: 'ARES-1',
        message: 'Exercise module ventilation increased to nominal workout airflow rate.',
        priority: 'ROUTINE',
      },
      {
        id: 'RCOMM-005',
        timestamp: iso(2),
        displayTime: timeStr(2),
        from: 'ARES-1',
        to: 'NOVA-2',
        message: 'Routine crew behavioral surveillance active across all 4 habitat modules.',
        priority: 'ROUTINE',
      },
      {
        id: 'RCOMM-006',
        timestamp: iso(1),
        displayTime: timeStr(1),
        from: 'NOVA-2',
        to: 'ARES-1',
        message: 'Telemetry monitoring nominal. Synthetic asteroid polar radar locked on 4 NEOs.',
        priority: 'ROUTINE',
      },
    ];
  }

  public getAllRobots(): RobotState[] {
    return [this.ares.getState(), this.nova.getState()];
  }

  public getRobot(id: RobotId): RobotState | null {
    if (id === 'ARES-1') return this.ares.getState();
    if (id === 'NOVA-2') return this.nova.getState();
    return null;
  }

  public getCommLogs(limit = 30): RobotCommunicationMessage[] {
    return this.commLogs.slice(0, limit);
  }

  public sendRobotAction(
    robotId: RobotId,
    action: 'START' | 'PAUSE' | 'RETURN' | 'PATROL' | 'INSPECT' | 'ASSIST' | 'STATUS',
    module?: HabitatModule
  ): { success: boolean; robot: RobotState; message: string } {
    let resultMessage = '';
    const now = new Date();
    const session = db.getSession();

    if (robotId === 'ARES-1') {
      resultMessage = this.ares.setAction(action, module);
    } else {
      resultMessage = this.nova.setAction(action, module);
    }

    // Log coordination message
    const commMsg: RobotCommunicationMessage = {
      id: `RCOMM-${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: now.toTimeString().split(' ')[0],
      from: robotId,
      to: robotId === 'ARES-1' ? 'NOVA-2' : 'ARES-1',
      message: `Action executed: [${action}] in ${module || 'ASSIGNED_STATION'}. Status: ONLINE.`,
      priority: 'ROUTINE',
    };
    this.commLogs.unshift(commMsg);
    if (this.commLogs.length > 50) this.commLogs.pop();

    // Store robot event persistently in local db
    const rEvt: RobotEvent = {
      id: `REVT-${Date.now()}`,
      robotId,
      robotName: robotId === 'ARES-1' ? 'ARES-1 (Crew Support)' : 'NOVA-2 (Engineering)',
      timestamp: now.toISOString(),
      missionId: 'MISSION_AURORA_042',
      task: action,
      status: 'ONLINE',
      location: module || 'HABITAT',
      eventType: robotId === 'ARES-1' ? 'CREW_REMINDER' : 'EQUIPMENT_CHECK',
      description: resultMessage,
      communicationStatus: session.commStatus,
      syncStatus: session.commStatus === 'ONLINE' ? 'SYNCED' : 'PENDING',
    };
    db.addRobotEvent(rEvt);

    return {
      success: true,
      robot: robotId === 'ARES-1' ? this.ares.getState() : this.nova.getState(),
      message: resultMessage,
    };
  }

  public onAnomalyDetected(anomaly: any): void {
    const aresMsg = this.ares.handleAnomaly(anomaly);
    const novaMsg = this.nova.handleAnomaly(anomaly);
    const now = new Date();
    const session = db.getSession();

    // Log inter-robot urgency dialogue
    const msg1: RobotCommunicationMessage = {
      id: `RCOMM-${Date.now()}-1`,
      timestamp: now.toISOString(),
      displayTime: now.toTimeString().split(' ')[0],
      from: 'ARES-1',
      to: 'NOVA-2',
      message: `CRITICAL ALERT: ${anomaly.description}. Dispatching verification protocol to ${anomaly.module || 'HABITAT'}.`,
      priority: 'CRITICAL',
    };

    const msg2: RobotCommunicationMessage = {
      id: `RCOMM-${Date.now()}-2`,
      timestamp: now.toISOString(),
      displayTime: now.toTimeString().split(' ')[0],
      from: 'NOVA-2',
      to: 'ARES-1',
      message: `Correlating telemetry with habitat accelerometer variance. No secondary hull breach detected.`,
      priority: 'CRITICAL',
    };

    this.commLogs.unshift(msg2);
    this.commLogs.unshift(msg1);
    if (this.commLogs.length > 50) this.commLogs.splice(50);

    // Save persistent event
    db.addRobotEvent({
      id: `REVT-ANOM-${Date.now()}`,
      robotId: 'ARES-1',
      robotName: 'ARES-1',
      timestamp: now.toISOString(),
      missionId: 'MISSION_AURORA_042',
      task: 'CREW_SAFETY_CHECK',
      status: 'ACTIVE',
      location: anomaly.module || 'HABITAT',
      eventType: 'SAFETY_DISPATCH',
      description: `ARES-1 initiated crew safety check in response to ${anomaly.id}. NOVA-2 monitoring telemetry.`,
      communicationStatus: session.commStatus,
      syncStatus: session.commStatus === 'ONLINE' ? 'SYNCED' : 'PENDING',
    });
  }

  public onAsteroidAnomalyDetected(asteroid: any): void {
    const novaMsg = this.nova.handleAsteroidAnomaly(asteroid);
    const now = new Date();
    const session = db.getSession();

    const msg: RobotCommunicationMessage = {
      id: `RCOMM-${Date.now()}-AST`,
      timestamp: now.toISOString(),
      displayTime: now.toTimeString().split(' ')[0],
      from: 'NOVA-2',
      to: 'ARES-1',
      message: `ASTEROID ALERT: ${asteroid.name} trajectory delta-V variance detected. Logging ephemeris covariance.`,
      priority: 'ELEVATED',
    };
    this.commLogs.unshift(msg);

    db.addRobotEvent({
      id: `REVT-AST-${Date.now()}`,
      robotId: 'NOVA-2',
      robotName: 'NOVA-2',
      timestamp: now.toISOString(),
      missionId: 'MISSION_AURORA_042',
      task: 'ASTEROID_TRAJECTORY_CALIBRATION',
      status: 'ACTIVE',
      location: 'CONTROL_MODULE',
      eventType: 'TELEMETRY_ALERT',
      description: `NOVA-2 processing trajectory deviation for ${asteroid.name}.`,
      communicationStatus: session.commStatus,
      syncStatus: session.commStatus === 'ONLINE' ? 'SYNCED' : 'PENDING',
    });
  }

  public tick(isOffline: boolean): void {
    this.ares.tick(isOffline);
    this.nova.tick(isOffline);

    // Generate periodic inter-robot heartbeat coordination messages every ~30 seconds
    const now = Date.now();
    if (now - this.lastCoordinationTime > 28000) {
      this.lastCoordinationTime = now;
      const timeStr = new Date().toTimeString().split(' ')[0];
      const iso = new Date().toISOString();

      if (isOffline) {
        this.commLogs.unshift({
          id: `RCOMM-AUTO-${now}`,
          timestamp: iso,
          displayTime: timeStr,
          from: 'NOVA-2',
          to: 'ARES-1',
          message: 'AUTONOMOUS MODE ACTIVE: Local telemetry logging nominal. Earth uplink disconnected.',
          priority: 'ROUTINE',
        });
      } else {
        const routineNotes = [
          'ARES-1: Station acoustic sensors nominal. Crew moving on schedule.',
          'NOVA-2: Power bus 1 and 2 balance is 100%. Solar array tracking aligned.',
          'ARES-1: Routine hydration and environmental reminder queue verified.',
          'NOVA-2: ECLSS atmospheric recycling loop efficiency at 99.4%.',
        ];
        const randomNote = routineNotes[Math.floor(Math.random() * routineNotes.length)];
        const fromRobot: RobotId = randomNote.startsWith('ARES') ? 'ARES-1' : 'NOVA-2';
        const toRobot: RobotId = fromRobot === 'ARES-1' ? 'NOVA-2' : 'ARES-1';

        this.commLogs.unshift({
          id: `RCOMM-AUTO-${now}`,
          timestamp: iso,
          displayTime: timeStr,
          from: fromRobot,
          to: toRobot,
          message: randomNote.split(':')[1]?.trim() || randomNote,
          priority: 'ROUTINE',
        });
      }

      if (this.commLogs.length > 50) this.commLogs.pop();
    }
  }

  public askRobot(robotId: RobotId, query: string, context: any): string {
    if (robotId === 'ARES-1') {
      return this.ares.generateResponse(query, context);
    } else {
      return this.nova.generateResponse(query, context);
    }
  }
}

export const robotManager = RobotManager.getInstance();
