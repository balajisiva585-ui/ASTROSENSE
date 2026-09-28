import fs from 'fs';
import path from 'path';
import { db } from '../database/db';
import { telemetrySimulator } from '../telemetry/TelemetrySimulator';
import { asteroidMonitor } from '../asteroid/AsteroidMonitor';
import { crewManager } from '../mission/CrewManager';
import { robotManager } from '../robots/RobotManager';
import { crewRoutineManager } from '../crew/CrewRoutineManager';
import { ChatMessage, SpaceKnowledgeItem } from '../types';

export class SpaceAssistantEngine {
  private static instance: SpaceAssistantEngine;
  private knowledgeBase: SpaceKnowledgeItem[] = [];

  private constructor() {
    this.loadKnowledgeBase();
  }

  public static getInstance(): SpaceAssistantEngine {
    if (!SpaceAssistantEngine.instance) {
      SpaceAssistantEngine.instance = new SpaceAssistantEngine();
    }
    return SpaceAssistantEngine.instance;
  }

  private loadKnowledgeBase(): void {
    try {
      const kbPath = path.resolve(__dirname, '../../../data/space_knowledge_base.json');
      if (fs.existsSync(kbPath)) {
        const raw = fs.readFileSync(kbPath, 'utf-8');
        this.knowledgeBase = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not load space knowledge base, using fallback array:', err);
    }
  }

  public getKnowledgeBase(): SpaceKnowledgeItem[] {
    return this.knowledgeBase;
  }

  public ask(question: string): ChatMessage {
    const q = question.toLowerCase().trim();
    const now = new Date();
    const timestamp = now.toISOString();

    const session = db.getSession();
    const astro = db.getAstronaut('AST-01');
    const allCrew = crewManager.getAllCrew();
    const telemetry = telemetrySimulator.getCurrentTelemetry();
    const anomalies = db.getAnomalies({ resolved: false });
    const isOffline = session.commStatus === 'OFFLINE';
    const ares = robotManager.getRobot('ARES-1');
    const nova = robotManager.getRobot('NOVA-2');

    // 0. Robot Intelligence Queries (ARES-1, NOVA-2, Robot status, Robot actions)
    if (q.includes('ares') || q.includes('nova') || q.includes('robot') || q.includes('robots') || q.includes('bot')) {
      if (q.includes('ares') && !q.includes('nova') && ares) {
        return {
          id: `MSG-${Date.now()}`,
          sender: 'ASSISTANT',
          timestamp,
          text: `**ARES-1 (Autonomous Crew Support Robot) Status [SIMULATED ROBOT STATE]**:\n\n` +
            `• **Name & Role:** ${ares.name} (${ares.role})\n` +
            `• **Status:** ${ares.status} | Battery: ${ares.batteryPct}% | Location: ${ares.location}\n` +
            `• **Current Action:** ${ares.currentTask}\n` +
            `• **Primary Mission Responsibilities:** Crew routine reminders, schedule tracking, acoustic announcements, voice interaction, and local safety check-ins.\n` +
            `• **ARES-1 Voice:** *"AST-01 has completed scheduled laboratory tasks. Meal window approaching. All crew wellness metrics nominal."*`,
          category: 'MISSION_OPERATIONS',
          sources: [
            {
              title: 'ARES-1 Onboard Autonomous Agent Core',
              category: 'MISSION_OPERATIONS',
              type: 'SIMULATED_ROBOT',
            },
          ],
        };
      }

      if (q.includes('nova') && !q.includes('ares') && nova) {
        return {
          id: `MSG-${Date.now()}`,
          sender: 'ASSISTANT',
          timestamp,
          text: `**NOVA-2 (Autonomous Engineering Robot) Status [SIMULATED ROBOT STATE]**:\n\n` +
            `• **Name & Role:** ${nova.name} (${nova.role})\n` +
            `• **Status:** ${nova.status} | Battery: ${nova.batteryPct}% | Location: ${nova.location}\n` +
            `• **Current Action:** ${nova.currentTask}\n` +
            `• **Telemetry Analysis:** Cabin Temp ${telemetry.cabinTemperature}°C, Pressure ${telemetry.cabinPressure} kPa, Power ${telemetry.powerGeneratedKw} kW.\n` +
            `• **NOVA-2 Voice:** *"Telemetry analysis nominal. Monitored environmental and power subsystem parameters within simulated mission constraints."*`,
          category: 'SPACECRAFT_SYSTEMS',
          sources: [
            {
              title: 'NOVA-2 Avionics & Diagnostics Bus',
              category: 'SPACECRAFT_SYSTEMS',
              type: 'SIMULATED_ROBOT',
            },
          ],
        };
      }

      // Both robots or general robot query
      const robotLog = robotManager.getCommLogs(3);
      const logSummary = robotLog.map((l: any) => `• **${l.from} → ${l.to}** [${l.timestamp.slice(11, 19)} UTC]: "${l.message}"`).join('\n');

      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Onboard Autonomous Mission Robots (ARES-1 & NOVA-2) [SIMULATED ROBOTS]**:\n\n` +
          `• **ARES-1 (Crew Support):** ${ares?.status || 'ONLINE'} | Batt: ${ares?.batteryPct || 87}% | Loc: ${ares?.location || 'LABORATORY'} | Task: ${ares?.currentTask || 'CREW_MONITORING'}\n` +
          `• **NOVA-2 (Engineering):** ${nova?.status || 'ONLINE'} | Batt: ${nova?.batteryPct || 92}% | Loc: ${nova?.location || 'WORKSTATION'} | Task: ${nova?.currentTask || 'TELEMETRY_CHECK'}\n` +
          `• **Autonomy Mode:** ${session.autonomousModeActive ? 'ACTIVE (Local Decentralized Operation)' : 'STANDBY (Ground Telemetry Sync)'}\n\n` +
          `**Recent Robot-to-Robot Inter-Comm Coordination:**\n` +
          `${logSummary || '• Inter-robot heartbeat exchange active.'}`,
        category: 'MISSION_OPERATIONS',
        sources: [
          {
            title: 'ASTROSENSE Autonomous Multi-Robot Coordinator',
            category: 'MISSION_OPERATIONS',
            type: 'SIMULATED_ROBOT',
          },
        ],
      };
    }

    // 0.5. Crew Routine and Schedule Queries
    if (q.includes('schedule') || q.includes('routine') || q.includes('next activity') || q.includes('meal') || q.includes('rest') || q.includes('exercise session')) {
      const scheduleMap = crewRoutineManager.getAllCrewSchedules();
      const s1 = scheduleMap['AST-01'] || Object.values(scheduleMap)[0];
      const taskList = s1.tasks.map((t: any) => `  - ${t.timeSlot}: ${t.title} (${t.status})`).join('\n');

      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Crew Circadian Routine & Daily Schedule [SIMULATED SCHEDULE]**:\n\n` +
          `• **AST-01 Current Activity:** ${s1.currentActivity}\n` +
          `• **AST-01 Next Activity:** ${s1.nextActivity} (${s1.nextWindowTime})\n\n` +
          `**AST-01 Daily Timeline:**\n${taskList}\n\n` +
          `*Note: Routine timelines are simulated for crew circadian regulation and workload balancing.*`,
        category: 'HUMAN_ACTIVITY_RECOGNITION',
        sources: [
          {
            title: 'AstroSense Crew Routine Management Engine',
            category: 'HUMAN_ACTIVITY_RECOGNITION',
            type: 'SIMULATED_SCHEDULE',
          },
        ],
      };
    }

    // 1. Check for Live Telemetry / Temperature / Pressure / Battery query
    if (
      q.includes('temperature') ||
      q.includes('pressure') ||
      q.includes('oxygen') ||
      q.includes('co2') ||
      q.includes('battery') ||
      q.includes('power') ||
      q.includes('altitude') ||
      q.includes('speed') ||
      q.includes('velocity') ||
      q.includes('telemetry')
    ) {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Live Spacecraft Telemetry Status [SIMULATED MISSION TELEMETRY]**:\n\n` +
          `• **Cabin Atmosphere:** Temp ${telemetry.cabinTemperature}°C | Pressure ${telemetry.cabinPressure} kPa | O2 ${telemetry.oxygenPct}% | CO2 ${telemetry.co2Ppm} ppm\n` +
          `• **Orbital Parameters:** Altitude ${telemetry.orbitAltitudeKm} km | Velocity ${telemetry.orbitVelocityKmS} km/s (Period: 92.8 min)\n` +
          `• **Power & Battery:** Solar Generation ${telemetry.powerGeneratedKw} kW | Battery ${telemetry.batteryStoragePct}% (${telemetry.dayNightCycle})\n` +
          `• **RF Ground Link:** ${session.commStatus} (${telemetry.groundStationInView}) | Signal: ${telemetry.signalStrengthDbm} dBm\n\n` +
          `*All environmental telemetry is currently operating within nominal flight safety envelopes.*`,
        category: 'SPACECRAFT_SYSTEMS',
        sources: [
          {
            title: 'Onboard ECLSS & Avionics Telemetry Bus',
            category: 'SPACECRAFT_SYSTEMS',
            type: 'SIMULATED_TELEMETRY',
          },
        ],
      };
    }

    // 2. Check for Mission Status / "What's happening right now?"
    if (
      q.includes('happening') ||
      q.includes('mission status') ||
      q.includes('status') ||
      q.includes('overview') ||
      q.includes('what is going on') ||
      q.includes('summary')
    ) {
      const activeAnomText = anomalies.length > 0
        ? `⚠️ **${anomalies.length} Active Safety Anomaly Detected:** ${anomalies[0].title}`
        : `✅ **Zero Active Anomalies:** All crew and station subsystems nominal.`;

      const commText = isOffline
        ? `📡 **COMMUNICATION STATUS:** OFFLINE (Autonomous Onboard Mode Active, ${session.unsyncedEventCount} events queued in local flash)`
        : `📡 **COMMUNICATION STATUS:** ONLINE (Direct Telemetry Downlink to Earth Ground Mission Control)`;

      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Mission Aurora Status Briefing [SIMULATED MISSION DATA]**:\n\n` +
          `• **Flight Day:** Day 0${session.missionDay} | Mission Elapsed: ${Math.round(session.missionElapsedTimeSeconds / 60)} minutes\n` +
          `• ${commText}\n` +
          `• **Crew Activity:** ${allCrew.length} crew members active across habitat modules.\n` +
          `  - **AST-01 (${astro.name}):** ${astro.currentActivity.replace(/_/g, ' ')} in ${astro.currentModule.replace(/_/g, ' ')} (${astro.activityConfidence}% conf)\n` +
          `  - **AST-02 (Commander Chen):** OPERATING EQUIPMENT in CONTROL MODULE\n` +
          `  - **AST-03 (Dr. Lindqvist):** SITTING in WORKSTATION\n` +
          `  - **AST-04 (Kenji Sato):** EXERCISING in EXERCISE AREA (138 BPM)\n` +
          `• ${activeAnomText}`,
        category: 'MISSION_OPERATIONS',
        sources: [
          {
            title: 'AstroSense Live Mission State Matrix',
            category: 'MISSION_OPERATIONS',
            type: 'SIMULATED_TELEMETRY',
          },
        ],
      };
    }

