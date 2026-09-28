# ASTROSENSE REST API Specification

All endpoints are hosted locally on the onboard edge server (`http://localhost:3001/api`). The system is fully offline-capable with zero external internet dependencies.

---

## 1. System Health & Session Management

### `GET /api/health`
Returns onboard node operational health, active mission, communication status, and autonomy state.
- **Response:**
```json
{
  "status": "HEALTHY",
  "system": "ASTROSENSE_ONBOARD_EDGE_AI",
  "mission": "MISSION AURORA",
  "commStatus": "ONLINE",
  "autonomousMode": false,
  "timestamp": "2026-09-28T15:39:27.474Z"
}
```

### `GET /api/simulation/session`
Returns current flight day, mission elapsed time, and unsynced event queue counter.

### `POST /api/simulation/comm-status`
Sets spacecraft ground link status (`ONLINE`, `DEGRADED`, `OFFLINE`).
- **Body:** `{ "status": "OFFLINE" }`

---

## 2. Human Activity Recognition & Crew

### `GET /api/crew`
Returns real-time biometric and activity records for all 4 station astronauts (AST-01 to AST-04).

### `POST /api/crew/:id/activity`
Manually updates an astronaut's classified activity and habitat module.
- **Body:** `{ "activity": "EXERCISING", "module": "EXERCISE_AREA" }`

### `POST /api/activities/record`
Ingests a classified activity into the local event store and triggers anomaly checks.
- **Body:** `{ "activity": "FALL_ABNORMAL_MOVEMENT", "module": "EXERCISE_AREA", "confidence": 97.4 }`

### `GET /api/events`
Queries local ACID event vault with filtering options (`syncStatus`, `severity`, `limit`, `activity`).

---

## 3. Autonomous Robotic Assistants (ARES-1 & NOVA-2)

### `GET /api/robots`
Returns current state, battery level, location, task, and subsystem health for both robots.

### `GET /api/robots/logs?limit=30`
Returns inter-robot dialogue messages from the local mesh communication bus.

### `POST /api/robots/:id/action`
Dispatches a simulated autonomous robot command.
- **Body:** `{ "action": "PATROL", "module": "LABORATORY" }`
- **Supported Actions:** `START`, `PAUSE`, `RETURN`, `PATROL`, `INSPECT`, `ASSIST`, `STATUS`

---

## 4. Crew Routine & Circadian Schedules

### `GET /api/routine/schedules`
Returns scheduled daily timetable blocks (Work, Meal, Exercise, Rest, Sleep) for all 4 crew members.

### `POST /api/routine/tasks`
Adds a new schedule block to an astronaut's daily timetable.

### `PATCH /api/routine/tasks/:id/status`
Updates task status (`PENDING`, `ACTIVE`, `COMPLETED`, `PAUSED`).

### `GET /api/routine/announcements`
Returns recent routine announcements dispatched by ARES-1.

### `POST /api/routine/announcements`
Dispatches a simulated acoustic routine broadcast.
- **Body:** `{ "text": "Attention crew. Scheduled meal period is approaching.", "category": "MEAL" }`

---

## 5. Live Video Feeds

### `GET /api/video/feeds`
Returns real-time metadata for all 4 simulated habitat camera channels (CAM-01 to CAM-04).

### `POST /api/video/feeds/:id/source`
Switches stream source between `SIMULATED`, `WEBCAM`, and `LOCAL_VIDEO`.
- **Body:** `{ "source": "WEBCAM" }`

---

## 6. Voice Mission Assistant

### `GET /api/voice/commands`
Returns catalog of supported offline NLP voice commands.

### `POST /api/voice/command`
Processes a voice transcript or text query using local deterministic intent parsing.
- **Body:** `{ "command": "What is the mission status?" }`
- **Response:**
```json
{
  "success": true,
  "data": {
    "transcript": "What is the mission status?",
    "understood": true,
    "intent": "MISSION_STATUS",
    "responseText": "Mission Aurora is on Day 042. Communication link is ONLINE...",
    "spokenText": "Mission Aurora is on Day 042...",
    "category": "MISSION_OPERATIONS"
  }
}
```

---

## 7. Deep Space Asteroids & Telemetry

### `GET /api/telemetry/current`
Returns 1Hz spacecraft telemetry (Cabin Temp, Pressure, O2%, CO2 ppm, Altitude, Velocity, Solar Power, Battery storage).

### `GET /api/asteroids`
Returns radar tracking matrix for near-Earth objects (e.g., 99942 Apophis-Sim, ASTEROID-B07).

### `POST /api/asteroids/trigger-anomaly`
Simulates a trajectory delta-V anomaly on a tracked asteroid.

---

## 8. Delay-Tolerant Re-Synchronization

### `GET /api/sync/status`
Returns synchronization progress (0% to 100%), unsynced count, and state.

### `POST /api/sync/trigger`
Triggers multi-stage batch transmission to Earth Ground Mission Control when communication is online.
