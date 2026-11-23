export type DriveSyncState = 'synced' | 'syncing' | 'error' | 'disconnected' | 'local_only';

export interface GoogleDriveConfig {
  clientId: string;
  folderName: string;
  fileName: string;
  isConfigured: boolean;
  isConnected: boolean;
  userEmail?: string;
  userName?: string;
  userPicture?: string;
  folderId?: string;
  fileId?: string;
  lastSyncedAt?: string;
  lastError?: string;
}

export interface SyncMetadata {
  lastSyncTimestamp: string;
  status: DriveSyncState;
  message?: string;
}
