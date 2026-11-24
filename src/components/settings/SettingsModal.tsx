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
  Sparkles,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  UserCheck,
  Fingerprint,
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

  const [activeTab, setActiveTab] = useState<'drive' | 'general' | 'security' | 'backup'>('drive');
  const [clientIdInput, setClientIdInput] = useState<string>(database.driveConfig.clientId || '');
  const [usdRateInput, setUsdRateInput] = useState<string>(
    database.settings.usdToIdrRate.toString()
  );
  const [userNameInput, setUserNameInput] = useState<string>(database.settings.userName);
  const [userRoleInput, setUserRoleInput] = useState<string>(database.settings.userRole);
  const [finnhubApiKeyInput, setFinnhubApiKeyInput] = useState<string>(
    database.settings.finnhubApiKey || ''
  );
  const [autoRefreshIntervalInput, setAutoRefreshIntervalInput] = useState<number>(
    database.settings.autoRefreshPricesIntervalMinutes || 0
  );
  const [isSecurityEnabledInput, setIsSecurityEnabledInput] = useState<boolean>(
    database.settings.security?.isSecurityEnabled ?? true
  );
  const [masterPinInput, setMasterPinInput] = useState<string>(
    database.settings.security?.masterPin || '8888'
  );
  const [authorizedEmailInput, setAuthorizedEmailInput] = useState<string>(
    database.settings.security?.authorizedEmail || ''
  );
  const [autoLockMinutesInput, setAutoLockMinutesInput] = useState<number>(
    database.settings.security?.autoLockMinutes ?? 15
  );
  const [showPinInput, setShowPinInput] = useState<boolean>(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isFetchingRate, setIsFetchingRate] = useState<boolean>(false);

  // Sync inputs when modal opens or settings update
  React.useEffect(() => {
    if (isOpen) {
      setClientIdInput(database.driveConfig.clientId || '');
      setUsdRateInput(database.settings.usdToIdrRate.toString());
      setUserNameInput(database.settings.userName);
      setUserRoleInput(database.settings.userRole);
      setFinnhubApiKeyInput(database.settings.finnhubApiKey || '');
      setAutoRefreshIntervalInput(database.settings.autoRefreshPricesIntervalMinutes || 0);
      setIsSecurityEnabledInput(database.settings.security?.isSecurityEnabled ?? true);
      setMasterPinInput(database.settings.security?.masterPin || '8888');
      setAuthorizedEmailInput(database.settings.security?.authorizedEmail || '');
      setAutoLockMinutesInput(database.settings.security?.autoLockMinutes ?? 15);
      setSecuritySuccess(null);
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
        finnhubApiKey: finnhubApiKeyInput.trim() || undefined,
        autoRefreshPricesIntervalMinutes: autoRefreshIntervalInput,
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

  const handleSaveSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSecurityEnabledInput && masterPinInput.trim().length < 4) {
      alert('Master Passcode must be at least 4 characters');
      return;
    }
    updateSettings({
      security: {
        isSecurityEnabled: isSecurityEnabledInput,
        masterPin: masterPinInput.trim(),
        authorizedEmail: authorizedEmailInput.trim(),
        autoLockMinutes: autoLockMinutesInput,
      },
    });
    setSecuritySuccess('Security configuration saved successfully!');
    setTimeout(() => setSecuritySuccess(null), 3000);
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
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center space-x-2 transition-all ${
              activeTab === 'security'
                ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#8B5CF6]" />
            <span>Security & Gate</span>
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
            {/* Live Pricing Architecture Explanation Card */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#171C2A] to-[#131722] border border-[#1E2433] space-y-2.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#F59E0B]">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Live Dollar & Stock Pricing Engine</span>
              </div>
              <p className="text-xs text-[#9CA3AF] leading-relaxed">
                The dashboard automatically synchronizes real-time prices using multiple live data feeds:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#0E121B] border border-[#1E2433]">
                  <span className="font-bold text-emerald-400 block mb-0.5">1. Dollar (USD/IDR)</span>
                  <span className="text-[#9CA3AF]">
                    Live public FX API with automatic IDR re-conversion for all assets.
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0E121B] border border-[#1E2433]">
                  <span className="font-bold text-[#F59E0B] block mb-0.5">2. Crypto (BTC, ETH)</span>
                  <span className="text-[#9CA3AF]">
                    Native real-time CoinGecko public feed with 24h percentage swings.
                  </span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#0E121B] border border-[#1E2433]">
                  <span className="font-bold text-blue-400 block mb-0.5">3. US & IDX Stocks</span>
                  <span className="text-[#9CA3AF]">
                    Live market ticker data + optional free Finnhub real-time API.
                  </span>
                </div>
              </div>
            </div>

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
                  USD / IDR Live Exchange Rate
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
                    Fetch FX
                  </Button>
                </div>
              </div>
            </div>

            {/* Auto-Refresh & Finnhub API Key */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#9CA3AF] mb-1">
                  Price Auto-Refresh Cadence
                </label>
                <select
                  value={autoRefreshIntervalInput}
                  onChange={(e) => setAutoRefreshIntervalInput(parseInt(e.target.value, 10))}
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                >
                  <option value={0}>Manual Only (Click Header Button)</option>
                  <option value={1}>Every 1 Minute (Active Market)</option>
                  <option value={5}>Every 5 Minutes (Recommended)</option>
                  <option value={15}>Every 15 Minutes</option>
                </select>
                <p className="text-[10px] text-[#64748B] mt-1">
                  Automatically updates dollar rate and asset prices in the background.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-[#9CA3AF]">
                    Finnhub Stock API Key (Optional)
                  </label>
                  <a
                    href="https://finnhub.io/"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-[#F59E0B] hover:underline inline-flex items-center space-x-0.5"
                  >
                    <span>Get Free Key</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <input
                  type="text"
                  value={finnhubApiKeyInput}
                  onChange={(e) => setFinnhubApiKeyInput(e.target.value)}
                  placeholder="e.g. cxxxxxxxxxxxx"
                  className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs font-mono text-[#F3F4F6] focus:border-[#F59E0B] focus:outline-none"
                />
                <p className="text-[10px] text-[#64748B] mt-1">
                  Free real-time quotes for US stocks (NVDA, AAPL, MSFT, VOO, TSLA).
                </p>
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

        {/* 3. SECURITY & ACCESS CONTROL TAB */}
        {activeTab === 'security' && (
          <form onSubmit={handleSaveSecurity} className="space-y-4">
            {/* Security Overview Banner */}
            <div className="p-4 rounded-xl bg-[#171C2A] border border-[#1E2433] flex items-start space-x-3.5">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-[#F3F4F6] flex items-center space-x-2">
                  <span>Single-Account Executive Protection</span>
                  <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    PROTECTED
                  </span>
                </h4>
                <p className="text-xs text-[#9CA3AF] mt-1 leading-relaxed">
                  Lock your dashboard behind a Master Passcode and restrict Google Drive cloud synchronization strictly to your verified email account.
                </p>
              </div>
            </div>

            {/* Toggle Master Passcode Protection */}
            <div className="p-4 rounded-xl bg-[#131722] border border-[#1E2433] flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-[#F3F4F6] block">
                  Require Master Passcode on Launch
                </label>
                <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                  Displays the executive lock screen whenever this dashboard is opened in a new tab or browser session.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={isSecurityEnabledInput}
                  onChange={(e) => setIsSecurityEnabledInput(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#1E2433] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8B5CF6]"></div>
              </label>
            </div>

            {/* Master Passcode Input */}
            <div className="p-4 rounded-xl bg-[#131722] border border-[#1E2433] space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#F3F4F6] flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4 text-[#F59E0B]" />
                  <span>Master Passcode / PIN</span>
                </label>
                <span className="text-[10px] text-[#64748B]">Min. 4 characters</span>
              </div>
              <div className="relative">
                <input
                  type={showPinInput ? 'text' : 'password'}
                  value={masterPinInput}
                  onChange={(e) => setMasterPinInput(e.target.value)}
                  placeholder="Set your master passcode..."
                  className="w-full bg-[#171C2A] border border-[#1E2433] focus:border-violet-500/60 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-[#F3F4F6] focus:outline-none"
                  required={isSecurityEnabledInput}
                />
                <button
                  type="button"
                  onClick={() => setShowPinInput(!showPinInput)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                >
                  {showPinInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-[#64748B]">
                Default passcode is <span className="font-mono text-amber-400">8888</span>. You can change it to any PIN or password.
              </p>
            </div>

            {/* Google Drive Account Whitelist */}
            <div className="p-4 rounded-xl bg-[#131722] border border-[#1E2433] space-y-2">
              <label className="text-xs font-semibold text-[#F3F4F6] flex items-center space-x-1.5">
                <UserCheck className="w-4 h-4 text-emerald-400" />
                <span>Authorized Owner Google Account Whitelist</span>
              </label>
              <input
                type="email"
                value={authorizedEmailInput}
                onChange={(e) => setAuthorizedEmailInput(e.target.value)}
                placeholder="e.g. rikatnalendra@gmail.com"
                className="w-full bg-[#171C2A] border border-[#1E2433] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs text-[#F3F4F6] focus:outline-none"
              />
              <p className="text-[10px] text-[#64748B]">
                When set, attempts to connect Google Drive with any other email address will be strictly rejected.
              </p>
            </div>

            {/* Inactivity Auto-Lock Cadence */}
            <div className="p-4 rounded-xl bg-[#131722] border border-[#1E2433] space-y-2">
              <label className="text-xs font-semibold text-[#F3F4F6] flex items-center space-x-1.5">
                <Fingerprint className="w-4 h-4 text-blue-400" />
                <span>Inactivity Auto-Lock</span>
              </label>
              <select
                value={autoLockMinutesInput}
                onChange={(e) => setAutoLockMinutesInput(parseInt(e.target.value, 10))}
                className="w-full bg-[#171C2A] border border-[#1E2433] rounded-xl px-3 py-2 text-xs text-[#F3F4F6] focus:border-violet-500 focus:outline-none"
              >
                <option value={0}>Disabled (Lock Only via Header Button or Tab Close)</option>
                <option value={5}>Auto-lock after 5 Minutes of Inactivity</option>
                <option value={15}>Auto-lock after 15 Minutes (Recommended)</option>
                <option value={30}>Auto-lock after 30 Minutes</option>
                <option value={60}>Auto-lock after 1 Hour</option>
              </select>
            </div>

            {securitySuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{securitySuccess}</span>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-[#1E2433]">
              <Button variant="primary" size="sm" type="submit">
                Save Security Settings
              </Button>
            </div>
          </form>
        )}

        {/* 4. BACKUP & DATA CONTROLS */}
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
