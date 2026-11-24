import { MasterDatabaseSchema } from '../types/database';

class CloudSyncService {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    };
    const savedToken = localStorage.getItem('cloud_sync_token');
    if (savedToken) {
      headers['Authorization'] = `Bearer ${savedToken.trim()}`;
    }
    return headers;
  }

  /**
   * Pull latest database state from cloud
   */
  public async pullFromCloud(): Promise<MasterDatabaseSchema | null> {
    try {
      const res = await fetch('/api/sync', {
        headers: this.getHeaders(),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data && json.data.accounts) {
          return json.data as MasterDatabaseSchema;
        }
      }
    } catch (e) {
      console.warn('Cloud sync pull error:', e);
    }
    return null;
  }

  /**
   * Push current database state to cloud
   */
  public async pushToCloud(data: MasterDatabaseSchema): Promise<boolean> {
    try {
      const res = await fetch('/api/sync', {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({ data }),
      });

      if (res.ok) {
        const json = await res.json();
        return !!json.success;
      }
    } catch (e) {
      console.warn('Cloud sync push error:', e);
    }
    return false;
  }

  public saveCustomToken(token: string) {
    if (token) {
      localStorage.setItem('cloud_sync_token', token.trim());
    } else {
      localStorage.removeItem('cloud_sync_token');
    }
  }

  public getCustomToken(): string {
    return localStorage.getItem('cloud_sync_token') || '';
  }
}

export const cloudSyncService = new CloudSyncService();
