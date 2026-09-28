# ASTROSENSE Deployment & Operation Guide

ASTROSENSE is designed for zero-cloud, offline-first deployment on embedded spacecraft hardware, edge computers, or local evaluation workstations.

---

## 1. Quick Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- Modern Web Browser (Chrome, Edge, Firefox, Safari) with Web Speech API and Web Audio API support.

### Step-by-Step Installation
```bash
# 1. Clone repository
git clone https://github.com/your-username/ASTROSENSE.git
cd ASTROSENSE

# 2. Install all root, server, and client dependencies
npm run install:all

# 3. Build project bundles
npm run build

# 4. Start local development server
npm run dev
```

The application will be accessible at:
- **Frontend Dashboard**: `http://localhost:3000`
- **Backend API Edge Node**: `http://localhost:3001`

---

## 2. Embedded & Air-Gapped Deployment

For standalone installation on an air-gapped embedded device (e.g., Raspberry Pi 4/5, NVIDIA Jetson, industrial edge server):

```bash
# 1. Package production bundle
npm run build

# 2. Run edge API server in standalone mode
npm start
```

### Environment Variables
Configure `.env` in the root or server directory:

```ini
PORT=3001
NODE_ENV=production
DATA_DIR=./data
AUTO_SYNC_ON_RESTORE=true
DEFAULT_INACTIVITY_THRESHOLD_SECONDS=900
DEFAULT_ANOMALY_SENSITIVITY=MEDIUM
```

---

## 3. Network Isolation & Security Principles

1. **Zero External API Calls**: The platform never calls OpenAI, Gemini, Anthropic, or external cloud analytics. All speech recognition, natural language processing, and activity classification run on local compute.
2. **Local Persistence**: All events are committed to local SQLite / JSON storage with ACID compliance.
3. **No Credential Storage**: No secrets, cloud keys, or third-party tokens are required to run the platform.
