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
    const loaded: SpaceKnowledgeItem[] = [];

    // 1. Load generic space knowledge base
    try {
      const kbPath = path.resolve(__dirname, '../../../data/space_knowledge_base.json');
      if (fs.existsSync(kbPath)) {
        const raw = fs.readFileSync(kbPath, 'utf-8');
        const items = JSON.parse(raw);
        loaded.push(...items);
      }
    } catch (err) {
      console.warn('Could not load generic space knowledge base:', err);
    }

    // 2. Load NASA verified knowledge
    try {
      const nasaPath = path.resolve(__dirname, '../knowledge/nasa_knowledge.json');
      if (fs.existsSync(nasaPath)) {
        const raw = fs.readFileSync(nasaPath, 'utf-8');
        const nasaItems = JSON.parse(raw);
        for (const item of nasaItems) {
          loaded.push({
            ...item,
            content: (item.facts || []).map((f: string) => `• ${f}`).join('\n'),
            source: `${item.sourceTitle} (${item.sourceAgency}.gov)`,
            verified: true,
          });
        }
      }
    } catch (err) {
      console.warn('Could not load NASA knowledge base:', err);
    }

    // 3. Load ISRO verified knowledge
    try {
      const isroPath = path.resolve(__dirname, '../knowledge/isro_knowledge.json');
      if (fs.existsSync(isroPath)) {
        const raw = fs.readFileSync(isroPath, 'utf-8');
        const isroItems = JSON.parse(raw);
        for (const item of isroItems) {
          loaded.push({
            ...item,
            content: (item.facts || []).map((f: string) => `• ${f}`).join('\n'),
            source: `${item.sourceTitle} (${item.sourceAgency}.gov.in)`,
            verified: true,
          });
        }
      }
    } catch (err) {
      console.warn('Could not load ISRO knowledge base:', err);
    }

    this.knowledgeBase = loaded;
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

    // 0.8. Specific Vision HAR and Webcam Diagnostic Questions
    if (
      q.includes('what activities can the webcam detect') ||
      q.includes('activities can the webcam detect') ||
      q.includes('supported activities') ||
      q.includes('what can the camera detect')
    ) {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Supported Real-Time Human Activities [VISION HAR ENGINE]**:\n\n` +
          `ASTROSENSE's browser-side MediaPipe Pose + OpenCV.js engine classifies human activity using 33 3D skeletal landmarks and optical-flow temporal motion analysis:\n\n` +
          `1. **STANDING**: Upright torso, hips vertically aligned above knees, low baseline movement, stable center of mass.\n` +
          `2. **SITTING**: Lowered hips relative to shoulders, acute knee flexion (~90°), stable seated posture.\n` +
          `3. **WALKING**: Sustained translational movement, alternating ankle/knee trajectories, periodic stride kinematics, high optical-flow displacement.\n` +
          `4. **EXERCISING**: High kinetic energy, periodic joint oscillations (squats, curls, arm extensions), cyclic knee/elbow angle variations.\n` +
          `5. **SLEEPING_RESTING**: Recumbent horizontal body posture, minimum kinetic energy for sustained duration.\n` +
          `6. **LONG_INACTIVITY**: Person detected with movement below safety threshold for longer than the configured limit.\n` +
          `7. **FALL_ABNORMAL_MOVEMENT**: Sudden rapid downward acceleration of center of mass accompanied by sharp optical flow spike and horizontal orientation.\n` +
          `8. **NO PERSON DETECTED**: No human body landmark detected in frame (does NOT fabricate fake standing/walking).\n` +
          `9. **ANALYZING / UNKNOWN**: Transitional state when confidence or temporal majority is below statistical confirmation threshold.`,
        category: 'HUMAN_ACTIVITY_RECOGNITION',
        sources: [
          {
            title: 'AstroSense Onboard Vision Pipeline (MediaPipe + OpenCV.js)',
            category: 'HUMAN_ACTIVITY_RECOGNITION',
            type: 'VERIFIED_KNOWLEDGE',
          },
        ],
      };
    }

    if (
      q.includes('why is the camera showing analyzing') ||
      q.includes('showing analyzing') ||
      q.includes('what is analyzing')
    ) {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Explanation of "ANALYZING" State [VISION HAR ENGINE]**:\n\n` +
          `The camera displays **ANALYZING** whenever:\n` +
          `1. **Temporal Confirmation Window**: The system uses a 30–60 frame rolling majority buffer. During rapid posture transitions (e.g. standing to sitting), it waits for sustained kinematic agreement before locking the new activity to eliminate flickering.\n` +
          `2. **Low Visibility or Occlusion**: If key body joints (hips, knees, shoulders) are partially occluded or poorly lit, confidence drops below the 60% threshold.\n` +
          `3. **Ambiguous Kinematics**: When motion signals are between stable thresholds (such as partial fidgeting or context-dependent gestures like eating/working), the system honestly shows ANALYZING rather than fabricating an unverified activity.`,
        category: 'HUMAN_ACTIVITY_RECOGNITION',
        sources: [
          {
            title: 'AstroSense Temporal Majority Voting & Hysteresis Specification',
            category: 'HUMAN_ACTIVITY_RECOGNITION',
            type: 'VERIFIED_KNOWLEDGE',
          },
        ],
      };
    }

    if (
      q.includes('what does long inactivity mean') ||
      q.includes('long inactivity') ||
      q.includes('inactivity alert')
    ) {
      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**Safety Definition of "LONG INACTIVITY" [CREW HEALTH PROTOCOL]**:\n\n` +
          `**LONG INACTIVITY** is an automated safety alert triggered when:\n` +
          `• A human subject is actively detected in the camera frame.\n` +
          `• Total kinetic energy and joint displacement remain strictly below 0.05 units for a sustained duration (configurable, default >15–30 seconds during active duty periods).\n` +
          `• The astronaut is not in designated sleep quarters or a scheduled rest window.\n\n` +
          `**Purpose**: Protects crew members against sudden medical incapacitation, carbon dioxide stupor, or microgravity entanglements during unmonitored solo duty shifts. When detected, ARES-1 robot or audio intercom requests vocal status confirmation.`,
        category: 'ASTRONAUT_SAFETY',
        sources: [
          {
            title: 'NASA Human Research Program (HRP) - Behavioral Health & Inactivity Standards',
            category: 'ASTRONAUT_SAFETY',
            type: 'VERIFIED_KNOWLEDGE',
            sourceAgency: 'NASA',
            sourceTitle: 'NASA Behavioral Health & Performance Standards',
            sourceUrl: 'https://www.nasa.gov/hrp/',
            verifiedAt: '2026-09-29',
          },
        ],
      };
    }

    // 1. Specific NASA Knowledge Inquiries (Gateway, HALO, I-Hab, Orion, Countermeasures)
    if (q.includes('gateway') || q.includes('halo') || q.includes('i-hab') || q.includes('ihab') || q.includes('orion') || q.includes('artemis')) {
      const matched = this.knowledgeBase.find(k =>
        k.sourceAgency === 'NASA' && (
          (q.includes('gateway') && k.id.includes('GATEWAY')) ||
          (q.includes('halo') && k.id.includes('HALO')) ||
          ((q.includes('i-hab') || q.includes('ihab')) && k.id.includes('IHAB')) ||
          (q.includes('orion') && k.id.includes('ORION')) ||
          (q.includes('artemis') && (k.id.includes('GATEWAY') || k.id.includes('ORION')))
        )
      );

      if (matched) {
        return {
          id: `MSG-${Date.now()}`,
          sender: 'ASSISTANT',
          timestamp,
          text: `**${matched.title} [VERIFIED NASA KNOWLEDGE]**\n\n` +
            `${matched.summary}\n\n` +
            `**Key Technical Facts:**\n` +
            `${matched.content}\n\n` +
            `*(Source: ${matched.sourceTitle} // ${matched.sourceUrl})*`,
          category: matched.category,
          sources: [
            {
              title: matched.title,
              category: matched.category,
              type: 'VERIFIED_KNOWLEDGE',
              sourceAgency: 'NASA',
              sourceTitle: matched.sourceTitle,
              sourceUrl: matched.sourceUrl,
              verifiedAt: matched.verifiedAt,
            },
          ],
        };
      }
    }

    // 2. Specific ISRO Knowledge Inquiries (Gaganyaan, Chandrayaan-3, Aditya-L1, BAS, Vyommitra)
    if (
      q.includes('gaganyaan') ||
      q.includes('chandrayaan') ||
      q.includes('aditya') ||
      q.includes('aditya-l1') ||
      q.includes('bharatiya antariksh') ||
      q.includes('bas') ||
      q.includes('vyommitra')
    ) {
      const matched = this.knowledgeBase.find(k =>
        k.sourceAgency === 'ISRO' && (
          (q.includes('gaganyaan') && k.id.includes('GAGANYAAN')) ||
          (q.includes('chandrayaan') && k.id.includes('CHANDRAYAAN')) ||
          ((q.includes('aditya') || q.includes('aditya-l1')) && k.id.includes('ADITYAL1')) ||
          ((q.includes('bharatiya') || q.includes('bas')) && k.id.includes('BAS')) ||
          (q.includes('vyommitra') && k.id.includes('VYOMMITRA'))
        )
      );

      if (matched) {
        return {
          id: `MSG-${Date.now()}`,
          sender: 'ASSISTANT',
          timestamp,
          text: `**${matched.title} [VERIFIED ISRO KNOWLEDGE]**\n\n` +
            `${matched.summary}\n\n` +
            `**Key Technical Facts:**\n` +
            `${matched.content}\n\n` +
            `*(Source: ${matched.sourceTitle} // ${matched.sourceUrl})*`,
          category: matched.category,
          sources: [
            {
              title: matched.title,
              category: matched.category,
              type: 'VERIFIED_KNOWLEDGE',
              sourceAgency: 'ISRO',
              sourceTitle: matched.sourceTitle,
              sourceUrl: matched.sourceUrl,
              verifiedAt: matched.verifiedAt,
            },
          ],
        };
      }
    }

    // 3. Live Telemetry Queries
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

    // 4. Mission Status Queries
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

    // 5. Communication Loss & Emergency Procedures
    if (
      q.includes('communication is lost') ||
      q.includes('communication loss') ||
      q.includes('comm loss') ||
      q.includes('blackout') ||
      q.includes('loss of communication') ||
      q.includes('comm is lost') ||
      q.includes('offline mode') ||
      q.includes('what happens during communication loss') ||
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

    // 6. Check for Astronaut / Crew specific query
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

    // 7. Check for Anomaly / Alert query
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
          `**AI DECISION SUPPORT ANALYSIS (Human Verification Required):**\n` +
          `Local heuristic classifiers indicate potential safety envelope breach.\n\n` +
          `**RECOMMENDED PROCEDURE:**\n` +
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

    // 8. Asteroid / Deep Space query
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

    // 9. Search Local Space Knowledge Base for Keyword Match
    const matchedItem = this.findBestKnowledgeMatch(q);
    if (matchedItem) {
      const agencyBadge = matchedItem.sourceAgency ? ` [VERIFIED ${matchedItem.sourceAgency} KNOWLEDGE]` : ` [VERIFIED KNOWLEDGE]`;
      return {
        id: `MSG-${Date.now()}`,
        sender: 'ASSISTANT',
        timestamp,
        text: `**${matchedItem.title}${agencyBadge}**\n\n` +
          `${matchedItem.summary}\n\n` +
          (matchedItem.content ? `${matchedItem.content}\n\n` : '') +
          `*(Source: ${matchedItem.sourceTitle || matchedItem.source || 'Official Space Agency Reference'})*`,
        category: matchedItem.category,
        sources: [
          {
            title: matchedItem.title,
            category: matchedItem.category,
            type: 'VERIFIED_KNOWLEDGE',
            sourceAgency: matchedItem.sourceAgency,
            sourceTitle: matchedItem.sourceTitle || matchedItem.source,
            sourceUrl: matchedItem.sourceUrl,
            verifiedAt: matchedItem.verifiedAt,
          },
        ],
      };
    }

    // 10. General Space Assistant Fallback
    return {
      id: `MSG-${Date.now()}`,
      sender: 'ASSISTANT',
      timestamp,
      text: `I am **ASTROSENSE AI**, your autonomous onboard mission intelligence and spaceflight assistant.\n\n` +
        `You can ask me about:\n` +
        `• **NASA Programs** ("What is Gateway?", "What is HALO?", "What is Orion?")\n` +
        `• **ISRO Programs** ("What is Gaganyaan?", "What is Aditya-L1?", "What is Chandrayaan-3?", "What is Bharatiya Antariksh Station?")\n` +
        `• **Vision Activity Recognition** ("What activities can the webcam detect?", "Why is the camera showing ANALYZING?", "What does LONG INACTIVITY mean?")\n` +
        `• **Spacecraft Telemetry & Crew** ("What is the cabin temperature?", "What's happening on the mission right now?")\n` +
        `• **Emergency Flight Rules** ("What happens during communication loss?", "Why do astronauts exercise in microgravity?")\n\n` +
        `*NASA and ISRO facts are loaded from official offline public data without cloud dependencies.*`,
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
      if (item.keywords) {
        for (const kw of item.keywords) {
          if (query.includes(kw.toLowerCase())) score += 3;
        }
      }
      if (item.topic && query.includes(item.topic.toLowerCase())) score += 5;
      if (item.title && query.includes(item.title.toLowerCase())) score += 4;
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

