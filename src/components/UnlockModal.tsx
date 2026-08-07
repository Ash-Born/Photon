import React, { useState } from 'react';
import { useSentinel } from '../context/SentinelContext';
import { X, Key, Lock, CheckCircle, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const UnlockModal: React.FC = () => {
  const { unlockModalOpen, setUnlockModalOpen, unlockWithPassword, currentTier, setCurrentTier } = useSentinel();
  const [passwordInput, setPasswordInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!unlockModalOpen) return null;

  const handleUnlock = (pwdToUse?: string) => {
    const pwd = pwdToUse || passwordInput;
    const result = unlockWithPassword(pwd);
    if (result.success) {
      setFeedback({ type: 'success', message: result.message });
      try {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
      setTimeout(() => {
        setUnlockModalOpen(false);
        setFeedback(null);
        setPasswordInput('');
      }, 1500);
    } else {
      setFeedback({ type: 'error', message: result.message });
    }
  };

  const handleQuickFill = (pwd: string) => {
    setPasswordInput(pwd);
    handleUnlock(pwd);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-md bg-[#0d1222] border border-cyan-500/30 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10 relative">
        
        {/* Close Button */}
        <button
          onClick={() => setUnlockModalOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Access Tier Unlocker</h3>
            <p className="text-xs text-slate-400">Enter system password to elevate permissions</p>
          </div>
        </div>

        {/* Current Active Tier */}
        <div className="mb-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400">Current Access Level:</span>
          <span className="font-bold text-cyan-400 uppercase tracking-wider">{currentTier}</span>
        </div>

        {/* Password Form */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-semibold text-slate-300">Enter Secret Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleUnlock()}
              placeholder="Enter security key"
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
            />
          </div>

          <button
            onClick={() => handleUnlock()}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-lg shadow-cyan-500/20 transition-all"
          >
            Unlock Access Level
          </button>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div className={`mb-4 p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
          }`}>
            {feedback.type === 'success' ? <CheckCircle className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Quick Tier Selection */}
        <div className="border-t border-slate-800 pt-4">
          <p className="text-[11px] font-medium text-slate-400 mb-2">Quick Access Switcher (Requires Password):</p>
          <div className="grid grid-cols-3 gap-2 text-center mb-3">
            
            <button
              onClick={() => handleQuickFill('porosh')}
              className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 text-amber-300 text-center transition-all"
            >
              <div className="font-bold text-xs">PRO TIER</div>
              <div className="text-[10px] text-amber-400/70 font-mono mt-0.5">porosh</div>
            </button>

            <button
              onClick={() => handleQuickFill('saydi20@A')}
              className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-cyan-300 text-center transition-all"
            >
              <div className="font-bold text-xs">ENTERPRISE</div>
              <div className="text-[10px] text-cyan-400/70 font-mono mt-0.5">saydi20@A</div>
            </button>

            <button
              onClick={() => handleQuickFill('zenith')}
              className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 text-center transition-all"
            >
              <div className="font-bold text-xs">SUPER ADMIN</div>
              <div className="text-[10px] text-purple-400/70 font-mono mt-0.5">zenith</div>
            </button>

          </div>

          <button
            onClick={() => {
              setCurrentTier('lite');
              setFeedback({ type: 'success', message: 'Restored to Free Lite Tier' });
              setTimeout(() => {
                setUnlockModalOpen(false);
                setFeedback(null);
              }, 1000);
            }}
            className="w-full py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            ← Reset to Default Free Lite Tier
          </button>
        </div>

      </div>
    </div>
  );
};
