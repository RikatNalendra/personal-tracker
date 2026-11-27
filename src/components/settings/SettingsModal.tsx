import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useDashboard } from '../../context/DashboardContext';
import { marketPriceService } from '../../services/marketPriceService';
import { googleSheetsService } from '../../services/googleSheetsService';
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
  FileSpreadsheet,
  Check,
  Send,
  Camera,
  AlertTriangle,
} from 'lucide-react';
import { GoogleDriveGuideModal } from './GoogleDriveGuideModal';
import { GoogleSheetsGuideModal } from './GoogleSheetsGuideModal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const {
    database,
    syncState,
    lastSyncedAt,
    sheetsSyncState,
    lastSheetsSyncedAt,
    updateSettings,
    updateDriveConfig,
    updateSheetsConfig,
    syncNowToSheets,
    pullFromSheets,
    connectGoogleDrive,
    disconnectGoogleDrive,
    syncNowToDrive,
    pullFromDrive,
    exportDatabase,
    importDatabase,
    resetToDemoData,
    clearAllData,
  } = useDashboard();

  const [activeTab, setActiveTab] = useState<'sheets' | 'drive' | 'general' | 'security' | 'backup'>('sheets');
  const [sheetsWebhookInput, setSheetsWebhookInput] = useState<string>(
    database.sheetsConfig?.webhookUrl || ''
  );
  const [sheetsAutoSyncInput, setSheetsAutoSyncInput] = useState<boolean>(
    database.sheetsConfig?.autoSync ?? true
  );
  const [isTestingSheets, setIsTestingSheets] = useState<boolean>(false);
  const [isSyncingSheets, setIsSyncingSheets] = useState<boolean>(false);
  const [isPullingSheets, setIsPullingSheets] = useState<boolean>(false);
  const [sheetsMessage, setSheetsMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSheetsGuideOpen, setIsSheetsGuideOpen] = useState<boolean>(false);

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
  const [masterPinInput, setMasterPinInput] = useState<string>(() => {
    return (typeof window !== 'undefined' && localStorage.getItem('executive_master_pin')) ||
      database.settings.security?.masterPin ||
      '8888';
  });
  const [pinError, setPinError] = useState<string | null>(null);
  const [userAvatarInput, setUserAvatarInput] = useState<string>(
    database.settings.userAvatar || ''
  );
  const [avatarError, setAvatarError] = useState<string | null>(null);
  const [isProcessingAvatar, setIsProcessingAvatar] = useState<boolean>(false);
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
      setSheetsWebhookInput(database.sheetsConfig?.webhookUrl || '');
      setSheetsAutoSyncInput(database.sheetsConfig?.autoSync ?? true);
      setSheetsMessage(null);
      setClientIdInput(database.driveConfig.clientId || '');
      setUsdRateInput(database.settings.usdToIdrRate.toString());
      setUserNameInput(database.settings.userName);
      setUserRoleInput(database.settings.userRole);
      setFinnhubApiKeyInput(database.settings.finnhubApiKey || '');
      setAutoRefreshIntervalInput(database.settings.autoRefreshPricesIntervalMinutes || 0);
      setIsSecurityEnabledInput(database.settings.security?.isSecurityEnabled ?? true);
      const activePin = (typeof window !== 'undefined' && localStorage.getItem('executive_master_pin')) ||
        database.settings.security?.masterPin ||
        '8888';
      setMasterPinInput(activePin);
      setPinError(null);
      setUserAvatarInput(database.settings.userAvatar || '');
      setAvatarError(null);
      setAuthorizedEmailInput(database.settings.security?.authorizedEmail || '');
      setAutoLockMinutesInput(database.settings.security?.autoLockMinutes ?? 15);
      setSecuritySuccess(null);
    }
  }, [isOpen, database.settings, database.driveConfig.clientId, database.sheetsConfig]);

  const handleSaveSheetsConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUrl = sheetsWebhookInput.trim();
    updateSheetsConfig({
      webhookUrl: cleanUrl,
      isConfigured: !!cleanUrl,
      autoSync: sheetsAutoSyncInput,
    });
    setSheetsMessage({ text: 'Pengaturan Google Sheets berhasil disimpan!', isError: false });
    setTimeout(() => setSheetsMessage(null), 3000);
  };

  const handleTestSheets = async () => {
    const cleanUrl = sheetsWebhookInput.trim();
    if (!cleanUrl) {
      setSheetsMessage({ text: 'Masukkan URL Webhook terlebih dahulu', isError: true });
      return;
    }
    setIsTestingSheets(true);
    setSheetsMessage(null);
    try {
      const res = await googleSheetsService.testConnection(cleanUrl);
      setSheetsMessage({ text: res.message, isError: !res.success });
      if (res.success) {
        updateSheetsConfig({
          webhookUrl: cleanUrl,
          isConfigured: true,
          autoSync: sheetsAutoSyncInput,
        });
      }
    } catch (err: any) {
      setSheetsMessage({ text: err?.message || 'Gagal terhubung ke Google Sheets', isError: true });
    } finally {
      setIsTestingSheets(false);
    }
  };

  const handleSyncSheetsNow = async () => {
    setIsSyncingSheets(true);
    setSheetsMessage(null);
    try {
      const ok = await syncNowToSheets();
      if (ok) {
        setSheetsMessage({
          text: `Berhasil menyinkronkan seluruh data ke Google Sheets!`,
          isError: false,
        });
      }
    } catch (err: any) {
      setSheetsMessage({ text: err?.message || 'Sinkronisasi gagal', isError: true });
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handlePullSheetsNow = async () => {
    setIsPullingSheets(true);
    setSheetsMessage(null);
    try {
      const ok = await pullFromSheets(false);
      if (ok) {
        setSheetsMessage({
          text: `Berhasil memuat seluruh data dari Google Sheets ke perangkat ini!`,
          isError: false,
        });
      }
    } catch (err: any) {
      setSheetsMessage({ text: err?.message || 'Gagal memuat data dari Google Sheets', isError: true });
    } finally {
      setIsPullingSheets(false);
    }
  };

  const handleSaveDriveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateDriveConfig({
      clientId: clientIdInput.trim(),
    });
  };

  const handleAvatarFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setAvatarError('Harap pilih file gambar (JPG, PNG, atau WebP)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAvatarError('Ukuran file maksimal 10MB');
      return;
    }

    setIsProcessingAvatar(true);
    setAvatarError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const maxDim = 256;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('Canvas context not available');
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setUserAvatarInput(compressedDataUrl);
        } catch (err: any) {
          setAvatarError('Gagal memproses gambar: ' + (err?.message || 'Error'));
        } finally {
          setIsProcessingAvatar(false);
        }
      };
      img.onerror = () => {
        setAvatarError('File gambar rusak atau tidak dapat dibaca');
        setIsProcessingAvatar(false);
      };
      img.src = event.target?.result as string;
    };
    reader.onerror = () => {
      setAvatarError('Gagal membaca file gambar');
      setIsProcessingAvatar(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setUserAvatarInput('');
    setAvatarError(null);
  };

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    const rate = parseFloat(usdRateInput);
    if (!isNaN(rate) && rate > 0) {
      updateSettings({
        usdToIdrRate: rate,
        userName: userNameInput.trim(),
        userRole: userRoleInput.trim(),
        userAvatar: userAvatarInput || undefined,
        finnhubApiKey: finnhubApiKeyInput.trim() || undefined,
        autoRefreshPricesIntervalMinutes: autoRefreshIntervalInput,
      });

      // Push updated preferences and photo to Google Sheets backup
      if (database.sheetsConfig?.isConfigured && database.sheetsConfig.webhookUrl) {
        try {
          await syncNowToSheets();
        } catch (err) {
          console.warn('Sheets sync on general save:', err);
        }
      }
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

  const handleDirectSavePasscode = async () => {
    setPinError(null);
    const pinToSave = masterPinInput.trim();

    if (isSecurityEnabledInput) {
      if (pinToSave.length < 4) {
        setPinError('Passcode minimal harus 4 karakter / angka');
        return;
      }
    }

    // Persist immediately in localStorage so lock screen recognizes it instantly
    localStorage.setItem('executive_master_pin', pinToSave);

    updateSettings({
      security: {
        isSecurityEnabled: isSecurityEnabledInput,
        masterPin: pinToSave || '8888',
        authorizedEmail: authorizedEmailInput.trim(),
        autoLockMinutes: autoLockMinutesInput,
      },
    });

    // Reset failed lock attempts and suspension
    localStorage.removeItem('exec_lock_failed_attempts');
    localStorage.removeItem('exec_lock_suspended_until');

    setSecuritySuccess(`Passcode "${pinToSave}" berhasil disimpan! Menyinkronkan ke Google Sheets...`);

    if (database.sheetsConfig?.isConfigured && database.sheetsConfig.webhookUrl) {
      try {
        await syncNowToSheets();
        setSecuritySuccess(`Passcode "${pinToSave}" aktif & dicadangkan ke Google Sheets!`);
      } catch {
        setSecuritySuccess(`Passcode "${pinToSave}" aktif secara lokal!`);
      }
    } else {
      setSecuritySuccess(`Passcode "${pinToSave}" aktif!`);
    }

    setTimeout(() => setSecuritySuccess(null), 4000);
  };

  const handleSaveSecurity = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleDirectSavePasscode();
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
        <div className="flex space-x-1 p-1 bg-[#0E121B] rounded-xl border border-[#1E2433] mb-6 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sheets')}
            className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'sheets'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Google Sheets (Mutasi)</span>
            {database.sheetsConfig?.isConfigured && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('drive')}
            className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'drive'
                ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <Cloud className="w-4 h-4 text-[#00D68F]" />
            <span>Cloud Sync (HP &amp; Laptop)</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'general'
                ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <DollarSign className="w-4 h-4 text-[#10B981]" />
            <span>FX &amp; Preferences</span>
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'security'
                ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <Shield className="w-4 h-4 text-[#8B5CF6]" />
            <span>Security &amp; Gate</span>
          </button>
          <button
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 px-2.5 text-xs font-semibold rounded-lg flex items-center justify-center space-x-1.5 transition-all whitespace-nowrap ${
              activeTab === 'backup'
                ? 'bg-[#1E2433] text-[#F3F4F6] shadow-sm'
                : 'text-[#9CA3AF] hover:text-[#F3F4F6]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#3B82F6]" />
            <span>Backup &amp; Data</span>
          </button>
        </div>

        {/* 0. GOOGLE SHEETS TAB (DATA MUTASI & SALDO LIVE SPREADSHEET) */}
        {activeTab === 'sheets' && (
          <div className="space-y-5">
            {/* Connection Banner */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#171C2A] to-[#131722] border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-[#F3F4F6]">Google Sheets Live Mutation Sync</h4>
                    {database.sheetsConfig?.isConfigured ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Terhubung</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        <span>Belum Dikonfigurasi</span>
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Data mutasi transaksi dan saldo rekening tersimpan rapi langsung di Google Spreadsheet Anda (<strong className="text-emerald-300">rikatnalendra25@gmail.com</strong>). Bebas error 403 Google Verification.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 self-end sm:self-auto flex-shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  disabled={isPullingSheets || !database.sheetsConfig?.webhookUrl}
                  onClick={handlePullSheetsNow}
                  icon={<Download className={`w-3.5 h-3.5 text-emerald-400 ${isPullingSheets ? 'animate-bounce' : ''}`} />}
                  title="Tarik data mutasi & rekening dari Google Sheets ke perangkat ini"
                >
                  {isPullingSheets ? 'Menarik Data...' : 'Tarik dari Sheets (Pull)'}
                </Button>

                <Button
                  variant="emerald"
                  size="sm"
                  type="button"
                  disabled={isSyncingSheets || !database.sheetsConfig?.webhookUrl}
                  onClick={handleSyncSheetsNow}
                  icon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncingSheets ? 'animate-spin' : ''}`} />}
                  title="Kirim data mutasi & rekening saat ini ke Google Sheets"
                >
                  {isSyncingSheets ? 'Menyinkronkan...' : 'Sync ke Sheets (Push)'}
                </Button>
              </div>
            </div>

            {/* Mobile & Laptop Cross-Device Sync Guide Card */}
            <div className="p-3.5 rounded-xl bg-[#131722] border border-emerald-500/20 text-xs space-y-2">
              <div className="flex items-center space-x-2 font-bold text-emerald-300">
                <span>📱</span>
                <span>Cara Sinkronisasi Data Antara Laptop &amp; HP via Google Sheets:</span>
              </div>
              <div className="text-[#9CA3AF] space-y-1 text-[11px] leading-relaxed">
                <p>
                  1. <strong className="text-[#F3F4F6]">Di Laptop:</strong> Klik tombol <span className="text-emerald-400 font-semibold">"Sync ke Sheets (Push)"</span> untuk memastikan seluruh transaksi &amp; rekening terbaru sudah terkirim ke Google Spreadsheet.
                </p>
                <p>
                  2. <strong className="text-[#F3F4F6]">Di HP:</strong> Buka tautan Vercel Anda di browser HP, buka Settings &gt; Google Sheets, lalu klik <span className="text-emerald-400 font-semibold">"Tarik dari Sheets (Pull)"</span>. Semua data akan langsung termuat identik!
                </p>
                <p className="text-[#64748B]">
                  *Catatan: Pastikan kode di Google Apps Script Anda sudah diperbarui dengan versi terbaru agar mendukung pembacaan data ke HP.
                </p>
              </div>
            </div>

            {/* Form Webhook URL */}
            <form onSubmit={handleSaveSheetsConfig} className="space-y-4">
              <div className="p-4 rounded-xl bg-[#131722] border border-[#1E2433] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#F3F4F6] flex items-center space-x-1.5">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    <span>Google Apps Script Webhook URL</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsSheetsGuideOpen(true)}
                    className="text-[11px] font-semibold text-emerald-400 hover:text-emerald-300 hover:underline flex items-center space-x-1"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    <span>Buka Panduan &amp; Salin Kode Script</span>
                  </button>
                </div>

                <div className="flex space-x-2">
                  <input
                    type="url"
                    value={sheetsWebhookInput}
                    onChange={(e) => setSheetsWebhookInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="flex-1 bg-[#171C2A] border border-[#1E2433] focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#F3F4F6] focus:outline-none"
                    required
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    disabled={isTestingSheets || !sheetsWebhookInput.trim()}
                    onClick={handleTestSheets}
                    icon={<Send className={`w-3.5 h-3.5 ${isTestingSheets ? 'animate-pulse' : ''}`} />}
                  >
                    {isTestingSheets ? 'Menguji...' : 'Test Koneksi'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    type="submit"
                  >
                    Simpan
                  </Button>
                </div>
                <p className="text-[10px] text-[#64748B]">
                  Dapatkan URL Webhook ini dalam 1 menit dengan menempelkan script ke menu <strong>Ekstensi &gt; Apps Script</strong> di Google Sheets Anda.
                </p>

                {/* Auto-Sync Toggle */}
                <div className="pt-2 border-t border-[#1E2433] flex items-center justify-between">
                  <div>
                    <label className="text-xs font-semibold text-[#F3F4F6] block">
                      Auto-Sync Live Transaksi
                    </label>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">
                      Kirim otomatis setiap kali Anda mencatat pemasukan, pengeluaran, atau transfer baru.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                    <input
                      type="checkbox"
                      checked={sheetsAutoSyncInput}
                      onChange={(e) => {
                        setSheetsAutoSyncInput(e.target.checked);
                        updateSheetsConfig({ autoSync: e.target.checked });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#1E2433] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>

              {sheetsMessage && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
                    sheetsMessage.isError
                      ? 'bg-red-500/10 border-red-500/20 text-red-400'
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}
                >
                  {sheetsMessage.isError ? (
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span>{sheetsMessage.text}</span>
                </div>
              )}
            </form>

            {/* Quick Action & Helper Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsSheetsGuideOpen(true)}
                className="p-3.5 rounded-xl bg-[#131722] border border-[#1E2433] hover:border-emerald-500/40 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#F3F4F6] group-hover:text-emerald-400">
                    📖 Panduan 4 Langkah &amp; Kode Script
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#64748B] group-hover:text-emerald-400" />
                </div>
                <p className="text-[11px] text-[#9CA3AF]">
                  Buka panduan bergambar untuk menyalin kode Google Apps Script dan deploy Web App.
                </p>
              </button>

              <a
                href="https://sheets.new"
                target="_blank"
                rel="noreferrer"
                className="p-3.5 rounded-xl bg-[#131722] border border-[#1E2433] hover:border-emerald-500/40 text-left transition-all group block"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-[#F3F4F6] group-hover:text-emerald-400">
                    📄 Buat Spreadsheet Baru (sheets.new)
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#64748B] group-hover:text-emerald-400" />
                </div>
                <p className="text-[11px] text-[#9CA3AF]">
                  Buka tab baru di browser Anda untuk membuat spreadsheet kosong di akun Google Anda.
                </p>
              </a>
            </div>

            {/* Live Data Structure Specs */}
            <div className="p-4 rounded-xl bg-[#0E121B] border border-[#1E2433] space-y-2 text-xs">
              <div className="font-semibold text-[#F3F4F6] mb-2 flex items-center space-x-1.5">
                <span>Struktur Sheet yang Otomatis Dibuat di Spreadsheet Anda:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-lg bg-[#131722] border border-[#1E2433]">
                  <strong className="text-emerald-400 block mb-0.5">1. Mutasi Transaksi</strong>
                  <span className="text-[#9CA3AF]">Tanggal, Tipe (Pemasukan/Pengeluaran/Transfer), Kategori, Jumlah (Rp), Rekening Asal &amp; Tujuan, Catatan.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#131722] border border-[#1E2433]">
                  <strong className="text-blue-400 block mb-0.5">2. Rekening &amp; Saldo</strong>
                  <span className="text-[#9CA3AF]">Nama Rekening (BCA, Mandiri, Jago, dll), Tipe, Saldo Terkini, dan Formula Total Liquid Cash.</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#131722] border border-[#1E2433]">
                  <strong className="text-amber-400 block mb-0.5">3. Ringkasan Bulanan</strong>
                  <span className="text-[#9CA3AF]">Total Pemasukan, Total Pengeluaran, dan Net Savings (Tabungan Bersih).</span>
                </div>
                <div className="p-2.5 rounded-lg bg-[#131722] border border-[#1E2433]">
                  <strong className="text-violet-400 block mb-0.5">4. Master Backup JSON</strong>
                  <span className="text-[#9CA3AF]">Snapshot database lengkap untuk cadangan darurat (aman seumur hidup di Google Drive).</span>
                </div>
              </div>
              <div className="pt-2 flex items-center justify-between text-[#64748B] text-[10px]">
                <span>Status Terakhir:</span>
                <span className="font-mono text-emerald-400">
                  {lastSheetsSyncedAt ? new Date(lastSheetsSyncedAt).toLocaleString('id-ID') : (database.sheetsConfig?.lastSyncedAt ? new Date(database.sheetsConfig.lastSyncedAt).toLocaleString('id-ID') : 'Belum pernah disinkronkan')}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* 1. CLOUD SYNC TAB (MULTI-DEVICE LAPTOP & HP) */}
        {activeTab === 'drive' && (
          <div className="space-y-5">
            {/* Active Cloud Status Banner */}
            <div className="p-4 rounded-xl bg-[#171C2A] border border-[#1E2433] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center space-x-3.5">
                <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
                  <Cloud className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-[#F3F4F6]">Cross-Device Cloud Sync</h4>
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Active & Ready</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Data tersinkronisasi otomatis antara <strong>Laptop</strong> dan <strong>HP</strong> tanpa Google Cloud.
                  </p>
                </div>
              </div>

              <div className="flex space-x-2 self-end sm:self-auto">
                <Button variant="outline" size="sm" type="button" onClick={pullFromDrive}>
                  Pull from Cloud
                </Button>
                <Button variant="emerald" size="sm" type="button" onClick={syncNowToDrive}>
                  Sync to Cloud Now
                </Button>
              </div>
            </div>

            {/* HP / Mobile Instructions Card */}
            <div className="p-4 rounded-xl bg-[#131722] border border-white/[0.08] space-y-3">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#F3F4F6]">
                <span className="text-base">📱</span>
                <span>Cara Akses & Sinkronisasi di HP Anda:</span>
              </div>
              <div className="space-y-2 text-xs text-[#9CA3AF]">
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
                  <span>Buka browser di HP Anda dan ketik URL Vercel Anda: <code className="text-[#F59E0B] font-mono font-bold select-all">https://personal-tracker-nu-six.vercel.app</code></span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
                  <span>Masukkan Master PIN Anda (default: <strong className="text-amber-400 font-mono">8888</strong>) pada layar kunci.</span>
                </div>
                <div className="flex items-start space-x-2.5">
                  <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
                  <span>Semua rekening, transaksi, dan tugas Anda langsung muncul. Setiap input dari HP otomatis tersinkronisasi ke Laptop!</span>
                </div>
              </div>
            </div>

            {/* Database Cloud Specs */}
            <div className="p-4 rounded-xl bg-[#0E121B] border border-[#1E2433] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Cloud Storage Target:</span>
                <span className="font-mono text-[#F3F4F6]">personal-tracker (Private GitHub DB)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Master JSON Database File:</span>
                <span className="font-mono text-[#00D68F]">database/cloud_db.json</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#9CA3AF]">Last Synced:</span>
                <span className="text-[#9CA3AF] font-mono">
                  {lastSyncedAt ? new Date(lastSyncedAt).toLocaleString('id-ID') : 'Just now'}
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

            {/* Executive Identity & Photo Upload */}
            <div className="p-4 rounded-xl bg-[#131722] border border-[#1E2433] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#F3F4F6] flex items-center space-x-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>Foto Profil &amp; Identitas Eksekutif</span>
                </label>
                <span className="text-[10px] text-emerald-400 font-medium">Tampil di Layar Kunci &amp; Sidebar</span>
              </div>

              <div className="flex items-center space-x-4">
                <div className="relative flex-shrink-0">
                  {userAvatarInput ? (
                    <img
                      src={userAvatarInput}
                      alt="Profile preview"
                      className="w-16 h-16 rounded-2xl object-cover ring-2 ring-emerald-500/40 shadow-lg shadow-black/40"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#10B981] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-black text-xl ring-2 ring-white/10 shadow-lg">
                      {userNameInput
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .substring(0, 2)
                        .toUpperCase() || 'ED'}
                    </div>
                  )}
                  {isProcessingAvatar && (
                    <div className="absolute inset-0 bg-black/70 rounded-2xl flex items-center justify-center">
                      <RefreshCw className="w-5 h-5 text-emerald-400 animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <label className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold cursor-pointer transition-colors shadow-sm">
                      <Camera className="w-3.5 h-3.5" />
                      <span>{userAvatarInput ? 'Ganti Foto' : 'Upload Foto Profil'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarFileSelect}
                        className="hidden"
                      />
                    </label>

                    {userAvatarInput && (
                      <button
                        type="button"
                        onClick={handleRemoveAvatar}
                        className="inline-flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-medium transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus Foto</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-[#9CA3AF]">
                    Foto otomatis dikompresi agar hemat memori dan tersimpan sinkron di Google Sheets.
                  </p>
                  {avatarError && (
                    <p className="text-[11px] text-rose-400 font-medium">{avatarError}</p>
                  )}
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

            {/* Master Passcode Management */}
            <div className="p-4 rounded-xl bg-[#131722] border border-[#1E2433] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-[#F3F4F6] flex items-center space-x-1.5">
                  <KeyRound className="w-4 h-4 text-[#F59E0B]" />
                  <span>Ganti Master Passcode / PIN Akun</span>
                </label>
                <span className="text-[10px] text-amber-400 font-mono font-semibold">
                  Aktif: {typeof window !== 'undefined' ? (localStorage.getItem('executive_master_pin') || database.settings.security?.masterPin || '8888') : '8888'}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-medium text-[#9CA3AF] mb-1">
                    Passcode Baru (Min. 4 Karakter / Angka)
                  </label>
                  <div className="relative">
                    <input
                      type={showPinInput ? 'text' : 'password'}
                      value={masterPinInput}
                      onChange={(e) => {
                        setMasterPinInput(e.target.value);
                        setPinError(null);
                      }}
                      placeholder="Ketik passcode baru (misal: 2525)..."
                      className="w-full bg-[#171C2A] border border-[#1E2433] focus:border-amber-500/60 rounded-xl px-3.5 py-2.5 text-sm font-mono tracking-wider text-[#F3F4F6] focus:outline-none"
                      required={isSecurityEnabledInput}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinInput(!showPinInput)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1"
                      title={showPinInput ? 'Sembunyikan' : 'Lihat'}
                    >
                      {showPinInput ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={handleDirectSavePasscode}
                  className="py-2.5 px-4 font-bold flex-shrink-0 shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5 mr-1.5" />
                  Simpan Passcode
                </Button>
              </div>

              {pinError && (
                <div className="flex items-center space-x-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Anti-Brute-Force Policy Note */}
              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold text-amber-200">Perlindungan Anti Brute-Force:</strong> Jika salah memasukkan passcode 3 kali berturut-turut di layar kunci terminal, akses akan ditangguhkan (suspend) otomatis selama 5 menit.
                </div>
              </div>

              <p className="text-[10px] text-[#64748B]">
                Setiap kali passcode disimpan, terminal kunci otomatis menggunakan passcode baru dan langsung dicadangkan ke Google Sheets.
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

      {/* Guide Modals */}
      <GoogleDriveGuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <GoogleSheetsGuideModal isOpen={isSheetsGuideOpen} onClose={() => setIsSheetsGuideOpen(false)} />
    </>
  );
};
