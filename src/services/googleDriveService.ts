import { MasterDatabaseSchema } from '../types/database';

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token?: string; error?: string }) => void;
            error_callback?: (err: any) => void;
          }) => {
            requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
          };
          revoke: (token: string, done: () => void) => void;
        };
      };
    };
  }
}

const DRIVE_FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
const FOLDER_NAME = 'Executive_Dashboard_Data';
const FILE_NAME = 'personal_executive_dashboard_db.json';

class GoogleDriveService {
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;
  private folderId: string | null = null;
  private fileId: string | null = null;
  private tokenClient: any = null;

  constructor() {
    // Restore session if available
    const savedToken = sessionStorage.getItem('gdrive_access_token');
    const savedExpiry = sessionStorage.getItem('gdrive_token_expiry');
    if (savedToken && savedExpiry && Date.now() < parseInt(savedExpiry, 10)) {
      this.accessToken = savedToken;
      this.tokenExpiresAt = parseInt(savedExpiry, 10);
    }
  }

  public isTokenValid(): boolean {
    return !!this.accessToken && Date.now() < this.tokenExpiresAt - 60000; // 1 min buffer
  }

  public getAccessToken(): string | null {
    if (this.isTokenValid()) {
      return this.accessToken;
    }
    return null;
  }

  public setAccessToken(token: string, expiresInSeconds: number = 3600) {
    this.accessToken = token;
    this.tokenExpiresAt = Date.now() + expiresInSeconds * 1000;
    sessionStorage.setItem('gdrive_access_token', token);
    sessionStorage.setItem('gdrive_token_expiry', this.tokenExpiresAt.toString());
  }

  public clearSession() {
    if (this.accessToken && window.google?.accounts?.oauth2?.revoke) {
      try {
        window.google.accounts.oauth2.revoke(this.accessToken, () => {});
      } catch (e) {
        console.warn('Error revoking token:', e);
      }
    }
    this.accessToken = null;
    this.tokenExpiresAt = 0;
    this.folderId = null;
    this.fileId = null;
    sessionStorage.removeItem('gdrive_access_token');
    sessionStorage.removeItem('gdrive_token_expiry');
  }

  /**
   * Request Google OAuth2 token using Google Identity Services
   */
  public async requestToken(clientId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!window.google?.accounts?.oauth2) {
        return reject(
          new Error('Google Identity Services library is not loaded. Please verify your internet connection.')
        );
      }

      if (!clientId || clientId.trim() === '') {
        return reject(
          new Error('Please enter a valid Google Cloud Client ID in Settings first.')
        );
      }

      try {
        this.tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId.trim(),
          scope: DRIVE_FILE_SCOPE,
          callback: (response) => {
            if (response.error) {
              return reject(new Error(`Google Auth error: ${response.error}`));
            }
            if (response.access_token) {
              this.setAccessToken(response.access_token);
              resolve(response.access_token);
            } else {
              reject(new Error('No access token returned from Google'));
            }
          },
          error_callback: (err) => {
            reject(new Error(err?.message || 'Google OAuth failed to initialize'));
          },
        });

        // Request token with popup
        this.tokenClient.requestAccessToken({ prompt: '' });
      } catch (err: any) {
        reject(new Error(`Failed to initialize Google Auth: ${err.message || err}`));
      }
    });
  }

  /**
   * Fetch user profile info
   */
  public async getUserInfo(token: string): Promise<{ email: string; name: string; picture?: string }> {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error('Failed to fetch user info from Google');
    }
    return res.json();
  }

  /**
   * Locate or create the dedicated folder in user's Drive: Executive_Dashboard_Data
   */
  public async getOrCreateFolder(token: string): Promise<string> {
    if (this.folderId) return this.folderId;

    // Search for existing folder
    const query = encodeURIComponent(
      `name = '${FOLDER_NAME}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`
    );
    const searchRes = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)&spaces=drive`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!searchRes.ok) {
      const err = await searchRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to search Google Drive folder');
    }

    const searchData = await searchRes.json();
    if (searchData.files && searchData.files.length > 0) {
      this.folderId = searchData.files[0].id;
      return this.folderId!;
    }

    // Create new folder
    const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: FOLDER_NAME,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });

    if (!createRes.ok) {
      const err = await createRes.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to create Executive folder in Google Drive');
    }

    const createData = await createRes.json();
    this.folderId = createData.id;
    return this.folderId!;
  }

  /**
   * Find existing master database file in folder
   */
  public async findDatabaseFile(token: string, folderId: string): Promise<string | null> {
    const query = encodeURIComponent(
      `name = '${FILE_NAME}' and '${folderId}' in parents and trashed = false`
    );
    const res = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&spaces=drive`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data.files && data.files.length > 0) {
      this.fileId = data.files[0].id;
      return this.fileId;
    }
    return null;
  }

  /**
   * Sync/Upload Master Database to Google Drive (multipart upload)
   */
  public async syncDatabaseToDrive(
    token: string,
    data: MasterDatabaseSchema
  ): Promise<{ fileId: string; timestamp: string }> {
    const folderId = await this.getOrCreateFolder(token);
    const existingFileId = await this.findDatabaseFile(token, folderId);

    const metadata = {
      name: FILE_NAME,
      mimeType: 'application/json',
      ...(existingFileId ? {} : { parents: [folderId] }),
    };

    const fileContent = JSON.stringify(data, null, 2);
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const multipartRequestBody =
      delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      'Content-Type: application/json\r\n\r\n' +
      fileContent +
      closeDelimiter;

    const url = existingFileId
      ? `https://www.googleapis.com/upload/drive/v3/files/${existingFileId}?uploadType=multipart`
      : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart';

    const method = existingFileId ? 'PATCH' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || 'Failed to upload database to Google Drive');
    }

    const result = await res.json();
    this.fileId = result.id;
    return {
      fileId: result.id,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Download / Pull Database from Google Drive
   */
  public async downloadDatabaseFromDrive(token: string): Promise<MasterDatabaseSchema | null> {
    const folderId = await this.getOrCreateFolder(token);
    const fileId = await this.findDatabaseFile(token, folderId);

    if (!fileId) {
      return null;
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error('Failed to download database file from Google Drive');
    }

    const db = await res.json();
    return db as MasterDatabaseSchema;
  }
}

export const googleDriveService = new GoogleDriveService();
