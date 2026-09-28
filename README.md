# ASTROSENSE
### AI-Powered Onboard Human Activity Recognition & Autonomous Crew Monitoring System

[![License: MIT](https://img.shields.io/badge/License-MIT-cyan.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933.svg?logo=node.js)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6.svg?logo=typescript)](https://www.typescriptlang.org)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF.svg?logo=vite)](https://vitejs.dev)
[![Architecture: Zero--Cloud](https://img.shields.io/badge/Architecture-Zero--Cloud%20Offline--First-00f0ff.svg)](#offline-first-architecture)
[![Status: Hackathon--Ready](https://img.shields.io/badge/Status-Hackathon--Ready-emerald.svg)](#demo-workflow)

---

## 1. Project Overview

**ASTROSENSE** is a full-stack, software-only prototype of an **onboard edge artificial intelligence system** engineered for human spaceflight and orbital habitats. The system performs real-time **Human Activity Recognition (HAR)**, automated crew circadian routine management, autonomous multi-robot mission coordination, acoustic voice interaction, deep space asteroid tracking, and local anomaly detection.

Designed specifically for deep space missions (such as Lunar Gateway, Mars transit, or orbital space habitats) where communication with Earth suffers from high latency, bandwidth constraints, and orbital blackout periods, ASTROSENSE operates **100% autonomously without external cloud dependencies or internet access**.

```
HUMAN ACTIVITY (12-Class HAR)
        ↓
ONBOARD EDGE AI INFERENCE (24ms Latency)
        ↓
MISSION MONITOR & MULTI-CAM MATRIX
        ↓
CREW ROUTINE & CIRCADIAN MANAGER
        ↓
AUTONOMOUS MISSION ROBOTS (ARES-1 + NOVA-2)
        ↓
ANOMALY DETECTION & AI DECISION SUPPORT
        ↓
LOCAL RESILIENT ACID EVENT VAULT (SQLite)
        ↓
COMMUNICATION LOSS (BLACKOUT) → AUTONOMOUS MODE
        ↓
COMMUNICATION RESTORED → DELAY-TOLERANT SYNCHRONIZATION
        ↓
EARTH GROUND MISSION CONTROL
```

---

## 2. Problem Statement

Long-duration human spaceflight and microgravity habitat operations introduce severe challenges:
1. **Communication Latency & Blackouts**: Orbital geometry, planetary occlusion, and solar conjunctions lead to extended ground communication blackouts. Systems dependent on cloud servers (e.g., commercial LLMs or cloud vision APIs) fail immediately in deep space.
2. **Crew Health & Cognitive Fatigue**: Astronauts face microgravity deconditioning, circadian disruption, high workloads, and isolation. Autonomous onboard scheduling and routine assistance are vital for mission success.
3. **Kinetic & Habitat Anomalies**: Sudden microgravity falls, abnormal impacts, or equipment faults require immediate in-cabin acoustic and robotic responses without waiting for Earth intervention.
4. **Data Continuity**: Mission telemetry and behavioral logs generated during blackout must be stored safely in resilient local non-volatile storage and synchronized without data loss upon re-establishing contact.

---

## 3. Proposed Solution

ASTROSENSE resolves these challenges through an **edge-native, delay-tolerant software architecture**:
- **Onboard Edge Vision HAR**: Classifies 12 microgravity activity categories in real-time from 4 habitat camera feeds.
- **Offline Intelligence Engines**: Local deterministic voice NLP engine and embedded 30+ topic space knowledge base requiring zero cloud connectivity.
- **Autonomous Mission Robotics**: Two simulated software robots (**ARES-1** for crew wellness & routine reminders, and **NOVA-2** for 1Hz engineering telemetry & asteroid radar diagnostics).
- **Delay-Tolerant Re-Synchronization**: Implements CCSDS bundle store-and-forward protocols to synchronize stored mission events back to Earth Ground Mission Control when ground links are restored.

---

## 4. Key Features

- 🧠 **12-Class Biomechanical HAR**: Fine-motor, locomotion, exercise, and safety states.
- 🖥️ **Unified Mission Monitor**: Aerospace dashboard combining multi-camera feeds, spacecraft telemetry, crew vitals, robots, and live events.
- 🎥 **Live Multi-Camera Matrix**: 4 simulated habitat channels (`CAM-01` to `CAM-04`) with interactive canvas skeletal tracking, webcam mode, and video upload.
- 🎙️ **Astrosense Voice Assistant**: Zero-cloud speech recognition (Web Speech API) and text fallback supporting 14+ mission queries.
- 👨‍🚀 **Crew Routine & Circadian Manager**: Daily timetable tracking (Work, Meal, Exercise, Rest, Sleep) with acoustic announcements.
- 🤖 **Autonomous Mission Robots**:
  - **ARES-1**: Crew support, wellness reminders, and safety dispatch.
  - **NOVA-2**: Engineering telemetry analysis, ECLSS monitoring, and asteroid diagnostics.
  - **Inter-Robot Communication Bus**: Real-time mesh dialogue between robots.
- ☄️ **Deep Space Asteroid Monitor**: Real-time radar matrix tracking 4 near-Earth objects with delta-V anomaly detection.
- 🚨 **Real-Time Anomaly Center**: Kinetic fall and inactivity detection with AI decision-support recommendations.
- 📡 **Communication Blackout Simulator**: Interactive toggle between `ONLINE` and `OFFLINE` ground link states.
- 💾 **Local ACID Event Vault**: Embedded resilient storage buffering events with microsecond UTC timestamps.
- 🔄 **Delay-Tolerant Synchronization**: Multi-stage burst downlinking (0% → 100%) reconciling Earth databases.
- 🌍 **Ground Mission Control Dashboard**: Dual-perspective view showing what Earth sees during blackout vs. nominal periods.
- 📊 **Mission Audit & Report Export**: Instant CSV and JSON downloads of mission timelines.
- 🎬 **Three Interactive Demo Runners**: Original 13-step Judge Demo, 14-step Extended Space Demo, and 16-step Advanced Monitoring Demo.

---

## 5. System Architecture

```
+-----------------------------------------------------------------------------------+
|                        ASTROSENSE ONBOARD EDGE NODE                               |
|                                                                                   |
|   +---------------------+   +-----------------------+   +---------------------+   |
|   |  Multi-Cam Vision   |   | Astrosense Voice NLP  |   | 1Hz Telemetry Bus   |   |
|   | (CAM-01 to CAM-04)  |   | (Offline Web Speech)  |   | (ECLSS & Avionics)  |   |
|   +----------+----------+   +-----------+-----------+   +----------+----------+   |
|              |                          |                          |              |
|              v                          v                          v              |
|   +---------------------------------------------------------------------------+   |
|   |               Onboard Edge AI Inference & Reasoning Engine                |   |
|   |   - 12-Class HAR Pose Estimation       - Rule-Based Anomaly Detector      |   |
|   |   - ARES-1 (Crew Support Robot)        - NOVA-2 (Engineering Robot)       |   |
|   |   - Circadian Schedule Manager         - Inter-Robot Mesh Bus             |   |
|   +-------------------------------------+-------------------------------------+   |
|                                         |                                         |
|                                         v                                         |
|   +---------------------------------------------------------------------------+   |
|   |                 Local ACID Event Vault (SQLite / JSON WAL)                |   |
|   |       - Unsynced Event Queue        - Microsecond UTC Timestamps          |   |
|   +-------------------------------------+-------------------------------------+   |
+-----------------------------------------|-----------------------------------------+
                                          |
                        COMMUNICATION LINK STATUS?
                                   /      \
                        ONLINE    /        \   OFFLINE (BLACKOUT)
                                 /          \
                                v            v
        +----------------------------+   +----------------------------+
        | Delay-Tolerant Sync Engine |   | Autonomous Onboard Mode    |
        | (CCSDS Store-and-Forward)  |   | - In-Cabin Audio Alarms    |
        | - Batch Downlink: 0%->100% |   | - Autonomous Robot Patrols |
        +--------------+-------------+   | - Local Flash Storage      |
                       |                 +----------------------------+
                       v
        +----------------------------+
        | Earth Ground Control Station|
        | - Reconciled Mission Logs  |
        | - Telemetry Timeline Audit |
        +----------------------------+
```

---

## 6. Technology Stack

### Frontend Application
- **Framework**: React 18 with TypeScript
- **Bundler & Tooling**: Vite 6.0
- **Styling**: Vanilla CSS + Tailwind CSS tokens (aerospace dark mode)
- **Icons**: Lucide Icons
- **Audio & Speech**: Web Audio API + Web Speech API (`SpeechRecognition` & `SpeechSynthesis`)

### Backend Edge Node Server
- **Runtime**: Node.js (v18+) with Express and TypeScript
- **Execution & Hot-Reload**: `tsx`
- **Persistence**: Embedded local database with ACID properties and Write-Ahead Logging
- **Networking**: REST API with CORS isolation

---

## 7. AI & Human Activity Recognition Architecture

The HAR inference engine classifies crew motion into 12 discrete operational and safety classes:

| Class ID | Activity Name | Habitat Module | Description |
| :--- | :--- | :--- | :--- |
| `01` | `WALKING` | Laboratory / Quarters | Routine transit between station modules |
| `02` | `STANDING` | Workstation / Control | Stationary posture during system inspection |
| `03` | `SITTING` | Workstation / Habitat | Seated computing or communications |
| `04` | `WORKING` | Laboratory | Fine-motor biological assay manipulation |
| `05` | `OPERATING_EQUIPMENT`| Control Module | Subsystem switch and avionics console actuation |
| `06` | `EXERCISING` | Exercise Area | Cardiovascular and ARED resistive countermeasure |
| `07` | `EATING` | Crew Quarters | Nutrition and hydration intake |
| `08` | `SLEEPING_RESTING` | Crew Quarters | Circadian sleep cycle or restorative rest |
| `09` | `MAINTENANCE` | Workstation | Habitat infrastructure repair |
| `10` | `STATIONARY_IDLE` | Habitat | Inactive resting state |
| `11` | `FALL_ABNORMAL_MOVEMENT` | Any Module | **CRITICAL**: Rapid acceleration or loss of vertical posture |
| `12` | `LONG_INACTIVITY` | Any Module | **WARNING**: Extended lack of movement beyond safe threshold |

---

## 8. Offline-First Architecture

ASTROSENSE is built on three offline principles:
1. **Zero External Endpoints**: Operates in fully air-gapped environments without calling cloud APIs.
2. **Local Flash Persistence**: All state transitions and anomaly detections are committed to local disk storage.
3. **Graceful Degradation**: If browser hardware features (such as microphone or webcam) are unavailable, fallback modes (Text Command Mode and Canvas Simulation) activate automatically.

---

## 9. Communication Blackout & Autonomous Mode

When orbital geometry breaks the radio link with Earth:
- Earth Ground Control displays `COMMUNICATION UNAVAILABLE`.
- The spacecraft engages **Autonomous Robot Mode Active**.
- Classification, vitals monitoring, circadian reminders, and robot telemetry diagnostics continue locally.
- Events are flagged with `sync_status = 'PENDING'`.

---

## 10. Local Event Storage

Every mission event is stored with structured metadata:
```json
{
  "id": "EVT-1727538240000",
  "timestamp": "2026-09-28T15:44:00.000Z",
  "displayTime": "15:44:00",
  "astronautId": "AST-01",
  "activity": "FALL_ABNORMAL_MOVEMENT",
  "confidence": 96.3,
  "durationSeconds": 15,
  "severity": "CRITICAL",
  "module": "EXERCISE_AREA",
  "syncStatus": "PENDING",
  "source": "ONBOARD_EDGE_AI"
}
```

---

## 11. Delay-Tolerant Synchronization

When ground communication is restored (`COMM: ONLINE`):
- The synchronization engine detects pending offline records.
- Telemetry bundles are downlinked in multi-stage batches (0% → 25% → 50% → 75% → 100%).
- Earth Ground Mission Control updates historical timelines with zero missing records.

---

## 12. AI Space Assistant

A collapsible onboard spaceflight intelligence chatbot powered by an embedded knowledge base covering:
- Spacecraft subsystems & ECLSS life support
- Microgravity physiology and countermeasure exercise
- Delay-Tolerant Networking (CCSDS protocols)
- Near-Earth object tracking and orbital mechanics
- Real-time crew, robot, and telemetry state queries

---

## 13. Mission Monitor

A dedicated aerospace command dashboard (`/mission-monitor`) featuring:
- **Top Aerospace Status Bar**: Live flight day, comm status, autonomy mode, crew count, robot status, and active alerts.
- **Quad-Camera Surveillance Matrix**: Live feeds from Laboratory, Quarters, Workstation, and Exercise Area.
- **Real-Time Telemetry Cards**: Atmospheric pressure, temperature, oxygen concentration, power bus, and orbital velocity.
- **Multi-Crew Tracking Matrix**: Live vitals and motion classification for AST-01 through AST-04.

---

## 14. Live Video Simulation

Interactive 4-channel camera feeds (`LiveVideoMonitor.tsx`, `CameraFeed.tsx`):
- **Simulated Mode**: Canvas-rendered astronaut wireframe animation with microgravity particles and bounding box.
- **Webcam Mode**: Live video from user's camera (WebRTC) when permission is granted.
- **Local Video Upload**: Support for loading external video files for verification.
- **Safety Overlays**: Activity, confidence %, and hazard warning banners (`⚠ ABNORMAL MOVEMENT DETECTED`).

---

## 15. Voice Assistant

Astrosense Voice (`VoiceAssistant.tsx`, `VoiceStatus.tsx`, `VoiceCommandEngine.ts`):
- **Speech-to-Text**: Web Speech API speech recognition.
- **Text Fallback**: Full interactive text command mode if microphone hardware is unavailable.
- **Voice Synthesis**: Verbal response audio with mute and volume controls.
- **Offline NLP Intent Parser**: Handles 14+ mission commands with zero external API calls.

---

## 16. Crew Routine Manager

Dedicated circadian management interface (`/crew-routine`):
- **4-Crew Circadian Timetables**: Work, Meal, Exercise, Rest, and Sleep time blocks.
- **Task Lifecycle**: Start, pause, complete, and add scheduled tasks.
- **Acoustic Routine Announcements**: Voice reminders dispatched by ARES-1 (e.g., *"Attention crew: Scheduled nutrition period is approaching."*).

---

## 17. ARES-1 and NOVA-2 Robots

Two simulated autonomous robotic assistants (`/robot-control`):
- **ARES-1 (Crew Support Robot)**:
  - *Personality*: Calm, helpful, crew-focused.
  - *Duties*: Crew routine reminders, wellness check-ins, acoustic announcements, voice assistance.
- **NOVA-2 (Engineering Robot)**:
  - *Personality*: Technical, analytical, telemetry-focused.
  - *Duties*: 1Hz telemetry diagnostics, power distribution monitoring, life support verification, asteroid radar corroboration.
- **Action Controls**: `START`, `PAUSE`, `RETURN`, `PATROL`, `INSPECT`, `ASSIST`, `STATUS`.
- **Robot-to-Robot Communication**: Real-time message exchange on a local mesh communication bus.

---

## 18. Asteroid Monitoring

Deep space radar pipeline (`/asteroids`):
- Synthetic observation of 4 near-Earth objects (e.g., 99942 Apophis-Sim, ASTEROID-B07).
- Trajectory delta-V anomaly simulation triggering NOVA-2 diagnostic alerts and decision-support verification protocols.

---

## 19. Anomaly Detection

Real-time heuristic and classification anomaly detection (`/anomalies`):
- **Kinetic Slip / Fall**: Dispatches immediate acoustic alarms and sends ARES-1 to assist.
- **Prolonged Inactivity**: Detects stationary periods beyond safety thresholds.
- **AI Decision Support**: Structured detection evidence, confidence score, and recommended checklist labeled **HUMAN VERIFICATION REQUIRED**.

---

## 20. Mission Control

Ground station dashboard (`/mission-control`):
- Displays the Earth ground view during nominal and blackout operations.
- Real-time delay-tolerant synchronization progress bar (0% to 100%).
- Complete chronological audit log of downlinked mission events.

---

## 21. Demo Workflow

ASTROSENSE provides three interactive demo runners:

### 1. 🚀 Original 13-Step Judge Demo
*2-minute hackathon judge evaluation demonstrating HAR, blackout, and synchronization.*
- Click **"START JUDGE DEMO"** in the top navigation header.

### 2. 🛰️ 14-Step Extended Space Demo
*3-5 minute demonstration including asteroid anomalies, AI chatbot queries, and multi-crew tracking.*
- Click **"Extended Demo"** in the top navigation header.

### 3. 🤖 16-Step Advanced Monitoring Demo
*Complete multi-subsystem walkthrough featuring Multi-Cam HAR, ARES-1 & NOVA-2 robots, Voice Assistant, Comm Blackout, and Synchronization.*
- Click **"Advanced Demo"** in the top header or on the Mission Monitor page.

---

## 22. Project Structure

```
ASTROSENSE/
├── client/                     # Frontend React + TypeScript + Vite Application
│   ├── src/
│   │   ├── components/         # Reusable UI widgets and subsystem cards
│   │   │   ├── common/         # Header, Navigation, AlertBanner
│   │   │   ├── video/          # CameraFeed, LiveVideoMonitor
│   │   │   ├── voice/          # VoiceAssistant, VoiceStatus
│   │   │   ├── robots/         # RobotCard, RobotControl, RobotCommunicationLog
│   │   │   ├── assistant/      # SpaceAssistant Chatbot
│   │   │   ├── demo/           # JudgeDemoModal, ExtendedDemoModal, AdvancedDemoModal
│   │   │   └── ...             # Telemetry, Asteroids, Crew widgets
│   │   ├── context/            # MissionContext (Global state & polling)
│   │   ├── pages/              # 16 Subsystem Pages (MissionMonitor, CrewRoutine, etc.)
│   │   ├── services/           # API Client methods
│   │   ├── types/              # Complete TypeScript interfaces
│   │   └── utils/              # Sound synthesis & formatters
│   ├── package.json
│   └── vite.config.ts
├── server/                     # Backend Node.js Express Edge AI Server
│   ├── src/
│   │   ├── ai/                 # SpaceAssistantEngine, DemoInferenceEngine
│   │   ├── anomaly/            # AnomalyDetector
│   │   ├── asteroid/           # AsteroidMonitor
│   │   ├── crew/               # CrewRoutineManager, CrewManager
│   │   ├── database/           # Local SQLite / JSON Event Vault
│   │   ├── robots/             # AresRobot, NovaRobot, RobotManager
│   │   ├── routes/             # REST API Routes (robots, routine, voice, video, etc.)
│   │   ├── services/           # SimulationService (Demo runners)
│   │   ├── sync/               # Delay-Tolerant SyncEngine
│   │   ├── telemetry/          # TelemetrySimulator (1Hz ECLSS & orbital data)
│   │   ├── video/              # VideoSimulationService
│   │   ├── voice/              # VoiceCommandEngine (Offline NLP)
│   │   ├── types/              # Server TypeScript interfaces
│   │   └── index.ts            # Server entry point (Port 3001)
│   ├── package.json
│   └── tsconfig.json
├── data/                       # Seed JSON knowledge bases & simulation data
├── docs/                       # Technical architecture & evaluation documentation
│   ├── ARCHITECTURE.md         # Detailed Mermaid architectural diagrams
│   ├── API.md                  # REST API endpoint reference
│   ├── DEPLOYMENT.md           # Local & air-gapped installation guide
│   ├── DEMO_GUIDE.md           # Step-by-step judge & demo runner guide
│   └── OFFLINE_FIRST.md        # Delay-tolerant store-and-forward spec
├── models/                     # HAR model architecture specifications
├── .env.example                # Environment configuration template
├── .gitignore                  # Git exclusion rules
├── package.json                # Root workspace orchestration
└── README.md                   # Main project documentation
```

---

## 23. Installation

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

```bash
# Clone the repository
git clone https://github.com/your-username/ASTROSENSE.git
cd ASTROSENSE

# Install all dependencies (root, server, and client)
npm run install:all
```

---

## 24. Running Locally

### Start Both Server & Client
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:3000`
- **Backend Edge Server**: `http://localhost:3001`

### Build for Production
```bash
npm run build
```

---

## 25. API Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Node health & communication status |
| `GET` | `/api/robots` | States of ARES-1 & NOVA-2 robots |
| `POST`| `/api/robots/:id/action` | Dispatch simulated robot commands |
| `GET` | `/api/routine/schedules` | 4-crew circadian timetables |
| `POST`| `/api/routine/announcements`| Trigger acoustic routine broadcast |
| `GET` | `/api/video/feeds` | 4-channel habitat camera metadata |
| `POST`| `/api/voice/command` | Process offline NLP voice query |
| `GET` | `/api/telemetry/current` | 1Hz spacecraft telemetry |
| `GET` | `/api/asteroids` | Radar tracking matrix for NEOs |
| `POST`| `/api/sync/trigger` | Delay-tolerant batch downlinking |
| `GET` | `/api/simulation/demo/status`| 13-step Judge Demo status |
| `GET` | `/api/simulation/advanced-demo/status` | 16-step Advanced Demo status |

*(See [`docs/API.md`](docs/API.md) for full parameter specifications).*

---

## 26. Testing

Verify the complete backend and frontend build:

```bash
# Compile Server TypeScript
npm --prefix server run build

# Compile Client TypeScript & Vite bundle
npm --prefix client run build
```

---

## 27. Important Limitations & Data Provenance

> **DISCLAIMER & DATA PROVENANCE NOTICE**:
> 
> 1. **Software Simulation Prototype**: ASTROSENSE is a software-only evaluation prototype. Telemetry, camera feeds, astronaut vitals, asteroid radar distances, and robot actions are **simulated software demonstrations**.
> 2. **No Real Hardware Control**: The platform does not claim direct physical control of live spaceflight hardware or satellite constellations.
> 3. **Non-Medical Advice**: Crew routine reminders, activity classifications, and vitals are simulated for workload regulation and do not constitute clinical or medical diagnosis.
> 4. **Human-in-the-Loop Principle**: All AI and robot anomaly responses are flagged with **AI DECISION SUPPORT – HUMAN VERIFICATION REQUIRED**.

---

## 28. Future Scope

- **Edge Neuromorphic Acceleration**: Porting the ST-GCN model to spiking neural network (SNN) neuromorphic edge hardware (e.g., Intel Loihi).
- **Multi-Modal Sensor Fusion**: Integrating wearable IMU, EMG, and ambient acoustic sensors with optical camera pose estimation.
- **Physical Robotics Integration**: Interfacing ROS 2 (Robot Operating System) with ARES-1 and NOVA-2 agent cores.
- **CCSDS Space Packet Compliance**: Upgrading synchronization serialization to binary CCSDS Space Packet Protocol (SPP) formats.

---

## 29. Team / Authors

Developed with pride for Space Technology innovation, Smart India Hackathon, and autonomous space exploration research.

---

## 30. License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
