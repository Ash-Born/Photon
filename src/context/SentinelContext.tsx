import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserTier,
  User,
  ThreatLog,
  FakeNewsReport,
  BlocklistItem,
  AuditLog,
  FeatureToggle,
  ApiConfig
} from '../types';

interface SentinelContextType {
  currentTier: UserTier;
  setCurrentTier: (tier: UserTier) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isExtensionActive: boolean;
  setIsExtensionActive: (active: boolean) => void;
  unlockModalOpen: boolean;
  setUnlockModalOpen: (open: boolean) => void;
  redScreenThreat: { threatType: string; url: string; severity: number; details?: string } | null;
  triggerRedScreen: (threat: { threatType: string; url: string; severity: number; details?: string }) => void;
  clearRedScreen: () => void;
  threatLogs: ThreatLog[];
  fakeNewsReports: FakeNewsReport[];
  usersList: User[];
  blocklist: BlocklistItem[];
  auditLogs: AuditLog[];
  featureToggles: FeatureToggle[];
  apiConfigs: ApiConfig[];
  apiQuota: { used: number; remaining: number; total: number; status: 'ONLINE' | 'OFFLINE'; endpointCalls: Record<number, number> };
  consumeApiCredit: (apiId?: number) => boolean;
  refillApiQuota: () => void;
  
  // Actions
  unlockWithPassword: (password: string) => { success: boolean; tier?: UserTier; message: string };
  logThreat: (threat: Omit<ThreatLog, 'id' | 'detectedAt'>) => void;
  logFakeNewsReport: (report: Omit<FakeNewsReport, 'id' | 'reportedAt'>) => void;
  addBlocklistItem: (domain: string, threatType: string, severity: number) => void;
  removeBlocklistItem: (id: number) => void;
  toggleFeature: (key: string) => void;
  updateUserTier: (userId: number, newTier: UserTier) => void;
  toggleUserActive: (userId: number) => void;
  logAudit: (action: string, actionType: AuditLog['actionType'], details: string) => void;
  totalThreatsCount: number;
  phishingCount: number;
  malwareCount: number;
  fakeNewsCount: number;
}

