# ASTROSENSE Offline-First & Delay-Tolerant Architecture

Deep space exploration environments are characterized by high orbital latency, line-of-sight occlusion, solar conjunctions, and total communication blackouts. ASTROSENSE is architected from the ground up as an **Offline-First Autonomous Edge Node**.

---

## 1. Core Architectural Pillars

### 1.1 Zero Cloud Dependency
- **Embedded Neural Inference**: 12-class HAR model runs locally on the edge processor at 24ms per frame.
- **Local Space Knowledge Base**: 30+ comprehensive aerospace reference documents stored locally on flash.
- **Local Speech & NLP Processing**: Voice queries parsed deterministically without external cloud speech APIs.

### 1.2 ACID Local Event Vault
When communication is severed:
- All human activity transitions, vitals anomalies, and robotic telemetry events are committed directly to an embedded SQLite database using Write-Ahead Logging (WAL).
- Microsecond UTC timestamps and cryptographic sequence numbers ensure tamper-proof chronological ordering.
- The `sync_status` field is flagged as `PENDING`.

### 1.3 Delay-Tolerant Synchronization (DTN)
Inspired by the **CCSDS 734.2-B-1 (Delay-Tolerant Networking Bundle Protocol)**:
- When RF ground carrier lock is re-acquired (`COMM: ONLINE`), the synchronization engine triggers an automated burst handshake.
- Offline event batches are transmitted in prioritized bundles (Critical Anomalies → Robot Logs → Routine Activities).
- Progress is reported incrementally (0% → 25% → 50% → 75% → 100%).
- Upon Earth Ground Mission Control acknowledgment, synced records transition to `sync_status = 'SYNCED'`.

```
[Spacecraft Offline Event Vault]
             ↓
[1. Carrier Lock Detection (ONLINE)]
             ↓
[2. Delta Bundle Packaging (CCSDS RFC 5050)]
             ↓
[3. Ground Handshake & Downlink (0% -> 100%)]
             ↓
[4. Earth Ground Station Timeline Reconciliation]
             ↓
[5. Local Queue Cleared (Unsynced Count = 0)]
```

---

## 2. Fault Tolerance & Safety Interlocks

- **Autonomous In-Cabin Alarms**: High-severity kinetic disruptions (such as falls) trigger local acoustic and visual habitat alerts immediately without waiting for Earth transmission.
- **Robot Autonomous Mode**: Robotic assistants continue circadian reminders, environmental monitoring, and inter-robot heartbeats locally during blackout.
- **Human Verification Required**: The system provides decision-support evidence without executing unverified automated actuation on mission-critical flight hardware.
