import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { MasterDatabaseSchema, AppSettings } from '../types/database';
import { Account, Category, Transaction, Asset } from '../types/finance';
import { Task, TaskWorkspace, TaskStatus } from '../types/tasks';
import { DriveSyncState, GoogleDriveConfig } from '../types/drive';
import { storageService } from '../services/storageService';
import { googleDriveService } from '../services/googleDriveService';
import { marketPriceService } from '../services/marketPriceService';
import { useToast } from './ToastContext';
import confetti from 'canvas-confetti';

interface DashboardContextType {
  database: MasterDatabaseSchema;
  syncState: DriveSyncState;
  lastSyncedAt: string | null;
  isRefreshingPrices: boolean;

  // Transactions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  editTransaction: (id: string, tx: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;

  // Accounts
  addAccount: (acc: Omit<Account, 'id' | 'updatedAt'>) => void;
  editAccount: (id: string, acc: Partial<Account>) => void;
  deleteAccount: (id: string) => void;

  // Categories
  addCategory: (cat: Omit<Category, 'id'>) => void;
  editCategory: (id: string, cat: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  // Assets
  addAsset: (asset: Omit<Asset, 'id' | 'lastPriceUpdate'>) => void;
  editAsset: (id: string, asset: Partial<Asset>) => void;
  deleteAsset: (id: string) => void;
  updateAssetPriceManual: (id: string, price: number) => void;
  refreshLivePrices: () => Promise<void>;

  // Tasks
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  editTask: (id: string, task: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  updateTaskStatus: (id: string, status: TaskStatus) => void;

  // Workspaces
  addTaskWorkspace: (ws: Omit<TaskWorkspace, 'id'>) => void;

  // Settings & Drive
  updateSettings: (settings: Partial<AppSettings>) => void;
  updateDriveConfig: (config: Partial<GoogleDriveConfig>) => void;
  connectGoogleDrive: () => Promise<void>;
  disconnectGoogleDrive: () => void;
  syncNowToDrive: () => Promise<void>;
  pullFromDrive: () => Promise<void>;

  // Backup & Reset
  resetToDemoData: () => void;
  clearAllData: () => void;
  exportDatabase: () => void;
  importDatabase: (file: File) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, error, info } = useToast();
  const [database, setDatabase] = useState<MasterDatabaseSchema>(() => storageService.loadDatabase());
  const [syncState, setSyncState] = useState<DriveSyncState>(() => {
    return googleDriveService.isTokenValid() ? 'synced' : 'local_only';
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isRefreshingPrices, setIsRefreshingPrices] = useState<boolean>(false);

  // Debounced auto-sync ref
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to persist database changes locally and schedule cloud sync
  const updateDbAndPersist = useCallback(
    (updater: (prev: MasterDatabaseSchema) => MasterDatabaseSchema, triggerSync: boolean = true) => {
      setDatabase((prev) => {
        const next = updater(prev);
        storageService.saveDatabase(next);

        // Schedule auto-sync to drive if connected
        if (triggerSync && next.driveConfig.isConnected && googleDriveService.isTokenValid()) {
          if (syncTimeoutRef.current) {
            clearTimeout(syncTimeoutRef.current);
          }
          setSyncState('syncing');
          syncTimeoutRef.current = setTimeout(async () => {
            try {
              const token = googleDriveService.getAccessToken();
              if (token) {
                const res = await googleDriveService.syncDatabaseToDrive(token, next);
                setSyncState('synced');
                setLastSyncedAt(res.timestamp);
              }
            } catch (err: any) {
              console.error('Auto-sync error:', err);
              setSyncState('error');
            }
          }, 2500);
        }

        return next;
      });
    },
    []
  );

  // Initial Drive status check on mount
  useEffect(() => {
    if (googleDriveService.isTokenValid() && database.driveConfig.isConnected) {
      setSyncState('synced');
    } else if (database.driveConfig.isConnected) {
      setSyncState('disconnected');
    } else {
      setSyncState('local_only');
    }
  }, [database.driveConfig.isConnected]);

  // TRANSACTION ACTIONS WITH BALANCE ADJUSTMENTS
  const addTransaction = useCallback(
    (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
      const newTx: Transaction = {
        ...txData,
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };

      updateDbAndPersist((prev) => {
        // Adjust account balances
        const updatedAccounts = prev.accounts.map((acc) => {
          if (newTx.type === 'income' && acc.id === newTx.accountId) {
            return { ...acc, balance: acc.balance + newTx.amount, updatedAt: new Date().toISOString() };
          }
          if (newTx.type === 'expense' && acc.id === newTx.accountId) {
            return { ...acc, balance: acc.balance - newTx.amount, updatedAt: new Date().toISOString() };
          }
          if (newTx.type === 'transfer') {
            if (acc.id === newTx.accountId) {
              return { ...acc, balance: acc.balance - newTx.amount, updatedAt: new Date().toISOString() };
            }
            if (acc.id === newTx.toAccountId) {
              return { ...acc, balance: acc.balance + newTx.amount, updatedAt: new Date().toISOString() };
            }
          }
          return acc;
        });

        return {
          ...prev,
          accounts: updatedAccounts,
          transactions: [newTx, ...prev.transactions],
        };
      });

      success('Transaction logged', `${newTx.type.toUpperCase()}: ${newTx.notes || 'Recorded successfully'}`);
    },
    [updateDbAndPersist, success]
  );

  const editTransaction = useCallback(
    (id: string, updatedFields: Partial<Transaction>) => {
      updateDbAndPersist((prev) => {
        const oldTx = prev.transactions.find((t) => t.id === id);
        if (!oldTx) return prev;

        const mergedTx: Transaction = { ...oldTx, ...updatedFields };

        // Revert old transaction's balance effect
        let accounts = prev.accounts.map((acc) => {
          let bal = acc.balance;
          if (oldTx.type === 'income' && acc.id === oldTx.accountId) bal -= oldTx.amount;
          if (oldTx.type === 'expense' && acc.id === oldTx.accountId) bal += oldTx.amount;
          if (oldTx.type === 'transfer') {
            if (acc.id === oldTx.accountId) bal += oldTx.amount;
            if (acc.id === oldTx.toAccountId) bal -= oldTx.amount;
          }
          return { ...acc, balance: bal };
        });

        // Apply new transaction's balance effect
        accounts = accounts.map((acc) => {
          let bal = acc.balance;
          if (mergedTx.type === 'income' && acc.id === mergedTx.accountId) bal += mergedTx.amount;
          if (mergedTx.type === 'expense' && acc.id === mergedTx.accountId) bal -= mergedTx.amount;
          if (mergedTx.type === 'transfer') {
            if (acc.id === mergedTx.accountId) bal -= mergedTx.amount;
            if (acc.id === mergedTx.toAccountId) bal += mergedTx.amount;
          }
          return { ...acc, balance: bal, updatedAt: new Date().toISOString() };
        });

        return {
          ...prev,
          accounts,
          transactions: prev.transactions.map((t) => (t.id === id ? mergedTx : t)),
        };
      });

      info('Transaction updated', 'Changes and balances recalculated');
    },
    [updateDbAndPersist, info]
  );

  const deleteTransaction = useCallback(
    (id: string) => {
      updateDbAndPersist((prev) => {
        const oldTx = prev.transactions.find((t) => t.id === id);
        if (!oldTx) return prev;

        // Revert account balance effect
        const accounts = prev.accounts.map((acc) => {
          let bal = acc.balance;
          if (oldTx.type === 'income' && acc.id === oldTx.accountId) bal -= oldTx.amount;
          if (oldTx.type === 'expense' && acc.id === oldTx.accountId) bal += oldTx.amount;
          if (oldTx.type === 'transfer') {
            if (acc.id === oldTx.accountId) bal += oldTx.amount;
            if (acc.id === oldTx.toAccountId) bal -= oldTx.amount;
          }
          return { ...acc, balance: bal, updatedAt: new Date().toISOString() };
        });

        return {
          ...prev,
          accounts,
          transactions: prev.transactions.filter((t) => t.id !== id),
        };
      });

      info('Transaction deleted', 'Balance adjusted accordingly');
    },
    [updateDbAndPersist, info]
  );

  // ACCOUNT ACTIONS
  const addAccount = useCallback(
    (accData: Omit<Account, 'id' | 'updatedAt'>) => {
      const newAcc: Account = {
        ...accData,
        id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        updatedAt: new Date().toISOString(),
      };
      updateDbAndPersist((prev) => ({
        ...prev,
        accounts: [...prev.accounts, newAcc],
      }));
      success('Account created', `${newAcc.name} is ready for transactions`);
    },
    [updateDbAndPersist, success]
  );

  const editAccount = useCallback(
    (id: string, accData: Partial<Account>) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        accounts: prev.accounts.map((a) =>
          a.id === id ? { ...a, ...accData, updatedAt: new Date().toISOString() } : a
        ),
      }));
      info('Account updated', 'Account details saved');
    },
    [updateDbAndPersist, info]
  );

  const deleteAccount = useCallback(
    (id: string) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        accounts: prev.accounts.filter((a) => a.id !== id),
      }));
      info('Account removed', 'Account deleted from records');
    },
    [updateDbAndPersist, info]
  );

  // CATEGORY ACTIONS
  const addCategory = useCallback(
    (catData: Omit<Category, 'id'>) => {
      const newCat: Category = {
        ...catData,
        id: `cat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      updateDbAndPersist((prev) => ({
        ...prev,
        categories: [...prev.categories, newCat],
      }));
      success('Category added', `${newCat.name} created`);
    },
    [updateDbAndPersist, success]
  );

  const editCategory = useCallback(
    (id: string, catData: Partial<Category>) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        categories: prev.categories.map((c) => (c.id === id ? { ...c, ...catData } : c)),
      }));
      info('Category updated', 'Category and budgets saved');
    },
    [updateDbAndPersist, info]
  );

  const deleteCategory = useCallback(
    (id: string) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        categories: prev.categories.filter((c) => c.id !== id),
      }));
      info('Category removed', 'Category deleted');
    },
    [updateDbAndPersist, info]
  );

  // ASSET ACTIONS
  const addAsset = useCallback(
    (assetData: Omit<Asset, 'id' | 'lastPriceUpdate'>) => {
      const newAsset: Asset = {
        ...assetData,
        id: `ast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        lastPriceUpdate: new Date().toISOString(),
      };
      updateDbAndPersist((prev) => ({
        ...prev,
        assets: [...prev.assets, newAsset],
      }));
      success('Asset logged', `${newAsset.name} added to portfolio`);
    },
    [updateDbAndPersist, success]
  );

  const editAsset = useCallback(
    (id: string, assetData: Partial<Asset>) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        assets: prev.assets.map((a) =>
          a.id === id ? { ...a, ...assetData, lastPriceUpdate: new Date().toISOString() } : a
        ),
      }));
      info('Asset updated', 'Holdings and valuation updated');
    },
    [updateDbAndPersist, info]
  );

  const deleteAsset = useCallback(
    (id: string) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        assets: prev.assets.filter((a) => a.id !== id),
      }));
      info('Asset removed', 'Asset removed from portfolio');
    },
    [updateDbAndPersist, info]
  );

  const updateAssetPriceManual = useCallback(
    (id: string, price: number) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        assets: prev.assets.map((a) =>
          a.id === id ? { ...a, currentPrice: price, lastPriceUpdate: new Date().toISOString() } : a
        ),
      }));
      success('Price updated', `Manual price override set to ${price}`);
    },
    [updateDbAndPersist, success]
  );

  const refreshLivePrices = useCallback(async (silent: boolean = false) => {
    setIsRefreshingPrices(true);
    if (!silent) {
      info('Market pricing update', 'Fetching live market quotes & FX rates...');
    }
    try {
      const { updatedAssets, usdRate } = await marketPriceService.refreshAllAssetPrices(
        database.assets,
        database.settings.usdToIdrRate,
        database.settings.finnhubApiKey
      );

      updateDbAndPersist((prev) => ({
        ...prev,
        settings: {
          ...prev.settings,
          usdToIdrRate: usdRate,
          lastPriceRefreshTimestamp: new Date().toISOString(),
        },
        assets: updatedAssets,
      }));

      if (!silent) {
        success('Valuations updated', `Live rates refreshed (USD/IDR: Rp ${usdRate.toLocaleString('id-ID')})`);
      }
    } catch (err: any) {
      console.error('Failed to refresh market prices:', err);
      if (!silent) {
        error('Price refresh error', err?.message || 'Could not reach pricing API');
      }
    } finally {
      setIsRefreshingPrices(false);
    }
  }, [database.assets, database.settings.usdToIdrRate, database.settings.finnhubApiKey, updateDbAndPersist, info, success, error]);

  // Periodic auto-refresh if interval is configured
  useEffect(() => {
    const intervalMins = database.settings.autoRefreshPricesIntervalMinutes || 0;
    if (intervalMins <= 0) return;

    const timer = setInterval(() => {
      refreshLivePrices(true);
    }, intervalMins * 60 * 1000);

    return () => clearInterval(timer);
  }, [database.settings.autoRefreshPricesIntervalMinutes, refreshLivePrices]);

  // TASK ACTIONS
  const addTask = useCallback(
    (taskData: Omit<Task, 'id' | 'createdAt'>) => {
      const newTask: Task = {
        ...taskData,
        id: `tsk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
      };
      updateDbAndPersist((prev) => ({
        ...prev,
        tasks: [newTask, ...prev.tasks],
      }));
      success('Task created', newTask.title);
    },
    [updateDbAndPersist, success]
  );

  const editTask = useCallback(
    (id: string, taskData: Partial<Task>) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) => (t.id === id ? { ...t, ...taskData } : t)),
      }));
    },
    [updateDbAndPersist]
  );

  const deleteTask = useCallback(
    (id: string) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        tasks: prev.tasks.filter((t) => t.id !== id),
      }));
      info('Task removed', 'Task deleted');
    },
    [updateDbAndPersist, info]
  );

  const toggleTaskStatus = useCallback(
    (id: string) => {
      let isDone = false;
      let allDone = false;

      updateDbAndPersist((prev) => {
        const target = prev.tasks.find((t) => t.id === id);
        if (!target) return prev;

        const newStatus: TaskStatus = target.status === 'completed' ? 'todo' : 'completed';
        isDone = newStatus === 'completed';

        const updatedTasks = prev.tasks.map((t) => {
          if (t.id === id) {
            return {
              ...t,
              status: newStatus,
              completedAt: newStatus === 'completed' ? new Date().toISOString() : undefined,
              streakCount:
                t.recurrence !== 'none' && newStatus === 'completed'
                  ? (t.streakCount || 0) + 1
                  : t.streakCount,
            };
          }
          return t;
        });

        // Check if all today's tasks are completed
        const todayTasks = updatedTasks.filter((t) => t.dueDate === new Date().toISOString().split('T')[0]);
        if (todayTasks.length > 0 && todayTasks.every((t) => t.status === 'completed')) {
          allDone = true;
        }

        return { ...prev, tasks: updatedTasks };
      });

      if (isDone) {
        if (allDone) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          });
          success('Outstanding!', "All scheduled priorities for today completed!");
        } else {
          success('Completed', 'Priority checked off');
        }
      }
    },
    [updateDbAndPersist, success]
  );

  const updateTaskStatus = useCallback(
    (id: string, status: TaskStatus) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        tasks: prev.tasks.map((t) =>
          t.id === id
            ? {
                ...t,
                status,
                completedAt: status === 'completed' ? new Date().toISOString() : undefined,
              }
            : t
        ),
      }));
    },
    [updateDbAndPersist]
  );

  const addTaskWorkspace = useCallback(
    (wsData: Omit<TaskWorkspace, 'id'>) => {
      const newWs: TaskWorkspace = {
        ...wsData,
        id: `ws_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };
      updateDbAndPersist((prev) => ({
        ...prev,
        taskWorkspaces: [...prev.taskWorkspaces, newWs],
      }));
      success('Workspace created', newWs.name);
    },
    [updateDbAndPersist, success]
  );

  // SETTINGS & GOOGLE DRIVE INTEGRATION
  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        settings: { ...prev.settings, ...newSettings },
      }));
      success('Settings updated', 'Preferences saved');
    },
    [updateDbAndPersist, success]
  );

  const updateDriveConfig = useCallback(
    (configData: Partial<GoogleDriveConfig>) => {
      updateDbAndPersist((prev) => ({
        ...prev,
        driveConfig: { ...prev.driveConfig, ...configData },
      }));
      info('Drive config updated', 'Client details saved');
    },
    [updateDbAndPersist, info]
  );

  const connectGoogleDrive = useCallback(async () => {
    const clientId = database.driveConfig.clientId;
    if (!clientId) {
      error('Configuration Missing', 'Please enter your Google Cloud Client ID in Settings first.');
      return;
    }

    setSyncState('syncing');
    try {
      const token = await googleDriveService.requestToken(clientId);
      const userInfo = await googleDriveService.getUserInfo(token);

      // Single-Account Owner Whitelist Verification
      const authorizedEmail = database.settings.security?.authorizedEmail?.trim().toLowerCase();
      if (authorizedEmail && userInfo.email.trim().toLowerCase() !== authorizedEmail) {
        googleDriveService.clearSession();
        setSyncState('disconnected');
        error('Access Denied', `Only the authorized owner (${authorizedEmail}) is permitted to link and sync this dashboard.`);
        return;
      }

      // If authorizedEmail was blank, automatically set this connected email as the owner
      if (!authorizedEmail && userInfo.email) {
        updateSettings({
          security: {
            ...(database.settings.security || {
              isSecurityEnabled: true,
              masterPin: '8888',
              autoLockMinutes: 15,
            }),
            authorizedEmail: userInfo.email,
          },
        });
      }

      updateDbAndPersist((prev) => ({
        ...prev,
        driveConfig: {
          ...prev.driveConfig,
          isConnected: true,
          isConfigured: true,
          userEmail: userInfo.email,
          userName: userInfo.name,
          userPicture: userInfo.picture,
          lastError: undefined,
        },
      }));

      // Check if remote DB exists or upload current DB
      const folderId = await googleDriveService.getOrCreateFolder(token);
      const existingDb = await googleDriveService.downloadDatabaseFromDrive(token);

      if (existingDb && existingDb.accounts && existingDb.transactions) {
        // Remote file already exists; merge or update
        info('Drive connected', `Found existing database in Executive_Dashboard_Data folder`);
      } else {
        // Upload initial
        await googleDriveService.syncDatabaseToDrive(token, database);
      }

      setSyncState('synced');
      setLastSyncedAt(new Date().toISOString());
      success('Connected to Google Drive', `Synced with ${userInfo.email}`);
    } catch (err: any) {
      console.error('Drive connection error:', err);
      setSyncState('error');
      updateDbAndPersist((prev) => ({
        ...prev,
        driveConfig: {
          ...prev.driveConfig,
          isConnected: false,
          lastError: err?.message || 'Connection failed',
        },
      }));
      error('Google Drive Connection Failed', err?.message || 'Check client ID and authorized origins');
    }
  }, [database, updateDbAndPersist, success, error, info]);

  const disconnectGoogleDrive = useCallback(() => {
    googleDriveService.clearSession();
    updateDbAndPersist((prev) => ({
      ...prev,
      driveConfig: {
        ...prev.driveConfig,
        isConnected: false,
        userEmail: undefined,
        userName: undefined,
        userPicture: undefined,
      },
    }));
    setSyncState('local_only');
    info('Disconnected from Google Drive', 'Local storage active');
  }, [updateDbAndPersist, info]);

  const syncNowToDrive = useCallback(async () => {
    const token = googleDriveService.getAccessToken();
    if (!token) {
      // Prompt reconnect
      await connectGoogleDrive();
      return;
    }

    setSyncState('syncing');
    try {
      const res = await googleDriveService.syncDatabaseToDrive(token, database);
      setSyncState('synced');
      setLastSyncedAt(res.timestamp);
      success('Drive Sync Complete', `Saved to personal_executive_dashboard_db.json`);
    } catch (err: any) {
      console.error('Manual sync error:', err);
      setSyncState('error');
      error('Drive Sync Error', err?.message || 'Could not upload to Google Drive');
    }
  }, [database, connectGoogleDrive, success, error]);

  const pullFromDrive = useCallback(async () => {
    const token = googleDriveService.getAccessToken();
    if (!token) {
      error('Not Connected', 'Please connect to Google Drive first');
      return;
    }

    setSyncState('syncing');
    try {
      const remoteDb = await googleDriveService.downloadDatabaseFromDrive(token);
      if (remoteDb && remoteDb.accounts) {
        setDatabase(remoteDb);
        storageService.saveDatabase(remoteDb);
        setSyncState('synced');
        setLastSyncedAt(new Date().toISOString());
        success('Pulled from Drive', 'Local dashboard updated with master cloud copy');
      } else {
        info('No Remote Data', 'No database file found on Google Drive yet. Uploading local state...');
        await googleDriveService.syncDatabaseToDrive(token, database);
        setSyncState('synced');
      }
    } catch (err: any) {
      setSyncState('error');
      error('Drive Download Failed', err?.message || 'Failed to download from Drive');
    }
  }, [database, success, error, info]);

  // BACKUP & RESET
  const resetToDemoData = useCallback(() => {
    const demo = storageService.resetToDemo();
    setDatabase(demo);
    success('Demo Data Restored', 'Realistic executive sample data loaded');
  }, [success]);

  const clearAllData = useCallback(() => {
    const empty = storageService.clearAllData();
    setDatabase(empty);
    info('Database Cleared', 'All records wiped');
  }, [info]);

  const exportDatabase = useCallback(() => {
    storageService.exportDatabaseJSON(database);
    success('Backup Exported', 'personal_executive_dashboard_db.json saved to your device');
  }, [database, success]);

  const importDatabase = useCallback(
    async (file: File) => {
      try {
        const loaded = await storageService.importDatabaseJSON(file);
        setDatabase(loaded);
        success('Database Imported', 'Master database successfully restored');
      } catch (err: any) {
        error('Import Failed', err?.message || 'File is corrupted or invalid');
      }
    },
    [success, error]
  );

  return (
    <DashboardContext.Provider
      value={{
        database,
        syncState,
        lastSyncedAt,
        isRefreshingPrices,
        addTransaction,
        editTransaction,
        deleteTransaction,
        addAccount,
        editAccount,
        deleteAccount,
        addCategory,
        editCategory,
        deleteCategory,
        addAsset,
        editAsset,
        deleteAsset,
        updateAssetPriceManual,
        refreshLivePrices,
        addTask,
        editTask,
        deleteTask,
        toggleTaskStatus,
        updateTaskStatus,
        addTaskWorkspace,
        updateSettings,
        updateDriveConfig,
        connectGoogleDrive,
        disconnectGoogleDrive,
        syncNowToDrive,
        pullFromDrive,
        resetToDemoData,
        clearAllData,
        exportDatabase,
        importDatabase,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
