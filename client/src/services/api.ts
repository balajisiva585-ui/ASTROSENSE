import {
  Astronaut,
  MissionEvent,
  AnomalyAlert,
  MissionSession,
  SyncState,
  ActivityType,
  HabitatModule,
  CommStatus,
  InferencePrediction,
  MissionSummaryReport,
  SpacecraftTelemetry,
  AsteroidObject,
  SpaceKnowledgeItem,
  ChatMessage,
  LiveEventStreamItem,
} from '../types';

const API_BASE = '/api';

export const api = {
  // Astronaut
  async getAstronaut(id = 'AST-01'): Promise<Astronaut> {
    const res = await fetch(`${API_BASE}/astronaut?id=${id}`);
    const json = await res.json();
    return json.data;
  },

  async updateAstronaut(updates: Partial<Astronaut>): Promise<Astronaut> {
    const res = await fetch(`${API_BASE}/astronaut`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    return json.data;
  },

  async resetAstronaut(): Promise<Astronaut> {
    const res = await fetch(`${API_BASE}/astronaut/reset`, { method: 'POST' });
    const json = await res.json();
    return json.data;
  },

  // Multi-Crew
  async getAllCrew(): Promise<Astronaut[]> {
    const res = await fetch(`${API_BASE}/crew`);
    const json = await res.json();
    return json.data;
  },

  async updateCrewActivity(id: string, activity: ActivityType, module?: HabitatModule): Promise<Astronaut> {
    const res = await fetch(`${API_BASE}/crew/${id}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity, module }),
    });
    const json = await res.json();
    return json.data;
  },

  // Activities & AI Inference
  async getActivitiesCatalog(): Promise<{ activities: any[]; modelMetadata: any }> {
    const res = await fetch(`${API_BASE}/activities`);
    const json = await res.json();
    return json.data;
  },

  async predictActivity(frameInput: any): Promise<InferencePrediction> {
    const res = await fetch(`${API_BASE}/activities/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(frameInput),
    });
    const json = await res.json();
    return json.data;
  },

  async recordActivity(activity: ActivityType, module?: HabitatModule, confidence?: number): Promise<MissionEvent> {
    const res = await fetch(`${API_BASE}/activities/record`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activity, module, confidence }),
    });
    const json = await res.json();
    return json.data;
  },

  // Events
  async getEvents(params?: {
    syncStatus?: string;
    severity?: string;
    limit?: number;
    activity?: string;
  }): Promise<{ events: MissionEvent[]; totalCount: number; unsyncedCount: number }> {
    const query = new URLSearchParams();
    if (params?.syncStatus) query.append('syncStatus', params.syncStatus);
    if (params?.severity) query.append('severity', params.severity);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.activity) query.append('activity', params.activity);

    const res = await fetch(`${API_BASE}/events?${query.toString()}`);
    const json = await res.json();
    return json.data;
  },

  async getLiveEventStream(): Promise<LiveEventStreamItem[]> {
    const res = await fetch(`${API_BASE}/simulation/live-stream`);
    const json = await res.json();
    return json.data;
  },

  // Anomalies
  async getAnomalies(params?: { severity?: string; resolved?: boolean; limit?: number }): Promise<AnomalyAlert[]> {
    const query = new URLSearchParams();
    if (params?.severity) query.append('severity', params.severity);
    if (params?.resolved !== undefined) query.append('resolved', params.resolved.toString());
    if (params?.limit) query.append('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/anomalies?${query.toString()}`);
    const json = await res.json();
    return json.data;
  },

  async resolveAnomaly(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/anomalies/${id}/resolve`, { method: 'POST' });
    const json = await res.json();
    return json.success;
  },

  // Synchronization
  async getSyncStatus(): Promise<SyncState> {
    const res = await fetch(`${API_BASE}/sync/status`);
    const json = await res.json();
    return json.data;
  },

  async triggerSync(): Promise<any> {
    const res = await fetch(`${API_BASE}/sync`, { method: 'POST' });
    const json = await res.json();
    return json.data;
  },

  // Simulation & Demos
  async getSession(): Promise<MissionSession> {
    const res = await fetch(`${API_BASE}/simulation/session`);
    const json = await res.json();
    return json.data;
  },

  async setCommStatus(status: CommStatus): Promise<{ commStatus: CommStatus; autonomousModeActive: boolean }> {
    const res = await fetch(`${API_BASE}/simulation/comm-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return json.data;
  },

  // Judge Demo
  async getDemoStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/demo/status`);
    const json = await res.json();
    return json.data;
  },

  async startJudgeDemo(speed = 1): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/demo/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed }),
    });
    return res.json();
  },

  async stopJudgeDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/demo/stop`, { method: 'POST' });
    return res.json();
  },

  async stepJudgeDemo(stepIndex: number): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/demo/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepIndex }),
    });
    return res.json();
  },

  // Extended Space Demo
  async getExtendedDemoStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/extended-demo/status`);
    const json = await res.json();
    return json.data;
  },

  async startExtendedDemo(speed = 1): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/extended-demo/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed }),
    });
    return res.json();
  },

  async stopExtendedDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/extended-demo/stop`, { method: 'POST' });
    return res.json();
  },

  async stepExtendedDemo(stepIndex: number): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/extended-demo/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepIndex }),
    });
    return res.json();
  },

  async triggerFall(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/trigger-fall`, { method: 'POST' });
    return res.json();
  },

  async triggerInactivity(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/trigger-inactivity`, { method: 'POST' });
    return res.json();
  },

  // Telemetry
  async getCurrentTelemetry(): Promise<SpacecraftTelemetry> {
    const res = await fetch(`${API_BASE}/telemetry/current`);
    const json = await res.json();
    return json.data;
  },

  async getTelemetryHistory(limit = 20): Promise<SpacecraftTelemetry[]> {
    const res = await fetch(`${API_BASE}/telemetry/history?limit=${limit}`);
    const json = await res.json();
    return json.data;
  },

  // Asteroid & Deep Space
  async getAsteroids(): Promise<AsteroidObject[]> {
    const res = await fetch(`${API_BASE}/asteroids`);
    const json = await res.json();
    return json.data;
  },

  async triggerAsteroidAnomaly(id = 'ASTEROID-B07'): Promise<any> {
    const res = await fetch(`${API_BASE}/asteroids/trigger-anomaly`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    return res.json();
  },

  async resolveAsteroidAnomaly(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/asteroids/${id}/resolve`, { method: 'POST' });
    return res.json();
  },

  // AI Space Assistant
  async sendAssistantMessage(message: string): Promise<ChatMessage> {
    const res = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    const json = await res.json();
    return json.data;
  },

  async getKnowledgeBase(): Promise<SpaceKnowledgeItem[]> {
    const res = await fetch(`${API_BASE}/assistant/knowledge`);
    const json = await res.json();
    return json.data;
  },

  // Export & Summary Report
  async getMissionReportSummary(): Promise<MissionSummaryReport> {
    const res = await fetch(`${API_BASE}/export/report-summary`);
    const json = await res.json();
    return json.data;
  },

  // Settings
  async getSettings(): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`);
    const json = await res.json();
    return json.data;
  },

  async saveSettings(settings: any): Promise<any> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.json();
  },

  // Video Feeds
  async getVideoFeeds(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/video/feeds`);
    const json = await res.json();
    return json.data;
  },

  async updateVideoSource(id: string, source: 'SIMULATED' | 'WEBCAM' | 'LOCAL_VIDEO'): Promise<any> {
    const res = await fetch(`${API_BASE}/video/feeds/${id}/source`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source }),
    });
    const json = await res.json();
    return json.data;
  },

  // Autonomous Robots (ARES-1 & NOVA-2)
  async getRobots(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/robots`);
    const json = await res.json();
    return json.data;
  },

  async getRobotLogs(limit = 30): Promise<any[]> {
    const res = await fetch(`${API_BASE}/robots/logs?limit=${limit}`);
    const json = await res.json();
    return json.data;
  },

  async sendRobotAction(robotId: string, action: string, module?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/robots/${robotId}/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, module }),
    });
    const json = await res.json();
    return json.data;
  },

  // Crew Routine Manager
  async getCrewSchedules(): Promise<Record<string, any>> {
    const res = await fetch(`${API_BASE}/routine/schedules`);
    const json = await res.json();
    return json.data;
  },

  async getCrewSchedule(astronautId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/routine/schedule/${astronautId}`);
    const json = await res.json();
    return json.data;
  },

  async updateTaskStatus(taskId: string, status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED'): Promise<any> {
    const res = await fetch(`${API_BASE}/routine/tasks/${taskId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    return json.data;
  },

  async addTask(task: any): Promise<any> {
    const res = await fetch(`${API_BASE}/routine/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(task),
    });
    const json = await res.json();
    return json.data;
  },

  async getAnnouncements(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/routine/announcements`);
    const json = await res.json();
    return json.data;
  },

  async triggerAnnouncement(text: string, category = 'GENERAL', astronautId?: string): Promise<any> {
    const res = await fetch(`${API_BASE}/routine/announcements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, category, astronautId }),
    });
    const json = await res.json();
    return json.data;
  },

  async getVoiceSettings(): Promise<any> {
    const res = await fetch(`${API_BASE}/routine/voice-settings`);
    const json = await res.json();
    return json.data;
  },

  async updateVoiceSettings(voiceAnnouncementsEnabled: boolean, announcementVolume?: number): Promise<any> {
    const res = await fetch(`${API_BASE}/routine/voice-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voiceAnnouncementsEnabled, announcementVolume }),
    });
    const json = await res.json();
    return json.data;
  },

  // Voice Mission Assistant (Speech / Text fallback)
  async sendVoiceCommand(command: string): Promise<any> {
    const res = await fetch(`${API_BASE}/voice/command`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command }),
    });
    const json = await res.json();
    return json.data;
  },

  async getVoiceCommandsCatalog(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/voice/commands`);
    const json = await res.json();
    return json.data;
  },

  // Advanced 16-Step Monitoring Demo
  async getAdvancedDemoStatus(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/advanced-demo/status`);
    const json = await res.json();
    return json.data;
  },

  async startAdvancedDemo(speed = 1): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/advanced-demo/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ speed }),
    });
    return res.json();
  },

  async stopAdvancedDemo(): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/advanced-demo/stop`, { method: 'POST' });
    return res.json();
  },

  async stepAdvancedDemo(stepIndex: number): Promise<any> {
    const res = await fetch(`${API_BASE}/simulation/advanced-demo/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepIndex }),
    });
    return res.json();
  },
};