const defaultFeatureToggles: FeatureToggle[] = [
  // Fake News (9)
  { key: 'feature_cursor_detection', name: 'Cursor Hover Link Scanning', category: 'fake_news', description: 'Automatically scans link target content on hover (500ms delay, 6s tooltip)', tierRequired: 'lite', isActive: true },
  { key: 'feature_copy_detection', name: 'Clipboard Copy Text Scan', category: 'fake_news', description: 'Scans copied text for misleading news and highlights selection', tierRequired: 'lite', isActive: true },
  { key: 'feature_rightclick_check', name: 'Right-Click Context Fact Check', category: 'fake_news', description: 'Context menu integration for direct fact checking', tierRequired: 'lite', isActive: true },
  { key: 'feature_trust_score', name: '0-100% Trust Score Calculator', category: 'fake_news', description: 'Mathematical trust metric for domains & articles', tierRequired: 'lite', isActive: true },
  { key: 'feature_claim_analysis', name: 'Claim-by-Claim Breakdown', category: 'fake_news', description: 'BERT-based claim extraction and verification', tierRequired: 'pro', isActive: true },
  { key: 'feature_web_crosscheck', name: 'Web Search Cross-Verification', category: 'fake_news', description: 'DuckDuckGo/Google search factual verification', tierRequired: 'pro', isActive: true },
  { key: 'feature_bias_detection', name: 'Political & Emotional Bias AI', category: 'fake_news', description: 'Measures loaded political language and bias', tierRequired: 'pro', isActive: true },
  { key: 'feature_missing_context', name: 'Missing Context Highlighting', category: 'fake_news', description: 'Identifies omitted essential context in headlines', tierRequired: 'pro', isActive: true },
  { key: 'feature_deepfake_detection', name: 'Deepfake Media Inspection', category: 'fake_news', description: 'CNN image/video AI manipulation analyzer', tierRequired: 'enterprise', isActive: true },

  // Cyber Attack Prevention (10)
  { key: 'feature_phishing_detection', name: 'ML Phishing Link Guard', category: 'cyber_attack', description: '25-feature ML & VirusTotal URL checking', tierRequired: 'lite', isActive: true },
  { key: 'feature_malware_protection', name: 'Pre-Download Malware Scanner', category: 'cyber_attack', description: 'Pre-intercepts downloads (.exe, .dll, .scr) for PE analysis', tierRequired: 'lite', isActive: true },
  { key: 'feature_ransomware_protection', name: 'Ransomware Behavior Blocker', category: 'cyber_attack', description: 'Interception of payload execution and encryption patterns', tierRequired: 'pro', isActive: true },
  { key: 'feature_xss_protection', name: 'Cross-Site Scripting Guard (XSS)', category: 'cyber_attack', description: 'Script injection & DOM mutation analyzer', tierRequired: 'enterprise', isActive: true },
  { key: 'feature_mitm_protection', name: 'Man-In-The-Middle Shield (MITM)', category: 'cyber_attack', description: 'SSL certificate spoofing & DNS alteration alert', tierRequired: 'enterprise', isActive: true },
  { key: 'feature_ddos_prevention', name: 'DDoS Rate-Limit Defense', category: 'cyber_attack', description: 'Anomaly traffic filter & IP blacklisting', tierRequired: 'enterprise', isActive: true },
  { key: 'feature_clickjacking_protection', name: 'Invisible Overlay Clickjacking', category: 'cyber_attack', description: 'Invisible button & opacity trick interceptor', tierRequired: 'pro', isActive: true },
  { key: 'feature_clipboard_hijacking', name: 'Clipboard Alteration Guard', category: 'cyber_attack', description: 'Prevents unauthorized crypto address/text modification', tierRequired: 'pro', isActive: true },
  { key: 'feature_fake_update_blocker', name: 'Fake Browser Update Shield', category: 'cyber_attack', description: 'Blocks fraudulent browser extension/update modals', tierRequired: 'pro', isActive: true },
  { key: 'feature_notification_scam', name: 'Notification Scam Blocker', category: 'cyber_attack', description: 'Blocks malicious push notification prompt exploits', tierRequired: 'lite', isActive: true },

  // Red Screen System (4)
  { key: 'feature_phishing_redscreen', name: 'Phishing Red Screen Interceptor', category: 'red_screen', description: 'Triggers emergency screen on score ≥ 90%', tierRequired: 'pro', isActive: true },
  { key: 'feature_malware_redscreen', name: 'Malware Red Screen Interceptor', category: 'red_screen', description: 'Emergency screen on dangerous PE file', tierRequired: 'pro', isActive: true },
  { key: 'feature_ransomware_redscreen', name: 'Ransomware Red Screen Interceptor', category: 'red_screen', description: 'Immediate block page on ransomware pattern', tierRequired: 'pro', isActive: true },
  { key: 'feature_mitm_redscreen', name: 'MITM Emergency Red Screen', category: 'red_screen', description: 'Full overlay when SSL/DNS spoofing occurs', tierRequired: 'enterprise', isActive: true },

  // Dashboards & Reporting (6)
  { key: 'feature_lite_dashboard', name: 'Lite Basic Dashboard', category: 'dashboard', description: 'Basic statistics & threat blocks counter', tierRequired: 'lite', isActive: true },
  { key: 'feature_pro_dashboard', name: 'Pro Dashboard & 30-Day Graphs', category: 'dashboard', description: 'Interactive charts, history log filters', tierRequired: 'pro', isActive: true },
  { key: 'feature_enterprise_dashboard', name: 'Enterprise Multi-User Control', category: 'dashboard', description: 'Central policies, heatmaps, admin settings', tierRequired: 'enterprise', isActive: true },
  { key: 'feature_check_history', name: 'Filterable History Archive', category: 'dashboard', description: 'Full history of past URL/fact scans', tierRequired: 'pro', isActive: true },
  { key: 'feature_caching_system', name: 'Fast Local Scan Caching', category: 'dashboard', description: 'Instant response for recurring links', tierRequired: 'pro', isActive: true },
  { key: 'feature_reports_download', name: 'PDF & CSV Export Generator', category: 'dashboard', description: 'One-click executive security reports', tierRequired: 'pro', isActive: true },
];

