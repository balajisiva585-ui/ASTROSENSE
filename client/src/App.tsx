import React from 'react';
import { useMission } from './context/MissionContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { LiveMissionPage } from './pages/LiveMissionPage';
import { CrewStatusPage } from './pages/CrewStatusPage';
import { AnomalyCenterPage } from './pages/AnomalyCenterPage';
import { AsteroidMonitorPage } from './pages/AsteroidMonitorPage';
import { MissionControlPage } from './pages/MissionControlPage';
import { AstronautProfilePage } from './pages/AstronautProfilePage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { LogsTimelinePage } from './pages/LogsTimelinePage';
import { ArchitecturePage } from './pages/ArchitecturePage';
import { ProblemStatementPage } from './pages/ProblemStatementPage';
import { ReferencesPage } from './pages/ReferencesPage';
import { SettingsPage } from './pages/SettingsPage';
import { MissionMonitorPage } from './pages/MissionMonitorPage';
import { CrewRoutinePage } from './pages/CrewRoutinePage';
import { RobotControlPage } from './pages/RobotControlPage';
import { JudgeDemoModal } from './components/demo/JudgeDemoModal';
import { ExtendedDemoModal } from './components/demo/ExtendedDemoModal';
import { AdvancedDemoModal } from './components/demo/AdvancedDemoModal';
import { MissionReportModal } from './components/demo/MissionReportModal';
import { SpaceAssistant } from './components/assistant/SpaceAssistant';
import { VoiceAssistant } from './components/voice/VoiceAssistant';

export const App: React.FC = () => {
  const { activeTab, session } = useMission();

  return (
    <div className="min-h-screen bg-space-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Aerospace Mission Header */}
      <Header />

      {/* Primary Subsystem Navigation */}
      <Navigation />

      {/* Main Subsystem Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'mission-monitor' && <MissionMonitorPage />}
        {activeTab === 'crew-routine' && <CrewRoutinePage />}
        {activeTab === 'robot-control' && <RobotControlPage />}
        {activeTab === 'live-mission' && <LiveMissionPage />}
        {activeTab === 'crew' && <CrewStatusPage />}
        {activeTab === 'anomalies' && <AnomalyCenterPage />}
        {activeTab === 'asteroids' && <AsteroidMonitorPage />}
        {activeTab === 'mission-control' && <MissionControlPage />}
        {activeTab === 'astronaut' && <AstronautProfilePage />}
        {activeTab === 'analytics' && <AnalyticsPage />}
        {activeTab === 'timeline' && <LogsTimelinePage />}
        {activeTab === 'architecture' && <ArchitecturePage />}
        {activeTab === 'problem' && <ProblemStatementPage />}
        {activeTab === 'references' && <ReferencesPage />}
        {activeTab === 'settings' && <SettingsPage />}
      </main>

      {/* Global Modals & Side Assistants */}
      <JudgeDemoModal />
      <ExtendedDemoModal />
      <AdvancedDemoModal />
      <MissionReportModal />
      <SpaceAssistant />
      <VoiceAssistant />

      {/* Aerospace Footer */}
      <footer className="border-t border-space-800 bg-space-950 py-4 px-6 text-center text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>ASTROSENSE v1.5.0 • Autonomous Spacecraft Human Activity Recognition & Deep Space Intelligence</span>
          </div>
          <div className="text-[11px] text-slate-400 font-sans">
            Zero-Cloud Architecture • Delay-Tolerant Crew Safety Prototype • 100% Offline AI
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
