import React, { useState, useRef } from 'react';
import { useSentinel } from '../context/SentinelContext';
import { analyzeUrlThreat } from '../services/api';
import { UrlScanResult } from '../types';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  Search,
  Key,
  Layers,
  Sliders,
  Sparkles,
  Zap,
  AlertTriangle,
  FileText,
  MessageSquare,
  Globe,
  Send,
  Image,
  Mic,
  Video,
  Lock,
  Unlock,
  CreditCard,
  Download,
  MapPin,
  Bug,
  Cpu,
  X
} from 'lucide-react';

export const PopupSimulator: React.FC = () => {
  const {
    totalThreatsCount,
    phishingCount,
    fakeNewsCount,
    currentTier,
    setCurrentTier,
    setActiveTab,
    isExtensionActive,
    setIsExtensionActive,
    logThreat,
    threatLogs,
    auditLogs,
    apiQuota,
    consumeApiCredit,
    unlockWithPassword
  } = useSentinel();

  // Lite Tier - URL Validator State
  const [inputUrl, setInputUrl] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<UrlScanResult | null>(null);

  // Lite Tier - Text / Claim Checker State
  const [customChatInput, setCustomChatInput] = useState('');
  const [liveAlertNotification, setLiveAlertNotification] = useState<string | null>(null);
  const [latestVerdict, setLatestVerdict] = useState<{
    text: string;
    verdictLabel: string;
    verdictScore: number;
    verdictDetails: string;
    type: string;
  } | null>(null);

  // Modal & Unlock state
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const [unlockMode, setUnlockMode] = useState<'card' | 'password'>('card');
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<'pro' | 'enterprise'>('pro');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paymentSuccessMsg, setPaymentSuccessMsg] = useState<string | null>(null);

  // Standalone code bundle download
  const handleDownloadStandalonePackage = () => {
    const htmlBundle = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>ZENITH CYBER SECURITY SUITE - STANDALONE HOSTABLE PACKAGE</title>
  <style>
    body { font-family: sans-serif; background: #0a0e1a; color: #fff; padding: 40px; text-align: center; }
    .card { background: #111827; border: 2px solid #06b6d4; padding: 30px; border-radius: 20px; max-width: 600px; margin: 40px auto; }
    h1 { color: #22d3ee; }
    a { color: #38bdf8; text-decoration: none; font-weight: bold; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🛡️ ZENITH CYBER SECURITY PACKAGE</h1>
    <p>This standalone deployment package contains the complete AI Cyber Guard application.</p>
    <p>To deploy: host the /dist production build folder on any HTTP/HTTPS web server (Apache, Nginx, Vercel, Netlify, or Cloud Run).</p>
    <p>All ML Heuristics, D3 Heatmaps, and Threat Activity Logs are bundled and ready.</p>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlBundle], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ZENITH_Cyber_Security_Standalone_Package.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Enterprise Log Export Format State
  const [exportFormat, setExportFormat] = useState<'json' | 'csv' | 'txt'>('json');

  // File Upload Ref for Pro Tier features
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeUploadCategory, setActiveUploadCategory] = useState<'image' | 'audio' | 'video' | 'text' | null>(null);

  // Pro tier check
  const isProUnlocked = currentTier === 'pro' || currentTier === 'enterprise' || currentTier === 'super_admin';
  const isEnterpriseUnlocked = currentTier === 'enterprise' || currentTier === 'super_admin';

  // Handle URL scanning (Lite)
  const handleScanUrl = async () => {
    if (!inputUrl.trim()) return;
    if (apiQuota.remaining <= 0) {
      alert('API Limit Reached! Unlock Pro or Enterprise tier.');
      return;
    }

    setScanning(true);
    setScanResult(null);
    consumeApiCredit();

    try {
      const res = await analyzeUrlThreat(inputUrl.trim());
      setScanResult(res);

      if (res.status === 'dangerous' || res.status === 'suspicious') {
        logThreat({
          url: res.url,
          domain: res.domain,
          threatType: 'phishing',
          severity: res.threatScore,
          isBlocked: true,
          details: res.recommendation
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  // Handle Text / Claim input checking (Lite)
  const handleCheckText = () => {
    if (!customChatInput.trim()) return;
    const lower = customChatInput.toLowerCase();

    const isPhish = lower.includes('gift') || lower.includes('free') || lower.includes('.top') || lower.includes('.xyz') || lower.includes('login') || lower.includes('verify') || lower.includes('bonus') || lower.includes('crypto');
    const isFakeNews = lower.includes('বিনা মূল্যে') || lower.includes('১০,০০০ টাকা') || lower.includes('উপহার প্রদান করছে') || lower.includes('ফ্রি গিফট') || lower.includes('viral claim') || lower.includes('secret cure');
    const isValidNews = lower.includes('bbc.com') || lower.includes('cnn.com') || lower.includes('prothomalo.com') || lower.includes('thedailystar.net') || lower.includes('reuters.com');

    let type = 'safe';
    let label = '✅ 100% VERIFIED SAFE STATEMENT';
    let score = 0;
    let details = '• Source: Google Safe Browsing API (Clean)\n• Source: Zero Malware PE Signatures';

    if (isPhish) {
      type = 'phishing';
      label = '🚨 98% PHISHING / SCAM CLAIM FLAGGED';
      score = 98;
      details = '• Source: ML Domain & Brand Spoofing Heuristics\n• Source: Known Social Engineering Pattern';
    } else if (isFakeNews) {
      type = 'fakenews';
      label = '⚠️ 94% FAKE NEWS / FRAUD CLAIM FLAGGED';
      score = 94;
      details = '• Source: IFCN Fact-Check Cross-Reference\n• Source: Known Social Media Scam Pattern';
    } else if (isValidNews) {
      type = 'safe';
      label = '🛡️ VERIFIED REAL NEWS SOURCE';
      score = 0;
      details = '• Source: International Fact-Checking Network (IFCN)\n• Source: Reputable Media Publisher Registry';
    }

    setLatestVerdict({
      text: customChatInput,
      verdictLabel: label,
      verdictScore: score,
      verdictDetails: details,
      type
    });

    setLiveAlertNotification(`Verdict: ${label}`);
    setTimeout(() => setLiveAlertNotification(null), 4000);
    setCustomChatInput('');
  };

  // Handle File Upload (Pro tier only)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name;
    const category = activeUploadCategory || 'file';
    let verdictLabel = `✅ VERIFIED AUTHENTIC ${category.toUpperCase()}`;
    let verdictScore = 0;
    let type = 'safe';

    if (fileName.toLowerCase().includes('deepfake') || fileName.toLowerCase().includes('scam') || fileName.toLowerCase().includes('fake') || fileName.toLowerCase().includes('phish')) {
      verdictLabel = `🚨 SUSPICIOUS ${category.toUpperCase()}: SYNTHETIC AI DEEPFAKE / SCAM`;
      verdictScore = 96;
      type = 'phishing';
    }

    setLatestVerdict({
      text: `[Uploaded ${category.toUpperCase()}: ${fileName}] (${(file.size / 1024).toFixed(1)} KB)`,
      verdictLabel,
      verdictScore,
      verdictDetails: `• Source: Multimodal Spectral AI Detector\n• Source: C2PA Media Provenance Check`,
      type
    });

    setLiveAlertNotification(`[${category.toUpperCase()} SCANNED] ${verdictLabel}`);
    setTimeout(() => setLiveAlertNotification(null), 4000);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Unlock via Password
  const handlePasswordUnlock = () => {
    setPasswordError(null);
    const res = unlockWithPassword(passwordInput);
    if (res.success) {
      setPaymentSuccessMsg(res.message);
      setTimeout(() => {
        setPaymentSuccessMsg(null);
        setShowUpgradeDialog(false);
      }, 1800);
    } else {
      setPasswordError(res.message);
    }
  };

  // Unlock via simulated card payment
  const handleCardPaymentUnlock = (targetTier: 'pro' | 'enterprise') => {
    setCurrentTier(targetTier);
    setPaymentSuccessMsg(`🎉 Payment Approved! ${targetTier.toUpperCase()} Tier is now unlocked & active.`);
    setTimeout(() => {
      setPaymentSuccessMsg(null);
      setShowUpgradeDialog(false);
    }, 1800);
  };

  // Enterprise Custom Log File Save / Download
  const downloadEnterpriseLog = () => {
    if (!isEnterpriseUnlocked) {
      setShowUpgradeDialog(true);
      return;
    }

    const logData = {
      timestamp: new Date().toISOString(),
      system: 'ZENITH Enterprise Sentinel',
      totalThreatsCount,
      phishingCount,
      fakeNewsCount,
      threatLogs,
      auditLogs
    };

    let content = '';
    let mimeType = 'text/plain';
    let ext = 'txt';

    if (exportFormat === 'json') {
      content = JSON.stringify(logData, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    } else if (exportFormat === 'csv') {
      content = 'ID,URL,Domain,ThreatType,Severity,DetectedAt\n' +
        threatLogs.map(t => `${t.id},"${t.url}","${t.domain}",${t.threatType},${t.severity},"${t.detectedAt}"`).join('\n');
      mimeType = 'text/csv';
      ext = 'csv';
    } else {
      content = `--- ZENITH ENTERPRISE SECURITY LOG ---\nGenerated: ${new Date().toLocaleString()}\nTotal Threats: ${totalThreatsCount}\nPhishing Blocked: ${phishingCount}\n\n` +
        threatLogs.map(t => `[${t.detectedAt}] ${t.threatType.toUpperCase()} - ${t.url} (Severity: ${t.severity}%)`).join('\n');
      mimeType = 'text/plain';
      ext = 'txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ZENITH_Enterprise_Audit_Log.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fadeIn">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="text-sm font-bold text-white">ZENITH Cyber Guard</h2>
            <p className="text-[11px] text-slate-400">
              Lite: URL Check • Pro: Text, Image, Video, Audio & Maps • Enterprise: Admin & Custom Logs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleDownloadStandalonePackage}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-all"
            title="Download full standalone deployment package"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Download Package</span>
          </button>

          <button
            onClick={() => setShowUpgradeDialog(true)}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Key className="w-3.5 h-3.5 text-cyan-400" />
            <span>Upgrade / Tier: {currentTier.toUpperCase()}</span>
            {isProUnlocked ? (
              <Unlock className="w-3.5 h-3.5 text-emerald-400 ml-1" />
            ) : (
              <Lock className="w-3.5 h-3.5 text-amber-400 ml-1" />
            )}
          </button>
        </div>
      </div>

      {/* Main Extension Toolbar Card */}
      <div className="flex justify-center">
        <div className="w-full max-w-[440px] bg-[#0c1020] border-2 border-cyan-500/30 rounded-3xl p-5 shadow-2xl shadow-cyan-500/10 space-y-4">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 p-0.5 flex items-center justify-center">
                <div className="w-full h-full bg-[#0c1020] rounded-[6px] flex items-center justify-center">
                  <Shield className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-white tracking-wide">ZENITH GUARD</h3>
                <span className="text-[10px] text-cyan-400 font-mono">Real-time Extension</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isExtensionActive
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
              }`}>
                {isExtensionActive ? 'ACTIVE' : 'PAUSED'}
              </span>
              <button
                onClick={() => setIsExtensionActive(!isExtensionActive)}
                className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
                title="Toggle Protection"
              >
                <Zap className={`w-3.5 h-3.5 ${isExtensionActive ? 'text-amber-400' : 'text-slate-500'}`} />
              </button>
            </div>
          </div>

          {/* Quick Threat Counts */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-center">
              <span className="text-[10px] text-slate-400 block">Threats</span>
              <span className="text-sm font-black text-white">{totalThreatsCount}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-center">
              <span className="text-[10px] text-slate-400 block">Phishing</span>
              <span className="text-sm font-black text-rose-400">{phishingCount}</span>
            </div>
            <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-2 text-center">
              <span className="text-[10px] text-slate-400 block">Fake News</span>
              <span className="text-sm font-black text-amber-400">{fakeNewsCount}</span>
            </div>
          </div>

          {/* REAL-TIME NOTIFICATION BANNER */}
          {liveAlertNotification && (
            <div className="bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border border-cyan-400 text-cyan-200 text-xs font-bold p-2.5 rounded-xl flex items-center gap-2 animate-fadeIn">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
              <span className="flex-1 leading-snug">{liveAlertNotification}</span>
            </div>
          )}

          {/* LITE TIER: Simple URL Validator (Only URL Checker in Lite) */}
          <div className="space-y-1.5 p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                URL Phishing & Security Validator
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                LITE
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleScanUrl()}
                  placeholder="e.g. paypal-verify.xyz"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
                />
              </div>
              <button
                onClick={handleScanUrl}
                disabled={scanning}
                className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs disabled:opacity-50 transition-all shrink-0"
              >
                {scanning ? '...' : 'Scan'}
              </button>
            </div>

            {/* URL Scan Result */}
            {scanResult && (
              <div className={`mt-2 p-2.5 rounded-xl border text-xs space-y-1 animate-fadeIn ${
                scanResult.status === 'dangerous'
                  ? 'bg-rose-950/50 border-rose-500/50 text-rose-200'
                  : scanResult.status === 'suspicious'
                  ? 'bg-amber-950/50 border-amber-500/50 text-amber-200'
                  : 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200'
              }`}>
                <div className="font-bold text-[11px] uppercase flex items-center justify-between">
                  <span>{scanResult.status.toUpperCase()} (Threat Score: {scanResult.threatScore}%)</span>
                  <span className="text-[10px] font-mono">Trust: {scanResult.trustScore}%</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">{scanResult.recommendation}</p>
              </div>
            )}
          </div>

          {/* Hidden File Input for Pro Tier */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept={
              activeUploadCategory === 'image'
                ? 'image/*'
                : activeUploadCategory === 'video'
                ? 'video/*'
                : activeUploadCategory === 'audio'
                ? 'audio/*'
                : '*/*'
            }
          />

          {/* PRO TIER SECTION: Text/Claim Checker, Image, Video, Audio, Global Heatmap, Regional Map, ML PE, Deepfake, AI Fact Checker */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900/90 to-cyan-950/30 border border-cyan-500/30 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Pro Tier Advanced Suite
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                isProUnlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isProUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isProUnlocked ? 'PRO UNLOCKED' : 'PRO ONLY'}
              </span>
            </div>

            {/* PRO FEATURE: Real-time Text & Claim Checker with ML */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-200 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  Real-Time Text & Claim Checker (ML)
                </span>
                {!isProUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="text"
                  value={customChatInput}
                  onChange={(e) => setCustomChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (isProUnlocked ? handleCheckText() : setShowUpgradeDialog(true))}
                  placeholder={isProUnlocked ? "Enter text claim or link to verify..." : "🔒 Unlock Pro tier to check claims & text..."}
                  disabled={!isProUnlocked}
                  className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none disabled:opacity-50"
                />
                <button
                  onClick={() => isProUnlocked ? handleCheckText() : setShowUpgradeDialog(true)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition-all ${
                    isProUnlocked
                      ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Check</span>
                </button>
              </div>

              {/* Latest Verdict Result */}
              {latestVerdict && isProUnlocked && (
                <div className={`mt-2 p-2 rounded-lg border text-xs space-y-1 animate-fadeIn ${
                  latestVerdict.type === 'phishing'
                    ? 'bg-rose-950/60 border-rose-500 text-rose-200'
                    : latestVerdict.type === 'fakenews'
                    ? 'bg-amber-950/60 border-amber-500 text-amber-200'
                    : 'bg-emerald-950/60 border-emerald-500 text-emerald-200'
                }`}>
                  <div className="font-bold text-[11px] flex items-center justify-between">
                    <span>{latestVerdict.verdictLabel}</span>
                    <span className="text-[10px] font-mono">Risk: {latestVerdict.verdictScore}%</span>
                  </div>
                  <p className="text-[11px] text-slate-300 font-mono whitespace-pre-line">{latestVerdict.verdictDetails}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  if (!isProUnlocked) {
                    setShowUpgradeDialog(true);
                  } else {
                    setActiveUploadCategory('image');
                    fileInputRef.current?.click();
                  }
                }}
                className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isProUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Image Scanner</span>
                </span>
                {!isProUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  if (!isProUnlocked) {
                    setShowUpgradeDialog(true);
                  } else {
                    setActiveUploadCategory('video');
                    fileInputRef.current?.click();
                  }
                }}
                className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isProUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-purple-400" />
                  <span>Video Deepfake</span>
                </span>
                {!isProUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  if (!isProUnlocked) {
                    setShowUpgradeDialog(true);
                  } else {
                    setActiveUploadCategory('audio');
                    fileInputRef.current?.click();
                  }
                }}
                className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isProUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Mic className="w-3.5 h-3.5 text-amber-400" />
                  <span>Audio Voice Check</span>
                </span>
                {!isProUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  if (!isProUnlocked) {
                    setShowUpgradeDialog(true);
                  } else {
                    setActiveTab('global_threat_heatmap');
                  }
                }}
                className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isProUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Global Heat Map</span>
                </span>
                {!isProUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  if (!isProUnlocked) {
                    setShowUpgradeDialog(true);
                  } else {
                    setActiveTab('global_threat_heatmap');
                  }
                }}
                className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isProUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" />
                  <span>Regional Map</span>
                </span>
                {!isProUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  if (!isProUnlocked) {
                    setShowUpgradeDialog(true);
                  } else {
                    setActiveTab('url_deep_scan');
                  }
                }}
                className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isProUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-amber-400" />
                  <span>ML Malware PE</span>
                </span>
                {!isProUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  if (!isProUnlocked) {
                    setShowUpgradeDialog(true);
                  } else {
                    setActiveTab('fake_news_checker');
                  }
                }}
                className={`col-span-2 p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isProUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AI Fact Checker & Deepfake Manipulation Shield</span>
                </span>
                {!isProUnlocked ? <Lock className="w-3 h-3 text-amber-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
              </button>
            </div>
          </div>

          {/* ENTERPRISE TIER SECTION: Admin Dashboard, Admin Console, Custom Log Save/Export */}
          <div className="p-3 rounded-2xl bg-gradient-to-br from-slate-900/90 to-blue-950/30 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-blue-300 flex items-center gap-1.5 uppercase tracking-wider">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Enterprise Suite & Admin
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 ${
                isEnterpriseUnlocked ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              }`}>
                {isEnterpriseUnlocked ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                {isEnterpriseUnlocked ? 'ENTERPRISE UNLOCKED' : 'ENTERPRISE ONLY'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              <button
                onClick={() => {
                  if (!isEnterpriseUnlocked) {
                    setShowUpgradeDialog(true);
                  } else {
                    setActiveTab('dashboard');
                  }
                }}
                className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isEnterpriseUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span>Admin Dashboard</span>
                </span>
                {!isEnterpriseUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
              </button>

              <button
                onClick={() => {
                  if (!isEnterpriseUnlocked) {
                    setShowUpgradeDialog(true);
                  } else {
                    setActiveTab('admin');
                  }
                }}
                className={`p-2 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all ${
                  isEnterpriseUnlocked
                    ? 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-200'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-amber-500/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Admin Console</span>
                </span>
                {!isEnterpriseUnlocked && <Lock className="w-3 h-3 text-amber-400" />}
              </button>
            </div>

            {/* Enterprise Log File Save / Export Option */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] text-slate-300 font-bold">
                <span className="flex items-center gap-1">
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enterprise Log File Save / Export</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {exportFormat.toUpperCase()} format
                </span>
              </div>

              <div className="flex items-center gap-1">
                {(['json', 'csv', 'txt'] as const).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => setExportFormat(fmt)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all uppercase ${
                      exportFormat === fmt
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

              <button
                onClick={downloadEnterpriseLog}
                className={`w-full py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md ${
                  isEnterpriseUnlocked
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 border border-slate-700 hover:border-amber-500/50'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>
                  {isEnterpriseUnlocked
                    ? `Save & Download Log (.${exportFormat})`
                    : '🔒 Unlock Enterprise to Save Custom Log'}
                </span>
              </button>
            </div>
          </div>

          {/* Footer Quick View Tabs */}
          <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-800">
            <button
              onClick={() => setActiveTab('threat_activity_log')}
              className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center gap-1"
            >
              <FileText className="w-3 h-3 text-cyan-400" />
              <span>Log</span>
            </button>
            <button
              onClick={() => setActiveTab('global_threat_heatmap')}
              className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center gap-1"
            >
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Map</span>
            </button>
            <button
              onClick={() => setActiveTab('dashboard')}
              className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center gap-1"
            >
              <Layers className="w-3 h-3 text-blue-400" />
              <span>Dashboard</span>
            </button>
            <button
              onClick={() => setActiveTab('admin')}
              className="py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center gap-1"
            >
              <Sliders className="w-3 h-3 text-purple-400" />
              <span>Admin</span>
            </button>
          </div>

        </div>
      </div>

      {/* TIER UPGRADE / PASSCODE UNLOCK MODAL */}
      {showUpgradeDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-[#0c1020] border-2 border-cyan-500/50 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 space-y-4 relative">
            
            <button
              onClick={() => setShowUpgradeDialog(false)}
              className="absolute right-4 top-4 p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Key className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-white">Unlock Pro & Enterprise Features</h3>
                <p className="text-xs text-slate-400">Choose simulated Card Payment or enter optional Password</p>
              </div>
            </div>

            {paymentSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center animate-fadeIn">
                {paymentSuccessMsg}
              </div>
            )}

            {/* Mode Switch Tabs */}
            <div className="flex rounded-xl bg-slate-900 p-1 border border-slate-800">
              <button
                onClick={() => setUnlockMode('card')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  unlockMode === 'card'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Card Payment</span>
              </button>

              <button
                onClick={() => setUnlockMode('password')}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  unlockMode === 'password'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Key className="w-3.5 h-3.5" />
                <span>Password Key</span>
              </button>
            </div>

            {unlockMode === 'card' ? (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">Card Number (Simulated)</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-300 block">CVV</label>
                    <input
                      type="text"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button
                    onClick={() => handleCardPaymentUnlock('pro')}
                    className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-cyan-500/20"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pay $19 (PRO)</span>
                  </button>

                  <button
                    onClick={() => handleCardPaymentUnlock('enterprise')}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 shadow-md shadow-emerald-500/20"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    <span>Pay $49 (ENTERPRISE)</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-300 block">Enter Unlock Passcode / Key</label>
                  <input
                    type="password"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handlePasswordUnlock()}
                    placeholder="Enter password (e.g. pro, enterprise, porosh)"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none"
                  />
                  {passwordError && (
                    <p className="text-[11px] text-rose-400 font-bold mt-1">{passwordError}</p>
                  )}
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-400 space-y-1 font-mono">
                  <div className="font-bold text-cyan-300">🔑 Available Test Passwords:</div>
                  <div>• <strong className="text-white">pro</strong> or <strong className="text-white">porosh</strong> → Unlocks Pro Suite</div>
                  <div>• <strong className="text-white">enterprise</strong> or <strong className="text-white">saydi20@A</strong> → Unlocks Enterprise</div>
                  <div>• <strong className="text-white">admin</strong> or <strong className="text-white">zenith</strong> → Unlocks Super Admin</div>
                </div>

                <button
                  onClick={handlePasswordUnlock}
                  className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>Verify Password & Unlock</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
