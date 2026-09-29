# ASTROSENSE Evaluation & Demo Guide

ASTROSENSE features three interactive, automated demonstration runners designed for hackathon judges, technical evaluators, and classroom presentations.

---

## 🚀 1. Original 13-Step Judge Demo
*Designed for quick 2-minute evaluation of core Human Activity Recognition, Blackout resilience, and Re-synchronization.*

- **Trigger**: Click **"START JUDGE DEMO"** in the top navigation header.
- **Workflow**:
  1. **Step 1: Routine Transit (Walking)** — Normal telemetry downlink to Earth.
  2. **Step 2: Microgravity Research (Working)** — Real-time edge AI fine-motor classification.
  3. **Step 3: Spacecraft Communication Blackout** — Orbital tracking geometry drops ground link (`OFFLINE`).
  4. **Step 4: Autonomous Onboard Mode Activated** — Edge intelligence maintains 24ms inference latency.
  5. **Step 5: Edge AI Activity Recognition Continues** — Local events queue up in offline flash store.
  6. **Step 6: Countermeasure Aerobic Workout** — Exercise tracking with vitals monitoring.
  7. **Step 7: Sudden Kinetic Disruption (Fall)** — High kinetic acceleration spike detected.
  8. **Step 8: Critical Onboard Safety Alarm** — Acoustic & visual habitat warning dispatched.
  9. **Step 9: AI Recovery Verification** — Posture stabilized into resting position.
  10. **Step 10: Ground Communication Restored** — Carrier lock re-established with DSN Madrid antenna (`ONLINE`).
  11. **Step 11: Delay-Tolerant Re-Synchronization** — Multi-stage batch downlinking (0% → 100%).
  12. **Step 12: Earth Mission Control Updated** — Zero missing events or data gaps.
  13. **Step 13: Final Mission Aurora Telemetry Report** — Complete exportable mission debrief.

---

## 🛰️ 2. 14-Step Extended Space Demo (3-5 Minutes)
*Comprehensive exploration including deep space asteroid radar, AI decision support, and multi-crew monitoring.*

- **Trigger**: Click **"Extended Demo"** in the top navigation header.
- **Key Highlights**:
  - AI Space Assistant queries ("What is happening on the mission right now?").
  - Deep space asteroid radar tracking (4 near-Earth objects).
  - Delta-V trajectory anomaly detected on ASTEROID-B07.
  - Multi-crew module localization.
  - Delay-tolerant synchronization and full report compilation.

---

## 🤖 3. 16-Step Advanced Monitoring Demo
*Complete multi-subsystem workflow covering Multi-Camera HAR, ARES-1 & NOVA-2 robots, Voice Assistant, Comm Blackout, and Synchronization.*

- **Trigger**: Click **"Advanced Demo"** in the top navigation header or on the Mission Monitor page.
- **Workflow**:
  1. **Step 1: Open Mission Monitor** — Unified aerospace command dashboard initialized.
  2. **Step 2: Simulated Live Video & HAR Vision** — 4-channel camera streams with live skeletal overlays.
  3. **Step 3: Multi-Crew Activity Monitoring** — 4 astronauts tracked simultaneously across habitat modules.
  4. **Step 4: ARES-1 Crew Support Robot Active** — Routine wellness checks & schedule tracking.
  5. **Step 5: NOVA-2 Engineering Robot Active** — 1Hz telemetry diagnostics & asteroid radar monitoring.
  6. **Step 6: Voice Assistant Mission Status Query** — Offline NLP query processing.
  7. **Step 7: Crew Routine Schedule Reminder** — Acoustic routine reminder broadcasted.
  8. **Step 8: Trigger Simulated Kinetic Anomaly** — Slip/fall event detected in exercise bay.
  9. **Step 9: ARES-1 Autonomous Safety Response** — ARES-1 dispatches local crew verification.
  10. **Step 10: NOVA-2 Secondary Telemetry Sweep** — NOVA-2 checks habitat pressure & structural accelerometers.
  11. **Step 11: Spacecraft Communication Blackout** — Ground connection drops to `OFFLINE`.
  12. **Step 12: Autonomous Robot Mode Sustained** — ARES-1 & NOVA-2 maintain local inter-robot coordination.
  13. **Step 13: Local ACID Event & Robot Storage** — Unsynced events buffered safely in SQLite.
  14. **Step 14: Ground Communication Link Restored** — Ground link switches to `ONLINE`.
  15. **Step 15: Synchronize Robot & Crew Events** — Complete offline backlog transmitted to Earth (0% → 100%).
  16. **Step 16: Comprehensive Mission Report & Export** — Mission audit debrief ready for CSV/JSON download.