const defaultApiConfigs: ApiConfig[] = [
  { id: 1, name: 'Google Fact Check API', keyName: 'GOOGLE_FACT_CHECK_KEY', endpoint: 'factchecktools.googleapis.com', rateLimit: '1,000 / day', status: 'online', tierRequired: 'pro', latencyMs: 42 },
  { id: 2, name: 'NewsData.io API', keyName: 'NEWSDATA_API_KEY', endpoint: 'newsdata.io/api/1/news', rateLimit: '200 / day', status: 'online', tierRequired: 'pro', latencyMs: 65 },
  { id: 3, name: 'DuckDuckGo Search API', keyName: 'DUCKDUCKGO_API', endpoint: 'api.duckduckgo.com', rateLimit: 'Unlimited', status: 'online', tierRequired: 'pro', latencyMs: 38 },
  { id: 4, name: 'URLhaus Malware Feed API', keyName: 'URLHAUS_API', endpoint: 'urlhaus-api.abuse.ch', rateLimit: 'Unlimited', status: 'online', tierRequired: 'lite', latencyMs: 85 },
  { id: 5, name: 'VirusTotal v3 API', keyName: 'VIRUSTOTAL_API_KEY', endpoint: 'www.virustotal.com/api/v3', rateLimit: '4 / minute', status: 'online', tierRequired: 'pro', latencyMs: 110 },
  { id: 6, name: 'PhishTank API', keyName: 'PHISHTANK_KEY', endpoint: 'check.phishtank.com', rateLimit: '1,000 / day', status: 'online', tierRequired: 'lite', latencyMs: 50 },
  { id: 7, name: 'OpenPhish Feed API', keyName: 'OPENPHISH_API', endpoint: 'openphish.com/feed.txt', rateLimit: '500 / day', status: 'online', tierRequired: 'pro', latencyMs: 45 },
  { id: 8, name: 'AbuseIPDB Reputation API', keyName: 'ABUSEIPDB_API_KEY', endpoint: 'api.abuseipdb.com/api/v2', rateLimit: '1,000 / day', status: 'online', tierRequired: 'enterprise', latencyMs: 95 },
  { id: 9, name: 'Google Maps Heatmap API', keyName: 'GMAPS_API_KEY', endpoint: 'maps.googleapis.com', rateLimit: '25,000 / day', status: 'online', tierRequired: 'enterprise', latencyMs: 30 },
  { id: 10, name: 'Factiverse Deep Check API', keyName: 'FACTIVERSE_API_KEY', endpoint: 'api.factiverse.ai/v1', rateLimit: '100 / day', status: 'online', tierRequired: 'enterprise', latencyMs: 140 },
];

const initialUsers: User[] = [
  { id: 1, username: 'admin', email: 'admin@zenith.com', fullName: 'Super Admin', tier: 'super_admin', role: 'super_admin', isActive: true, lastLoginAt: new Date().toISOString(), threatCount: 42 },
  { id: 2, username: 'porosh_pro', email: 'porosh@sec.io', fullName: 'Porosh User (Pro)', tier: 'pro', role: 'user', isActive: true, lastLoginAt: new Date(Date.now() - 3600000).toISOString(), threatCount: 18 },
  { id: 3, username: 'enterprise_lead', email: 'saydi@enterprise.corp', fullName: 'Saydi Hasan Lead', tier: 'enterprise', role: 'admin', isActive: true, lastLoginAt: new Date(Date.now() - 86400000).toISOString(), threatCount: 124 },
  { id: 4, username: 'john_lite', email: 'john@public.org', fullName: 'John Public', tier: 'lite', role: 'user', isActive: true, lastLoginAt: new Date(Date.now() - 172800000).toISOString(), threatCount: 5 },
  { id: 5, username: 'suspicious_guest', email: 'spammer99@temp.xyz', fullName: 'Suspicious Guest', tier: 'lite', role: 'user', isActive: false, lastLoginAt: new Date(Date.now() - 300000).toISOString(), threatCount: 89 },
];

const initialThreatLogs: ThreatLog[] = [];

const initialFakeNewsReports: FakeNewsReport[] = [];

const initialBlocklist: BlocklistItem[] = [];

const initialAuditLogs: AuditLog[] = [];

const SentinelContext = createContext<SentinelContextType | undefined>(undefined);

