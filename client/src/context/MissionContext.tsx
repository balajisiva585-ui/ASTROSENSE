import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Astronaut,
  MissionSession,
  MissionEvent,
  AnomalyAlert,
  SyncState,
  ActivityType,
  HabitatModule,
  CommStatus,
  SpacecraftTelemetry,
  AsteroidObject,
  ChatMessage,
  LiveEventStreamItem,
  RobotState,
  RobotId,
  RobotCommunicationMessage,
  CrewScheduleOverview,
  CrewRoutineTask,
  RoutineAnnouncement,
  CameraFeedState,
} from '../types';
import { api } from '../services/api';
import { sounds } from '../utils/sounds';

interface MissionContextType {
  astronaut: Astronaut | null;
  session: MissionSession | null;
  events: MissionEvent[];
  anomalies: AnomalyAlert[];
  syncState: SyncState | null;
  demoStatus: any;
  extendedDemoStatus: any;
  advancedDemoStatus: any;
  activeTab: string;
  inputMode: 'SIMULATION' | 'CAMERA' | 'VIDEO';
  isJudgeDemoOpen: boolean;
  isExtendedDemoOpen: boolean;
  isAdvancedDemoOpen: boolean;
  isReportModalOpen: boolean;
  isAssistantOpen: boolean;
  isVoiceModalOpen: boolean;
  soundEnabled: boolean;
  loading: boolean;
  error: string | null;

  // Spacecraft & Crew State
  telemetry: SpacecraftTelemetry | null;
  telemetryHistory: SpacecraftTelemetry[];
  asteroids: AsteroidObject[];
  crewList: Astronaut[];
  liveEventStream: LiveEventStreamItem[];
  chatMessages: ChatMessage[];
  isChatLoading: boolean;

  // Robot State
  robots: RobotState[];
  robotLogs: RobotCommunicationMessage[];

  // Routine & Schedules
  crewSchedules: Record<string, CrewScheduleOverview>;
  announcements: RoutineAnnouncement[];
  voiceAnnouncementsEnabled: boolean;
  announcementVolume: number;

  // Video Feeds
  videoFeeds: CameraFeedState[];
  activeCamId: string;

  // Navigation & Actions
  setTab: (tab: string) => void;
  setInputMode: (mode: 'SIMULATION' | 'CAMERA' | 'VIDEO') => void;
  toggleCommStatus: () => Promise<void>;
  setComm: (status: CommStatus) => Promise<void>;
  triggerSyncNow: () => Promise<void>;
  recordManualActivity: (activity: ActivityType, module?: HabitatModule) => Promise<void>;
  resolveAnomalyAlert: (id: string) => Promise<void>;
  triggerFallAnomaly: () => Promise<void>;
  triggerInactivityAnomaly: () => Promise<void>;

  // Asteroid & Deep Space
  triggerAsteroidAlert: (id?: string) => Promise<void>;
  resolveAsteroidAlert: (id: string) => Promise<void>;

  // Crew
  updateCrewMemberActivity: (id: string, activity: ActivityType, module?: HabitatModule) => Promise<void>;

  // Video Feeds
  setActiveCamId: (id: string) => void;
  updateVideoSource: (camId: string, source: 'SIMULATED' | 'WEBCAM' | 'LOCAL_VIDEO') => Promise<void>;

  // Robots
  sendRobotAction: (robotId: RobotId, action: string, module?: HabitatModule) => Promise<void>;

