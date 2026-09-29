# 🚀 ASTROSENSE — Render Production Deployment Guide

This guide provides step-by-step instructions to deploy **ASTROSENSE** (Autonomous Deep-Space Crew Vision & Mission Intelligence) to [Render](https://render.com).

---

## 🏛️ System Architecture on Render

```text
                                 RENDER CLOUD DEPLOYMENT
 ┌──────────────────────────────────────────────────────────────────────────────────┐
 │                                                                                  │
 │  ┌──────────────────────────────┐              ┌──────────────────────────────┐  │
 │  │      ASTROSENSE CLIENT       │              │      ASTROSENSE SERVER       │  │
 │  │   (Render Static Site)       │              │    (Render Web Service)      │  │
 │  │                              │              │                              │  │
 │  │ • React 18 + Vite + Tailwind │  REST / JSON │ • Node.js + Express + TS     │  │
 │  │ • Client-side OpenCV.js WASM │─────────────▶│ • Bound to 0.0.0.0:$PORT     │  │
 │  │ • MediaPipe 33 Landmarks     │◀─────────────│ • CORS whitelist enabled     │  │
 │  │ • Pure HTTPS Webcam Access   │              │ • Resilient SQLite Onboard   │  │
 │  │ • No Raw Video Upload        │              │ • Hybrid PostgreSQL Sync     │  │
 │  └──────────────────────────────┘              └──────────────┬───────────────┘  │
 │                                                               │                  │
 │                                                               │ SSL TLS Pool     │
 │                                                               ▼                  │
 │                                                ┌──────────────────────────────┐  │
 │                                                │     RENDER POSTGRESQL DB     │  │
 │                                                │   (Ground Ground Station)    │  │
 │                                                │                              │  │
 │                                                │ • 10 Auto-Migrated Tables    │  │
 │                                                │ • Automated Indexing         │  │
 │                                                │ • Delay-Tolerant Vault       │  │
 │                                                └──────────────────────────────┘  │
 └──────────────────────────────────────────────────────────────────────────────────┘
```

---

## 📋 Required Environment Variables

| Variable | Target Component | Description | Example / Recommended Value |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | Backend (`server`) | Node execution environment | `production` |
| `PORT` | Backend (`server`) | Web server port (auto-set by Render) | `3001` or provided by Render |
| `FRONTEND_URL` | Backend (`server`) | Allowed frontend origin for CORS | `https://astrosense-client.onrender.com` |
| `DATABASE_URL` | Backend (`server`) | PostgreSQL ground database connection string | `postgresql://user:pass@dpg-xxx.render.com/astrosense` |
| `DATABASE_SSL` | Backend (`server`) | Enable SSL connection to database | `true` |
| `DATABASE_AUTO_SYNC`| Backend (`server`) | Enable periodic sync engine | `true` |
| `DATABASE_SYNC_INTERVAL_MS` | Backend (`server`) | Sync interval in milliseconds | `10000` |
| `VITE_API_BASE_URL` | Frontend (`client`)| Backend API endpoint for browser calls | `https://astrosense-server.onrender.com` |

> ⚠️ **Database Security Note**: `DATABASE_URL` is **only** configured on the backend web service. It is **never** exposed to the frontend client bundle.

---

## ⚡ Deployment Method 1: Render Blueprint (`render.yaml`) [Recommended]

ASTROSENSE includes an Infrastructure-as-Code Blueprint (`render.yaml`) in the repository root.

### Steps:
1. Push your changes to your GitHub repository (e.g. `balajisiva585-ui/ASTROSENSE`).
2. Log into the [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Select your **ASTROSENSE** repository.
5. Render will automatically detect `render.yaml` and plan 3 resources:
   - `astrosense-server` (Web Service)
   - `astrosense-client` (Static Site)
   - `astrosense-db` (PostgreSQL Database)
6. Click **Apply**.
7. Render will automatically build, deploy, and link the environment variables between the services!

---

## 🛠️ Deployment Method 2: Manual Dashboard Setup

If you prefer configuring services individually in the Render Dashboard:

### Step 1: Create the Managed PostgreSQL Database
1. In Render Dashboard, click **New +** → **PostgreSQL**.
2. Set:
   - **Name**: `astrosense-db`
   - **Database**: `astrosense`
   - **User**: `astrosense_user`
   - **Region**: `Oregon (US West)` (or closest region)
   - **Plan**: `Free`
3. Click **Create Database**.
4. Copy the **Internal Database URL** (or **External Database URL**).

---

### Step 2: Deploy the Backend Web Service (`astrosense-server`)
1. Click **New +** → **Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `astrosense-server`
   - **Language / Runtime**: `Node`
   - **Region**: `Oregon (US West)` (same as database)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Add **Environment Variables**:
   - `NODE_ENV` = `production`
   - `DATABASE_URL` = *(Paste the PostgreSQL connection string from Step 1)*
   - `DATABASE_SSL` = `true`
   - `FRONTEND_URL` = `https://astrosense-client.onrender.com` *(Update after creating frontend)*
5. Click **Create Web Service**.
6. Once deployed, note your backend URL: e.g. `https://astrosense-server.onrender.com`.

---

### Step 3: Deploy the Frontend Static Site (`astrosense-client`)
1. Click **New +** → **Static Site**.
2. Connect your GitHub repository.
3. Configure the static site settings:
   - **Name**: `astrosense-client`
   - **Branch**: `main`
   - **Root Directory**: `client`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. Add **Environment Variables**:
   - `VITE_API_BASE_URL` = `https://astrosense-server.onrender.com` *(Your backend URL from Step 2)*
5. Configure **Redirects / Rewrites** (SPA Fallback):
   - **Type**: `Rewrite`
   - **Source**: `/*`
   - **Destination**: `/index.html`
6. Click **Create Static Site**.

---

## 📷 Webcam & Privacy in Production HTTPS

### 🔒 HTTPS Requirement for Camera
- Modern browsers (Google Chrome, Apple Safari, Microsoft Edge, Mozilla Firefox) enforce strict security for media devices (`navigator.mediaDevices.getUserMedia`).
- Camera streams are **only** permitted over secure `https://` or `localhost`.
- Render provides automatic, managed SSL/TLS certificates on all `*.onrender.com` domains.

### 🛡️ Edge Privacy Guarantee
- ASTROSENSE performs **100% on-device client-side inference** using **OpenCV.js WebAssembly** and **MediaPipe PoseLandmarker**.
- **No raw video frames or webcam images are ever uploaded to the server or database.**
- Only derived activity state metadata (e.g. `STANDING`, confidence score, duration, timestamp) is synced to the database.

---

## 🧪 Post-Deployment Verification Checklist

Once your services are live, verify the installation:

### 1. Health Check
Open `https://<YOUR-SERVER-URL>.onrender.com/api/health` in your browser.
Expected response:
```json
{
  "status": "HEALTHY",
  "system": "ASTROSENSE_ONBOARD_EDGE_AI",
  "mission": "MISSION AURORA",
  "commStatus": "ONLINE",
  "autonomousMode": false,
  "uptimeSeconds": 45,
  "timestamp": "2026-09-29T11:30:00.000Z",
  "environment": "production",
  "port": 3001,
  "database": {
    "sqlite": {
      "status": "ONLINE",
      "mode": "ONBOARD_PRIMARY_AND_OFFLINE_VAULT",
      "resilientFallback": true
    },
    "postgresGround": {
      "status": "ONLINE",
      "configured": true,
      "provider": "Render",
      "tablesReady": true
    }
  },
  "version": "1.0.0"
}
```

### 2. Physical Webcam HAR Verification
1. Navigate to `https://<YOUR-CLIENT-URL>.onrender.com`.
2. Click **REAL WEBCAM** in the header.
3. Grant camera permission in your browser prompt.
4. Watch the 3-second optical sensor calibration (`3... 2... 1... POSE LOCK ACQUIRED`).
5. Verify:
   - 33 Pose landmarks overlay on your body.
   - Real measured FPS (~25–30 FPS) and latency (~25–35 ms) appear on the HUD.
   - Activities like `STANDING`, `SITTING`, `WALKING`, and `EXERCISING` are accurately classified based on kinematics.
   - Stepping out of frame displays `NO PERSON DETECTED`.

### 3. PostgreSQL Ground Database Verification
1. Navigate to `/database-setup` in the web application navigation.
2. Verify all 10 ground tables are initialized and reporting row counts.
3. Test a manual synchronization trigger.

### 4. Offline Resilience Verification
1. Open the Mission Control panel and toggle **COMMUNICATION: OFFLINE**.
2. Perform physical activities in front of the webcam.
3. Verify events are queued in the local SQLite vault as `UNSYNCED`.
4. Toggle **COMMUNICATION: ONLINE** and observe the burst synchronization emptying the queue into PostgreSQL.

---

## 🆘 Troubleshooting & Common Questions

| Issue | Root Cause | Resolution |
| :--- | :--- | :--- |
| **CORS Error in Browser Console** | Backend `FRONTEND_URL` does not match the frontend URL | Set `FRONTEND_URL=https://<YOUR-CLIENT-URL>.onrender.com` on the backend Web Service. |
| **Camera Access Blocked** | Browser permission rejected or non-HTTPS URL | Ensure you are browsing over `https://` and click the camera icon in the browser address bar to allow access. |
| **Ground Database Awaiting Connection** | `DATABASE_URL` missing or incorrect | Provide a valid PostgreSQL connection string or use the built-in SQLite onboard mode. |
| **Page Refresh 404s on Client Routes** | Missing SPA rewrite rule on Static Site | Add a Rewrite rule on Render Static Site: `/*` → `/index.html`. |
| **Large Model Download Times** | First load caching | Model assets (`pose_landmarker_lite.task` & `opencv.js`) are bundled in `/client/dist` and cached by browser service/cache headers. |
