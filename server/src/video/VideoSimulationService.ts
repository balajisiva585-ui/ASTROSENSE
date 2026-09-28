import { CameraFeedState, ActivityType, HabitatModule } from '../types';
import { db } from '../database/db';
import { crewManager } from '../mission/CrewManager';

export class VideoSimulationService {
  private static instance: VideoSimulationService;
  private cameraFeeds: Record<string, CameraFeedState> = {};

  private constructor() {
    this.seedCameraFeeds();
  }

  public static getInstance(): VideoSimulationService {
    if (!VideoSimulationService.instance) {
      VideoSimulationService.instance = new VideoSimulationService();
    }
    return VideoSimulationService.instance;
  }

  private seedCameraFeeds(): void {
    this.cameraFeeds = {
      'CAM-01': {
        id: 'CAM-01',
        name: 'CAM-01 [LAB]',
        module: 'LABORATORY',
        label: 'MODULE A / SCIENCE BAY (BIO-ASSAY)',
        isLive: true,
        assignedAstronautId: 'AST-01',
        currentActivity: 'WORKING',
        confidence: 96.4,
        safetyStatus: 'NORMAL',
        movementState: 'STATIONARY',
        fps: 30,
        resolution: '1920x1080 (HD)',
        streamSource: 'SIMULATED',
      },
      'CAM-02': {
        id: 'CAM-02',
        name: 'CAM-02 [QUARTERS]',
        module: 'CREW_QUARTERS',
        label: 'MODULE B / CREW SLEEP & HABITAT',
        isLive: true,
        assignedAstronautId: 'AST-01',
        currentActivity: 'SLEEPING_RESTING',
        confidence: 98.1,
        safetyStatus: 'NORMAL',
        movementState: 'STATIONARY',
        fps: 30,
        resolution: '1920x1080 (HD)',
        streamSource: 'SIMULATED',
      },
      'CAM-03': {
        id: 'CAM-03',
        name: 'CAM-03 [WORKSTATION]',
        module: 'WORKSTATION',
        label: 'MODULE C / FLIGHT WORKSTATION',
        isLive: true,
        assignedAstronautId: 'AST-03',
        currentActivity: 'OPERATING_EQUIPMENT',
        confidence: 95.8,
        safetyStatus: 'NORMAL',
        movementState: 'STATIONARY',
        fps: 30,
        resolution: '1920x1080 (HD)',
        streamSource: 'SIMULATED',
      },
      'CAM-04': {
        id: 'CAM-04',
        name: 'CAM-04 [EXERCISE]',
        module: 'EXERCISE_AREA',
        label: 'MODULE D / ARED & CYCLE ERGOMETER',
        isLive: true,
        assignedAstronautId: 'AST-04',
        currentActivity: 'EXERCISING',
        confidence: 97.9,
        safetyStatus: 'NORMAL',
        movementState: 'HIGH_KINETIC',
        fps: 30,
        resolution: '1920x1080 (HD)',
        streamSource: 'SIMULATED',
      },
    };
  }

  public getAllFeeds(): CameraFeedState[] {
    const ast01 = db.getAstronaut('AST-01');
    const allCrew = crewManager.getAllCrew();

    // Sync active camera state with real crew state
    if (this.cameraFeeds['CAM-01']) {
      this.cameraFeeds['CAM-01'].currentActivity = ast01.currentActivity;
      this.cameraFeeds['CAM-01'].confidence = ast01.activityConfidence;
      this.cameraFeeds['CAM-01'].safetyStatus = ast01.currentStatus;
      this.cameraFeeds['CAM-01'].movementState = ast01.movementState || 'STATIONARY';
    }

    const ast04 = allCrew.find(c => c.id === 'AST-04');
    if (ast04 && this.cameraFeeds['CAM-04']) {
      this.cameraFeeds['CAM-04'].currentActivity = ast04.currentActivity;
      this.cameraFeeds['CAM-04'].confidence = ast04.activityConfidence;
      this.cameraFeeds['CAM-04'].movementState = ast04.movementState || 'HIGH_KINETIC';
    }

    return Object.values(this.cameraFeeds);
  }

  public getFeed(id: string): CameraFeedState | null {
    return this.cameraFeeds[id] || null;
  }

  public updateFeedSource(id: string, source: 'SIMULATED' | 'WEBCAM' | 'LOCAL_VIDEO'): CameraFeedState | null {
    const feed = this.cameraFeeds[id];
    if (feed) {
      feed.streamSource = source;
      return { ...feed };
    }
    return null;
  }
}

export const videoSimulationService = VideoSimulationService.getInstance();
