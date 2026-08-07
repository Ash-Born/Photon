export type UserTier = 'lite' | 'pro' | 'enterprise' | 'super_admin';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  tier: UserTier;
  role: 'user' | 'admin' | 'super_admin';
  isActive: boolean;
  lastLoginAt: string;
  threatCount: number;
}

export interface ThreatLog {
  id: number;
  url: string;
  domain: string;
  threatType: 'phishing' | 'malware' | 'ransomware' | 'xss' | 'mitm' | 'clickjacking' | 'fake_update' | 'notification_scam';
  severity: number; // 0 - 100
  isBlocked: boolean;
  userId?: number;
  userName?: string;
  detectedAt: string;
  details?: string;
}

export interface FakeNewsReport {
  id: number;
  contentHash: string;
  contentText: string;
  sourceUrl?: string;
  sourceDomain?: string;
  fakeScore: number; // 0 - 100
  confidence: number; // 0 - 100
  isFake: boolean;
  biasScore: number;
  claims: { claim: string; rating: 'TRUE' | 'FALSE' | 'MISLEADING'; explanation: string }[];
  missingContext?: string;
  status: 'pending' | 'verified' | 'flagged';
  reportedAt: string;
}

export interface BlocklistItem {
  id: number;
  domain: string;
  threatType: string;
  severity: number;
  source: string;
  isActive: boolean;
  addedAt: string;
}

export interface AuditLog {
  id: number;
  userId?: number;
  userName: string;
  action: string;
  actionType: 'security' | 'user_mgmt' | 'policy' | 'feature' | 'system';
  details: string;
  status: 'success' | 'failed' | 'warning';
  createdAt: string;
}

export interface SystemSetting {
  key: string;
  value: string;
  group: 'security' | 'features' | 'alerts' | 'filtering';
  description: string;
}

export interface FeatureToggle {
  key: string;
  name: string;
  category: 'fake_news' | 'cyber_attack' | 'red_screen' | 'dashboard' | 'api';
  description: string;
  tierRequired: UserTier;
  isActive: boolean;
}

export interface ApiConfig {
  id: number;
  name: string;
  keyName: string;
  endpoint: string;
  rateLimit: string;
  status: 'online' | 'degraded' | 'offline';
  tierRequired: UserTier;
  latencyMs: number;
}

export interface UrlScanResult {
  url: string;
  domain: string;
  trustScore: number; // 0 = dangerous, 100 = completely safe
  threatScore: number; // 0 = safe, 100 = malicious
  status: 'safe' | 'caution' | 'suspicious' | 'dangerous';
  threatTypes: string[];
  featuresAnalyzed: {
    hasHttps: boolean;
    domainAgeDays: number;
    subdomainCount: number;
    redirectCount: number;
    hasSuspiciousKeywords: boolean;
    specialCharCount: number;
    ipInHost: boolean;
    virusTotalDetections: number;
    urlhausMatch: boolean;
    phishTankMatch: boolean;
  };
  recommendation: string;
}

export interface PeAnalysisResult {
  fileName: string;
  fileSizeKb: number;
  md5: string;
  sha256: string;
  isMalware: boolean;
  confidence: number;
  modelAccuracy: string;
  peFeatures: {
    entropy: number;
    importsCount: number;
    exportsCount: number;
    sectionsCount: number;
    hasSuspiciousSections: boolean;
    debugSize: number;
    resourcesEntropy: number;
  };
  detectedFamily?: string;
  suspiciousIndicators: string[];
}

export interface ApiQuota {
  used: number;
  remaining: number;
  total: number;
  status: 'ONLINE' | 'OFFLINE';
  lastUsedAt?: string;
  endpointCalls?: Record<number, number>;
}
