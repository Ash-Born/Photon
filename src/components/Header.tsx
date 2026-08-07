import React from 'react';
import { useSentinel } from '../context/SentinelContext';
import {
  Shield,
  Key,
  MapPin,
  Radio,
  Layers,
  Cpu,
  Newspaper,
  Eye,
  Sliders,
  Power,
  FileText,
  Globe
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    currentTier,
    activeTab,
    setActiveTab,
    isExtensionActive,
    setIsExtensionActive,
    setUnlockModalOpen,
    apiQuota,
    refillApiQuota
  } = useSentinel();

  const getTierBadge = () => {
    switch (currentTier) {
      case 'super_admin':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center gap-1.5 animate-pulse">👑 SUPER ADMIN</span>;
      case 'enterprise':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1.5">🏢 ENTERPRISE</span>;
      case 'pro':
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">⭐ PRO TIER</span>;
      default:
        return <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-700/50 text-slate-300 border border-slate-600/40 flex items-center gap-1.5">FREE LITE</span>;
    }
  };

  const navItems = [
    { id: 'extension_popup', label: 'Popup View', icon: Shield },
    { id: 'threat_activity_log', label: 'Threat Activity Log', icon: FileText },
    { id: 'global_threat_heatmap', label: 'Global Threat Heatmap', icon: Globe },
    { id: 'fake_news_map', label: 'Fake News Regional Map', icon: MapPin },
    { id: 'url_scanner', label: 'URL Threat Inspector', icon: Radio },
    { id: 'malware_analyzer', label: 'ML Malware PE Analyzer', icon: Cpu },
    { id: 'fake_news', label: 'AI Fact-Checker', icon: Newspaper },
    { id: 'deepfake', label: 'Deepfake Scanner', icon: Eye, reqTier: 'enterprise' },
    { id: 'dashboard', label: 'Security Dashboard', icon: Layers },
    { id: 'admin', label: 'Admin Console', icon: Sliders, reqTier: 'enterprise' },
    { id: 'api_integrations', label: '10 API Feeds', icon: Radio },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0e1a]/90 backdrop-blur-xl border-b border-cyan-500/20 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Extension Toggle */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('extension_popup')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0a0e1a] rounded-[10px] flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-300">
                  ZENITH
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Fake News, Phishing Link & Malware Detector Extension</p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          {/* Active Shield Switch */}
          <button
            onClick={() => setIsExtensionActive(!isExtensionActive)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isExtensionActive
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{isExtensionActive ? 'Protection Active' : 'Protection Paused'}</span>
          </button>
        </div>

        {/* Tier Info, Real-time API Quota & Password Unlock Trigger */}
        <div className="flex flex-wrap items-center gap-2.5">
          
          {/* Real-time API Quota Status */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              API ONLINE
            </span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-300">
              Used: <strong className="text-cyan-400">{apiQuota.used}</strong> / Left: <strong className="text-emerald-400">{apiQuota.remaining}</strong>
            </span>
            {apiQuota.remaining <= 10 && (
              <button
                onClick={refillApiQuota}
                className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/40"
              >
                Refill
              </button>
            )}
          </div>

          {getTierBadge()}

          <button
            onClick={() => setUnlockModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 text-xs font-semibold transition-all shadow-sm"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Unlock Tiers</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3 overflow-x-auto no-scrollbar flex items-center gap-1.5 border-t border-slate-800/80 pt-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isRestricted = item.reqTier === 'enterprise' && !(currentTier === 'enterprise' || currentTier === 'super_admin');
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                  : isRestricted
                  ? 'text-slate-500 hover:text-slate-400 hover:bg-slate-800/40'
                  : 'text-slate-300 hover:text-cyan-300 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {isRestricted && <span className="text-[9px] bg-slate-800 text-amber-400 px-1 rounded">PRO+</span>}
            </button>
          );
        })}
      </div>
    </header>
  );
};
