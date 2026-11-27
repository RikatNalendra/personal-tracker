import { Account, Category, Transaction, Asset } from './finance';
import { Task, TaskWorkspace } from './tasks';
import { GoogleDriveConfig } from './drive';

export interface GoogleSheetsConfig {
  webhookUrl: string;
  sheetName?: string;
  isConfigured: boolean;
  autoSync: boolean;
  lastSyncedAt?: string;
  lastError?: string;
}

export interface SecuritySettings {
  isSecurityEnabled: boolean;
  masterPin: string; // 4-8 digit PIN or password
  authorizedEmail?: string; // whitelist for single Google Account owner
  autoLockMinutes: number; // 0 = disabled, 5, 15, 30
}

export interface AppSettings {
  defaultCurrency: 'IDR';
  usdToIdrRate: number;
  autoSyncToDrive: boolean;
  syncIntervalMinutes: number;
  userName: string;
  userRole: string;
  userAvatar?: string; // Base64 compressed image data URI or URL
  finnhubApiKey?: string;
  autoRefreshPricesIntervalMinutes?: number; // 0 = manual only, 1 = 1m, 5 = 5m
  lastPriceRefreshTimestamp?: string;
  security?: SecuritySettings;
}

export interface MasterDatabaseSchema {
  version: string;
  updatedAt: string;
  settings: AppSettings;
  driveConfig: GoogleDriveConfig;
  sheetsConfig?: GoogleSheetsConfig;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  assets: Asset[];
  tasks: Task[];
  taskWorkspaces: TaskWorkspace[];
}