export const SentinelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTier, setCurrentTier] = useState<UserTier>('lite');
  const [activeTab, setActiveTab] = useState<string>('extension_popup');
  const [isExtensionActive, setIsExtensionActive] = useState<boolean>(true);
  const [unlockModalOpen, setUnlockModalOpen] = useState<boolean>(false);
  const [redScreenThreat, setRedScreenThreat] = useState<{ threatType: string; url: string; severity: number; details?: string } | null>(null);

  const [threatLogs, setThreatLogs] = useState<ThreatLog[]>(initialThreatLogs);
  const [fakeNewsReports, setFakeNewsReports] = useState<FakeNewsReport[]>(initialFakeNewsReports);
  const [usersList, setUsersList] = useState<User[]>(initialUsers);
  const [blocklist, setBlocklist] = useState<BlocklistItem[]>(initialBlocklist);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);
  const [featureToggles, setFeatureToggles] = useState<FeatureToggle[]>(defaultFeatureToggles);
  const [apiConfigs] = useState<ApiConfig[]>(defaultApiConfigs);

  // Real-time API Usage Quota state with LocalStorage persistence
  const [apiQuota, setApiQuota] = useState<{
    used: number;
    remaining: number;
    total: number;
    status: 'ONLINE' | 'OFFLINE';
    endpointCalls: Record<number, number>;
  }>(() => {
    try {
      const saved = localStorage.getItem('zenith_api_quota');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // ignore
    }
    return {
      used: 32,
      remaining: 68,
      total: 100,
      status: 'ONLINE',
      endpointCalls: { 1: 8, 2: 6, 3: 5, 4: 4, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1, 10: 1 }
    };
  });

  useEffect(() => {
    try {
      localStorage.setItem('zenith_api_quota', JSON.stringify(apiQuota));
    } catch (e) {
      // ignore
    }
  }, [apiQuota]);

  const consumeApiCredit = (apiId?: number): boolean => {
    if (apiQuota.remaining <= 0) {
      logAudit('API Quota Exceeded Attempt', 'system', 'Limit reached (0 remaining)');
      return false;
    }
    setApiQuota(prev => {
      const targetApiId = apiId || Math.floor(Math.random() * 10) + 1;
      const updatedCalls = { ...prev.endpointCalls };
      updatedCalls[targetApiId] = (updatedCalls[targetApiId] || 0) + 1;

      return {
        ...prev,
        used: prev.used + 1,
        remaining: Math.max(0, prev.remaining - 1),
        endpointCalls: updatedCalls
      };
    });
    return true;
  };

  const refillApiQuota = () => {
    const totalLimit = currentTier === 'super_admin' ? 5000 : currentTier === 'enterprise' ? 1000 : currentTier === 'pro' ? 500 : 100;
    setApiQuota({
      used: 0,
      remaining: totalLimit,
      total: totalLimit,
      status: 'ONLINE',
      endpointCalls: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0 }
    });
    logAudit('API Quota Refilled', 'system', `Reset quota limit to ${totalLimit} credits`);
  };

  // Stats calculation
  const totalThreatsCount = threatLogs.length;
  const phishingCount = threatLogs.filter(t => t.threatType === 'phishing').length;
  const malwareCount = threatLogs.filter(t => t.threatType === 'malware' || t.threatType === 'ransomware').length;
  const fakeNewsCount = fakeNewsReports.length;

  // Tier password check - strict validation
  const unlockWithPassword = (password: string) => {
    if (!password || typeof password !== 'string') {
      return { success: false, message: '❌ Password cannot be empty! Enter valid passcode.' };
    }
    const trimmed = password.trim();
    if (!trimmed) {
      return { success: false, message: '❌ Password cannot be blank!' };
    }

    const lowerPass = trimmed.toLowerCase();
    if (lowerPass === 'porosh' || lowerPass === 'pro' || lowerPass === 'pro2026') {
      setCurrentTier('pro');
      setApiQuota(prev => ({ ...prev, total: 500, remaining: prev.remaining + 400 }));
      logAudit('Unlocked Pro Tier with password', 'user_mgmt', 'Password match: Pro tier');
      return { success: true, tier: 'pro' as UserTier, message: '🎉 Success! Pro Tier Unlocked (All Pro Features Available)' };
    } else if (trimmed === 'saydi20@A' || lowerPass === 'enterprise' || lowerPass === 'enterprise2026') {
      setCurrentTier('enterprise');
      setApiQuota(prev => ({ ...prev, total: 1000, remaining: prev.remaining + 900 }));
      logAudit('Unlocked Enterprise Tier with password', 'user_mgmt', 'Password match: Enterprise tier');
      return { success: true, tier: 'enterprise' as UserTier, message: '🛡️ Success! Enterprise Tier Unlocked (All Features & Admin Console)' };
    } else if (lowerPass === 'zenith' || lowerPass === 'superadmin' || lowerPass === 'admin') {
      setCurrentTier('super_admin');
      setApiQuota(prev => ({ ...prev, total: 5000, remaining: 5000 }));
      logAudit('Unlocked Super Admin Console with password', 'user_mgmt', 'Password match: Super admin');
      return { success: true, tier: 'super_admin' as UserTier, message: '👑 Success! Super Admin Console Unlocked (Full System Access)' };
    }

    logAudit(`Failed tier unlock attempt with incorrect password: ${trimmed}`, 'user_mgmt', 'Incorrect password');
    return { success: false, message: '❌ Incorrect Password! Free Tier maintained.' };
  };

  const triggerRedScreen = (threat: { threatType: string; url: string; severity: number; details?: string }) => {
    setRedScreenThreat(threat);
    logAudit(`Emergency Red Screen Triggered: ${threat.threatType.toUpperCase()} on ${threat.url}`, 'security', `Severity: ${threat.severity}%`);
  };

  const clearRedScreen = () => {
    setRedScreenThreat(null);
  };

  const logThreat = (threat: Omit<ThreatLog, 'id' | 'detectedAt'>) => {
    const newLog: ThreatLog = {
      ...threat,
      id: Date.now(),
      detectedAt: new Date().toISOString()
    };
    setThreatLogs(prev => [newLog, ...prev]);

    // Auto-trigger red screen if severity >= 80
    if (threat.severity >= 80) {
      triggerRedScreen({
        threatType: threat.threatType,
        url: threat.url,
        severity: threat.severity,
        details: threat.details
      });
    }
  };

  const logFakeNewsReport = (report: Omit<FakeNewsReport, 'id' | 'reportedAt'>) => {
    const newReport: FakeNewsReport = {
      ...report,
      id: Date.now(),
      reportedAt: new Date().toISOString()
    };
    setFakeNewsReports(prev => [newReport, ...prev]);
  };

  const addBlocklistItem = (domain: string, threatType: string, severity: number) => {
    const newItem: BlocklistItem = {
      id: Date.now(),
      domain,
      threatType,
      severity,
      source: 'Admin Manual Add',
      isActive: true,
      addedAt: new Date().toISOString()
    };
    setBlocklist(prev => [newItem, ...prev]);
    logAudit(`Added domain to blocklist: ${domain}`, 'security', `Category: ${threatType}, Severity: ${severity}%`);
  };

  const removeBlocklistItem = (id: number) => {
    setBlocklist(prev => prev.filter(item => item.id !== id));
    logAudit(`Removed blocklist item ID ${id}`, 'security', 'Manual deletion');
  };

  const toggleFeature = (key: string) => {
    setFeatureToggles(prev => prev.map(f => {
      if (f.key === key) {
        const nextState = !f.isActive;
        logAudit(`Feature Toggled: ${f.name}`, 'feature', `New Status: ${nextState ? 'ENABLED' : 'DISABLED'}`);
        return { ...f, isActive: nextState };
      }
      return f;
    }));
  };

  const updateUserTier = (userId: number, newTier: UserTier) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        logAudit(`Updated user ID ${userId} tier to ${newTier.toUpperCase()}`, 'user_mgmt', `User: ${u.username}`);
        return { ...u, tier: newTier };
      }
      return u;
    }));
  };

  const toggleUserActive = (userId: number) => {
    setUsersList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = !u.isActive;
        logAudit(`User ID ${userId} account ${nextStatus ? 'Activated' : 'Suspended'}`, 'user_mgmt', `User: ${u.username}`);
        return { ...u, isActive: nextStatus };
      }
      return u;
    }));
  };

  const logAudit = (action: string, actionType: AuditLog['actionType'], details: string) => {
    const newAudit: AuditLog = {
      id: Date.now(),
      userName: currentTier === 'super_admin' ? 'Super Admin' : currentTier.toUpperCase() + ' User',
      action,
      actionType,
      details,
      status: 'success',
      createdAt: new Date().toLocaleTimeString()
    };
    setAuditLogs(prev => [newAudit, ...prev]);
  };

  return (
    <SentinelContext.Provider value={{
      currentTier,
      setCurrentTier,
      activeTab,
      setActiveTab,
      isExtensionActive,
      setIsExtensionActive,
      unlockModalOpen,
      setUnlockModalOpen,
      redScreenThreat,
      triggerRedScreen,
      clearRedScreen,
      threatLogs,
      fakeNewsReports,
      usersList,
      blocklist,
      auditLogs,
      featureToggles,
      apiConfigs,
      apiQuota,
      consumeApiCredit,
      refillApiQuota,
      unlockWithPassword,
      logThreat,
      logFakeNewsReport,
      addBlocklistItem,
      removeBlocklistItem,
      toggleFeature,
      updateUserTier,
      toggleUserActive,
      logAudit,
      totalThreatsCount,
      phishingCount,
      malwareCount,
      fakeNewsCount
    }}>
      {children}
    </SentinelContext.Provider>
  );
};

export const useSentinel = () => {
  const context = useContext(SentinelContext);
  if (!context) {
    throw new Error('useSentinel must be used within a SentinelProvider');
  }
  return context;
};

export const useZenith = useSentinel;
