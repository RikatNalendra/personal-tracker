import { Account, Category, Transaction, Asset } from './finance';
import { Task, TaskWorkspace } from './tasks';
import { GoogleDriveConfig } from './drive';

export interface AppSettings {
  defaultCurrency: 'IDR';
  usdToIdrRate: number;
  autoSyncToDrive: boolean;
  syncIntervalMinutes: number;
  userName: string;
  userRole: string;
}

export interface MasterDatabaseSchema {
  version: string;
  updatedAt: string;
  settings: AppSettings;
  driveConfig: GoogleDriveConfig;
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  assets: Asset[];
  tasks: Task[];
  taskWorkspaces: TaskWorkspace[];
}
