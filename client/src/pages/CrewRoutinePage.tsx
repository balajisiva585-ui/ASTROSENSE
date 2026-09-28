import React, { useState } from 'react';
import { useMission } from '../context/MissionContext';
import {
  Calendar,
  Clock,
  Volume2,
  VolumeX,
  Plus,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Megaphone,
  Radio,
  User,
  Shield,
  Utensils,
  Dumbbell,
  Bed,
  Briefcase,
  Sliders,
} from 'lucide-react';

export const CrewRoutinePage: React.FC = () => {
  const {
    crewSchedules,
    announcements,
    updateTaskStatus,
    addTask,
    triggerRoutineAnnouncement,
    voiceAnnouncementsEnabled,
    announcementVolume,
    updateVoiceSettings,
  } = useMission();

  const [selectedAstro, setSelectedAstro] = useState<string>('AST-01');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState<any>('WORK');
  const [newTaskModule, setNewTaskModule] = useState<any>('LABORATORY');

  const currentSchedule = crewSchedules[selectedAstro] || {
    astronautId: selectedAstro,
    astronautName: 'Astronaut',
    currentActivity: 'Working',
    nextActivity: 'Meal',
    nextWindowTime: '12:30',
    laterActivity: 'Rest',
    laterWindowTime: '20:00',
    tasks: [],
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !newTaskTime.trim()) return;

    await addTask({
      astronautId: selectedAstro,
      title: newTaskTitle,
      timeSlot: newTaskTime,
      category: newTaskCategory,
      activityType: newTaskCategory === 'MEAL' ? 'EATING' : newTaskCategory === 'EXERCISE' ? 'EXERCISING' : 'WORKING',
      module: newTaskModule,
      status: 'PENDING',
    });

    setNewTaskTitle('');
    setNewTaskTime('');
    setIsAddModalOpen(false);
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'MEAL':
        return <Utensils className="w-4 h-4 text-amber-400" />;
      case 'EXERCISE':
        return <Dumbbell className="w-4 h-4 text-emerald-400" />;
      case 'REST':
      case 'SLEEP':
        return <Bed className="w-4 h-4 text-purple-400" />;
      default:
        return <Briefcase className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-space-950 border border-cyan-500/30 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-mono text-white tracking-wider uppercase">
                CREW ROUTINE & CIRCADIAN SCHEDULE MANAGER
              </h1>
              <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                SIMULATED SCHEDULE
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Autonomous circadian workload balancing & acoustic routine announcements
            </p>
          </div>
        </div>

        {/* Non-Medical Disclaimer */}
        <div className="bg-space-900/90 px-3.5 py-1.5 rounded-xl border border-amber-500/30 text-[11px] font-mono text-amber-300 flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-400" />
          <span>SIMULATED CREW ROUTINE • NOT MEDICAL ADVICE • NON-DIAGNOSTIC</span>
        </div>
      </div>

      {/* Main Grid: Schedule Timetable (Left 2 cols) + Voice Routine Announcements (Right 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Astronaut Timetable */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Astronaut Selector Tabs */}
          <div className="flex items-center justify-between bg-space-900 border border-space-800 rounded-xl p-2">
            <div className="flex items-center gap-2">
              {['AST-01', 'AST-02', 'AST-03', 'AST-04'].map((id) => (
                <button
                  key={id}
                  onClick={() => setSelectedAstro(id)}
                  className={`px-3.5 py-2 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5 ${
                    selectedAstro === id
                      ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                      : 'bg-space-950 text-gray-400 hover:text-white border border-space-800'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  {id}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-mono font-bold transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" /> ADD TASK
            </button>
          </div>

          {/* Current / Next / Later Routine Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-space-900 border border-cyan-500/30 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase">CURRENT ACTIVITY</span>
              <span className="text-sm font-mono font-bold text-cyan-300 truncate">
                {currentSchedule.currentActivity}
              </span>
              <span className="text-[10px] text-gray-400">ACTIVE FLIGHT BLOCK</span>
            </div>

            <div className="bg-space-900 border border-space-800 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase">NEXT SCHEDULED</span>
              <span className="text-sm font-mono font-bold text-amber-300 truncate">
                {currentSchedule.nextActivity}
              </span>
              <span className="text-[10px] text-gray-400">{currentSchedule.nextWindowTime}</span>
            </div>

            <div className="bg-space-900 border border-space-800 p-3.5 rounded-xl flex flex-col gap-1">
              <span className="text-[10px] font-mono text-gray-400 uppercase">LATER WINDOW</span>
              <span className="text-sm font-mono font-bold text-purple-300 truncate">
                {currentSchedule.laterActivity}
              </span>
              <span className="text-[10px] text-gray-400">{currentSchedule.laterWindowTime}</span>
            </div>
          </div>

          {/* Detailed Task Timetable */}
          <div className="bg-space-900 border border-space-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                DAILY TIMELINE FOR {selectedAstro} ({currentSchedule.astronautName})
              </h3>
              <span className="text-[10px] font-mono text-gray-400">
                {currentSchedule.tasks.length} SCHEDULED BLOCKS
              </span>
            </div>

            <div className="flex flex-col gap-2.5">
              {currentSchedule.tasks.map((task) => (
                <div
                  key={task.id}
                  className={`p-3.5 rounded-xl border text-xs font-mono flex flex-wrap items-center justify-between gap-3 transition ${
                    task.status === 'ACTIVE'
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                      : task.status === 'COMPLETED'
                      ? 'bg-space-950/60 border-space-800 text-gray-400 line-through'
                      : 'bg-space-950 border-space-800 text-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-space-900 border border-space-800">
                      {getCategoryIcon(task.category)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-cyan-300">{task.timeSlot}</span>
                        <span className="text-gray-400">•</span>
                        <span className="font-semibold text-white">{task.title}</span>
                      </div>
                      <div className="text-[11px] text-gray-400 flex items-center gap-2 mt-0.5">
                        <span>MODULE: {task.module.replace(/_/g, ' ')}</span>
                        <span>•</span>
                        <span className="text-gray-500">{task.notes}</span>
                      </div>
                    </div>
                  </div>

                  {/* Task Status Actions */}
                  <div className="flex items-center gap-1.5">
                    {task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                        className="px-2.5 py-1 bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-black rounded text-[10px] font-bold border border-emerald-500/40 transition flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3 h-3" /> COMPLETE
                      </button>
                    )}

                    {task.status !== 'ACTIVE' && task.status !== 'COMPLETED' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'ACTIVE')}
                        className="px-2.5 py-1 bg-cyan-500/20 hover:bg-cyan-500 text-cyan-300 hover:text-black rounded text-[10px] font-bold border border-cyan-500/40 transition flex items-center gap-1"
                      >
                        <PlayCircle className="w-3 h-3" /> START
                      </button>
                    )}

                    {task.status === 'ACTIVE' && (
                      <button
                        onClick={() => updateTaskStatus(task.id, 'PAUSED')}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500 text-amber-300 hover:text-black rounded text-[10px] font-bold border border-amber-500/40 transition flex items-center gap-1"
                      >
                        <PauseCircle className="w-3 h-3" /> PAUSE
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Voice Routine Announcements Panel */}
        <div className="flex flex-col gap-4">
          <div className="bg-space-900 border border-space-800 rounded-xl p-4 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-space-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-bold uppercase">
                <Megaphone className="w-4 h-4" />
                ROUTINE ANNOUNCEMENT CONTROLS
              </div>
              <button
                onClick={() => updateVoiceSettings(!voiceAnnouncementsEnabled)}
                className={`p-1.5 rounded-lg border text-xs font-mono transition flex items-center gap-1 ${
                  voiceAnnouncementsEnabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-red-500/20 text-red-300 border-red-500/40'
                }`}
              >
                {voiceAnnouncementsEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
                {voiceAnnouncementsEnabled ? 'VOICE ON' : 'VOICE OFF'}
              </button>
            </div>

            {/* Volume Slider */}
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex items-center justify-between text-gray-400">
                <span>ANNOUNCEMENT VOLUME:</span>
                <span className="text-cyan-300 font-bold">{announcementVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={announcementVolume}
                onChange={(e) => updateVoiceSettings(voiceAnnouncementsEnabled, parseInt(e.target.value))}
                className="accent-cyan-400 w-full"
              />
            </div>

            {/* Quick Trigger Preset Announcements */}
            <div className="flex flex-col gap-2 pt-2 border-t border-space-800">
              <span className="text-[10px] font-mono text-gray-400">BROADCAST SIMULATED REMINDERS:</span>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() =>
                    triggerRoutineAnnouncement(
                      'Attention crew. The scheduled meal period is approaching.',
                      'MEAL'
                    )
                  }
                  className="p-2.5 rounded-lg bg-space-950 hover:bg-cyan-950 border border-space-800 hover:border-cyan-500/40 text-left text-xs font-mono text-gray-300 hover:text-cyan-300 transition"
                >
                  🥗 "Scheduled meal period approaching"
                </button>

                <button
                  onClick={() =>
                    triggerRoutineAnnouncement(
                      'AST-03, your scheduled exercise session is beginning.',
                      'EXERCISE',
                      'AST-03'
                    )
                  }
                  className="p-2.5 rounded-lg bg-space-950 hover:bg-cyan-950 border border-space-800 hover:border-cyan-500/40 text-left text-xs font-mono text-gray-300 hover:text-cyan-300 transition"
                >
                  🏃 "AST-03 exercise session beginning"
                </button>

                <button
                  onClick={() =>
                    triggerRoutineAnnouncement(
                      'Scheduled rest period is approaching for Station Crew.',
                      'REST'
                    )
                  }
                  className="p-2.5 rounded-lg bg-space-950 hover:bg-cyan-950 border border-space-800 hover:border-cyan-500/40 text-left text-xs font-mono text-gray-300 hover:text-cyan-300 transition"
                >
                  🌙 "Scheduled rest period approaching"
                </button>

                <button
                  onClick={() =>
                    triggerRoutineAnnouncement(
                      'Mission task reminder: Equipment inspection is due in Control Module.',
                      'INSPECTION'
                    )
                  }
                  className="p-2.5 rounded-lg bg-space-950 hover:bg-cyan-950 border border-space-800 hover:border-cyan-500/40 text-left text-xs font-mono text-gray-300 hover:text-cyan-300 transition"
                >
                  🔧 "Equipment inspection is due"
                </button>
              </div>
            </div>
          </div>

          {/* Recent Routine Announcements Log */}
          <div className="bg-space-900 border border-space-800 rounded-xl p-4 shadow-xl flex flex-col gap-3">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <h4 className="text-xs font-mono font-bold text-gray-300 uppercase">
                ACOUSTIC BROADCAST LOG
              </h4>
              <span className="text-[10px] font-mono text-cyan-400">ARES-1 DISPATCH</span>
            </div>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1">
              {announcements.length === 0 ? (
                <div className="text-xs font-mono text-gray-400 text-center py-4">
                  No routine announcements dispatched yet.
                </div>
              ) : (
                announcements.map((ann) => (
                  <div
                    key={ann.id}
                    className="p-2 rounded-lg bg-space-950 border border-space-800/80 text-xs font-mono flex flex-col gap-1 text-gray-300"
                  >
                    <div className="flex items-center justify-between text-[10px] text-gray-400">
                      <span className="text-cyan-400 font-bold">📢 {ann.category}</span>
                      <span>{ann.displayTime} UTC</span>
                    </div>
                    <div className="text-gray-200">"{ann.announcementText}"</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-space-900 border border-cyan-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl flex flex-col gap-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-space-800 pb-2">
              <h3 className="text-sm font-bold text-white uppercase">ADD CREW ROUTINE TASK</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
              <div>
                <label className="text-gray-400 block mb-1">TASK TITLE</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Science Experiment Setup"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full bg-space-950 border border-space-800 rounded-lg p-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1">TIME SLOT</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 14:00 - 15:30"
                  value={newTaskTime}
                  onChange={(e) => setNewTaskTime(e.target.value)}
                  className="w-full bg-space-950 border border-space-800 rounded-lg p-2 text-white outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1">CATEGORY</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full bg-space-950 border border-space-800 rounded-lg p-2 text-white outline-none"
                  >
                    <option value="WORK">WORK</option>
                    <option value="EXERCISE">EXERCISE</option>
                    <option value="MEAL">MEAL</option>
                    <option value="REST">REST</option>
                    <option value="SLEEP">SLEEP</option>
                    <option value="MISSION_TASK">MISSION TASK</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 block mb-1">MODULE</label>
                  <select
                    value={newTaskModule}
                    onChange={(e) => setNewTaskModule(e.target.value as any)}
                    className="w-full bg-space-950 border border-space-800 rounded-lg p-2 text-white outline-none"
                  >
                    <option value="LABORATORY">LABORATORY</option>
                    <option value="WORKSTATION">WORKSTATION</option>
                    <option value="EXERCISE_AREA">EXERCISE AREA</option>
                    <option value="CREW_QUARTERS">CREW QUARTERS</option>
                    <option value="CONTROL_MODULE">CONTROL MODULE</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t border-space-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 bg-space-950 border border-space-800 text-gray-300 rounded-lg hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-lg shadow-[0_0_12px_rgba(0,240,255,0.3)]"
                >
                  COMMIT TASK
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