---

## 📹 4. 17-Step Real Webcam + OpenCV.js Demo Lab
*Interactive on-device browser optical verification using your physical webcam.*

- **Trigger**: Click **"WEBCAM LAB (17-STEP)"** in the top navigation header or **"TEST REAL WEBCAM"** in the Live Video Monitor.
- **Workflow**:
  1. **Step 1: Start Mission Control** — Initializing aerospace console and HUD telemetry.
  2. **Step 2: Select REAL WEBCAM Mode** — CAM-01 switches to physical optical sensor; secondary feeds remain simulated habitat sensors.
  3. **Step 3: Camera Permission & Link** — Establishing local WebRTC stream with zero cloud video upload.
  4. **Step 4: 3-Second Calibration** — Stand upright in neutral balance as system calibrates baseline height, shoulder width, and luminance.
  5. **Step 5: MediaPipe 33-Point Pose Lock** — 33 body skeletal landmarks acquired with green overlay at 25-30 FPS.
  6. **Step 6: Stand Upright (STANDING)** — Upright torso (< 26° tilt), straight knees (> 138°), low optical flow motion (< 0.05).
  7. **Step 7: Sit Down (SITTING)** — Lowered center of mass, knee flexion ~70°-135°, stable seated posture.
  8. **Step 8: Walk Across Frame (WALKING)** — Alternating leg trajectories with real translational displacement (> 0.07).
  9. **Step 9: Repetitive Aerobic Movement (EXERCISING)** — Kinetic energy surge (> 0.30) with periodic oscillation cycle (squats, curls).
  10. **Step 10: Cease Movement** — Low kinetic motion hold below 0.04.
  11. **Step 11: Trigger Inactivity Alert (LONG INACTIVITY)** — Stillness > 15s triggers in-cabin welfare check.
  12. **Step 12: Step Completely Out of Frame** — Body leaves optical field of view.
  13. **Step 13: Display NO PERSON DETECTED** — Landmark count drops to 0; zero synthetic activity hallucination.
  14. **Step 14: Anomaly Rule Evaluation** — Client-side safety bounds verify kinematic safety envelope.
  15. **Step 15: Local SQLite Persistence** — Real activity classifications committed to `astrosense_local.sqlite`.
  16. **Step 16: Simulate Communication Loss** — Link toggled to `OFFLINE`; autonomous onboard mode engages.
  17. **Step 17: Restore Earth Link + PostgreSQL Sync** — Ground connection restored; Delay-Tolerant Sync Engine flushes offline backlog to PostgreSQL (0% -> 100%).

---

## 🎮 Manual Interactive Exploration

You can also test every feature manually:
- **Toggle Communication Link**: Click the `COMM: ONLINE / OFFLINE` badge to simulate blackout on demand.
- **Talk to AstroSense**: Click `🎙️ TALK TO ASTROSENSE` to issue voice or text queries (NASA Gateway, ISRO Gaganyaan, HAR activities, telemetry).
- **Robot Control**: Navigate to `/robot-control` and command `ARES-1` or `NOVA-2` (`PATROL`, `INSPECT`, `ASSIST`).
- **Crew Routine**: Navigate to `/crew-routine` to manage circadian schedules and trigger voice announcements.
- **Camera Feeds**: Switch between simulated animations, local video uploads, or webcam input on `/mission-monitor`.
- **Asteroid Radar**: Trigger synthetic delta-V trajectory variance on `/asteroids`.
- **Hybrid Database**: Navigate to `/database-setup` to inspect SQLite and PostgreSQL sync state.