  // Routine
  updateTaskStatus: (taskId: string, status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED') => Promise<void>;
  addTask: (task: any) => Promise<void>;
  triggerRoutineAnnouncement: (text: string, category?: string, astronautId?: string) => Promise<void>;
  updateVoiceSettings: (enabled: boolean, volume?: number) => Promise<void>;

  // Voice Assistant
  openVoiceModal: () => void;
  closeVoiceModal: () => void;
  sendVoiceCommand: (cmd: string) => Promise<any>;

  // Judge Demo
  startJudgeDemo: (speed?: number) => Promise<void>;
  stopJudgeDemo: () => Promise<void>;
  stepJudgeDemo: (index: number) => Promise<void>;
  openJudgeDemo: () => void;
  closeJudgeDemo: () => void;

  // Extended Space Demo
  startExtendedDemo: (speed?: number) => Promise<void>;
  stopExtendedDemo: () => Promise<void>;
  stepExtendedDemo: (index: number) => Promise<void>;
  openExtendedDemo: () => void;
  closeExtendedDemo: () => void;

  // Advanced Monitoring Demo
  startAdvancedDemo: (speed?: number) => Promise<void>;
  stopAdvancedDemo: () => Promise<void>;
  stepAdvancedDemo: (index: number) => Promise<void>;
  openAdvancedDemo: () => void;
  closeAdvancedDemo: () => void;

  // Assistant Chat
  toggleAssistant: () => void;
  openAssistant: () => void;
  closeAssistant: () => void;
  sendAssistantMessage: (text: string) => Promise<void>;

  openReportModal: () => void;
  closeReportModal: () => void;
  toggleSound: () => void;
  refreshAll: () => Promise<void>;
}

const MissionContext = createContext<MissionContextType | undefined>(undefined);

export const MissionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [astronaut, setAstronaut] = useState<Astronaut | null>(null);
  const [session, setSession] = useState<MissionSession | null>(null);
  const [events, setEvents] = useState<MissionEvent[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyAlert[]>([]);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [demoStatus, setDemoStatus] = useState<any>(null);
  const [extendedDemoStatus, setExtendedDemoStatus] = useState<any>(null);
  const [advancedDemoStatus, setAdvancedDemoStatus] = useState<any>(null);

  // Additive state
  const [telemetry, setTelemetry] = useState<SpacecraftTelemetry | null>(null);
  const [telemetryHistory, setTelemetryHistory] = useState<SpacecraftTelemetry[]>([]);
  const [asteroids, setAsteroids] = useState<AsteroidObject[]>([]);
  const [crewList, setCrewList] = useState<Astronaut[]>([]);
  const [liveEventStream, setLiveEventStream] = useState<LiveEventStreamItem[]>([]);
  const [isAssistantOpen, setIsAssistantOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isChatLoading, setIsChatLoading] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'INIT-01',
      sender: 'ASSISTANT',
      timestamp: new Date().toISOString(),
      text: 'Greetings, Commander. I am **ASTROSENSE AI**, your autonomous onboard mission and spaceflight assistant.\n\nAsk me anything regarding real-time crew activities, habitat telemetry, anomaly diagnosis, communication loss procedures, autonomous robots (ARES-1 & NOVA-2), or crew routine schedules.',
      sources: [
        {
          title: 'AstroSense Onboard Knowledge Base',
          category: 'MISSION_OPERATIONS',
          type: 'VERIFIED_KNOWLEDGE',
        },
      ],
    },
  ]);

  // Robots & Routine & Video
  const [robots, setRobots] = useState<RobotState[]>([]);
  const [robotLogs, setRobotLogs] = useState<RobotCommunicationMessage[]>([]);
  const [crewSchedules, setCrewSchedules] = useState<Record<string, CrewScheduleOverview>>({});
  const [announcements, setAnnouncements] = useState<RoutineAnnouncement[]>([]);
  const [voiceAnnouncementsEnabled, setVoiceAnnouncementsEnabled] = useState<boolean>(true);
  const [announcementVolume, setAnnouncementVolume] = useState<number>(80);
  const [videoFeeds, setVideoFeeds] = useState<CameraFeedState[]>([]);
  const [activeCamId, setActiveCamId] = useState<string>('CAM-01');

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [inputMode, setInputMode] = useState<'SIMULATION' | 'CAMERA' | 'VIDEO'>('SIMULATION');
  const [isJudgeDemoOpen, setIsJudgeDemoOpen] = useState<boolean>(false);
  const [isExtendedDemoOpen, setIsExtendedDemoOpen] = useState<boolean>(false);
  const [isAdvancedDemoOpen, setIsAdvancedDemoOpen] = useState<boolean>(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const prevCommStatusRef = React.useRef<CommStatus | null>(null);
  const prevAnomalyCountRef = React.useRef<number>(0);

  const refreshAll = useCallback(async () => {
    try {
      const [
        astroData,
        sessionData,
        eventsData,
        anomaliesData,
        syncData,
        demoData,
        extDemoData,
        advDemoData,
        telemetryData,
        telemetryHistData,
        asteroidsData,
        crewData,
        streamData,
        robotsData,
        robotLogsData,
        routineSchedulesData,
        announcementsData,
        videoFeedsData,
      ] = await Promise.all([
        api.getAstronaut(),
        api.getSession(),
        api.getEvents({ limit: 40 }),
        api.getAnomalies(),
        api.getSyncStatus(),
        api.getDemoStatus(),
        api.getExtendedDemoStatus(),
        api.getAdvancedDemoStatus(),
        api.getCurrentTelemetry(),
        api.getTelemetryHistory(20),
        api.getAsteroids(),
        api.getAllCrew(),
        api.getLiveEventStream(),
        api.getRobots(),
        api.getRobotLogs(20),
        api.getCrewSchedules(),
        api.getAnnouncements(),
        api.getVideoFeeds(),
      ]);

      setAstronaut(astroData);
      setSession(sessionData);
      setEvents(eventsData.events);
      setAnomalies(anomaliesData);
      setSyncState(syncData);
      setDemoStatus(demoData);
      setExtendedDemoStatus(extDemoData);
      setAdvancedDemoStatus(advDemoData);
      setTelemetry(telemetryData);
      setTelemetryHistory(telemetryHistData);
      setAsteroids(asteroidsData);
      setCrewList(crewData);
      setLiveEventStream(streamData);
      setRobots(robotsData);
      setRobotLogs(robotLogsData);
      setCrewSchedules(routineSchedulesData);
      setAnnouncements(announcementsData);
      setVideoFeeds(videoFeedsData);

      // Trigger audio on state transitions
      if (prevCommStatusRef.current && prevCommStatusRef.current !== sessionData.commStatus) {
        if (sessionData.commStatus === 'OFFLINE') {
          sounds.playCommLossTone();
        } else if (sessionData.commStatus === 'ONLINE') {
          sounds.playCommRestoreChime();
        }
      }
      prevCommStatusRef.current = sessionData.commStatus;

      // Check if new anomaly arrived
      const unresolvedCritical = anomaliesData.filter(a => !a.resolved && a.severity === 'CRITICAL');
      if (unresolvedCritical.length > prevAnomalyCountRef.current) {
        sounds.playCriticalAlert();
      }
      prevAnomalyCountRef.current = unresolvedCritical.length;

      setError(null);
    } catch (err: any) {
      console.warn('Telemetry polling error:', err);
      setError(err.message || 'Telemetry link interrupted');
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll state every 1.2 seconds for real-time aerospace telemetry feed
  useEffect(() => {
    refreshAll();
    const interval = setInterval(refreshAll, 1200);
    return () => clearInterval(interval);
  }, [refreshAll]);

  const toggleCommStatus = async () => {
    if (!session) return;
    const nextStatus: CommStatus = session.commStatus === 'ONLINE' ? 'OFFLINE' : 'ONLINE';
    await setComm(nextStatus);
  };

  const setComm = async (status: CommStatus) => {
    try {
      await api.setCommStatus(status);
      if (status === 'OFFLINE') sounds.playCommLossTone();
      else sounds.playCommRestoreChime();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerSyncNow = async () => {
    try {
      await api.triggerSync();
      sounds.playSyncSuccessChime();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const recordManualActivity = async (activity: ActivityType, module?: HabitatModule) => {
    try {
      await api.recordActivity(activity, module);
      sounds.playTelemetryBlip();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resolveAnomalyAlert = async (id: string) => {
    try {
      await api.resolveAnomaly(id);
      sounds.playTelemetryBlip();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerFallAnomaly = async () => {
    try {
      await api.triggerFall();
      sounds.playCriticalAlert();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerInactivityAnomaly = async () => {
    try {
      await api.triggerInactivity();
      sounds.playTelemetryBlip();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerAsteroidAlert = async (id = 'ASTEROID-B07') => {
    try {
      await api.triggerAsteroidAnomaly(id);
      sounds.playCriticalAlert();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const resolveAsteroidAlert = async (id: string) => {
    try {
      await api.resolveAsteroidAnomaly(id);
      sounds.playTelemetryBlip();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateCrewMemberActivity = async (id: string, activity: ActivityType, module?: HabitatModule) => {
    try {
      await api.updateCrewActivity(id, activity, module);
      sounds.playTelemetryBlip();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Video Source Update
  const updateVideoSource = async (camId: string, source: 'SIMULATED' | 'WEBCAM' | 'LOCAL_VIDEO') => {
    try {
      await api.updateVideoSource(camId, source);
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Robot Actions
  const sendRobotAction = async (robotId: RobotId, action: string, module?: HabitatModule) => {
    try {
      await api.sendRobotAction(robotId, action, module);
      sounds.playTelemetryBlip();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Crew Routine Actions
  const updateTaskStatus = async (taskId: string, status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED') => {
    try {
      await api.updateTaskStatus(taskId, status);
      sounds.playTelemetryBlip();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addTask = async (task: any) => {
    try {
      await api.addTask(task);
      sounds.playTelemetryBlip();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const triggerRoutineAnnouncement = async (text: string, category = 'GENERAL', astronautId?: string) => {
    try {
      await api.triggerAnnouncement(text, category, astronautId);
      sounds.playTelemetryBlip();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const updateVoiceSettings = async (enabled: boolean, volume?: number) => {
    try {
      const res = await api.updateVoiceSettings(enabled, volume);
      setVoiceAnnouncementsEnabled(res.voiceAnnouncementsEnabled);
      if (res.announcementVolume !== undefined) setAnnouncementVolume(res.announcementVolume);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Voice Assistant
  const sendVoiceCommand = async (cmd: string) => {
    try {
      sounds.playTelemetryBlip();
      const result = await api.sendVoiceCommand(cmd);
      await refreshAll();
      return result;
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  // Judge Demo
  const startJudgeDemo = async (speed = 1) => {
    try {
      await api.startJudgeDemo(speed);
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stopJudgeDemo = async () => {
    try {
      await api.stopJudgeDemo();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stepJudgeDemo = async (index: number) => {
    try {
      await api.stepJudgeDemo(index);
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Extended Demo
  const startExtendedDemo = async (speed = 1) => {
    try {
      await api.startExtendedDemo(speed);
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stopExtendedDemo = async () => {
    try {
      await api.stopExtendedDemo();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stepExtendedDemo = async (index: number) => {
    try {
      await api.stepExtendedDemo(index);
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Advanced Demo
  const startAdvancedDemo = async (speed = 1) => {
    try {
      await api.startAdvancedDemo(speed);
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stopAdvancedDemo = async () => {
    try {
      await api.stopAdvancedDemo();
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const stepAdvancedDemo = async (index: number) => {
    try {
      await api.stepAdvancedDemo(index);
      await refreshAll();
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Assistant Chat
  const sendAssistantMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: ChatMessage = {
      id: `USER-${Date.now()}`,
      sender: 'USER',
      text,
      timestamp: new Date().toISOString(),
    };
    setChatMessages(prev => [...prev, userMsg]);
    setIsChatLoading(true);

    try {
      sounds.playTelemetryBlip();
      const botResponse = await api.sendAssistantMessage(text);
      setChatMessages(prev => [...prev, botResponse]);
      sounds.playTelemetryBlip();
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `ERR-${Date.now()}`,
        sender: 'ASSISTANT',
        text: `Error contacting local assistant: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
  };

  return (
    <MissionContext.Provider
      value={{
        astronaut,
        session,
        events,
        anomalies,
        syncState,
        demoStatus,
        extendedDemoStatus,
        advancedDemoStatus,
        activeTab,
        inputMode,
        isJudgeDemoOpen,
        isExtendedDemoOpen,
        isAdvancedDemoOpen,
        isReportModalOpen,
        isAssistantOpen,
        isVoiceModalOpen,
        soundEnabled,
        loading,
        error,
        telemetry,
        telemetryHistory,
        asteroids,
        crewList,
        liveEventStream,
        chatMessages,
        isChatLoading,
        robots,
        robotLogs,
        crewSchedules,
        announcements,
        voiceAnnouncementsEnabled,
        announcementVolume,
        videoFeeds,
        activeCamId,
        setTab: setActiveTab,
        setInputMode,
        toggleCommStatus,
        setComm,
        triggerSyncNow,
        recordManualActivity,
        resolveAnomalyAlert,
        triggerFallAnomaly,
        triggerInactivityAnomaly,
        triggerAsteroidAlert,
        resolveAsteroidAlert,
        updateCrewMemberActivity,
        setActiveCamId,
        updateVideoSource,
        sendRobotAction,
        updateTaskStatus,
        addTask,
        triggerRoutineAnnouncement,
        updateVoiceSettings,
        openVoiceModal: () => setIsVoiceModalOpen(true),
        closeVoiceModal: () => setIsVoiceModalOpen(false),
        sendVoiceCommand,
        startJudgeDemo,
        stopJudgeDemo,
        stepJudgeDemo,
        openJudgeDemo: () => setIsJudgeDemoOpen(true),
        closeJudgeDemo: () => setIsJudgeDemoOpen(false),
        startExtendedDemo,
        stopExtendedDemo,
        stepExtendedDemo,
        openExtendedDemo: () => setIsExtendedDemoOpen(true),
        closeExtendedDemo: () => setIsExtendedDemoOpen(false),
        startAdvancedDemo,
        stopAdvancedDemo,
        stepAdvancedDemo,
        openAdvancedDemo: () => setIsAdvancedDemoOpen(true),
        closeAdvancedDemo: () => setIsAdvancedDemoOpen(false),
        toggleAssistant: () => setIsAssistantOpen(prev => !prev),
        openAssistant: () => setIsAssistantOpen(true),
        closeAssistant: () => setIsAssistantOpen(false),
        sendAssistantMessage,
        openReportModal: () => setIsReportModalOpen(true),
        closeReportModal: () => setIsReportModalOpen(false),
        toggleSound,
        refreshAll,
      }}
    >
      {children}
    </MissionContext.Provider>
  );
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) {
    throw new Error('useMission must be used within a MissionProvider');
  }
  return context;
};
