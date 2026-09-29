# ASTROSENSE Real-Time Webcam Human Activity Recognition (HAR) & OpenCV.js Engine

## 1. Executive Summary & Pipeline Architecture

ASTROSENSE features an **on-device, air-gapped computer vision pipeline** designed for deep-space habitat crew monitoring without cloud dependencies or internet access. It processes local camera frames in real time directly within the client browser using WebAssembly and hardware acceleration (WebGL/WebGPU).

```
  PHYSICAL WEBCAM
        ↓
  navigator.mediaDevices.getUserMedia()
        ↓
  HTMLVideoElement (<video>)
        ↓
  OpenCV.js WebAssembly Engine (/js/opencv.js)
  - Resolution normalization (320x180 ROI)
  - Grayscale conversion (cv.cvtColor)
  - Brightness & contrast estimation (cv.meanStdDev)
  - Blur detection via Laplacian variance (cv.Laplacian)
  - Frame differencing (cv.absdiff + cv.threshold)
  - Lucas-Kanade Optical Flow Motion (cv.calcOpticalFlowPyrLK)
        ↓
  MediaPipe PoseLandmarker Lite (/wasm & /models)
  - 33 3D skeletal landmarks
  - Joint confidence & visibility scores
        ↓
  Biomechanical Feature Extraction (PoseFeatureExtractor)
  - Torso tilt angle (° from vertical)
  - Knee & elbow flexion angles
  - Center of mass translation (x, y)
  - Kinetic energy & vertical velocity vector
        ↓
  Temporal Activity Classifier & Hysteresis Buffer
  - 45-frame rolling majority voting
  - Multi-condition state machine
  - Conservative gating (Zero Hallucination)
        ↓
  Activity State Result + HUD Telemetry
        ↓
  SQLite Onboard Event Persistence (ACID flash ledger)
        ↓
  PostgreSQL Delay-Tolerant Sync (when ground link active)
```

---

## 2. Client-Side OpenCV.js Implementation

OpenCV.js is executed purely inside the browser client (`OpenCVVisionService.ts`):
- **Script Location**: Served locally from `/js/opencv.js` (no third-party external CDN reliance).
- **Functions Utilized**:
  - `cv.matFromImageData`: Ingests frame buffer from offscreen canvas.
  - `cv.cvtColor`: Converts RGBA buffer to single-channel 8-bit grayscale (`cv.COLOR_RGBA2GRAY`).
  - `cv.meanStdDev`: Computes mean luminance and pixel variance for brightness and contrast diagnostics.
  - `cv.Laplacian`: Evaluates focus sharpness and blur variance.
  - `cv.absdiff`: Quantifies frame-to-frame pixel change.
  - `cv.goodFeaturesToTrack` & `cv.calcOpticalFlowPyrLK`: Computes sparse optical flow vectors across human feature points.
- **Strict Memory Management**: Every intermediate `cv.Mat` is deleted immediately in `try ... finally` blocks via `.delete()` to prevent browser WebAssembly heap exhaustion.

---

## 3. Supported Real-Time Activities & Biomechanical Rules

| Activity Class | Biomechanical & Optical Rules | Diagnostic Rationale |
| :--- | :--- | :--- |
| **STANDING** | Upright torso (tilt < 26°), extended knees (> 138°), low kinetic energy (< 0.08), OpenCV optical flow motion < 0.08. | Erect posture in stationary neutral balance. |
| **SITTING** | Lowered center of mass relative to baseline, knee flexion (60°–135°), upright torso (tilt < 42°), low motion (< 0.12). | Seated posture with flexed lower limbs. |
| **WALKING** | Upright torso (tilt < 28°), alternating bipedal stride kinematics, OpenCV optical flow motion > 0.07. | Translational stride displacement across consecutive frames. |
| **EXERCISING** | High kinetic energy (> 0.30 or > 0.45) with rhythmic periodicity (> 0.5 Hz cycle), or aerobic optical flow surge (> 0.22). | High-kinetic cyclic countermeasure workout (squats, curls, jumping). |
| **SLEEPING / RESTING** | Horizontal recumbent spine (torso tilt > 60° from vertical), low kinetic energy (< 0.08), motion < 0.08. | Recumbent rest state along horizontal axis. |
| **LONG INACTIVITY** | Person detected in camera frame with zero kinetic translation for > configured limit (default > 15s). | Protects solo astronauts against sudden medical incapacitation or hypoxia. |
| **FALL / ABNORMAL** | Sudden rapid downward acceleration of center of mass (> 0.50 units/s) + sudden transition to recumbency (tilt > 40°). | High-impact tumbling or collapse anomaly. |
| **NO PERSON DETECTED**| MediaPipe landmark count < 15 points. | Honest empty-frame state. Never hallucinates standing or walking when empty. |
| **ANALYZING / UNKNOWN**| Transitioning between postures, occluded limbs, or context-dependent tasks without tool evidence. | Transitional temporal buffer or insufficient visual evidence. |

---

## 4. Anti-Flicker Temporal Majority Voting & Calibration

1. **Sliding Window Buffer**: Evaluates a 10–45 frame rolling history.
2. **Majority Voting**: Requires > 50% majority in the window to transition into a new activity state. Single-frame noise or camera jitter does not trigger false switches.
3. **3-Second Baseline Calibration**:
   - User stands in frame for 3 seconds (`3... 2... 1...`).
   - System establishes baseline torso height, shoulder width, center of mass Y, and room luminance.

---

## 5. Scientific Honesty & Transparency

- **No Fake Biometrics**: When operating in Real Webcam mode, heart rate is explicitly displayed as `HR: NOT AVAILABLE (NO BIOMETRIC SENSOR)`. Fake vitals are never fabricated.
- **Privacy Architecture**: Raw webcam video buffers remain strictly in local browser volatile memory. Zero video frames are streamed to any external cloud API or remote server.
- **Academic Attribution**: NASA and ISRO knowledge is cited directly with public source URLs (`nasa.gov`, `isro.gov.in`).
