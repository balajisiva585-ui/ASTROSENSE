import React from 'react';
import { useMission } from './context/MissionContext';
import { Header } from './components/common/Header';
import { Navigation } from './components/common/Navigation';
import { SpaceBackground } from './components/common/SpaceBackground';
import { MissionStatusHUD } from './components/mission/MissionStatusHUD';
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
import { DatabaseSetupPage } from './pages/DatabaseSetupPage';
import { MissionMonitorPage } from './pages/MissionMonitorPage';
import { CrewRoutinePage } from './pages/CrewRoutinePage';
import { RobotControlPage } from './pages/RobotControlPage';
import { JudgeDemoModal } from './components/demo/JudgeDemoModal';
import { ExtendedDemoModal } from './components/demo/ExtendedDemoModal';
import { AdvancedDemoModal } from './components/demo/AdvancedDemoModal';
import { RealWebcamDemoModal } from './components/demo/RealWebcamDemoModal';
import { MissionReportModal } from './components/demo/MissionReportModal';
import { SpaceAssistant } from './components/assistant/SpaceAssistant';
import { VoiceAssistant } from './components/voice/VoiceAssistant';
import { ShieldCheck, HardDrive, Lock } from 'lucide-react';

export const App: React.FC = () => {
  const { activeTab, setTab, isRealWebcamDemoOpen, closeRealWebcamDemo } = useMission();

  React.useEffect(() => {
    if (window.location.pathname === '/database-setup' || window.location.hash === '#/database-setup') {
      setTab('database-setup');
    }
  }, [setTab]);

  return (
    <div className="min-h-screen bg-transparent text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200 relative">
      {/* Dynamic Deep Space Cosmic Background */}
      <SpaceBackground />

      {/* Top Aerospace Spacecraft Header */}
      <Header />

      {/* Primary Subsystem Navigation Bar */}
      <Navigation />

      {/* Main Subsystem Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3.5 sm:p-5 lg:p-6 flex flex-col gap-4">
        {/* Global Mission Status HUD Banner */}
        <MissionStatusHUD />

        {/* Tab Pages */}
        {activeTab === 'dashboard' && <DashboardPage />}
        {activeTab === 'database-setup' && <DatabaseSetupPage />}
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
      <RealWebcamDemoModal
        isOpen={isRealWebcamDemoOpen}
        onClose={closeRealWebcamDemo}
      />
      <MissionReportModal />
      <SpaceAssistant />
      <VoiceAssistant />

      {/* Spacecraft Footer */}
      <footer className="border-t border-space-800/80 bg-space-950/90 backdrop-blur-md py-3.5 px-6 text-xs font-mono text-gray-400 mt-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2 text-cyan-300">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-bold">ASTROSENSE v2.0 // ORBITAL HAR</span>
            <span className="text-gray-500">|</span>
            <span className="text-gray-400 text-[11px]">AUTONOMOUS DEEP SPACE CREW VISION NODE</span>
          </div>

          <div className="flex items-center gap-4 text-[10px] text-gray-400">
            <div className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ZERO-CLOUD AIR-GAPPED</span>
            </div>
            <div className="flex items-center gap-1 text-cyan-400">
              <HardDrive className="w-3.5 h-3.5" />
              <span>SQLITE / POSTGRES HYBRID</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
