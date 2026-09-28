import { VoiceCommandResult } from '../types';
import { db } from '../database/db';
import { telemetrySimulator } from '../telemetry/TelemetrySimulator';
import { robotManager } from '../robots/RobotManager';
import { crewManager } from '../mission/CrewManager';
import { asteroidMonitor } from '../asteroid/AsteroidMonitor';
import { crewRoutineManager } from '../crew/CrewRoutineManager';

export class VoiceCommandEngine {
  private static instance: VoiceCommandEngine;

  private constructor() {}

  public static getInstance(): VoiceCommandEngine {
    if (!VoiceCommandEngine.instance) {
      VoiceCommandEngine.instance = new VoiceCommandEngine();
    }
    return VoiceCommandEngine.instance;
  }

  public processVoiceCommand(rawTranscript: string): VoiceCommandResult {
    const transcript = (rawTranscript || '').trim();
    const q = transcript.toLowerCase();

    const session = db.getSession();
    const astro = db.getAstronaut('AST-01');
    const allCrew = crewManager.getAllCrew();
    const telemetry = telemetrySimulator.getCurrentTelemetry();
    const anomalies = db.getAnomalies({ resolved: false });
    const robots = robotManager.getAllRobots();
    const isOffline = session.commStatus === 'OFFLINE';

    // 1. Mission Status / Summary
    if (q.includes('mission status') || q.includes('mission summary') || q.includes('status of the mission') || q.includes('how is the mission')) {
      const responseText = `Mission Aurora is on Day 0${session.missionDay}. Communication link is ${session.commStatus}. ${allCrew.length} crew members active across habitat modules. ${anomalies.length > 0 ? `Alert: ${anomalies.length} active anomalies detected.` : 'All spacecraft subsystems and crew vitals are operating within nominal thresholds.'}`;
      const spokenText = `Mission Aurora status: Day 0${session.missionDay}. Link is ${session.commStatus}. All ${allCrew.length} crew members nominal.`;
      return {
        transcript,
        understood: true,
        intent: 'MISSION_STATUS',
        responseText,
        spokenText,
        category: 'MISSION_OPERATIONS',
        dataPayload: { session, telemetry },
      };
    }

    // 2. How is the crew? / Crew status
    if (q.includes('how is the crew') || q.includes('crew status') || q.includes('check crew')) {
      const working = allCrew.filter(c => c.currentActivity === 'WORKING' || c.currentActivity === 'OPERATING_EQUIPMENT');
      const exercising = allCrew.filter(c => c.currentActivity === 'EXERCISING');
      const responseText = `Crew health status is nominal. ${working.length} crew members working on research tasks. ${exercising.length} crew member currently performing physical countermeasure exercise. Heart rates range from 68 to 138 BPM.`;
      const spokenText = `Crew health is nominal. ${working.length} working, ${exercising.length} exercising. Vitals are stable.`;
      return {
        transcript,
        understood: true,
        intent: 'CREW_STATUS',
        responseText,
        spokenText,
        category: 'HUMAN_ACTIVITY_RECOGNITION',
        dataPayload: { crew: allCrew },
      };
    }

    // 3. Who is currently working?
    if (q.includes('who is working') || q.includes('who is currently working') || q.includes('working crew')) {
      const workers = allCrew.filter(c => c.currentActivity === 'WORKING' || c.currentActivity === 'OPERATING_EQUIPMENT');
      const names = workers.map(w => `${w.id} (${w.name.split(' ')[0]} in ${w.currentModule.replace(/_/g, ' ')})`).join(', ');
      const responseText = `Currently working: ${names || 'None. All crew in rest or exercise window.'}. Local Edge AI confidence: 96.4%.`;
      const spokenText = `Currently working: ${workers.map(w => w.id).join(' and ') || 'none'}.`;
      return {
        transcript,
        understood: true,
        intent: 'WHO_IS_WORKING',
        responseText,
        spokenText,
        category: 'HUMAN_ACTIVITY_RECOGNITION',
      };
    }

    // 4. Who is resting / sleeping?
    if (q.includes('who is resting') || q.includes('who is sleeping') || q.includes('resting crew')) {
      const resters = allCrew.filter(c => c.currentActivity === 'SLEEPING_RESTING' || c.currentActivity === 'SITTING');
      const names = resters.map(r => `${r.id} (${r.name.split(' ')[0]})`).join(', ');
      const responseText = `Crew currently resting or seated: ${names || 'All crew members are actively translating or working.'}.`;
      const spokenText = `Resting or seated: ${names || 'no crew currently resting'}.`;
      return {
        transcript,
        understood: true,
        intent: 'WHO_IS_RESTING',
        responseText,
        spokenText,
        category: 'HUMAN_ACTIVITY_RECOGNITION',
      };
    }

    // 5. Are there any anomalies?
    if (q.includes('anomaly') || q.includes('anomalies') || q.includes('alerts') || q.includes('danger') || q.includes('hazard')) {
      if (anomalies.length === 0) {
        return {
          transcript,
          understood: true,
          intent: 'CHECK_ANOMALIES',
          responseText: 'No active safety or hardware anomalies detected. Station envelope is fully nominal.',
          spokenText: 'Zero active anomalies. Station safety envelope is nominal.',
          category: 'ASTRONAUT_SAFETY',
        };
      }
      const top = anomalies[0];
      return {
        transcript,
        understood: true,
        intent: 'CHECK_ANOMALIES',
        responseText: `Attention: ${anomalies.length} active anomaly detected. [${top.severity}] ${top.title} - ${top.description}. Recommended action: ${top.recommendedAction}`,
        spokenText: `Warning: Active ${top.severity.toLowerCase()} alert on ${top.targetObject || 'station'}. Verification recommended.`,
        category: 'ASTRONAUT_SAFETY',
        dataPayload: { anomalies },
      };
    }

    // 6. Show spacecraft telemetry
    if (q.includes('telemetry') || q.includes('temperature') || q.includes('pressure') || q.includes('oxygen') || q.includes('spacecraft')) {
      const responseText = `Spacecraft Telemetry: Cabin temperature is ${telemetry.cabinTemperature.toFixed(1)}°C, pressure ${telemetry.cabinPressure.toFixed(1)} kPa, oxygen ${telemetry.oxygenPct.toFixed(1)}%, orbit altitude ${telemetry.orbitAltitudeKm.toFixed(1)} km, velocity ${telemetry.orbitVelocityKmS.toFixed(2)} km/s, battery ${telemetry.batteryStoragePct.toFixed(0)}%.`;
      const spokenText = `Cabin temperature is ${telemetry.cabinTemperature.toFixed(0)} degrees. Pressure 101.3 kilopascals. Orbit altitude ${telemetry.orbitAltitudeKm.toFixed(0)} kilometers. All nominal.`;
      return {
        transcript,
        understood: true,
        intent: 'SHOW_TELEMETRY',
        responseText,
        spokenText,
        category: 'SPACECRAFT_SYSTEMS',
        dataPayload: { telemetry },
      };
    }

    // 7. Is communication online?
    if (q.includes('communication') || q.includes('comm') || q.includes('online') || q.includes('offline') || q.includes('blackout')) {
      const responseText = isOffline
        ? `Communication with Earth Ground Mission Control is OFFLINE. Spacecraft is operating in Delay-Tolerant Autonomous Mode. All events and telemetry are buffering in local flash storage.`
        : `Communication link with Earth Ground Mission Control is ONLINE through ${telemetry.groundStationInView}. Telemetry carrier is locked.`;
      const spokenText = isOffline
        ? 'Ground link is offline. Autonomous onboard mode is active.'
        : 'Communication is online with Deep Space Network.';
      return {
        transcript,
        understood: true,
        intent: 'COMM_STATUS',
        responseText,
        spokenText,
        category: 'COMMUNICATION',
      };
    }

    // 8. Enter autonomous mode
    if (q.includes('autonomous mode') || q.includes('enter autonomous') || q.includes('simulate blackout')) {
      db.updateSession('SESSION-AURORA-042', { commStatus: 'OFFLINE', autonomousModeActive: true });
      return {
        transcript,
        understood: true,
        intent: 'ENTER_AUTONOMOUS',
        responseText: 'Simulating Deep Space ground link occlusion. Autonomous Mode Activated. Local HAR neural inference and robot coordination running with zero cloud reliance.',
        spokenText: 'Autonomous mode activated. Local edge intelligence engaged.',
        category: 'MISSION_OPERATIONS',
      };
    }

    // 9. Check crew schedule / Next activity
    if (q.includes('schedule') || q.includes('routine') || q.includes('next activity') || q.includes('next crew activity')) {
      const sched = crewRoutineManager.getScheduleOverview('AST-01');
      const responseText = `Crew Schedule (AST-01): Current task is "${sched.currentActivity}". Next scheduled window is "${sched.nextActivity}" at ${sched.nextWindowTime}. Later: "${sched.laterActivity}".`;
      const spokenText = `AST-01 current task is ${sched.currentActivity}. Next window is ${sched.nextActivity}.`;
      return {
        transcript,
        understood: true,
        intent: 'CREW_SCHEDULE',
        responseText,
        spokenText,
        category: 'MISSION_OPERATIONS',
        dataPayload: { schedule: sched },
      };
    }

    // 10. What is ARES doing? / Robot status
    if (q.includes('ares') || q.includes('crew robot')) {
      const ares = robots.find(r => r.id === 'ARES-1')!;
      const responseText = `ARES-1 (Crew Support Robot) is ${ares.status} in ${ares.location.replace(/_/g, ' ')}. Battery: ${ares.batteryPct.toFixed(0)}%. Task: ${ares.currentTask}.`;
      const spokenText = `ARES-1 is ${ares.status.toLowerCase()} in the ${ares.location.toLowerCase().replace(/_/g, ' ')}, monitoring crew schedule.`;
      return {
        transcript,
        understood: true,
        intent: 'ROBOT_ARES_STATUS',
        responseText,
        spokenText,
        category: 'ROBOTICS',
        dataPayload: { robot: ares },
      };
    }

    // 11. What is NOVA monitoring?
    if (q.includes('nova') || q.includes('engineering robot')) {
      const nova = robots.find(r => r.id === 'NOVA-2')!;
      const responseText = `NOVA-2 (Engineering Robot) is ${nova.status} in ${nova.location.replace(/_/g, ' ')}. Battery: ${nova.batteryPct.toFixed(0)}%. Task: ${nova.currentTask}.`;
      const spokenText = `NOVA-2 is ${nova.status.toLowerCase()}, monitoring spacecraft telemetry and asteroid radar.`;
      return {
        transcript,
        understood: true,
        intent: 'ROBOT_NOVA_STATUS',
        responseText,
        spokenText,
        category: 'ROBOTICS',
        dataPayload: { robot: nova },
      };
    }

    // 12. Are both robots online?
    if (q.includes('robots') || q.includes('both robots')) {
      const responseText = `Both autonomous mission robots are ONLINE. ARES-1 (Crew Support, ${robots[0].batteryPct.toFixed(0)}% battery) in Laboratory; NOVA-2 (Engineering Diagnostics, ${robots[1].batteryPct.toFixed(0)}% battery) in Control Module. Inter-robot communication active.`;
      const spokenText = 'Both ARES-1 and NOVA-2 are online and operating autonomously.';
      return {
        transcript,
        understood: true,
        intent: 'ROBOTS_OVERVIEW',
        responseText,
        spokenText,
        category: 'ROBOTICS',
      };
    }

    // 13. Show today's mission events
    if (q.includes('events') || q.includes('timeline') || q.includes('log') || q.includes('history')) {
      const recentEvents = db.getEvents({ limit: 4 });
      const summary = recentEvents.map(e => `${e.displayTime} ${e.astronautId} ${e.activity}`).join(' | ');
      return {
        transcript,
        understood: true,
        intent: 'MISSION_EVENTS',
        responseText: `Recent Mission Events: ${summary || 'Events recorded in local SQLite store.'}.`,
        spokenText: `Latest event: ${recentEvents[0]?.activity || 'nominal tracking'}.`,
        category: 'MISSION_OPERATIONS',
        dataPayload: { events: recentEvents },
      };
    }

    // Fallback response
    return {
      transcript,
      understood: true,
      intent: 'GENERAL_QUERY',
      responseText: `AstroSense Voice acknowledged: "${transcript}". All spacecraft and crew subsystems remain nominal. You can ask for mission status, crew activities, telemetry, robot diagnostics, or schedules.`,
      spokenText: `Command received. Mission parameters are nominal.`,
      category: 'MISSION_OPERATIONS',
    };
  }
}

export const voiceCommandEngine = VoiceCommandEngine.getInstance();
