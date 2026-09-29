import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

export interface SafeDbConfig {
  isConfigured: boolean;
  provider: 'Supabase' | 'Neon' | 'Railway' | 'Render' | 'Custom' | 'None';
  host: string;
  database: string;
  user: string;
  port: number;
  ssl: boolean;
  autoSync: boolean;
  syncIntervalMs: number;
  maskedUrl: string;
}

const DATA_DIR = path.resolve(__dirname, '../../../data');
const CONFIG_FILE = path.join(DATA_DIR, 'db_config.json');
const ENV_FILE = path.resolve(__dirname, '../../../.env');

export class DbConfigManager {
  private static instance: DbConfigManager;

  private constructor() {
    this.ensureDataDir();
  }

  public static getInstance(): DbConfigManager {
    if (!DbConfigManager.instance) {
      DbConfigManager.instance = new DbConfigManager();
    }
    return DbConfigManager.instance;
  }

  private ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Identifies provider from connection string hostname.
   */
  public detectProvider(url: string): 'Supabase' | 'Neon' | 'Railway' | 'Render' | 'Custom' {
    const lower = (url || '').toLowerCase();
    if (lower.includes('supabase.co') || lower.includes('supabase.com') || lower.includes('pooler.supabase.com')) {
      return 'Supabase';
    }
    if (lower.includes('neon.tech') || lower.includes('aws.neon.tech')) {
      return 'Neon';
    }
    if (lower.includes('railway.app') || lower.includes('railway.internal') || lower.includes('railway.com')) {
      return 'Railway';
    }
    if (lower.includes('render.com') || lower.includes('onrender.com')) {
      return 'Render';
    }
    return 'Custom';
  }

  /**
   * Safely masks credentials in a postgres connection URL.
   * e.g. postgresql://user:secretpass@host:5432/db -> postgresql://user:••••••••@host:5432/db
   */
  public maskDatabaseUrl(rawUrl?: string): string {
    if (!rawUrl) return '';
    try {
      // Regex replace password between ://user: and @
      return rawUrl.replace(/(:\/\/[^:]+:)([^@]+)(@)/, '$1••••••••$3');
    } catch {
      return rawUrl;
    }
  }

