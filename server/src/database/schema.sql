-- ASTROSENSE Onboard SQLite Database Schema
-- Mission Aurora - Autonomous Human Activity Recognition

CREATE TABLE IF NOT EXISTS astronauts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    mission TEXT NOT NULL,
    mission_day INTEGER NOT NULL DEFAULT 1,
    current_module TEXT NOT NULL,
    current_activity TEXT NOT NULL,
    activity_confidence REAL NOT NULL,
    current_status TEXT NOT NULL DEFAULT 'NORMAL',
    activity_duration_seconds INTEGER NOT NULL DEFAULT 0,
    last_activity TEXT NOT NULL,
    vitals_json TEXT NOT NULL,
    stats_json TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS mission_events (
    id TEXT PRIMARY KEY,
    astronaut_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    display_time TEXT NOT NULL,
    activity TEXT NOT NULL,
    confidence REAL NOT NULL,
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    severity TEXT NOT NULL DEFAULT 'INFO',
    module TEXT NOT NULL,
    sync_status TEXT NOT NULL DEFAULT 'PENDING',
    source TEXT NOT NULL,
    processing_mode TEXT NOT NULL DEFAULT 'ONBOARD_EDGE_AI',
    details TEXT,
    synced_at TEXT,
    FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
);

CREATE TABLE IF NOT EXISTS anomalies (
    id TEXT PRIMARY KEY,
    astronaut_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    display_time TEXT NOT NULL,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    severity TEXT NOT NULL,
    activity TEXT NOT NULL,
    module TEXT NOT NULL,
    description TEXT NOT NULL,
    recommended_action TEXT,
    resolved INTEGER NOT NULL DEFAULT 0,
    sync_status TEXT NOT NULL DEFAULT 'PENDING',
    FOREIGN KEY(astronaut_id) REFERENCES astronauts(id)
);

CREATE TABLE IF NOT EXISTS sync_queue (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    queued_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'PENDING',
    synced_at TEXT,
    retry_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS mission_sessions (
    id TEXT PRIMARY KEY,
    mission_name TEXT NOT NULL,
    astronaut_id TEXT NOT NULL,
    mission_day INTEGER NOT NULL,
    mission_elapsed_time_seconds INTEGER NOT NULL DEFAULT 0,
    started_at TEXT NOT NULL,
    comm_status TEXT NOT NULL DEFAULT 'ONLINE',
    autonomous_mode_active INTEGER NOT NULL DEFAULT 0,
    unsynced_event_count INTEGER NOT NULL DEFAULT 0,
    total_events_count INTEGER NOT NULL DEFAULT 0,
    sync_progress INTEGER NOT NULL DEFAULT 0,
    is_syncing INTEGER NOT NULL DEFAULT 0,
    active_input_mode TEXT NOT NULL DEFAULT 'SIMULATION',
    inactivity_threshold_seconds INTEGER NOT NULL DEFAULT 900,
    anomaly_sensitivity TEXT NOT NULL DEFAULT 'MEDIUM',
    auto_sync_on_restore INTEGER NOT NULL DEFAULT 1,
    comm_loss_timestamp TEXT,
    comm_restore_timestamp TEXT,
    total_outage_seconds INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_events_sync_status ON mission_events(sync_status);
CREATE INDEX IF NOT EXISTS idx_events_timestamp ON mission_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_anomalies_severity ON anomalies(severity);
