import { MasterDatabaseSchema } from '../types/database';
import { INITIAL_DATABASE, SAMPLE_DEMO_DATABASE } from '../data/initialData';

const STORAGE_KEY = 'personal_executive_dashboard_master_db_v2';
const LEGACY_STORAGE_KEY = 'personal_executive_dashboard_master_db_v1';

export const storageService = {
  loadDatabase(): MasterDatabaseSchema {
    try {
      // Clean up legacy demo data storage key if present
      if (localStorage.getItem(LEGACY_STORAGE_KEY)) {
        localStorage.removeItem(LEGACY_STORAGE_KEY);
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Save clean initial database on first load
        localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
        return INITIAL_DATABASE;
      }
      const parsed = JSON.parse(stored) as MasterDatabaseSchema;
      return {
        ...INITIAL_DATABASE,
        ...parsed,
        settings: {
          ...INITIAL_DATABASE.settings,
          ...(parsed.settings || {}),
          security: {
            isSecurityEnabled: parsed.settings?.security?.isSecurityEnabled ?? INITIAL_DATABASE.settings.security?.isSecurityEnabled ?? true,
            masterPin: parsed.settings?.security?.masterPin || INITIAL_DATABASE.settings.security?.masterPin || '8888',
            authorizedEmail: parsed.settings?.security?.authorizedEmail ?? INITIAL_DATABASE.settings.security?.authorizedEmail ?? '',
            autoLockMinutes: parsed.settings?.security?.autoLockMinutes ?? INITIAL_DATABASE.settings.security?.autoLockMinutes ?? 15,
          },
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DEMO_DATABASE));
    return SAMPLE_DEMO_DATABASE;
  },

  clearAllData(): MasterDatabaseSchema {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DATABASE));
    return INITIAL_DATABASE;
  },
};
