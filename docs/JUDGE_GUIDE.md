# ASTROSENSE | Hackathon Judge & Evaluation Guide

Welcome Judges! This guide details the 2-to-3 minute evaluation workflow to verify all system capabilities.

---

## 🎯 Quick Demo Walkthrough (Under 3 Minutes)

### Option 1: Automated Judge Presentation Mode
1. Click the top-right button: **`START JUDGE DEMO`**.
2. The interactive 13-step modal will open.
3. Click **`Auto Play Demo`** (you can adjust speed to 2x or 4x).
4. Watch the step-by-step execution:
   - Steps 1-2: Normal activities (Walking, Working) with Ground Link Online.
   - Step 3: Spacecraft Communication Blackout triggered.
   - Step 4: Autonomous Onboard Mode engaged with zero Earth reliance.
   - Steps 5-6: Edge AI inference continues locally; Exercise classified.
   - Steps 7-8: Fall / kinetic anomaly triggered; Critical alert sounds.
   - Step 9: Events queued locally; Unsynced counter increases.
   - Step 10: Ground Communication Link restored.
   - Step 11: Delay-Tolerant Synchronization begins (0% -> 100%).
   - Step 12: All local events marked `SYNCED`.
   - Step 13: Final Mission Aurora Telemetry Report generated.
5. Click **`View Mission Report`** and download CSV/JSON.

---

### Option 2: Interactive Manual Test Checklist
1. **Live Onboard AI Vision**:
   - Check the live canvas HUD showing the 17-point biomechanical skeleton overlay.
   - Switch input mode between **Mission Sim**, **Webcam**, and **Local Video**.
2. **Communication Loss Test**:
   - Click **`SIMULATE COMM LOSS`**.
   - Notice the status changes to `OFFLINE` and the `AUTONOMOUS ONBOARD MODE` banner activates.
   - Notice the AI inference **never stops**.
3. **Safety Alert Test**:
   - Click **`TRIGGER SUDDEN FALL`** in the Quick Action Panel.
   - Notice the immediate `CRITICAL` safety alert banner and audio chime.
   - Notice `UNSYNCED EVENTS` counter increments.
4. **Synchronization Test**:
   - Click **`RESTORE COMMUNICATION`**.
   - Notice the sync progress bar run (0% -> 25% -> 50% -> 75% -> 100%).
   - Notice events transition from `PENDING` to `SYNCED` and the unsynced counter returns to 0.
5. **Data Export**:
   - Navigate to **Mission Logs** or open **Mission Report** and click **Export CSV** or **Export JSON**.
