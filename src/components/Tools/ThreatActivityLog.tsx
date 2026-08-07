import React, { useState, useMemo } from 'react';
import { useSentinel } from '../../context/SentinelContext';
import {
  ShieldAlert,
  ShieldCheck,
  Newspaper,
  Cpu,
  Download,
  Search,
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileText,
  Copy,
  Clock,
  Sparkles,
  Filter
} from 'lucide-react';

interface ActivityItem {
  id: number;
  category: 'phishing' | 'fake_news' | 'malware' | 'other';
  titleLabel: string;
  targetContent: string;
  sourceOrDomain: string;
  score: number;
  status: 'BLOCKED' | 'FLAGGED' | 'VERIFIED' | 'CAUTION' | 'LOGGED';
  timestamp: string;
  details: string;
}

export const ThreatActivityLog: React.FC = () => {
  const { threatLogs, fakeNewsReports, logThreat, logFakeNewsReport } = useSentinel();
  const [filterCategory, setFilterCategory] = useState<'all' | 'phishing' | 'fake_news' | 'malware'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'sort_desc' | 'sort_asc'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'highest_score' | 'lowest_score' | 'severity_desc' | 'severity_asc'>('newest');
  const [exportSuccess, setExportSuccess] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Combine and normalize threatLogs and fakeNewsReports into a real-time unified list
  const combinedActivityList: ActivityItem[] = useMemo(() => {
    const fromThreats: ActivityItem[] = threatLogs.map((log) => {
      let category: 'phishing' | 'malware' | 'other' = 'other';
      let titleLabel = 'Security Alert';
      if (log.threatType === 'phishing') {
        category = 'phishing';
        titleLabel = 'Phishing Link';
      } else if (log.threatType === 'malware') {
        category = 'malware';
        titleLabel = 'Malware PE File';
      } else {
        category = 'other';
        titleLabel = log.threatType.toUpperCase();
      }

      return {
        id: log.id,
        category,
        titleLabel,
        targetContent: log.url,
        sourceOrDomain: log.domain,
        score: log.severity,
        status: log.isBlocked ? 'BLOCKED' : log.severity >= 50 ? 'CAUTION' : 'LOGGED',
        timestamp: log.detectedAt,
        details: log.details || `${log.threatType.toUpperCase()} interception via 25-feature ML heuristics & VirusTotal feeds.`
      };
    });

    const fromFakeNews: ActivityItem[] = fakeNewsReports.map((report) => ({
      id: report.id,
      category: 'fake_news',
      titleLabel: 'Fake News Alert',
      targetContent: report.contentText,
      sourceOrDomain: report.sourceDomain || 'Social Media Feed / Messenger',
      score: report.fakeScore,
      status: report.isFake ? 'FLAGGED' : report.fakeScore >= 50 ? 'CAUTION' : 'VERIFIED',
      timestamp: report.reportedAt,
      details: report.claims?.[0]?.explanation || 'Evaluated via BERT NLP model and DuckDuckGo/Google fact cross-checking.'
    }));

    return [...fromThreats, ...fromFakeNews];
  }, [threatLogs, fakeNewsReports]);

  // Apply Search, Category Filter, Severity Filter, and Sorting
  const filteredActivityList = useMemo(() => {
    return combinedActivityList
      .filter((item) => {
        // Category filter
        if (filterCategory === 'phishing' && item.category !== 'phishing') return false;
        if (filterCategory === 'fake_news' && item.category !== 'fake_news') return false;
        if (filterCategory === 'malware' && (item.category !== 'malware' && item.category !== 'other')) return false;

        // Severity filter (Critical: >=90, High: 75-89, Medium: 50-74, Low: <50)
        if (severityFilter === 'critical' && item.score < 90) return false;
        if (severityFilter === 'high' && (item.score < 75 || item.score >= 90)) return false;
        if (severityFilter === 'medium' && (item.score < 50 || item.score >= 75)) return false;
        if (severityFilter === 'low' && item.score >= 50) return false;

        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTarget = item.targetContent.toLowerCase().includes(q);
          const matchDomain = item.sourceOrDomain.toLowerCase().includes(q);
          const matchDetails = item.details.toLowerCase().includes(q);
          const matchTitle = item.titleLabel.toLowerCase().includes(q);
          if (!matchTarget && !matchDomain && !matchDetails && !matchTitle) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (severityFilter === 'sort_desc' || sortBy === 'severity_desc' || sortBy === 'highest_score') {
          return b.score - a.score;
        }
        if (severityFilter === 'sort_asc' || sortBy === 'severity_asc' || sortBy === 'lowest_score') {
          return a.score - b.score;
        }
        if (sortBy === 'newest') {
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
        }
        return b.score - a.score;
      });
  }, [combinedActivityList, filterCategory, searchQuery, sortBy, severityFilter]);

  // Counts for category tabs
  const phishingCount = useMemo(
    () => combinedActivityList.filter((i) => i.category === 'phishing').length,
    [combinedActivityList]
  );
  const fakeNewsCount = useMemo(
    () => combinedActivityList.filter((i) => i.category === 'fake_news').length,
    [combinedActivityList]
  );
  const malwareCount = useMemo(
    () => combinedActivityList.filter((i) => i.category === 'malware' || i.category === 'other').length,
    [combinedActivityList]
  );

  // Export CSV functionality
  const handleExportCsv = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'ID,Category,Status,Risk or Fake Score (%),Target URL or Claim Text,Source / Domain,Explanation / Details,Timestamp\n';

    filteredActivityList.forEach((item) => {
      const cleanContent = item.targetContent.replace(/"/g, '""');
      const cleanDetails = item.details.replace(/"/g, '""');
      const cleanDomain = item.sourceOrDomain.replace(/"/g, '""');
      csvContent += `"${item.id}","${item.titleLabel}","${item.status}",${item.score},"${cleanContent}","${cleanDomain}","${cleanDetails}","${item.timestamp}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    const filename = `ZENITH_Threat_Activity_Log_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 4000);
  };

  // Simulate real-time scanner detection for testing
  const simulatePhishingCapture = () => {
    const domains = [
      { url: 'https://paypal-verify-secure.xyz/login-update', domain: 'paypal-verify-secure.xyz', score: 96 },
      { url: 'https://bank-login-auth.top/auth/session=8932', domain: 'bank-login-auth.top', score: 92 },
      { url: 'https://apple-id-confirm-support.net/account', domain: 'apple-id-confirm-support.net', score: 89 }
    ];
    const picked = domains[Math.floor(Math.random() * domains.length)];
    logThreat({
      url: picked.url,
      domain: picked.domain,
      threatType: 'phishing',
      severity: picked.score,
      isBlocked: true,
      details: 'Real-time phishing link capture: High-risk credential harvesting domain detected via ML heuristics.'
    });
  };

  const simulateFakeNewsCapture = () => {
    const claims = [
      { text: 'বিনা মূল্যে ১০,০০০ টাকা উপহার প্রদান করছে বিকাশ! নিচের লিংকে ক্লিক করুন।', score: 94, explanation: 'Unverified cash gift claim matching known social media rumor database.' },
      { text: 'BREAKING: NASA confirms emergency 15-day blackout starting tomorrow worldwide.', score: 91, explanation: 'Hoax viral claim contradicted by official astronomical and NASA records.' },
      { text: 'Government announces immediate 50% discount on all utility bills for citizens.', score: 85, explanation: 'Unauthenticated government notice circulating on WhatsApp.' }
    ];
    const picked = claims[Math.floor(Math.random() * claims.length)];
    logFakeNewsReport({
      contentHash: `hash_${Date.now()}`,
      contentText: picked.text,
      sourceUrl: 'https://social-feed-alert.net/share',
      sourceDomain: 'Social Media Feed',
      fakeScore: picked.score,
      confidence: 96,
      isFake: true,
      biasScore: 78,
      claims: [{
        claim: picked.text,
        rating: 'FALSE',
        explanation: picked.explanation
      }],
      status: 'flagged'
    });
  };

  const simulateMalwareCapture = () => {
    logThreat({
      url: 'https://cdn-download-mirror.net/setup/invoice_scan_09.exe',
      domain: 'cdn-download-mirror.net',
      threatType: 'malware',
      severity: 98,
      isBlocked: true,
      details: 'PE Section Entropy = 7.82 (UPX/Themida Packed). VirusTotal detection: Trojan.Win32.Agent.'
    });
  };

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Banner & Title */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0a0e1a] to-blue-950/40 border border-cyan-500/30 glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <FileText className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">Threat Activity Log</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  LIVE ENGINE RECORDING
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Real-time list of detected phishing links, malware files, and fake news alerts captured by the ZENITH scanner.
              </p>
            </div>
          </div>
        </div>

        {/* CSV Export Button */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={handleExportCsv}
            className="w-full md:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20 active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* Export Success Toast Notification */}
      {exportSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between gap-3 animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>CSV Export Complete:</strong> Downloaded <strong>{filteredActivityList.length}</strong> activity logs to your device.
            </span>
          </div>
          <span className="text-[10px] font-mono uppercase bg-emerald-900/60 px-2 py-0.5 rounded">
            Report Ready
          </span>
        </div>
      )}


      {/* Filtering, Searching, & Sorting Controls */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setFilterCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterCategory === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>All Activity ({combinedActivityList.length})</span>
          </button>

          <button
            onClick={() => setFilterCategory('phishing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterCategory === 'phishing'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            <span>Phishing Links ({phishingCount})</span>
          </button>

          <button
            onClick={() => setFilterCategory('fake_news')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterCategory === 'fake_news'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Newspaper className="w-3.5 h-3.5 text-amber-400" />
            <span>Fake News Alerts ({fakeNewsCount})</span>
          </button>

          <button
            onClick={() => setFilterCategory('malware')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              filterCategory === 'malware'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            <span>Malware / Other ({malwareCount})</span>
          </button>
        </div>

        {/* Search & Sort input */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search URL, domain, claim..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <select
              aria-label="Filter by Severity Level"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer py-1"
            >
              <option value="all" className="bg-[#0b0f19]">All Severity Levels</option>
              <option value="critical" className="bg-[#0b0f19]">Critical Severity (90-100% Risk)</option>
              <option value="high" className="bg-[#0b0f19]">High Severity (75-89% Risk)</option>
              <option value="medium" className="bg-[#0b0f19]">Medium Severity (50-74% Risk)</option>
              <option value="low" className="bg-[#0b0f19]">Low Severity (&lt;50% Risk)</option>
              <option value="sort_desc" className="bg-[#0b0f19]">Sort Severity: Critical → Low</option>
              <option value="sort_asc" className="bg-[#0b0f19]">Sort Severity: Low → Critical</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer py-1"
            >
              <option value="newest" className="bg-[#0b0f19]">Newest First</option>
              <option value="highest_score" className="bg-[#0b0f19]">Highest Risk Score</option>
              <option value="lowest_score" className="bg-[#0b0f19]">Lowest Risk Score</option>
              <option value="severity_desc" className="bg-[#0b0f19]">Severity: Critical → Low</option>
              <option value="severity_asc" className="bg-[#0b0f19]">Severity: Low → Critical</option>
            </select>
          </div>
        </div>

      </div>

      {/* Real-time Activity Log Table */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <h3 className="text-sm font-bold text-white">Live Scanner Detection Feed</h3>
            <span className="text-xs text-slate-400 font-mono">
              ({filteredActivityList.length} items shown)
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Export ready for CSV reporting
          </span>
        </div>

        {filteredActivityList.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 space-y-3">
            <ShieldCheck className="w-10 h-10 text-cyan-400 mx-auto opacity-80" />
            <p className="text-base font-bold text-white">No Matching Activity Logs</p>
            <p className="text-slate-400 max-w-md mx-auto">
              {searchQuery || filterCategory !== 'all'
                ? 'No threats or alerts match your current filter criteria. Try clearing the search query or category filter.'
                : 'No phishing links or fake news alerts logged yet. Use the quick simulator above or browse with the extension to populate live detections.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto no-scrollbar">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-mono tracking-wider bg-slate-950/40">
                  <th className="py-3 px-4 font-semibold">Activity Type</th>
                  <th className="py-3 px-4 font-semibold">Target URL / Claim Content</th>
                  <th className="py-3 px-4 font-semibold">Score</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Detection Details</th>
                  <th className="py-3 px-4 font-semibold text-right">Captured At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredActivityList.map((item) => {
                  const isPhishing = item.category === 'phishing';
                  const isFakeNews = item.category === 'fake_news';
                  const isMalware = item.category === 'malware';

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-900/70 transition-all group"
                    >
                      {/* Activity Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {isPhishing && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                              <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                              <span>PHISHING LINK</span>
                            </span>
                          )}
                          {isFakeNews && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                              <Newspaper className="w-3.5 h-3.5 text-amber-400" />
                              <span>FAKE NEWS ALERT</span>
                            </span>
                          )}
                          {isMalware && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                              <Cpu className="w-3.5 h-3.5 text-purple-400" />
                              <span>MALWARE PE</span>
                            </span>
                          )}
                          {!isPhishing && !isFakeNews && !isMalware && (
                            <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-slate-800 text-cyan-300 border border-slate-700">
                              {item.titleLabel.toUpperCase()}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target Content (URL or Claim text) */}
                      <td className="py-3.5 px-4 max-w-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-mono text-white font-semibold truncate max-w-[280px]"
                              title={item.targetContent}
                            >
                              {item.targetContent}
                            </span>
                            <button
                              onClick={() => handleCopy(item.id, item.targetContent)}
                              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-all"
                              title="Copy URL / Claim"
                            >
                              {copiedId === item.id ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">
                            Source: <span className="text-cyan-400">{item.sourceOrDomain}</span>
                          </div>
                        </div>
                      </td>

                      {/* Risk / Fake Score & Severity Level */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                              item.score >= 90
                                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                                : item.score >= 75
                                ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                                : item.score >= 50
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            }`}
                          >
                            {item.score}% Risk
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                              item.score >= 90
                                ? 'bg-rose-950/60 text-rose-400 border-rose-800'
                                : item.score >= 75
                                ? 'bg-orange-950/60 text-orange-400 border-orange-800'
                                : item.score >= 50
                                ? 'bg-amber-950/60 text-amber-400 border-amber-800'
                                : 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                            }`}
                          >
                            {item.score >= 90
                              ? 'Critical'
                              : item.score >= 75
                              ? 'High'
                              : item.score >= 50
                              ? 'Medium'
                              : 'Low'}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            item.status === 'BLOCKED' || item.status === 'FLAGGED'
                              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                              : item.status === 'CAUTION'
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      {/* Detection Details */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <p
                          className="text-[11px] text-slate-300 line-clamp-2"
                          title={item.details}
                        >
                          {item.details}
                        </p>
                      </td>

                      {/* Captured At */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap font-mono text-[11px] text-slate-400">
                        <div className="flex items-center justify-end gap-1.5">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>
                            {new Date(item.timestamp).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* CSV Export & API Telemetry Summary Footer */}
      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span>
            Showing <strong>{filteredActivityList.length}</strong> of <strong>{combinedActivityList.length}</strong> total captured threat events & fake news reports.
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 transition-all underline underline-offset-4"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV for Reporting</span>
          </button>
        </div>
      </div>

    </div>
  );
};
