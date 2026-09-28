import { RobotState, HabitatModule } from '../types';

export class AresRobot {
  private state: RobotState;

  constructor() {
    this.state = {
      id: 'ARES-1',
      name: 'ARES-1',
      role: 'Autonomous Crew Support & Habitat Assistant',
      type: 'CREW_SUPPORT',
      status: 'ONLINE',
      batteryPct: 88.5,
      location: 'LABORATORY',
      currentTask: 'Autonomous Crew Behavioral Surveillance & Routine Support',
      mode: 'NORMAL',
      subsystemHealth: 'OPTIMAL',
      lastActionTime: new Date().toISOString(),
      actionsHistory: [
        'Initialized in Laboratory Module',
        'Verified habitat acoustic sensors',
        'Logged scheduled nutrition window for AST-01',
      ],
      personalityStyle: 'CALM_CREW_FOCUSED',
    };
  }

  public getState(): RobotState {
    return { ...this.state };
  }

  public setAction(action: 'START' | 'PAUSE' | 'RETURN' | 'PATROL' | 'INSPECT' | 'ASSIST' | 'STATUS', module?: HabitatModule): string {
    const now = new Date().toISOString();
    this.state.lastActionTime = now;

    switch (action) {
      case 'PATROL':
        this.state.status = 'PATROLLING';
        if (module) this.state.location = module;
        this.state.currentTask = `Patrolling ${this.state.location.replace(/_/g, ' ')} for crew posture monitoring`;
        this.state.actionsHistory.unshift(`Started patrol in ${this.state.location} at ${new Date().toLocaleTimeString()}`);
        return `ARES-1 initiating routine patrol in ${this.state.location.replace(/_/g, ' ')}. Monitoring crew activity.`;

      case 'INSPECT':
        this.state.status = 'INSPECTING';
        if (module) this.state.location = module;
        this.state.currentTask = `Conducting crew quarters & safety harness inspection in ${this.state.location.replace(/_/g, ' ')}`;
        this.state.actionsHistory.unshift(`Safety inspection conducted in ${this.state.location}`);
        return `ARES-1 inspecting habitat module ${this.state.location.replace(/_/g, ' ')}. Life support sensors verified.`;

      case 'ASSIST':
        this.state.status = 'ASSISTING';
        this.state.currentTask = 'Assisting AST-01 with laboratory assay logging and schedule tracking';
        this.state.actionsHistory.unshift(`Crew assist protocol active`);
        return `ARES-1 standing by for crew assistance. Voice interaction and task reminders active.`;

      case 'RETURN':
        this.state.status = 'STANDBY';
        this.state.location = 'LABORATORY';
        this.state.currentTask = 'Docked at primary Laboratory charging station';
        this.state.actionsHistory.unshift(`Returned to Laboratory dock`);
        return `ARES-1 returned to primary dock. Battery trickle-charge active.`;

      case 'PAUSE':
        this.state.status = 'STANDBY';
        this.state.currentTask = 'Standing by for flight crew instructions';
        this.state.actionsHistory.unshift(`Task paused by operator`);
        return `ARES-1 holding current position. Autonomous reminders paused.`;

      case 'START':
      default:
        this.state.status = 'ONLINE';
        this.state.currentTask = 'Active crew support and routine schedule monitoring';
        this.state.actionsHistory.unshift(`Routine crew monitoring resumed`);
        return `ARES-1 active. All crew routine schedules synchronized.`;
    }
  }

  public generateResponse(query: string, context: { crew: any[]; anomalies: any[]; isOffline: boolean }): string {
    const q = query.toLowerCase();

    if (q.includes('status') || q.includes('doing') || q.includes('health')) {
      return `ARES-1 online in ${this.state.location.replace(/_/g, ' ')}. Battery is at ${this.state.batteryPct.toFixed(0)}%. Currently performing: ${this.state.currentTask}. All monitored crew members appear nominal.`;
    }

    if (q.includes('crew') || q.includes('astronaut')) {
      const workingCrew = context.crew.filter(c => c.currentActivity === 'WORKING' || c.currentActivity === 'OPERATING_EQUIPMENT');
      return `Crew status check: ${workingCrew.length} of 4 astronauts are engaged in scheduled research and station operations. AST-01 is in the Laboratory. Routine wellness reminders are queued.`;
    }

    if (q.includes('schedule') || q.includes('routine') || q.includes('reminder')) {
      return `Scheduled timetable is synchronized. Upcoming window: AST-01 laboratory work block completes at 12:30 UTC for nutrition intake. Rest window scheduled at 22:00.`;
    }

    return `ARES-1 acknowledging. Crew routine parameters are nominal. I am monitoring habitat safety and timeline milestones.`;
  }

  public handleAnomaly(anomaly: any): string {
    this.state.status = 'ASSISTING';
    this.state.currentTask = `SAFETY ALERT: Verifying AST-01 posture and life signs in ${anomaly.module || 'HABITAT'}`;
    this.state.actionsHistory.unshift(`Safety dispatch initiated for ${anomaly.id}`);
    return `Crew safety event detected. Beginning local crew-status verification in ${anomaly.module || 'HABITAT'}. Acoustic safety check initiated.`;
  }

  public tick(isOffline: boolean): void {
    if (isOffline) {
      this.state.mode = 'AUTONOMOUS';
      if (this.state.status === 'ONLINE') this.state.status = 'AUTONOMOUS';
    } else {
      this.state.mode = 'NORMAL';
      if (this.state.status === 'AUTONOMOUS') this.state.status = 'ONLINE';
    }

    // Battery simulation
    if (this.state.status === 'STANDBY') {
      this.state.batteryPct = Math.min(99.0, this.state.batteryPct + 0.04);
    } else {
      this.state.batteryPct = Math.max(45.0, this.state.batteryPct - 0.02);
    }

    if (this.state.actionsHistory.length > 20) {
      this.state.actionsHistory.pop();
    }
  }
}
