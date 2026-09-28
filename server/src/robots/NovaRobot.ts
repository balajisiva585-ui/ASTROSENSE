import { RobotState, HabitatModule } from '../types';

export class NovaRobot {
  private state: RobotState;

  constructor() {
    this.state = {
      id: 'NOVA-2',
      name: 'NOVA-2',
      role: 'Autonomous Engineering Diagnostics & Telemetry Specialist',
      type: 'ENGINEERING_SUPPORT',
      status: 'ONLINE',
      batteryPct: 93.2,
      location: 'CONTROL_MODULE',
      currentTask: 'Autonomous Telemetry Diagnostics & Deep Space Asteroid Radar Tracking',
      mode: 'NORMAL',
      subsystemHealth: 'OPTIMAL',
      lastActionTime: new Date().toISOString(),
      actionsHistory: [
        'Initialized in Control Module avionics bay',
        'Calibrated 1Hz ECLSS sensor bus',
        'Locked synthetic polar radar to 4 Near-Earth Objects',
      ],
      personalityStyle: 'TECHNICAL_ANALYTICAL',
    };
  }

  public getState(): RobotState {
    return { ...this.state };
  }

  public setAction(action: 'START' | 'PAUSE' | 'RETURN' | 'PATROL' | 'INSPECT' | 'ASSIST' | 'STATUS', module?: HabitatModule): string {
    const now = new Date().toISOString();
    this.state.lastActionTime = now;

    switch (action) {
      case 'INSPECT':
        this.state.status = 'INSPECTING';
        if (module) this.state.location = module;
        this.state.currentTask = `Performing thermal bus & power distribution diagnostic in ${this.state.location.replace(/_/g, ' ')}`;
        this.state.actionsHistory.unshift(`Telemetry diagnostic completed for ${this.state.location}`);
        return `NOVA-2 diagnostic sweep complete: Subsystem voltages nominal (28V DC bus). ECLSS pressure stable at 101.3 kPa.`;

      case 'PATROL':
        this.state.status = 'PATROLLING';
        if (module) this.state.location = module;
        this.state.currentTask = `Conducting RF link and sensor bus latency patrol in ${this.state.location.replace(/_/g, ' ')}`;
        this.state.actionsHistory.unshift(`Avionics bus patrol in ${this.state.location}`);
        return `NOVA-2 scanning hardware nodes. No packet drop detected on local avionics loop.`;

      case 'ASSIST':
        this.state.status = 'ASSISTING';
        this.state.currentTask = 'Assisting station pilot with orbital state vector calculations';
        this.state.actionsHistory.unshift(`Navigation assistance engaged`);
        return `NOVA-2 telemetry computation ready. Orbital altitude 418.5 km, velocity 7.67 km/s verified.`;

      case 'RETURN':
        this.state.status = 'STANDBY';
        this.state.location = 'CONTROL_MODULE';
        this.state.currentTask = 'Docked at Control Module avionics terminal';
        this.state.actionsHistory.unshift(`Returned to avionics bay`);
        return `NOVA-2 docked at primary engineering hub. Continuous telemetry logging active.`;

      case 'PAUSE':
        this.state.status = 'STANDBY';
        this.state.currentTask = 'Engineering diagnostic sweep paused by operator';
        this.state.actionsHistory.unshift(`Telemetry monitoring paused`);
        return `NOVA-2 holding standby state. Background anomaly watcher remains armed.`;

      case 'START':
      default:
        this.state.status = 'ONLINE';
        this.state.currentTask = 'Autonomous Telemetry Diagnostics & Deep Space Asteroid Radar Tracking';
        this.state.actionsHistory.unshift(`Continuous telemetry diagnostics resumed`);
        return `NOVA-2 online. All telemetry telemetry channels locked and logging nominal.`;
    }
  }

  public generateResponse(query: string, context: { telemetry: any; asteroids: any[]; anomalies: any[]; isOffline: boolean }): string {
    const q = query.toLowerCase();

    if (q.includes('status') || q.includes('doing') || q.includes('monitoring')) {
      const t = context.telemetry || { cabinTemperature: 22.4, cabinPressure: 101.3, orbitAltitudeKm: 418.5 };
      return `Telemetry check complete. All monitored subsystem values are within simulated nominal ranges: Cabin Temp ${t.cabinTemperature}°C, Pressure ${t.cabinPressure} kPa, Altitude ${t.orbitAltitudeKm} km. Battery SOC ${this.state.batteryPct.toFixed(0)}%.`;
    }

    if (q.includes('asteroid') || q.includes('deep space') || q.includes('radar')) {
      const astCount = context.asteroids?.length || 4;
      const anomAst = context.asteroids?.find((a: any) => a.isAnomaly);
      if (anomAst) {
        return `Radar telemetry alert: ${anomAst.name} displaying trajectory delta-V variance (+0.08 km/s). Optical cross-verification protocol recommended.`;
      }
      return `Synthetic polar radar tracking ${astCount} Near-Earth Objects. All trajectory vectors are within nominal 3-sigma confidence envelopes.`;
    }

    if (q.includes('power') || q.includes('battery') || q.includes('telemetry')) {
      return `Power subsystem telemetry: Solar array generation is nominal. Li-ion battery bus state-of-charge is ${this.state.batteryPct.toFixed(0)}%. No thermal runaway or ground fault detected.`;
    }

    return `NOVA-2 acknowledging query. Continuous spacecraft telemetry and asteroid radar surveillance are operational.`;
  }

  public handleAnomaly(anomaly: any): string {
    this.state.status = 'INSPECTING';
    this.state.currentTask = `MONITORING: Environmental and equipment telemetry for secondary anomalies following ${anomaly.id}`;
    this.state.actionsHistory.unshift(`Secondary telemetry sweep initiated for ${anomaly.id}`);
    return `Monitoring environmental and equipment telemetry for secondary anomalies. Cabin pressure, thermal loops, and structural acoustic sensors stable.`;
  }

  public handleAsteroidAnomaly(asteroid: any): string {
    this.state.status = 'INSPECTING';
    this.state.currentTask = `RADAR ALERT: Computing Doppler covariance matrix for ${asteroid.name}`;
    this.state.actionsHistory.unshift(`Asteroid variance alert processed for ${asteroid.id}`);
    return `NOVA-2 processing asteroid anomaly for ${asteroid.name}. Radar trajectory deviation registered. Queuing local verification packet.`;
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
      this.state.batteryPct = Math.min(99.5, this.state.batteryPct + 0.03);
    } else {
      this.state.batteryPct = Math.max(50.0, this.state.batteryPct - 0.015);
    }

    if (this.state.actionsHistory.length > 20) {
      this.state.actionsHistory.pop();
    }
  }
}
