# ASTROSENSE REST API Specification

## Base URL
`http://localhost:3001/api`

---

## 1. Astronaut Endpoints
- `GET /api/astronaut?id=AST-01`
  - Returns current astronaut telemetry profile, status, vitals, and stats.
- `PUT /api/astronaut`
  - Updates astronaut telemetry state.
- `POST /api/astronaut/reset`
  - Resets all telemetry to baseline flight parameters.

---

## 2. Activity & Inference Endpoints
- `GET /api/activities`
  - Returns the catalog of 12 supported HAR classes and model metadata.
- `POST /api/activities/predict`
  - Runs inference on an incoming frame or synthetic telemetry input.
- `POST /api/activities/record`
  - Logs a recognized human activity and checks for anomalies.

---

## 3. Events & Audit Logs
- `GET /api/events`
  - Query parameters: `syncStatus`, `severity`, `limit`, `activity`.
  - Returns filtered chronological mission events.
- `POST /api/events`
  - Creates a manual or automated mission event.

---

## 4. Safety Alerts & Anomalies
- `GET /api/anomalies`
  - Returns active and resolved safety alerts.
- `POST /api/anomalies/:id/resolve`
  - Acknowledges and dismisses a safety alert.

---

## 5. Communication & Synchronization
- `GET /api/sync/status`
  - Returns current RF link status, sync progress, and pending item count.
- `POST /api/sync`
  - Initiates delay-tolerant batch synchronization to Ground Mission Control.

---

## 6. Simulation & Demo Controls
- `GET /api/simulation/session`
  - Returns active mission session details.
- `POST /api/simulation/comm-status`
  - Body: `{ "status": "ONLINE" | "OFFLINE" }`
- `POST /api/simulation/demo/start`
  - Body: `{ "speed": 1 | 2 | 4 }`
- `POST /api/simulation/demo/stop`
  - Halts automated demo runner.
- `POST /api/simulation/demo/step`
  - Steps to a specific demo index (0–12).
- `POST /api/simulation/trigger-fall`
  - Triggers a critical fall anomaly.
- `POST /api/simulation/trigger-inactivity`
  - Triggers a long inactivity warning alert.

---

## 7. Data Export
- `GET /api/export/events.csv`
  - Downloads `mission_events.csv`.
- `GET /api/export/report.json`
  - Downloads `mission_report.json`.
- `GET /api/export/report-summary`
  - Returns structured mission summary JSON.
