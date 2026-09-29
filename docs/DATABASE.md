# ASTROSENSE — Hybrid Database Architecture & Connection Guide

ASTROSENSE uses an **Aerospace-Grade Delay-Tolerant Hybrid Database Architecture** designed for deep-space human activity recognition, resilient offline edge execution, and seamless ground synchronization.

---

## 1. Hybrid Architecture Overview

In deep space exploration and orbital operations, spacecraft experience frequent communication blackouts, signal delays, and planetary occultations. A pure cloud architecture risks critical astronaut safety. ASTROSENSE solves this through a two-tier hybrid database topology:

```
                  🛰️ ONBOARD SPACECRAFT EDGE NODE
  ┌──────────────────────────────────────────────────────────────┐
  │  Sensors / Cameras / Bio-Telemetry                            │
  │                      ↓                                       │
  │  Edge AI / HAR Inference Engine (Zero-Cloud)                 │
  │                      ↓                                       │
  │  SQLite Local Database (ACID / Microsecond Persistence)      │
  │                      ↓                                       │
  │  Delay-Tolerant Offline Sync Queue (Pending State)           │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                 RF Downlink Restored (Auto-Trigger)
                                 │
  ┌──────────────────────────────▼───────────────────────────────┐
  │  Automatic Delay-Tolerant Sync Engine                        │
  │  (Idempotent Batch Upsert / Duplicate Protection)            │
  └──────────────────────────────┬───────────────────────────────┘
                                 │
                  🌍 EARTH GROUND MISSION CONTROL
  ┌──────────────────────────────▼───────────────────────────────┐
  │  PostgreSQL Centralized Ground Database                      │
  │  (Supabase / Neon / Railway / Render / RDS / Custom)         │
  │                      ↓                                       │
  │  Ground Mission Control Analytics & Longitudinal Dashboards   │
  └──────────────────────────────────────────────────────────────┘
```

---

## 2. Onboard Database: SQLite

### Role & Resilience
* **Location:** Onboard local filesystem (`data/astrosense_local.sqlite`).
* **Zero Configuration:** Initialized automatically when the ASTROSENSE server starts. No developer or astronaut setup required.
* **100% Autonomous:** Functions with microsecond read/write latencies even during complete planetary communication blackout.
* **ACID Compliant:** Ensures atomic local persistence of all HAR activity events, kinematic anomalies, and robotic support dispatches.

### Onboard SQLite Tables
1. `missions` — Spacecraft mission sessions and metadata.
2. `astronauts` — Biometric parameters, real-time vitals, and activity profiles.
3. `activity_events` — HAR classification stream with confidence scores.
4. `anomaly_events` — Behavioral, safety, and kinetic anomaly alerts.
5. `telemetry` — Cabin environmental and orbital telemetry snapshots.
6. `communication_events` — Signal degradation and loss-of-signal logs.
7. `robot_events` — Autonomous companion actions (ARES-1 / NOVA-2).
8. `sync_history` — Synchronization audit trail and transmission metrics.
9. `crew_routine_events` — Daily mission schedules and flight plans.
10. `asteroid_events` — Deep space asteroid trajectory and hazard monitoring.
11. `mission_sessions` — Real-time telemetry session state.
12. `sync_queue` — Delay-tolerant pending transaction queue.

---

## 3. Ground Database: PostgreSQL

### Role & Capabilities
* **Location:** Cloud or enterprise ground servers (Supabase, Neon, Railway, Render, AWS RDS, GCP Cloud SQL, or Custom PostgreSQL).
* **Centralization:** Aggregates multi-mission timelines, historical fleet telemetry, and scientist analytics on Earth.
* **Delay-Tolerant Ingestion:** Accepts batched, timestamped transmissions from onboard spacecraft edge nodes upon RF re-acquisition.

