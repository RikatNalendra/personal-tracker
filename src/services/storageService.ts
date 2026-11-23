import { MasterDatabaseSchema } from '../types/database';
import { INITIAL_DATABASE } from '../data/initialData';

const STORAGE_KEY = 'personal_executive_dashboard_master_db_v1';

export const storageService = {
  loadDatabase(): MasterDatabaseSchema {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Save initial database on first load
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
        return INITIAL_DATABASE;
      }
      const parsed = JSON.parse(stored) as MasterDatabaseSchema;
      // Merge with default schema structure in case fields were added
      return {
        ...INITIAL_DATABASE,
        ...parsed,
        settings: {
          ...INITIAL_DATABASE.settings,
          ...(parsed.settings || {}),
        },
        driveConfig: {
          ...INITIAL_DATABASE.driveConfig,
          ...(parsed.driveConfig || {}),
        },
      };
    } catch (e) {
      console.error('Error loading database from localStorage:', e);
      return INITIAL_DATABASE;
    }
  },

  saveDatabase(data: MasterDatabaseSchema): void {
    try {
      const updatedData: MasterDatabaseSchema = {
        ...data,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    } catch (e) {
      console.error('Error saving database to localStorage:', e);
    }
  },

  exportDatabaseJSON(data: MasterDatabaseSchema, filename: string = 'personal_executive_dashboard_db.json'): void {
    try {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Error exporting database JSON:', e);
      throw e;
    }
  },

  async importDatabaseJSON(file: File): Promise<MasterDatabaseSchema> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string;
          const parsed = JSON.parse(content) as MasterDatabaseSchema;
          if (!parsed.accounts || !parsed.categories || !parsed.transactions || !parsed.assets || !parsed.tasks) {
            throw new Error('Invalid database format: Missing essential collections');
          }
          storageService.saveDatabase(parsed);
          resolve(parsed);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  },

  resetToDemo(): MasterDatabaseSchema {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
    return INITIAL_DATABASE;
  },

  clearAllData(): MasterDatabaseSchema {
    const blankDb: MasterDatabaseSchema = {
      ...INITIAL_DATABASE,
      accounts: [],
      transactions: [],
      assets: [],
      tasks: [],
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blankDb));
    return blankDb;
  },
};
