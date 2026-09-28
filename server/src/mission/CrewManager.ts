import { Astronaut, ActivityType, HabitatModule } from '../types';
import { db } from '../database/db';

export class CrewManager {
  private static instance: CrewManager;
  private crew: Record<string, Astronaut> = {};

  private constructor() {
    this.seedCrew();
  }

  public static getInstance(): CrewManager {
    if (!CrewManager.instance) {
      CrewManager.instance = new CrewManager();
    }
    return CrewManager.instance;
  }

  private seedCrew(): void {
    const ast01 = db.getAstronaut('AST-01');

    this.crew = {
      'AST-01': {
        ...ast01,
        id: 'AST-01',
        name: 'Dr. Elena Vance',
        role: 'Payload Commander & Astrobiologist',
        currentModule: 'LABORATORY',
        currentActivity: 'WORKING',
        activityConfidence: 96.4,
        movementState: 'STATIONARY',
        assignedTask: 'Microgravity Bio-Incubation Assay',
      },
      'AST-02': {
        id: 'AST-02',
        name: 'Commander Marcus Chen',
        role: 'Station Commander & Pilot',
        mission: 'MISSION AURORA',
        missionDay: 42,
        currentModule: 'CONTROL_MODULE',
        currentActivity: 'OPERATING_EQUIPMENT',
        activityConfidence: 97.2,
        currentStatus: 'NORMAL',
        activityDurationSeconds: 420,
        lastActivity: 'SITTING',
        movementState: 'STATIONARY',
        assignedTask: 'Orbital Station-Keeping Guidance Check',
        vitals: {
          heartRate: 68,
          spO2: 99,
          bodyTemp: 36.6,
          respiratoryRate: 14,
          metabolicKcalHour: 105,
        },
        stats: {
          totalActiveSeconds: 19200,
          totalInactiveSeconds: 11400,
          exerciseSeconds: 4800,
          workingSeconds: 12600,
          eatingDrinkingSeconds: 2200,
          sleepingSeconds: 28800,
          anomaliesDetected: 0,
          totalDetections: 52,
        },
      },
      'AST-03': {
        id: 'AST-03',
        name: 'Dr. Sarah Lindqvist',
        role: 'Flight Engineer & Systems Specialist',
        mission: 'MISSION AURORA',
        missionDay: 42,
        currentModule: 'WORKSTATION',
        currentActivity: 'SITTING',
        activityConfidence: 95.8,
        currentStatus: 'NORMAL',
        activityDurationSeconds: 610,
        lastActivity: 'WALKING',
        movementState: 'STATIONARY',
        assignedTask: 'ECLSS Atmospheric Recirculation Diagnostic',
        vitals: {
          heartRate: 72,
          spO2: 98,
          bodyTemp: 36.7,
          respiratoryRate: 15,
          metabolicKcalHour: 95,
        },
        stats: {
          totalActiveSeconds: 17800,
          totalInactiveSeconds: 12800,
          exerciseSeconds: 3600,
          workingSeconds: 13200,
          eatingDrinkingSeconds: 2100,
          sleepingSeconds: 28800,
          anomaliesDetected: 0,
          totalDetections: 45,
        },
      },
      'AST-04': {
        id: 'AST-04',
        name: 'Kenji Sato',
        role: 'Payload Specialist & Robotics Engineer',
        mission: 'MISSION AURORA',
        missionDay: 42,
        currentModule: 'EXERCISE_AREA',
        currentActivity: 'EXERCISING',
        activityConfidence: 98.1,
        currentStatus: 'NORMAL',
        activityDurationSeconds: 1320,
        lastActivity: 'WALKING',
        movementState: 'HIGH_KINETIC',
        assignedTask: 'Mandatory Aerobic Countermeasure (Cycle Ergometer)',
        vitals: {
          heartRate: 138,
          spO2: 98,
          bodyTemp: 37.2,
          respiratoryRate: 26,
          metabolicKcalHour: 440,
        },
        stats: {
          totalActiveSeconds: 21000,
          totalInactiveSeconds: 9600,
          exerciseSeconds: 5400,
          workingSeconds: 11000,
          eatingDrinkingSeconds: 2500,
          sleepingSeconds: 28800,
          anomaliesDetected: 0,
          totalDetections: 60,
        },
      },
    };
  }

  public getAllCrew(): Astronaut[] {
    // Keep AST-01 synchronized with main database
    const ast01 = db.getAstronaut('AST-01');
    this.crew['AST-01'] = {
      ...this.crew['AST-01'],
      ...ast01,
    };
    return Object.values(this.crew);
  }

  public getAstronaut(id: string): Astronaut | undefined {
    if (id === 'AST-01') {
      const ast01 = db.getAstronaut('AST-01');
      this.crew['AST-01'] = { ...this.crew['AST-01'], ...ast01 };
    }
    return this.crew[id];
  }

  public updateCrewActivity(id: string, activity: ActivityType, module?: HabitatModule): Astronaut | undefined {
    const astro = this.crew[id];
    if (!astro) return undefined;

    astro.lastActivity = astro.currentActivity;
    astro.currentActivity = activity;
    if (module) astro.currentModule = module;
    astro.activityDurationSeconds = 0;
    astro.activityConfidence = Math.round((93.5 + Math.random() * 5.5) * 10) / 10;

    if (activity === 'EXERCISING') {
      astro.movementState = 'HIGH_KINETIC';
      astro.vitals.heartRate = 135 + Math.floor(Math.random() * 10);
      astro.vitals.metabolicKcalHour = 420;
    } else if (activity === 'FALL_ABNORMAL_MOVEMENT') {
      astro.movementState = 'ERRATIC';
      astro.currentStatus = 'CRITICAL';
      astro.vitals.heartRate = 115 + Math.floor(Math.random() * 10);
    } else if (activity === 'WALKING' || activity === 'PICKING_CARRYING') {
      astro.movementState = 'TRANSLATING';
      astro.vitals.heartRate = 88 + Math.floor(Math.random() * 6);
    } else {
      astro.movementState = 'STATIONARY';
      astro.vitals.heartRate = 68 + Math.floor(Math.random() * 8);
    }

    if (id === 'AST-01') {
      db.updateAstronaut('AST-01', astro);
    }

    return astro;
  }

  public tick(): void {
    // Increment duration counters for all crew members
    Object.values(this.crew).forEach(a => {
      a.activityDurationSeconds += 1;
      if (a.currentActivity === 'EXERCISING') {
        a.vitals.heartRate = 135 + Math.floor(Math.random() * 8);
      }
    });
  }
}

export const crewManager = CrewManager.getInstance();
