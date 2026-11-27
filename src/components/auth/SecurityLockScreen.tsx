import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
  AlertTriangle,
  Eye,
  EyeOff,
  UserCheck,
  Fingerprint,
  Clock,
} from 'lucide-react';
import { Button } from '../common/Button';

interface SecurityLockScreenProps {
  onUnlock: () => void;
}

const STORAGE_KEY_FAILED_ATTEMPTS = 'exec_lock_failed_attempts';
const STORAGE_KEY_SUSPENDED_UNTIL = 'exec_lock_suspended_until';
const MAX_FAILED_ATTEMPTS = 3;
const SUSPENSION_DURATION_MS = 5 * 60 * 1000; // 5 minutes

export const SecurityLockScreen: React.FC<SecurityLockScreenProps> = ({ onUnlock }) => {
  const { database } = useDashboard();
  const security = database.settings.security || {
    isSecurityEnabled: true,
    masterPin: '8888',
    authorizedEmail: '',
    autoLockMinutes: 15,
  };

  const localMasterPin = typeof window !== 'undefined' ? localStorage.getItem('executive_master_pin') : null;
  const expectedPin = localMasterPin || security.masterPin || '8888';

  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_FAILED_ATTEMPTS);
    return saved ? parseInt(saved, 10) : 0;
  });

  // Calculate initial remaining suspension time (if any)
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => {
    const suspendedUntilStr = localStorage.getItem(STORAGE_KEY_SUSPENDED_UNTIL);
    if (!suspendedUntilStr) return 0;
    const suspendedUntil = parseInt(suspendedUntilStr, 10);
    const diff = Math.ceil((suspendedUntil - Date.now()) / 1000);
    return diff > 0 ? diff : 0;
  });

  const isSuspended = remainingSeconds > 0;
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when not suspended
  useEffect(() => {
    if (!isSuspended) {
      inputRef.current?.focus();
    }
  }, [isSuspended]);

  // Countdown timer for 5-minute suspension
  useEffect(() => {
    if (!isSuspended) return;

    const interval = setInterval(() => {
      const suspendedUntilStr = localStorage.getItem(STORAGE_KEY_SUSPENDED_UNTIL);
      if (!suspendedUntilStr) {
        setRemainingSeconds(0);
        return;
      }

      const suspendedUntil = parseInt(suspendedUntilStr, 10);
      const diff = Math.ceil((suspendedUntil - Date.now()) / 1000);

      if (diff <= 0) {
        // Cooldown period expired: reset suspension and failed attempts
        localStorage.removeItem(STORAGE_KEY_SUSPENDED_UNTIL);
        localStorage.setItem(STORAGE_KEY_FAILED_ATTEMPTS, '0');
        setAttempts(0);
        setRemainingSeconds(0);
        setErrorMessage(null);
      } else {
        setRemainingSeconds(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isSuspended]);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (isSuspended) return;

    if (pin.trim() === expectedPin) {
      // Clear suspension and failed attempts
      localStorage.removeItem(STORAGE_KEY_FAILED_ATTEMPTS);
      localStorage.removeItem(STORAGE_KEY_SUSPENDED_UNTIL);
      setAttempts(0);
      setErrorMessage(null);

      // Mark unlocked in sessionStorage
      sessionStorage.setItem('executive_os_unlocked', 'true');
      sessionStorage.setItem('executive_os_last_active', Date.now().toString());
      onUnlock();
    } else {
      const newAttempts = attempts + 1;
      setPin('');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);

      if (newAttempts >= MAX_FAILED_ATTEMPTS) {
        // Trigger 5-minute lockout
        const suspendUntil = Date.now() + SUSPENSION_DURATION_MS;
        localStorage.setItem(STORAGE_KEY_SUSPENDED_UNTIL, suspendUntil.toString());
        localStorage.setItem(STORAGE_KEY_FAILED_ATTEMPTS, newAttempts.toString());
        setAttempts(newAttempts);
        setRemainingSeconds(Math.ceil(SUSPENSION_DURATION_MS / 1000));
        setErrorMessage(
          '⛔ Akses Ditangguhkan: Salah memasukkan passcode 3 kali. Terminal dikunci selama 5 menit demi keamanan.'
        );
      } else {
        // Still has attempts left
        localStorage.setItem(STORAGE_KEY_FAILED_ATTEMPTS, newAttempts.toString());
        setAttempts(newAttempts);
        const remainingTries = MAX_FAILED_ATTEMPTS - newAttempts;
        setErrorMessage(
          `Passcode Salah! Sisa percobaan: ${remainingTries}x lagi sebelum terminal ditangguhkan 5 menit.`
        );
      }
    }
  };

  const handleQuickFillDefault = () => {
    if (isSuspended) return;
    setPin(expectedPin);
    setErrorMessage(null);
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const userInitials = database.settings.userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div className="fixed inset-0 z-50 bg-[#080A10] flex items-center justify-center p-4 selection:bg-[#F59E0B]/30 selection:text-[#F3F4F6]">
      {/* Ambient Radial Mesh Lighting */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[500px] bg-gradient-to-b from-[#F59E0B]/10 via-[#8B5CF6]/10 to-transparent blur-3xl opacity-60" />
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-gradient-to-t from-[#00D68F]/10 via-transparent to-transparent blur-3xl opacity-50" />
      </div>

      {/* Main Lock Card */}
      <div
        className={`relative w-full max-w-md bg-[#0D111A]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/80 card-rim transition-all ${
          isShaking ? 'animate-bounce border-rose-500/50' : ''
        }`}
      >
        {/* Top Executive Header */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F59E0B]/20 to-[#8B5CF6]/20 border border-white/10 mb-4 shadow-lg shadow-[#F59E0B]/10">
            <Lock className="w-8 h-8 text-[#F59E0B]" />
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
            Executive Terminal
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Personal Finance, Investment & Operational Command
          </p>
        </div>

        {/* 5-Minute Suspension Warning Banner */}
        {isSuspended && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 to-red-900/20 border border-rose-500/30 text-rose-300 shadow-lg shadow-rose-950/50">
            <div className="flex items-center space-x-2.5 mb-1.5 font-bold text-sm text-rose-200">
              <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0 animate-pulse" />
              <span>Akses Ditangguhkan (Suspended)</span>
            </div>
            <p className="text-xs text-rose-300/90 leading-relaxed">
              Anda salah memasukkan passcode 3 kali. Demi perlindungan keamanan data, terminal dikunci selama 5 menit.
            </p>
            <div className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-black/50 border border-rose-500/20 font-mono">
              <div className="flex items-center space-x-2 text-xs text-rose-300">
                <Clock className="w-3.5 h-3.5 text-rose-400 animate-spin" />
                <span>Sisa Waktu Penangguhan:</span>
              </div>
              <span className="text-lg font-black text-rose-400 tracking-widest">
                {formatCountdown(remainingSeconds)}
              </span>
            </div>
          </div>
        )}

        {/* Authorized User Profile Badge */}
        <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-[#101522] border border-white/[0.06] mb-6">
          {database.settings.userAvatar ? (
            <img
              src={database.settings.userAvatar}
              alt={database.settings.userName}
              className="w-11 h-11 rounded-xl object-cover ring-2 ring-white/10 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#10B981] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-extrabold text-sm ring-2 ring-white/10 shadow-md flex-shrink-0">
              {userInitials}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-[#F3F4F6] truncate">
                {database.settings.userName}
              </span>
              <UserCheck className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
            </div>
            <p className="text-[11px] text-[#9CA3AF] truncate">{database.settings.userRole}</p>
            {security.authorizedEmail && (
              <p className="text-[10px] text-amber-400/90 font-mono truncate mt-0.5">
                {security.authorizedEmail}
              </p>
            )}
          </div>
        </div>

        {/* Passcode Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-[#9CA3AF] flex items-center space-x-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span>Enter Master Passcode</span>
              </label>

              {/* Default Hint for immediate onboarding */}
              {expectedPin === '8888' && !isSuspended && (
                <button
                  type="button"
                  onClick={handleQuickFillDefault}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-medium underline"
                >
                  Use Default (8888)
                </button>
              )}
            </div>

            <div className="relative">
              <input
                ref={inputRef}
                type={showPin ? 'text' : 'password'}
                value={pin}
                disabled={isSuspended}
                onChange={(e) => setPin(e.target.value)}
                placeholder={isSuspended ? 'Terkunci 5 Menit' : '••••••••'}
                className={`w-full bg-[#131722] border rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-mono font-bold text-[#F3F4F6] placeholder-slate-600 focus:outline-none transition-all shadow-inner ${
                  isSuspended
                    ? 'border-rose-500/30 opacity-50 cursor-not-allowed bg-rose-950/10'
                    : 'border-white/[0.08] focus:border-[#F59E0B]/60'
                }`}
                autoComplete="current-password"
                maxLength={20}
              />
              {!isSuspended && (
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                  title={showPin ? 'Hide PIN' : 'Show PIN'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>

            {errorMessage && !isSuspended && (
              <div className="flex items-center space-x-1.5 mt-2 text-rose-400 text-xs font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}
          </div>

          {/* Unlock Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={isSuspended || !pin.trim()}
            className={`w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold tracking-wide shadow-md ${
              isSuspended
                ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-400'
                : 'shadow-amber-500/20'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>{isSuspended ? `Terkunci (${formatCountdown(remainingSeconds)})` : 'Unlock Dashboard'}</span>
          </Button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-[#64748B] flex items-center justify-center space-x-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
            <span>Rate-limiting &amp; 5-min lockout active (3x wrong attempt)</span>
          </p>
        </div>
      </div>
    </div>
  );
};