### Supported Providers
ASTROSENSE natively supports all standard PostgreSQL providers through standard Node.js database connections:
* **Supabase:** [https://supabase.com/docs/guides/database](https://supabase.com/docs/guides/database)
* **Neon (Serverless):** [https://neon.tech/docs/introduction](https://neon.tech/docs/introduction)
* **Railway:** [https://docs.railway.com/databases/postgresql](https://docs.railway.com/databases/postgresql)
* **Render PostgreSQL:** [https://render.com/docs/databases](https://render.com/docs/databases)
* **Custom / Enterprise PostgreSQL:** Any standard `postgresql://` URI (v12+).

---

## 4. Automatic Database Setup Wizard (`/database-setup`)

ASTROSENSE eliminates manual database provisioning, manual SQL scripts, and manual migrations through a guided 6-step automated setup wizard:

* **Step 1: Local SQLite** — Automatically checked and marked ready on first boot.
* **Step 2: Ground PostgreSQL Selection** — Choose provider, view official setup guides, and provide connection URI through a secure interface.
* **Step 3: Connection Test** — Performs an automated live latency ping and server version verification.
* **Step 4: Automatic Schema Initialization** — Automatically creates all 10 tables, safe indexes (`CREATE INDEX IF NOT EXISTS`), and seeds baseline mission profiles.
* **Step 5: Synchronization Verification** — Automatically runs a test sync from SQLite to PostgreSQL and verifies zero data loss.
* **Step 6: Complete** — Flags system as `DATABASE READY` and directs the user to Mission Control.

---

## 5. Zero Hardcoded Credentials & Security

* **Never Hardcoded:** Passwords, API keys, and connection strings are NEVER committed to source code or git.
* **Masked in Frontend:** Sensitive database URLs are masked on the backend (`postgresql://user:••••••••@host:5432/db`) and never exposed in client JavaScript or browser logs.
* **Safe `.env` Automation:** Connection parameters provided via the wizard are safely written to `.env` (which is in `.gitignore`).
* **Safe Authentication:** ASTROSENSE never asks for or stores third-party cloud provider passwords. Authentication is handled directly on the provider's official portal.

---

## 6. Environment Configuration

The application uses the following environment variables (defined in `.env.example`):

```env
# Ground PostgreSQL Connection String (Managed automatically by Setup Wizard)
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE

# SSL Connection Policy (Default: true for cloud providers)
DATABASE_SSL=true

# Delay-Tolerant Auto-Synchronization
DATABASE_AUTO_SYNC=true

# Background Sync Interval (Milliseconds)
DATABASE_SYNC_INTERVAL_MS=10000

# Server Port
PORT=3001
NODE_ENV=development
```

---

## 7. Automatic Synchronization Engine

The **SyncEngine** provides resilient delay-tolerant synchronization between SQLite and PostgreSQL:

```
[Edge Event Created]
         ↓
  SQLite: sync_status = 'PENDING'
         ↓
  [Communication Link Check]
   ├─ If OFFLINE: Queue held securely in SQLite. Autonomous Mode continues.
   └─ If ONLINE & PostgreSQL Connected:
         ↓
      Batch Transmission to PostgreSQL
      (Idempotent: ON CONFLICT (id) DO UPDATE / DO NOTHING)
         ↓
      PostgreSQL Write Verified
         ↓
      SQLite: sync_status = 'SYNCED' (synced_at timestamp recorded)
```

### Idempotency & Duplicate Protection
All synchronizations use primary-key upserts (`ON CONFLICT (id) DO UPDATE ...`). Retrying transmissions or recovering from network drops never creates duplicate events or corrupts mission history.

---

## 8. Database Health & Management APIs

ASTROSENSE exposes standard REST endpoints for database health, monitoring, and administration:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/database/status` | Comprehensive status for SQLite, PostgreSQL, SyncEngine, and masked config |
| `GET` | `/api/database/health` | Fast health check and latency ping for local and ground databases |
| `GET` | `/api/database/stats` | Record counts across all 10 tables in local and ground databases |
| `GET` | `/api/database/sync-history` | Recent batch synchronization logs |
| `GET` | `/api/database/providers` | Official provider metadata, guides, and documentation links |
| `POST` | `/api/database/test-connection` | Tests a candidate connection string without saving |
| `POST` | `/api/database/config` | Saves connection string, auto-creates schema, and triggers initial sync |
| `POST` | `/api/database/sync` | Manually triggers delay-tolerant synchronization |
| `POST` | `/api/database/disconnect` | Gracefully disconnects PostgreSQL client pool |
| `POST` | `/api/database/reset` | Clears ground database configuration without deleting remote databases |

---

## 9. Failure Handling & Recovery

* **PostgreSQL Unavailable:** If the ground database is unreachable or offline, ASTROSENSE does NOT crash. The UI displays `LOCAL SQLITE: ONLINE`, `GROUND POSTGRESQL: OFFLINE`, and `AUTONOMOUS MODE: ACTIVE`.
* **Automatic Reconnect:** Background sync engine automatically checks and restores ground link when the service becomes reachable.
* **Zero Telemetry Loss:** All activities and anomalies generated during outages are queued locally in SQLite and transmitted automatically upon restoration.

---

## 10. Developer & Admin Settings

From **Subsystem Settings (`/settings`)** or **Mission Monitor (`/mission-monitor`)**:
* **Test Connection:** Verify active database latency.
* **Reconnect:** Re-establish ground connection pool.
* **Disconnect:** Switch explicitly to 100% Autonomous Local SQLite mode.
* **Reset Database Configuration:** Clear saved connection strings safely without destructive remote table drops.
