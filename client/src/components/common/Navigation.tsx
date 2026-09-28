import React from 'react';
import { useMission } from '../../context/MissionContext';
import {
  LayoutDashboard,
  Radio,
  Users,
  ShieldAlert,
  Compass,
  Globe2,
  User,
  BarChart3,
  History,
  Layers,
  HelpCircle,
  BookOpen,
  Settings,
  Video,
  Calendar,
  Bot,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setTab, session, anomalies } = useMission();
  const unsyncedCount = session?.unsyncedEventCount || 0;
  const activeAnomaliesCount = anomalies.filter(a => !a.resolved).length;

  const navItems = [
    { id: 'dashboard', label: 'Onboard Dashboard', icon: LayoutDashboard },
    { id: 'mission-monitor', label: 'Mission Monitor', icon: Video, badge: 'LIVE', badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
    { id: 'crew-routine', label: 'Crew Routine', icon: Calendar },
    { id: 'robot-control', label: 'Robot Control', icon: Bot, badge: 'ARES/NOVA', badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
    { id: 'live-mission', label: 'Live Mission', icon: Radio },
    { id: 'crew', label: 'Crew Status', icon: Users },
    {
      id: 'anomalies',
      label: 'Anomaly Center',
      icon: ShieldAlert,
      badge: activeAnomaliesCount > 0 ? `${activeAnomaliesCount}` : undefined,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    },
    { id: 'asteroids', label: 'Asteroid Monitor', icon: Compass },
    {
      id: 'mission-control',
      label: 'Ground Mission Control',
      icon: Globe2,
      badge: unsyncedCount > 0 ? `${unsyncedCount} pend` : undefined,
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    },
    { id: 'astronaut', label: 'Astronaut Profile', icon: User },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'timeline', label: 'Mission Logs', icon: History },
    { id: 'architecture', label: 'Architecture', icon: Layers },
    { id: 'problem', label: 'Problem Statement', icon: HelpCircle },
    { id: 'references', label: 'References', icon: BookOpen },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="bg-space-900 border-b border-space-800 px-4 lg:px-8 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-space-850 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              <span>{item.label}</span>
              {item.badge && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded border font-mono ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