  /**
   * Parses connection string components for safe client presentation.
   */
  public parseUrlMetadata(rawUrl?: string): {
    host: string;
    database: string;
    user: string;
    port: number;
    provider: 'Supabase' | 'Neon' | 'Railway' | 'Render' | 'Custom' | 'None';
  } {
    if (!rawUrl) {
      return { host: '', database: '', user: '', port: 5432, provider: 'None' };
    }
    try {
      const parsed = new URL(rawUrl);
      const provider = this.detectProvider(rawUrl);
      return {
        host: parsed.hostname || '',
        database: parsed.pathname ? parsed.pathname.replace(/^\//, '') : '',
        user: parsed.username || '',
        port: parsed.port ? parseInt(parsed.port, 10) : 5432,
        provider,
      };
    } catch {
      return { host: 'unknown', database: 'unknown', user: 'unknown', port: 5432, provider: 'Custom' };
    }
  }

  /**
   * Retrieves active DATABASE_URL from process.env or saved local config file.
   */
  public getDatabaseUrl(): string | undefined {
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim().length > 0) {
      return process.env.DATABASE_URL.trim();
    }
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const fileContent = fs.readFileSync(CONFIG_FILE, 'utf-8');
        const json = JSON.parse(fileContent);
        if (json.databaseUrl && typeof json.databaseUrl === 'string') {
          return json.databaseUrl.trim();
        }
      }
    } catch (err) {
      console.warn('[DbConfigManager] Could not read db_config.json:', err);
    }
    return undefined;
  }

  /**
   * Safe status object for API responses (never reveals raw password).
   */
  public getSafeConfig(): SafeDbConfig {
    const rawUrl = this.getDatabaseUrl();
    const isConfigured = Boolean(rawUrl && rawUrl.length > 5);
    const meta = this.parseUrlMetadata(rawUrl);
    const maskedUrl = this.maskDatabaseUrl(rawUrl);

    const ssl = process.env.DATABASE_SSL !== 'false';
    const autoSync = process.env.DATABASE_AUTO_SYNC !== 'false';
    const syncIntervalMs = process.env.DATABASE_SYNC_INTERVAL_MS
      ? parseInt(process.env.DATABASE_SYNC_INTERVAL_MS, 10)
      : 10000;

    return {
      isConfigured,
      provider: meta.provider,
      host: meta.host,
      database: meta.database,
      user: meta.user,
      port: meta.port,
      ssl,
      autoSync,
      syncIntervalMs,
      maskedUrl,
    };
  }

  /**
   * Safely saves DATABASE_URL and parameters to .env and local data store.
   */
  public saveConfig(params: {
    databaseUrl: string;
    ssl?: boolean;
    autoSync?: boolean;
    syncIntervalMs?: number;
  }): boolean {
    try {
      this.ensureDataDir();
      const rawUrl = params.databaseUrl.trim();
      const ssl = params.ssl ?? true;
      const autoSync = params.autoSync ?? true;
      const syncIntervalMs = params.syncIntervalMs ?? 10000;

      // Update in-memory environment variables
      process.env.DATABASE_URL = rawUrl;
      process.env.DATABASE_SSL = String(ssl);
      process.env.DATABASE_AUTO_SYNC = String(autoSync);
      process.env.DATABASE_SYNC_INTERVAL_MS = String(syncIntervalMs);

      // Save to local config file
      fs.writeFileSync(
        CONFIG_FILE,
        JSON.stringify(
          {
            databaseUrl: rawUrl,
            ssl,
            autoSync,
            syncIntervalMs,
            updatedAt: new Date().toISOString(),
          },
          null,
          2
        ),
        'utf-8'
      );

      // Update or create .env file safely
      this.updateEnvFile({
        DATABASE_URL: rawUrl,
        DATABASE_SSL: String(ssl),
        DATABASE_AUTO_SYNC: String(autoSync),
        DATABASE_SYNC_INTERVAL_MS: String(syncIntervalMs),
      });

      return true;
    } catch (err) {
      console.error('[DbConfigManager] Error saving configuration:', err);
      return false;
    }
  }

  /**
   * Safely resets database configuration without deleting remote databases.
   */
  public resetConfig(): boolean {
    try {
      delete process.env.DATABASE_URL;
      if (fs.existsSync(CONFIG_FILE)) {
        fs.unlinkSync(CONFIG_FILE);
      }
      this.updateEnvFile({
        DATABASE_URL: '',
      });
      return true;
    } catch (err) {
      console.error('[DbConfigManager] Error resetting configuration:', err);
      return false;
    }
  }

  /**
   * Helper to write/update key-values in .env without wiping other unrelated keys.
   */
  private updateEnvFile(updates: Record<string, string>): void {
    try {
      let envContent = '';
      if (fs.existsSync(ENV_FILE)) {
        envContent = fs.readFileSync(ENV_FILE, 'utf-8');
      } else {
        // Create baseline .env with header
        envContent = `# ASTROSENSE Environment Configuration\nPORT=3001\nNODE_ENV=development\n`;
      }

      let lines = envContent.split('\n');
      const updatedKeys = new Set<string>();

      lines = lines.map(line => {
        const match = line.match(/^\s*([A-Za-z_0-9]+)\s*=/);
        if (match) {
          const key = match[1];
          if (key in updates) {
            updatedKeys.add(key);
            return `${key}=${updates[key]}`;
          }
        }
        return line;
      });

      // Append any new keys not already in the file
      for (const [key, val] of Object.entries(updates)) {
        if (!updatedKeys.has(key)) {
          lines.push(`${key}=${val}`);
        }
      }

      fs.writeFileSync(ENV_FILE, lines.join('\n'), 'utf-8');
    } catch (err) {
      console.warn('[DbConfigManager] Could not update .env file:', err);
    }
  }
}

export const dbConfigManager = DbConfigManager.getInstance();
