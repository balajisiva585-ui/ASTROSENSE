import {
  CrewRoutineTask,
  CrewScheduleOverview,
  RoutineAnnouncement,
  ActivityType,
  HabitatModule,
} from '../types';
import { db } from '../database/db';

export class CrewRoutineManager {
  private static instance: CrewRoutineManager;
  private tasks: Record<string, CrewRoutineTask[]> = {};
  private announcements: RoutineAnnouncement[] = [];
  private voiceAnnouncementsEnabled: boolean = true;
  private announcementVolume: number = 80;

  private constructor() {
    this.seedInitialSchedules();
  }

  public static getInstance(): CrewRoutineManager {
    if (!CrewRoutineManager.instance) {
      CrewRoutineManager.instance = new CrewRoutineManager();
    }
    return CrewRoutineManager.instance;
  }

  private seedInitialSchedules(): void {
    const now = Date.now();
    const timeStr = (hours: number, minutes: number) =>
      `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    this.tasks = {
      'AST-01': [
        {
          id: 'TASK-01-1',
          astronautId: 'AST-01',
          timeSlot: '07:30 - 08:30',
          title: 'Morning Briefing & Telemetry Alignment',
          activityType: 'WORKING',
          category: 'MISSION_TASK',
          module: 'CONTROL_MODULE',
          status: 'COMPLETED',
          notes: 'Synchronized daily objectives with Ground Mission Control.',
        },
        {
          id: 'TASK-01-2',
          astronautId: 'AST-01',
          timeSlot: '08:30 - 12:30',
          title: 'Biological & Activity Surveillance Assay Setup',
          activityType: 'WORKING',
          category: 'WORK',
          module: 'LABORATORY',
          status: 'ACTIVE',
          notes: 'Executing microgravity cellular incubation study.',
        },
        {
          id: 'TASK-01-3',
          astronautId: 'AST-01',
          timeSlot: '12:30 - 13:30',
          title: 'Midday Scheduled Nutrition & Hydration',
          activityType: 'EATING',
          category: 'MEAL',
          module: 'CREW_QUARTERS',
          status: 'PENDING',
          notes: 'Required metabolic intake tracking.',
        },
        {
          id: 'TASK-01-4',
          astronautId: 'AST-01',
          timeSlot: '13:30 - 16:30',
          title: 'Incubation Optical Microscopy & Data Log',
          activityType: 'WORKING',
          category: 'WORK',
          module: 'LABORATORY',
          status: 'PENDING',
          notes: 'Fine motor manipulation recordings.',
        },
        {
          id: 'TASK-01-5',
          astronautId: 'AST-01',
          timeSlot: '17:00 - 19:00',
          title: 'Cardiovascular & Bone Density Exercise',
          activityType: 'EXERCISING',
          category: 'EXERCISE',
          module: 'EXERCISE_AREA',
          status: 'PENDING',
          notes: 'ARED resistive exercise countermeasure.',
        },
        {
          id: 'TASK-01-6',
          astronautId: 'AST-01',
          timeSlot: '20:00 - 22:00',
          title: 'Personal Rest & Family Downlink',
          activityType: 'SLEEPING_RESTING',
          category: 'REST',
          module: 'CREW_QUARTERS',
          status: 'PENDING',
          notes: 'Pre-sleep relaxation and journal entry.',
        },
        {
          id: 'TASK-01-7',
          astronautId: 'AST-01',
          timeSlot: '22:00 - 06:30',
          title: 'Scheduled Sleep Period',
          activityType: 'SLEEPING_RESTING',
          category: 'SLEEP',
          module: 'CREW_QUARTERS',
          status: 'PENDING',
          notes: 'Circadian lighting dimmed.',
        },
      ],
      'AST-02': [
        {
          id: 'TASK-02-1',
          astronautId: 'AST-02',
          timeSlot: '08:00 - 11:30',
          title: 'Guidance & Orbit Station-Keeping Check',
          activityType: 'OPERATING_EQUIPMENT',
          category: 'EQUIPMENT_OPERATION',
          module: 'CONTROL_MODULE',
          status: 'ACTIVE',
          notes: 'Reaction wheel momentum desaturation.',
        },
        {
          id: 'TASK-02-2',
          astronautId: 'AST-02',
          timeSlot: '11:30 - 12:30',
          title: 'Scheduled Meal Period',
          activityType: 'EATING',
          category: 'MEAL',
          module: 'CREW_QUARTERS',
          status: 'PENDING',
        },
        {
          id: 'TASK-02-3',
          astronautId: 'AST-02',
          timeSlot: '13:00 - 15:00',
          title: 'Aerobic Exercise (T2 Treadmill)',
          activityType: 'EXERCISING',
          category: 'EXERCISE',
          module: 'EXERCISE_AREA',
          status: 'PENDING',
        },
        {
          id: 'TASK-02-4',
          astronautId: 'AST-02',
          timeSlot: '15:30 - 19:30',
          title: 'Life Support Subsystem Filter Inspection',
          activityType: 'OPERATING_EQUIPMENT',
          category: 'MISSION_TASK',
          module: 'STORAGE',
          status: 'PENDING',
        },
      ],
      'AST-03': [
        {
          id: 'TASK-03-1',
          astronautId: 'AST-03',
          timeSlot: '08:30 - 12:00',
          title: 'ECLSS Atmosphere Telemetry Audit',
          activityType: 'WORKING',
          category: 'WORK',
          module: 'WORKSTATION',
          status: 'ACTIVE',
        },
        {
          id: 'TASK-03-2',
          astronautId: 'AST-03',
          timeSlot: '12:00 - 13:00',
          title: 'Scheduled Meal Period',
          activityType: 'EATING',
          category: 'MEAL',
          module: 'CREW_QUARTERS',
          status: 'PENDING',
        },
        {
          id: 'TASK-03-3',
          astronautId: 'AST-03',
          timeSlot: '13:30 - 15:30',
          title: 'Cycle Ergometer Aerobic Workout',
          activityType: 'EXERCISING',
          category: 'EXERCISE',
          module: 'EXERCISE_AREA',
          status: 'PENDING',
        },
      ],
      'AST-04': [
        {
          id: 'TASK-04-1',
          astronautId: 'AST-04',
          timeSlot: '08:00 - 10:00',
          title: 'Robotics Arm Kinematics Calibration',
          activityType: 'OPERATING_EQUIPMENT',
          category: 'EQUIPMENT_OPERATION',
          module: 'CONTROL_MODULE',
          status: 'COMPLETED',
        },
        {
          id: 'TASK-04-2',
          astronautId: 'AST-04',
          timeSlot: '10:00 - 12:00',
          title: 'Mandatory Aerobic Countermeasure Session',
          activityType: 'EXERCISING',
          category: 'EXERCISE',
          module: 'EXERCISE_AREA',
          status: 'ACTIVE',
        },
        {
          id: 'TASK-04-3',
          astronautId: 'AST-04',
          timeSlot: '12:30 - 13:30',
          title: 'Scheduled Meal Window',
          activityType: 'EATING',
          category: 'MEAL',
          module: 'CREW_QUARTERS',
          status: 'PENDING',
        },
      ],
    };

    // Initial announcements
    const nowIso = new Date().toISOString();
    const timeNow = new Date().toTimeString().split(' ')[0];

    this.announcements = [
      {
        id: 'ANN-01',
        timestamp: nowIso,
        displayTime: timeNow,
        astronautId: 'AST-01',
        announcementText: 'Attention crew. AST-01 laboratory incubation block is active. Scheduled meal window approaches at 12:30 UTC.',
        category: 'MEAL',
        sourceRobot: 'ARES-1',
        spoken: true,
      },
      {
        id: 'ANN-02',
        timestamp: nowIso,
        displayTime: timeNow,
        astronautId: 'AST-04',
        announcementText: 'AST-04, mandatory aerobic exercise session is in progress. Target heart rate: 135-145 BPM.',
        category: 'EXERCISE',
        sourceRobot: 'ARES-1',
        spoken: true,
      },
    ];
  }

  public getScheduleOverview(astronautId = 'AST-01'): CrewScheduleOverview {
    const list = this.tasks[astronautId] || [];
    const activeTask = list.find(t => t.status === 'ACTIVE') || list[0];
    const pendingTasks = list.filter(t => t.status === 'PENDING');
    const nextTask = pendingTasks[0] || { title: 'Rest Period', timeSlot: 'Next Window' };
    const laterTask = pendingTasks[1] || { title: 'Sleep Cycle', timeSlot: 'Later Window' };

    const astro = db.getAstronaut(astronautId);

    return {
      astronautId,
      astronautName: astro.name,
      currentActivity: activeTask ? activeTask.title : 'Routine Duties',
      nextActivity: nextTask.title,
      nextWindowTime: nextTask.timeSlot,
      laterActivity: laterTask.title,
      laterWindowTime: laterTask.timeSlot,
      tasks: list,
    };
  }

  public getAllCrewSchedules(): Record<string, CrewScheduleOverview> {
    const result: Record<string, CrewScheduleOverview> = {};
    ['AST-01', 'AST-02', 'AST-03', 'AST-04'].forEach(id => {
      result[id] = this.getScheduleOverview(id);
    });
    return result;
  }

  public updateTaskStatus(taskId: string, status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED'): { success: boolean; task?: CrewRoutineTask } {
    for (const astronautId of Object.keys(this.tasks)) {
      const task = this.tasks[astronautId].find(t => t.id === taskId);
      if (task) {
        task.status = status;

        if (status === 'COMPLETED') {
          // Commit event to local mission store
          const session = db.getSession();
          db.addEvent({
            astronautId: task.astronautId,
            timestamp: new Date().toISOString(),
            displayTime: new Date().toTimeString().split(' ')[0],
            activity: task.activityType,
            confidence: 98.5,
            durationSeconds: 1800,
            severity: 'INFO',
            module: task.module,
            syncStatus: session.commStatus === 'ONLINE' ? 'SYNCED' : 'PENDING',
            source: 'CREW_ROUTINE_MANAGER',
            processingMode: 'ONBOARD_EDGE_AI',
            details: `Completed scheduled routine task: ${task.title} (${task.timeSlot})`,
          });
        }

        return { success: true, task };
      }
    }
    return { success: false };
  }

  public addTask(task: Omit<CrewRoutineTask, 'id'>): CrewRoutineTask {
    const astronautId = task.astronautId || 'AST-01';
    if (!this.tasks[astronautId]) {
      this.tasks[astronautId] = [];
    }

    const newTask: CrewRoutineTask = {
      ...task,
      id: `TASK-${Date.now()}`,
    };

    this.tasks[astronautId].push(newTask);
    return newTask;
  }

  public getAnnouncements(): RoutineAnnouncement[] {
    return this.announcements;
  }

  public triggerAnnouncement(text: string, category: 'MEAL' | 'EXERCISE' | 'REST' | 'WORK' | 'INSPECTION' | 'GENERAL' = 'GENERAL', astronautId?: string): RoutineAnnouncement {
    const now = new Date();
    const ann: RoutineAnnouncement = {
      id: `ANN-${Date.now()}`,
      timestamp: now.toISOString(),
      displayTime: now.toTimeString().split(' ')[0],
      astronautId,
      announcementText: text,
      category,
      sourceRobot: 'ARES-1',
      spoken: this.voiceAnnouncementsEnabled,
    };
    this.announcements.unshift(ann);
    if (this.announcements.length > 20) this.announcements.pop();
    return ann;
  }

  public getVoiceSettings() {
    return {
      voiceAnnouncementsEnabled: this.voiceAnnouncementsEnabled,
      announcementVolume: this.announcementVolume,
    };
  }

  public updateVoiceSettings(enabled: boolean, volume?: number) {
    this.voiceAnnouncementsEnabled = enabled;
    if (volume !== undefined) this.announcementVolume = volume;
    return this.getVoiceSettings();
  }
}

export const crewRoutineManager = CrewRoutineManager.getInstance();
