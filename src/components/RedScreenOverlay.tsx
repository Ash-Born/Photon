import React from 'react';
import { useSentinel } from '../context/SentinelContext';
import { ShieldAlert, AlertOctagon, ArrowLeft, ExternalLink, Zap } from 'lucide-react';

export const RedScreenOverlay: React.FC = () => {
  const { redScreenThreat, clearRedScreen, currentTier } = useSentinel();

  if (!redScreenThreat) return null;

  const getThreatTitle = () => {
    switch (redScreenThreat.threatType.toLowerCase()) {
      case 'phishing':
        return '🚨 PHISHING ATTACK INTERCEPTED!';
      case 'malware':
        return '🚨 DANGEROUS MALWARE DETECTED!';
      case 'ransomware':
        return '🔒 RANSOMWARE PAYLOAD BLOCKED!';
      case 'mitm':
        return '🌐 MAN-IN-THE-MIDDLE (MITM) SPOOFING DETECTED!';
      default:
        return '🚨 CRITICAL CYBER THREAT BLOCKED!';
    }
  };

  const getThreatDescription = () => {
    switch (redScreenThreat.threatType.toLowerCase()) {
      case 'phishing':
        return 'This URL matches a high-confidence fraudulent credential harvesting domain designed to steal your logins and financial data.';
      case 'malware':
        return 'The executable file or page attempted to execute a packed Trojan or high-entropy malicious PE payload.';
      case 'ransomware':
        return 'ZENITH ransomware shield detected suspicious file-renaming and unauthorized encryption API triggers.';
      case 'mitm':
        return 'SSL certificate signature mismatch detected. An unauthorized third party may be sniffing or modifying network traffic.';
      default:
        return 'High severity threat detected by ZENITH multi-engine security guard.';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gradient-to-br from-rose-950/95 via-rose-900/90 to-black/95 backdrop-blur-2xl animate-fadeIn">
      
      {/* Background Animated Pulse Effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-600/20 via-transparent to-transparent animate-pulse pointer-events-none" />

      <div className="w-full max-w-2xl bg-black/80 border-2 border-rose-500 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-rose-600/40 relative text-center text-white space-y-6">
        
        {/* Danger Header Icon */}
        <div className="inline-flex p-4 rounded-3xl bg-rose-500/20 border border-rose-500/50 shadow-inner text-rose-500 animate-bounce">
          <ShieldAlert className="w-16 h-16 sm:w-20 sm:h-20" />
        </div>

        {/* Title */}
        <div>
          <span className="text-xs font-mono font-bold tracking-widest text-rose-400 uppercase bg-rose-950 px-3 py-1 rounded-full border border-rose-800">
            ZENITH SHIELD INTERCEPTION • SEVERITY {redScreenThreat.severity}%
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-3 text-rose-100 tracking-tight">
            {getThreatTitle()}
          </h1>
        </div>

        {/* Threat URL Details Card */}
        <div className="bg-rose-950/60 border border-rose-800/80 rounded-2xl p-4 text-left font-mono text-xs space-y-2">
          <div className="flex items-center justify-between text-rose-300 font-bold border-b border-rose-900/60 pb-2">
            <span>TARGET THREAT URI</span>
            <span className="text-rose-400 bg-rose-900/40 px-2 py-0.5 rounded text-[10px]">{redScreenThreat.threatType.toUpperCase()}</span>
          </div>
          <div className="text-rose-200 break-all bg-black/40 p-2.5 rounded-lg border border-rose-900">
            {redScreenThreat.url}
          </div>
          {redScreenThreat.details && (
            <p className="text-slate-300 font-sans text-xs mt-1">
              <strong className="text-rose-400">Analysis: </strong>{redScreenThreat.details}
            </p>
          )}
        </div>

        {/* Description Text */}
        <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
          {getThreatDescription()} Access to this address has been blocked to protect your identity, passwords, and local files.
        </p>

        {/* Security Recommendations & Action Buttons */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          
          <button
            onClick={clearRedScreen}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Safety (Recommended)</span>
          </button>

          {(currentTier === 'pro' || currentTier === 'enterprise' || currentTier === 'super_admin') ? (
            <button
              onClick={clearRedScreen}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-900 border border-rose-800/80 hover:bg-rose-950/40 text-rose-300 font-medium text-xs flex items-center justify-center gap-1.5 transition-all opacity-80 hover:opacity-100"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Bypass & Continue (Unsafe)</span>
            </button>
          ) : (
            <div className="text-[11px] text-slate-400 flex items-center gap-1 bg-black/40 px-3 py-2 rounded-xl border border-slate-800">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>Unsafe Bypass requires Pro/Enterprise Tier</span>
            </div>
          )}

        </div>

        {/* Footer Note */}
        <div className="text-[10px] text-slate-500 flex items-center justify-center gap-2">
          <AlertOctagon className="w-3 h-3 text-rose-400" />
          <span>Logged in ZENITH Threat Database at {new Date().toLocaleTimeString()}</span>
        </div>

      </div>
    </div>
  );
};
