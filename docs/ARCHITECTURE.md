# ASTROSENSE System Architecture & Technical Specification

> **AI-Powered Onboard Human Activity Recognition & Autonomous Crew Monitoring System**  
> *Zero-Cloud • Delay-Tolerant • Edge AI • Offline-First Space Mission Architecture*

---

## 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph Spacecraft["🛰️ Spacecraft Onboard Habitat (Edge Node)"]
        subgraph Sensors["Optical & Telemetry Inputs"]
            CAM1["CAM-01 (Lab)"]
            CAM2["CAM-02 (Quarters)"]
            CAM3["CAM-03 (Workstation)"]
            CAM4["CAM-04 (Exercise)"]
            ECLSS["ECLSS & Telemetry Bus"]
        end

        subgraph EdgeAI["Local Inference & Reasoning Engine"]
            HAR["12-Class HAR Pose Classifier (ST-GCN / ConvLSTM)"]
            Anomaly["Heuristic Anomaly Detector (Fall / Inactivity)"]
            VoiceEngine["Local NLP Voice Engine (Web Speech + Offline Parser)"]
            SpaceAI["Local Space Knowledge Engine (30+ Verified Topics)"]
        end

        subgraph Robots["Autonomous Robotic Assistants"]
            ARES["ARES-1 (Crew Support Robot)"]
            NOVA["NOVA-2 (Engineering Robot)"]
            InterComm["Robot-to-Robot Mesh Bus"]
            ARES <--> InterComm <--> NOVA
        end

        subgraph Routine["Circadian Routine Engine"]
            Scheduler["4-Crew Routine Manager"]
            Announcements["Acoustic Voice Broadcaster"]
        end

        subgraph Storage["Resilient Onboard Storage"]
            SQLite["ACID Local Event Vault (SQLite / WAL)"]
            SyncQueue["Delay-Tolerant Offline Queue"]
        end

        subgraph UI["Onboard Human-Machine Interfaces"]
            Dash["Onboard Dashboard"]
            Monitor["Mission Monitor & Video Matrix"]
            VoiceUI["Astrosense Voice Assistant"]
            RobotUI["Robot Control Center"]
            RoutineUI["Crew Routine Timetable"]
        end
    end

    subgraph Ground["🌍 Earth Mission Control (Ground Station)"]
        DSN["Deep Space Network (DSN Madrid / Goldstone / Canberra)"]
        GroundControl["Ground Mission Control Dashboard"]
        AuditDB["Earth Historical Mission Database"]
    end

    Sensors --> EdgeAI
    EdgeAI --> Anomaly
    EdgeAI --> Dash
    EdgeAI --> Monitor
    Anomaly --> SQLite
    Anomaly --> ARES
    Anomaly --> NOVA
    ARES --> Scheduler
    Scheduler --> Announcements
    EdgeAI --> SQLite
    Robots --> SQLite
    SQLite --> SyncQueue

    SyncQueue -->|Communication Online / Telemetry Downlink| DSN
    SyncQueue -.->|Communication Blackout (Stored in Flash)| SQLite
    DSN --> GroundControl --> AuditDB
```

---

## 2. Component Pipelines

### 2.1 Optical & Human Activity Recognition Pipeline
```mermaid
sequenceDiagram
    participant Astronaut as 👨‍🚀 Astronaut Motion
    participant Cam as 🎥 Video Stream (CAM-01..04)
    participant Pose as 🦴 Skeleton Extractor (17 Joints)
    participant HAR as 🧠 12-Class HAR Classifier
    participant Anomaly as 🚨 Safety Anomaly Detector
    participant Vault as 💾 Local Event Vault
    participant Robot as 🤖 ARES-1 & NOVA-2

    Astronaut->>Cam: Motion in habitat module
    Cam->>Pose: 30 FPS spatial coordinates
    Pose->>HAR: Sliding 30-frame temporal tensor
    HAR->>HAR: Quantized inference (24ms latency)
    HAR->>Anomaly: Predicted activity + confidence %
    alt Kinetic Fall or Prolonged Inactivity
        Anomaly->>Vault: Store Critical Anomaly Event (ACID)
        Anomaly->>Robot: Dispatch ARES-1 Wellness Check & NOVA-2 Telemetry Corroboration
        Anomaly->>Cam: Overlay Hazard Warning Banners
    else Nominal Routine Motion
        HAR->>Vault: Commit routine activity transition
    end
```

### 2.2 Communication Blackout & Delay-Tolerant Re-Synchronization
```mermaid
sequenceDiagram
    participant Ground as 🌍 Ground Control
    participant Spacecraft as 🛰️ Spacecraft Bus
    participant Queue as 📦 Delay-Tolerant Queue
    participant DB as 💾 Local Event Vault

    Note over Ground,Spacecraft: 📡 Nominal State (Ground Link ONLINE)
    Spacecraft->>Ground: Real-time telemetry streaming (1Hz)

    Note over Ground,Spacecraft: 🌑 Orbital Occlusion / Comm Blackout (OFFLINE)
    Ground--xSpacecraft: RF Link Severed (Zero Cloud Connectivity)
    Spacecraft->>Spacecraft: Engage Autonomous Onboard Mode
    Spacecraft->>DB: Buffer all classifications, robot events & anomalies
    DB->>Queue: Enqueue unsynced packets (sync_status = 'PENDING')

    Note over Ground,Spacecraft: 🛰️ Re-Acquisition & Carrier Lock (ONLINE)
    Spacecraft->>Ground: Comm Restored — Handshake
    Queue->>Ground: Burst-transmit batch bundle (0% → 25% → 50% → 75% → 100%)
    Ground->>DB: Acknowledge receipts (sync_status = 'SYNCED')
    Note over Ground,Spacecraft: Earth Database 100% Reconciled with Zero Data Loss
```

---

## 3. Technology Stack

| Tier | Component | Technology | Rationale |
| :--- | :--- | :--- | :--- |
| **Frontend** | UI Framework | React 18 + TypeScript + Vite | Blazing fast rendering, deterministic types |
| **Styling** | Aerospace Theme | Tailwind CSS + Vanilla CSS Tokens | Dark mode aerospace aesthetic, cyan/indigo accents |
| **Icons** | Visual Language | Lucide Icons | Clean, standardized vector icons |
| **Audio** | Sound Synthesis | Web Audio API + Speech Synthesis | Zero external audio asset dependencies |
| **Backend** | API Server | Node.js + Express + TypeScript | Lightweight edge node runtime |
| **Persistence** | Database Engine | SQLite / JSON ACID Vault | Embedded, zero-configuration local persistence |
| **Speech** | Voice Engine | Web Speech API + Local NLP Matcher | 100% offline speech recognition & verbal playback |
| **Data Provenance**| Simulation Engine | Local Physics & Telemetry Simulator | Clearly labeled synthetic data generator |

---

## 4. Hardware Sizing & Flight Constraints

- **Processor**: ARM64 / x86 embedded SoC (e.g., NVIDIA Jetson Orin Nano, Raspberry Pi CM4, Space-grade RAD5545).
- **Power Envelope**: < 15 Watts average draw.
- **Memory Footprint**: < 256 MB RAM for server runtime, < 80 MB for web client.
- **Storage Requirement**: < 100 MB for local software stack and 10,000+ cached mission events.
- **Network Dependency**: **0% (Zero-Cloud)**. Operates indefinitely without internet access.
