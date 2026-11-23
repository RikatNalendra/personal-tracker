import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useDashboard } from '../../context/DashboardContext';
import { marketPriceService } from '../../services/marketPriceService';
import {
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Upload,
  RotateCcw,
  Trash2,
  ExternalLink,
  DollarSign,
  User,
  Shield,
  Layers,
} from 'lucide-react';
import { GoogleDriveGuideModal } from './GoogleDriveGuideModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    database,
    syncState,
    lastSyncedAt,
    updateSettings,
    updateDriveConfig,
    connectGoogleDrive,
    disconnectGoogleDrive,
    syncNowToDrive,
    pullFromDrive,
    exportDatabase,
    importDatabase,
    resetToDemoData,
    clearAllData,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<'drive' | 'general' | 'backup'>('drive');
  const [clientIdInput, setClientIdInput] = useState<string>(database.driveConfig.clientId || '');
  const [usdRateInput, setUsdRateInput] = useState<string>(
    database.settings.usdToIdrRate.toString()
  );
  const [userNameInput, setUserNameInput] = useState<string>(database.settings.userName);
  const [userRoleInput, setUserRoleInput] = useState<string>(database.settings.userRole);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isFetchingRate, setIsFetchingRate] = useState<boolean>(false);

  // Sync inputs when modal opens or settings update
  React.useEffect(() => {
    if (isOpen) {
      setClientIdInput(database.driveConfig.clientId || '');
      setUsdRateInput(database.settings.usdToIdrRate.toString());
      setUserNameInput(database.settings.userName);
      setUserRoleInput(database.settings.userRole);
    }
  }, [isOpen, database.settings, database.driveConfig.clientId]);

  const handleSaveDriveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateDriveConfig({
      clientId: clientIdInput.trim(),
    });
  };

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(usdRateInput);
    if (!isNaN(rate) && rate > 0) {
      updateSettings({
        usdToIdrRate: rate,
        userName: userNameInput.trim(),
        userRole: userRoleInput.trim(),
      });
    }
  };

  const handleFetchLiveRate = async () => {
    setIsFetchingRate(true);
    try {
      const liveRate = await marketPriceService.fetchLiveExchangeRate();
      setUsdRateInput(liveRate.toString());
      updateSettings({ usdToIdrRate: liveRate });
    } catch (e) {
      console.warn(e);
    } finally {
      setIsFetchingRate(false);
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await importDatabase(file);
      onClose();
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings & System Configuration"
        subtitle="Manage Google Drive cloud sync, currency rates, and master database backup"
        maxWidth="2xl"
      >
        {/* Navigation Tabs */}
        <div className="flex space-x-1 p-1 bg-[#0E121B] rounded-xl border border-[#1E2433] mb-6">
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'drive'
                ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <Cloud className="w-4 h-4 text-[#F59E0B]" />
            <span>Google Drive Sync</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'general'
                ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#10B981]" />
            <span>FX & Preferences</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'backup'
                ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#3B82F6]" />
            <span>Backup & Data</span>
          </button>
        </div>

        {/* 1. GOOGLE DRIVE TAB */}
        {activeTab === 'drive' && (
          <div className="space-y-5">
            {/* Connection Banner */}
            <div className="p-4 rounded-xl bg-[#171C2A] border border-[#1E2433] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-[#1E2433] flex items-center justify-center text-[#F59E0B]">
                  <Cloud className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-[#F3F4F6]">Google Drive Sync Status</h4>
                    {database.driveConfig.isConnected ? (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Connected
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-slate-700/40 text-slate-400 border border-slate-700">
                        Not Connected
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    {database.driveConfig.isConnected && database.driveConfig.userEmail
                      ? `Syncing with account: ${database.driveConfig.userEmail}`
                      : 'Sync directly to your personal Google Drive (drive.file scope)'}
                  </p>
                </div>
              </div>

              {database.driveConfig.isConnected ? (
                <Button variant="coral" size="sm" onClick={disconnectGoogleDrive}>
                  Disconnect
                </Button>
              ) : (
                <Button variant="primary" size="sm" onClick={connectGoogleDrive}>
                  Connect with Google
                </Button>
              )}
            </div>

            {/* Client ID Configuration Form */}
            <form onSubmit={handleSaveDriveConfig} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-[#F3F4F6]">
                    Google Cloud OAuth 2.0 Client ID
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsGuideOpen(true)}
                    className="text-xs text-[#F59E0B] hover:underline inline-flex items-center space-x-1"
                  >
                    <span>How to get a Client ID?</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
                <input
                  type="text"
                  value={clientIdInput}
                  onChange={(e) => setClientIdInput(e.target.value)}
                  placeholder="e.g. 123456789-abcdef.apps.googleusercontent.com"
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                />
                <p className="text-[11px] text-[#64748B] mt-1">
                  Stored securely in your local browser storage. Used only to obtain user-authorized Google Drive tokens.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <Button variant="secondary" size="sm" type="submit">
                  Save Client ID
                </Button>
                {database.driveConfig.isConnected && (
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" type="button" onClick={pullFromDrive}>
                      Pull from Drive
                    </Button>
                    <Button variant="emerald" size="sm" type="button" onClick={syncNowToDrive}>
                      Sync Now
                    </Button>
                  </div>
                )}
              </div>
            </form>

            {/* Folder & Master File Spec */}
            <div className="p-4 rounded-xl bg-[#0E121B] border border-[#1E2433] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Dedicated Drive Folder:</span>
                <span className="font-mono text-[#F3F4F6]">Executive_Dashboard_Data</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Dedicated Master DB File:</span>
                <span className="font-mono text-[#F59E0B]">personal_executive_dashboard_db.json</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Last Synced Timestamp:</span>
                <span className="text-[#9CA3AF]">
                  {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString('id-ID') : 'Never'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 2. GENERAL & FX PREFERENCES */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveGeneral} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                  Default Display Currency
                </label>
                <input
                  type="text"
                  disabled
                  value="IDR (Indonesian Rupiah - Rp)"
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#9CA3AF] cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                  USD / IDR Exchange Rate
                </label>
                <div className="flex space-x-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#9CA3AF]">
                      Rp
                    </span>
                    <input
                      type="number"
                      step="any"
                      required
                      value={usdRateInput}
                      onChange={(e) => setUsdRateInput(e.target.value)}
                      className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl pl-9 pr-3 py-2 text-xs font-mono font-semibold text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={isFetchingRate}
                    onClick={handleFetchLiveRate}
                    icon={<RefreshCw className={`w-3.5 h-3.5 ${isFetchingRate ? 'animate-spin' : ''}`} />}
                  >
                    Live FX
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                  Executive User Name
                </label>
                <input
                  type="text"
                  required
                  value={userNameInput}
                  onChange={(e) => setUserNameInput(e.target.value)}
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">Title / Role</label>
                <input
                  type="text"
                  required
                  value={userRoleInput}
                  onChange={(e) => setUserRoleInput(e.target.value)}
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#1E2433]">
              <Button variant="primary" size="sm" type="submit">
                Save Preferences
              </Button>
            </div>
          </form>
        )}

        {/* 3. BACKUP & DATA CONTROLS */}
        {activeTab === 'backup' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#171C2A] border border-[#1E2433]">
              <h4 className="text-sm font-semibold text-[#F3F4F6] mb-1">Manual JSON Backup & Restore</h4>
              <p className="text-xs text-[#9CA3AF] mb-4">
                Export your entire dashboard database (accounts, budgets, transactions, assets, and tasks) as a portable JSON file, or restore from an existing backup.
              </p>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportDatabase}
                  icon={<Download className="w-4 h-4 text-[#F59E0B]" />}
                >
                  Export JSON Backup
                </Button>

                <label className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl border border-[#1E2433] bg-[#131722]/80 hover:bg-[#1E2433] text-[#F3F4F6] cursor-pointer transition-colors gap-2">
                  <Upload className="w-4 h-4 text-[#3B82F6]" />
                  <span>Import JSON Backup</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Demo & Reset Controls */}
            <div className="p-4 rounded-xl bg-[#171C2A] border border-[#1E2433] space-y-3">
              <h4 className="text-sm font-semibold text-[#F3F4F6]">Demo & Maintenance</h4>
              <p className="text-xs text-[#9CA3AF]">
                Reset your database to pre-populated realistic Indonesian executive demo data, or clear all records.
              </p>

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetToDemoData}
                  icon={<RotateCcw className="w-4 h-4 text-[#10B981]" />}
                >
                  Reload Sample Executive Data
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
                      clearAllData();
                    }
                  }}
                  icon={<Trash2 className="w-4 h-4 text-[#EF4444]" />}
                  className="text-red-400 hover:text-red-300"
                >
                  Clear All Data
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Guide Modal */}
      <GoogleDriveGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
};
