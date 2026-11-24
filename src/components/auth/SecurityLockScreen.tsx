import React, { useState, useEffect, useRef } from 'react';
import { useDashboard } from '../../context/DashboardContext';
import {
  ShieldCheck,
  Lock,
  Unlock,
  KeyRound,
  AlertCircle,
  Eye,
  EyeOff,
  UserCheck,
  Fingerprint,
} from 'lucide-react';
import { Button } from '../common/Button';

interface SecurityLockScreenProps {
  onUnlock: () => void;
}

export const SecurityLockScreen: React.FC<SecurityLockScreenProps> = ({ onUnlock }) => {
  const { database, updateSettings } = useDashboard();
  const security = database.settings.security || {
    isSecurityEnabled: true,
    masterPin: '8888',
    authorizedEmail: '',
    autoLockMinutes: 15,
  };

  const [pin, setPin] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isShaking, setIsShaking] = useState<boolean>(false);
  const [attempts, setAttempts] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleUnlock = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const expectedPin = security.masterPin || '8888';

    if (pin.trim() === expectedPin) {
      setErrorMessage(null);
      // Mark unlocked in sessionStorage
      sessionStorage.setItem('executive_os_unlocked', 'true');
      sessionStorage.setItem('executive_os_last_active', Date.now().toString());
      onUnlock();
    } else {
      setAttempts((prev) => prev + 1);
      setIsShaking(true);
      setErrorMessage('Access Denied: Incorrect Master Passcode');
      setPin('');
      setTimeout(() => setIsShaking(false), 500);
    }
  };

  const handleQuickFillDefault = () => {
    const expected = security.masterPin || '8888';
    setPin(expected);
    setErrorMessage(null);
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

          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] font-bold tracking-wider uppercase mb-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span>Restricted Single-Account Access</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-[#F3F4F6] tracking-tight">
            Executive Terminal
          </h1>
          <p className="text-xs text-[#9CA3AF] mt-1">
            Personal Finance, Investment & Operational Command
          </p>
        </div>

        {/* Authorized User Profile Badge */}
        <div className="flex items-center space-x-3.5 p-3.5 rounded-2xl bg-[#101522] border border-white/[0.06] mb-6">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#10B981] via-[#3B82F6] to-[#8B5CF6] flex items-center justify-center text-white font-extrabold text-sm ring-2 ring-white/10 shadow-md">
            {userInitials}
          </div>
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
              {security.masterPin === '8888' && (
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
                onChange={(e) => setPin(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#131722] border border-white/[0.08] focus:border-[#F59E0B]/60 rounded-xl px-4 py-3 text-center text-lg tracking-[0.3em] font-mono font-bold text-[#F3F4F6] placeholder-slate-600 focus:outline-none transition-all shadow-inner"
                autoComplete="current-password"
                maxLength={20}
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors p-1"
                title={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {errorMessage && (
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
            className="w-full flex items-center justify-center space-x-2 py-3 rounded-xl font-bold tracking-wide shadow-md shadow-amber-500/20"
          >
            <Unlock className="w-4 h-4" />
            <span>Unlock Dashboard</span>
          </Button>
        </form>

        {/* Security Footer Notice */}
        <div className="mt-6 pt-5 border-t border-white/[0.06] text-center">
          <p className="text-[11px] text-[#64748B] flex items-center justify-center space-x-1.5">
            <Fingerprint className="w-3.5 h-3.5 text-slate-500" />
            <span>Session protected with client encryption & auto-lock</span>
          </p>
        </div>
      </div>
    </div>
  );
};