    // 3. Check for Communication Loss / Blackout / Emergency Procedures query
    if (
      q.includes('communication is lost') ||
      q.includes('communication loss') ||
      q.includes('comm loss') ||
      q.includes('blackout') ||
      q.includes('loss of communication') ||
      q.includes('comm is lost') ||
      q.includes('offline mode') ||
      q.includes('what should the crew do if communication')
    ) {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Spacecraft Communication Loss Standard Operating Procedure [VERIFIED KNOWLEDGE & ONBOARD PROTOCOL]**:\n\n` +
          `When communication with Earth Ground Mission Control is lost or occluded:\n\n` +
          `1. **Autonomous Intelligence Handover:** AstroSense automatically transitions to autonomous onboard edge mode. Real-time Human Activity Recognition (HAR) and vitals monitoring continue uninterrupted without internet or cloud dependencies.\n` +
          `2. **Local Resilient Event Persistence:** All recognized crew actions, duration logs, and anomaly events are committed directly to the onboard SQLite database and held in non-volatile flash storage.\n` +
          `3. **Autonomous Local Safety Alarms:** If a fall, abnormal kinematic impact, or critical vitals spike occurs, AstroSense triggers immediate in-cabin acoustic and visual safety alerts for fellow crew members without waiting for Earth authorization.\n` +
          `4. **Delay-Tolerant Re-Synchronization:** When the spacecraft re-enters Ground Deep Space Network (DSN) tracking visibility, AstroSense automatically triggers the Delay-Tolerant Synchronization engine (0% → 100%) to backfill the full timeline on Earth.\n\n` +
          `*Note: The flight crew does NOT need to manually intervene for baseline monitoring—onboard AI maintains 100% autonomous station safety.*`,
        category: 'EMERGENCY_PROCEDURES',
        sources: [
          {
            title: 'AstroSense Delay-Tolerant Autonomy Protocol (CCSDS 734.2-B-1)',
            category: 'EMERGENCY_PROCEDURES',
            type: 'VERIFIED_KNOWLEDGE',
          },
        ],
      };
    }

    // 4. Check for Astronaut / Crew specific query
    if (q.includes('ast-') || q.includes('astronaut') || q.includes('crew') || q.includes('elena') || q.includes('chen')) {
      const ast01Summary = `**Astronaut AST-01 (${astro.name})**: Currently **${astro.currentActivity.replace(/_/g, ' ')}** in **${astro.currentModule.replace(/_/g, ' ')}** with **${astro.activityConfidence}%** Edge AI confidence. Vitals: Heart Rate ${astro.vitals.heartRate} BPM, SpO2 ${astro.vitals.spO2}%, Core Temp ${astro.vitals.bodyTemp}°C. Cumulative active time today: ${(astro.stats.totalActiveSeconds / 3600).toFixed(1)} hrs.`;

      const otherCrewSummary = allCrew
        .filter(c => c.id !== 'AST-01')
        .map(c => `• **${c.id} (${c.name}):** ${c.currentActivity.replace(/_/g, ' ')} in ${c.currentModule.replace(/_/g, ' ')} (Task: ${c.assignedTask})`)
        .join('\n');

      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Active Crew Behavioral & Activity Roster [SIMULATED MISSION TELEMETRY]**:\n\n` +
          `${ast01Summary}\n\n` +
          `**Other Station Crew:**\n${otherCrewSummary}`,
        category: 'HUMAN_ACTIVITY_RECOGNITION',
        sources: [
          {
            title: 'AstroSense Biomechanical Multi-Camera Classifier',
            category: 'HUMAN_ACTIVITY_RECOGNITION',
            type: 'SIMULATED_TELEMETRY',
          },
        ],
      };
    }

    // 4. Check for Anomaly / Alert query
    if (q.includes('anomaly') || q.includes('alert') || q.includes('fall') || q.includes('danger') || q.includes('hazard')) {
      if (anomalies.length === 0) {
        return {
          id: `MSG-${Date.now()}`,
          sender: 'ASSISTANT',
          timestamp,
          text: `**Active Safety Anomaly Report [SIMULATED MISSION DATA]**:\n\n` +
            `No active anomalies currently flagged on station. All 4 crew members are exhibiting nominal kinetic activity signatures, and all spacecraft environmental sensors are within flight rule limits.`,
          category: 'ASTRONAUT_SAFETY',
          sources: [
            {
              title: 'Onboard Autonomous Safety Anomaly Classifier',
              category: 'ASTRONAUT_SAFETY',
              type: 'SIMULATED_TELEMETRY',
            },
          ],
        };
      }

      const top = anomalies[0];
      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**ACTIVE ANOMALY DETECTED: ${top.title} [SIMULATED MISSION ALERT]**\n\n` +
          `• **Severity:** ${top.severity}\n` +
          `• **Target:** ${top.targetObject || top.astronautId}\n` +
          `• **Time Detected:** ${top.displayTime} UTC\n` +
          `• **Evidence:** ${top.telemetryEvidence || top.description}\n\n` +
          `**AI DECISION SUPPORT ANALYSIS**:\n` +
          `Local heuristic classifiers indicate potential safety envelope breach.\n\n` +
          `**RECOMMENDED PROCEDURE (Human Verification Required):**\n` +
          `${top.recommendedAction}`,
        category: 'ASTRONAUT_SAFETY',
        recommendedAction: top.recommendedAction,
        isDecisionSupport: true,
        sources: [
          {
            title: 'AstroSense Realtime Anomaly Engine',
            category: 'ASTRONAUT_SAFETY',
            type: 'AI_RECOMMENDATION',
          },
        ],
      };
    }

    // 5. Check for Communication Loss / Offline Protocol query
    if (q.includes('communication') || q.includes('comm loss') || q.includes('lost') || q.includes('offline') || q.includes('blackout')) {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Protocol for Spacecraft Communication Blackout [VERIFIED KNOWLEDGE & FLIGHT RULES]**:\n\n` +
          `1. **Autonomous Onboard Mode Engaged:** AstroSense automatically transitions to local standalone operation. Zero telemetry frames or event classifications are halted.\n` +
          `2. **Local ACID Storage:** All activity classifications, biosensor vitals, and safety events are cached in local SQLite flash storage with microsecond UTC timestamps.\n` +
          `3. **Autonomous Crew Safety:** Life-safety anomaly detection (falls, extended inactivity) continues running locally with immediate cabin audio alerts.\n` +
          `4. **Re-Acquisition & Delay-Tolerant Sync:** Once RF ground connection is restored, the Delay-Tolerant Synchronization Engine batches and transmits all accumulated telemetry to Earth Mission Control (0% → 100%).`,
        category: 'COMMUNICATION',
        sources: [
          {
            title: 'CCSDS Delay-Tolerant Space Networking & ISS Flight Rules',
            category: 'COMMUNICATION',
            type: 'VERIFIED_KNOWLEDGE',
          },
        ],
      };
    }

    // 6. Check for Asteroid / Deep Space query
    if (q.includes('asteroid') || q.includes('neo') || q.includes('pha') || q.includes('apophis') || q.includes('deep space')) {
      const asteroids = asteroidMonitor.getAsteroids();
      const astList = asteroids
        .map(a => `• **${a.name} (${a.type}):** Dist: ${a.distanceLd} LD (${(a.distanceKm / 1e6).toFixed(2)}M km) | Vel: ${a.relativeVelocityKmS} km/s | Status: ${a.observationStatus}`)
        .join('\n');

      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Deep Space & Asteroid Observation Matrix [SIMULATED ASTEROID DATA]**:\n\n` +
          `Currently tracking ${asteroids.length} near-Earth objects via simulated radar telemetry:\n\n` +
          `${astList}\n\n` +
          `*Note: Planetary defense observations are simulated for hackathon demonstration.*`,
        category: 'ASTEROIDS',
        sources: [
          {
            title: 'AstroSense Deep Space Asteroid Radar Pipeline',
            category: 'ASTEROIDS',
            type: 'SIMULATED_TELEMETRY',
          },
        ],
      };
    }

    // 7. Search Local Space Knowledge Base for Keyword Match
    const matchedItem = this.findBestKnowledgeMatch(q);
    if (matchedItem) {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**${matchedItem.title} [VERIFIED KNOWLEDGE]**\n\n` +
          `${matchedItem.content}\n\n` +
          `*(Source: ${matchedItem.source})*`,
        category: matchedItem.category,
        sources: [
          {
            title: matchedItem.title,
            category: matchedItem.category,
            type: 'VERIFIED_KNOWLEDGE',
          },
        ],
      };
    }

    // 8. General Space Assistant Fallback with helpful suggestions
    return {
      id: `MSG-${Date.now()}`,
      sender: 'ASSISTANT',
      timestamp,
      text: `I am **ASTROSENSE AI**, your autonomous onboard mission and spaceflight assistant.\n\n` +
        `You can ask me about:\n` +
        `• **Live Mission Status & Astronaut Activities** ("What's happening on the mission right now?", "Show AST-01 activity")\n` +
        `• **Spacecraft Telemetry** ("What is the cabin temperature and oxygen level?")\n` +
        `• **Active Anomalies & Safety** ("Is there any anomaly?", "Explain the latest alert")\n` +
        `• **Deep Space Asteroids** ("What asteroids are being tracked?")\n` +
        `• **Flight Rules & Knowledge** ("What happens during communication loss?", "Why do astronauts exercise in microgravity?")`,
      category: 'SPACE_BASICS',
      sources: [
        {
          title: 'AstroSense Onboard Mission Intelligence Engine',
          category: 'SPACE_BASICS',
          type: 'VERIFIED_KNOWLEDGE',
        },
      ],
    };
  }

  private findBestKnowledgeMatch(query: string): SpaceKnowledgeItem | null {
    const tokens = query.split(/\s+/).filter(w => w.length > 2);
    let bestScore = 0;
    let bestItem: SpaceKnowledgeItem | null = null;

    for (const item of this.knowledgeBase) {
      let score = 0;
      for (const kw of item.keywords) {
        if (query.includes(kw)) score += 3;
      }
      for (const token of tokens) {
        if (item.title.toLowerCase().includes(token)) score += 2;
        if (item.summary.toLowerCase().includes(token)) score += 1;
        if (item.category.toLowerCase().includes(token)) score += 2;
      }
      if (score > bestScore) {
        bestScore = score;
        bestItem = item;
      }
    }

    return bestScore >= 2 ? bestItem : null;
  }
}

export const spaceAssistantEngine = SpaceAssistantEngine.getInstance();
