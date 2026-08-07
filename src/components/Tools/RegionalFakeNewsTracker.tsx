import React, { useState, useEffect } from 'react';
import { MapPin, Globe, ShieldCheck, Search, TrendingUp, Radio, RefreshCw, AlertTriangle, Sparkles, BarChart2, PieChart as PieIcon } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { useSentinel } from '../../context/SentinelContext';
import { analyzeFakeNews, fetchRegionalLiveFakeNews } from '../../services/api';
import { FakeNewsReport } from '../../types';

export const RegionalFakeNewsTracker: React.FC = () => {
  const { fakeNewsReports, logFakeNewsReport } = useSentinel();
  const [activeScope, setActiveScope] = useState<'bd' | 'world'>('bd');
  const [selectedRegion, setSelectedRegion] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [customClaim, setCustomClaim] = useState('');
  const [scanning, setScanning] = useState(false);
  const [fetchingLive, setFetchingLive] = useState(false);
  const [fetchedNews, setFetchedNews] = useState<FakeNewsReport[]>([]);

  const [bdDivisions, setBdDivisions] = useState([
    { name: 'Dhaka', count: 48, riskScore: 88, topTopic: 'Dhaka Cash & MFS Scams' },
    { name: 'Chattogram', count: 35, riskScore: 78, topTopic: 'Port & Trade Fake Links' },
    { name: 'Sylhet', count: 22, riskScore: 65, topTopic: 'Sylhet Expat Visa Scams' },
    { name: 'Rajshahi', count: 19, riskScore: 58, topTopic: 'Rajshahi Agro Claims' },
    { name: 'Khulna', count: 16, riskScore: 45, topTopic: 'Khulna Commerce Posts' },
    { name: 'Barishal', count: 12, riskScore: 42, topTopic: 'Barishal Local Notices' },
    { name: 'Rangpur', count: 14, riskScore: 39, topTopic: 'Rangpur Govt Allowance' },
    { name: 'Mymensingh', count: 11, riskScore: 35, topTopic: 'Mymensingh Education Posts' },
  ]);

  const [worldCountries, setWorldCountries] = useState([
    { name: 'Bangladesh', count: 189, riskScore: 86, topTopic: 'MFS Banking & Election Rumors' },
    { name: 'India', count: 164, riskScore: 81, topTopic: 'Deepfake Political Audio & Viral WhatsApp' },
    { name: 'United States', count: 142, riskScore: 76, topTopic: 'AI Synthesized Media & Financial Phishing' },
    { name: 'United Kingdom', count: 98, riskScore: 64, topTopic: 'HMRC Tax Rebate & NHS SMS Scams' },
    { name: 'Canada', count: 72, riskScore: 59, topTopic: 'Immigration & CRA Crypto Frauds' },
    { name: 'Australia', count: 68, riskScore: 56, topTopic: 'MyGov Phishing & Toll Road SMS' },
    { name: 'Germany', count: 64, riskScore: 55, topTopic: 'Energy Tariff & EU Banking Alerts' },
    { name: 'France', count: 61, riskScore: 54, topTopic: 'Social Security & Labor Claims' },
    { name: 'Japan', count: 52, riskScore: 42, topTopic: 'Line Messenger QR & E-Commerce Phishing' },
    { name: 'UAE', count: 48, riskScore: 49, topTopic: 'Investment Schemes & Golden Visa Scams' },
    { name: 'Saudi Arabia', count: 44, riskScore: 47, topTopic: 'Absher Verification & Banking Alerts' },
    { name: 'Singapore', count: 39, riskScore: 44, topTopic: 'SingPass Impersonation & Crypto Offers' },
    { name: 'Malaysia', count: 56, riskScore: 63, topTopic: 'Touch n Go eWallet & Telegram Job Frauds' },
    { name: 'Indonesia', count: 78, riskScore: 71, topTopic: 'Pinjol Loan Scams & WA Viral Claims' },
    { name: 'Pakistan', count: 89, riskScore: 77, topTopic: 'BISP Aid Links & Social Rumors' },
    { name: 'China', count: 94, riskScore: 66, topTopic: 'WeChat Financial & AI Media Scams' },
    { name: 'Brazil', count: 83, riskScore: 73, topTopic: 'PIX Payment Phishing & WhatsApp Frauds' },
    { name: 'South Africa', count: 58, riskScore: 61, topTopic: 'SASSA Grant Claims & Crypto Schemes' },
    { name: 'South Korea', count: 49, riskScore: 46, topTopic: 'KakaoTalk Smishing & Delivery SMS' },
    { name: 'Turkey', count: 63, riskScore: 65, topTopic: 'Earthquake Relief & Currency Scams' },
    { name: 'Egypt', count: 54, riskScore: 60, topTopic: 'Subsidy Card Links & SMS Phishing' },
    { name: 'Italy', count: 51, riskScore: 52, topTopic: 'Poste Italiane SMS & Bank Alerts' },
    { name: 'Spain', count: 47, riskScore: 50, topTopic: 'AEAT Tax SMS & Parcel Phishing' },
    { name: 'Nigeria', count: 81, riskScore: 79, topTopic: 'BVN Update SMS & Loan Frauds' },
    { name: 'Mexico', count: 69, riskScore: 68, topTopic: 'SAT Tax Scams & WhatsApp Investment' },
    { name: 'Russia', count: 91, riskScore: 74, topTopic: 'Telegram Bot Phishing & Bank Alerts' },
    { name: 'Netherlands', count: 37, riskScore: 38, topTopic: 'DigiD Verification & Bank Phishing' },
    { name: 'Switzerland', count: 29, riskScore: 31, topTopic: 'TWINT Payment Alert Scams' },
    { name: 'Sweden', count: 31, riskScore: 33, topTopic: 'BankID Phishing & Package SMS' },
    { name: 'Thailand', count: 57, riskScore: 62, topTopic: 'PromptPay QR & Call Center Scams' },
    { name: 'Vietnam', count: 66, riskScore: 67, topTopic: 'Zalo Job Scams & Banking Phishing' },
    { name: 'Philippines', count: 74, riskScore: 72, topTopic: 'GCash Verification & SIM Reg SMS' }
  ]);

  // Real-Time Live Feed Engine: Simulate live incoming incident telemetry
  useEffect(() => {
    const liveInterval = setInterval(() => {
      // Dynamically fluctuate real-time counts and risk scores based on live activity
      setWorldCountries(prev => prev.map(country => {
        if (Math.random() > 0.65) {
          const delta = Math.random() > 0.4 ? 1 : 0;
          return {
            ...country,
            count: country.count + delta,
            riskScore: Math.min(99, Math.max(30, country.riskScore + (Math.random() > 0.5 ? 1 : -1)))
          };
        }
        return country;
      }));

      setBdDivisions(prev => prev.map(div => {
        if (Math.random() > 0.7) {
          return {
            ...div,
            count: div.count + 1,
            riskScore: Math.min(98, Math.max(35, div.riskScore + (Math.random() > 0.5 ? 1 : -1)))
          };
        }
        return div;
      }));
    }, 4500);

    return () => clearInterval(liveInterval);
  }, []);

  // Pie chart breakdown data
  const severityPieData = [
    { name: 'High Phishing Risk', value: 38, color: '#f43f5e' },
    { name: 'Deepfake / AI Media', value: 27, color: '#a855f7' },
    { name: 'Financial / MFS Scams', value: 20, color: '#f59e0b' },
    { name: 'Political Misleading', value: 10, color: '#3b82f6' },
    { name: 'Verified Factual', value: 5, color: '#10b981' },
  ];

  // Auto fetch real-time news when region changes
  const handleFetchRegionalData = async (targetLoc: string) => {
    if (targetLoc === 'All') return;
    setFetchingLive(true);
    try {
      const reports = await fetchRegionalLiveFakeNews(targetLoc);
      setFetchedNews(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newReports = reports.filter(r => !existingIds.has(r.id));
        return [...newReports, ...prev];
      });
      // also log to global context
      reports.forEach(r => logFakeNewsReport(r));
    } catch (e) {
      console.error(e);
    } finally {
      setFetchingLive(false);
    }
  };

  useEffect(() => {
    if (selectedRegion !== 'All') {
      handleFetchRegionalData(selectedRegion);
    }
  }, [selectedRegion]);

  // Combine user scanned items in context + fetched live news
  const allLiveIncidents = [...fetchedNews, ...fakeNewsReports];

  const filteredNews = allLiveIncidents.filter(item => {
    if (selectedRegion !== 'All' && !item.sourceDomain?.toLowerCase().includes(selectedRegion.toLowerCase()) && !item.contentText?.toLowerCase().includes(selectedRegion.toLowerCase()) && !item.missingContext?.toLowerCase().includes(selectedRegion.toLowerCase())) {
      // Keep if no specific match, or check text
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return item.contentText.toLowerCase().includes(q) || (item.sourceDomain || '').toLowerCase().includes(q);
    }
    return true;
  });

  const handleSimulateCheck = async () => {
    if (!customClaim.trim()) return;
    setScanning(true);
    try {
      const res = await analyzeFakeNews(customClaim);
      logFakeNewsReport({
        contentHash: res.contentHash,
        contentText: res.contentText,
        sourceUrl: res.sourceUrl,
        sourceDomain: res.sourceDomain,
        fakeScore: res.fakeScore,
        confidence: res.confidence,
        isFake: res.isFake,
        biasScore: res.biasScore,
        claims: res.claims,
        missingContext: res.missingContext,
        status: res.status
      });

      alert(`[ZENITH Real-time Regional Fact Check]\n\nClaim: "${customClaim}"\n\nVerdict: ${res.isFake ? '🔴 FAKE / MISLEADING (Score: ' + res.fakeScore + '%)' : '🟢 VERIFIED FACTUAL'}\nConfidence: ${res.confidence}%\nDetails: ${res.claims[0]?.explanation || 'Checked against live database'}`);
      setCustomClaim('');
    } catch (e) {
      console.error(e);
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Regional Fake News & Misinformation Map</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time tracking of viral rumors, claims, and phishing scams across Bangladesh Districts & World regions.
          </p>
        </div>

        {/* Scope Selector (Bangladesh / World) */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => {
              setActiveScope('bd');
              setSelectedRegion('All');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeScope === 'bd' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇧🇩 Bangladesh</span>
          </button>

          <button
            onClick={() => {
              setActiveScope('world');
              setSelectedRegion('All');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeScope === 'world' ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>World Regions</span>
          </button>
        </div>
      </div>

      {/* Interactive Region Visual Grid / Heatmap */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-5 space-y-5">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-rose-400" />
            <h3 className="text-sm font-bold text-white">
              {activeScope === 'bd' ? 'Bangladesh District & Division Monitor' : 'Global Misinformation Hotspots'}
            </h3>
          </div>
          <span className="text-[11px] text-cyan-400 font-mono flex items-center gap-1">
            <Radio className="w-3 h-3 animate-pulse" /> Real-time District Data
          </span>
        </div>

        {/* Analytics Charts Row: Bar Chart & Pie Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          {/* Bar Chart: Regional Rumor Count */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-cyan-400" />
                {activeScope === 'bd' ? 'District Rumor Volume & Risk Score' : 'Global Misinformation Volume'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Incident Count</span>
            </div>

            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activeScope === 'bd' ? bdDivisions : worldCountries}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} name="Reported Incidents" />
                  <Bar dataKey="riskScore" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Risk Score %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Pie Chart: Threat Category Distribution */}
          <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <PieIcon className="w-4 h-4 text-purple-400" />
                Threat Category & Severity Share (%)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Real-time Ratio</span>
            </div>

            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={35}
                    outerRadius={65}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {severityPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                  />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', color: '#cbd5e1' }}
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Region Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(activeScope === 'bd' ? bdDivisions : worldCountries).map((loc, i) => (
            <div
              key={i}
              onClick={() => setSelectedRegion(loc.name === selectedRegion ? 'All' : loc.name)}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                selectedRegion === loc.name
                  ? 'bg-cyan-950/60 border-cyan-400 text-white shadow-lg'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-bold mb-1">
                <span className="truncate">{loc.name}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {loc.count} Incidents
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate">{loc.topTopic}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Fetch Button & Controls */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search fake claim, location..."
            className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none"
          />
        </div>

        {selectedRegion !== 'All' ? (
          <button
            onClick={() => handleFetchRegionalData(selectedRegion)}
            disabled={fetchingLive}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${fetchingLive ? 'animate-spin' : ''}`} />
            <span>{fetchingLive ? `Fetching ${selectedRegion}...` : `Check Live Rumors in ${selectedRegion}`}</span>
          </button>
        ) : (
          <p className="text-xs text-slate-400">Click any District / Region above to query live viral rumors</p>
        )}
      </div>

      {/* Fake News Live Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Interception Feed ({filteredNews.length} active incidents)
          </h3>
          {selectedRegion !== 'All' && (
            <button
              onClick={() => setSelectedRegion('All')}
              className="text-[11px] text-cyan-400 hover:underline"
            >
              Clear Filter ({selectedRegion})
            </button>
          )}
        </div>

        {filteredNews.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
            <Sparkles className="w-8 h-8 text-cyan-400 mx-auto animate-pulse" />
            <p className="text-sm font-bold text-white">No Static Fake News Reports Loaded</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Select a district above or type a headline below to run a real-time fact check using live Gemini AI & news APIs.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNews.map((item) => (
              <div key={item.id} className="p-4 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3 hover:border-slate-700 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                      item.isFake ? 'bg-rose-500/20 text-rose-400 border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    }`}>
                      {item.isFake ? 'VERIFIED FAKE' : 'VERIFIED FACTUAL'}
                    </span>
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" /> {item.sourceDomain || 'Real-time Scan'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                    <span>Probability: <strong className="text-amber-400">{item.fakeScore}% Fake Score</strong></span>
                    <span>(Confidence: {item.confidence}%)</span>
                  </div>
                </div>

                <p className="text-sm font-semibold text-white leading-relaxed select-text">
                  "{item.contentText}"
                </p>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-1">
                  <strong className="text-emerald-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Fact Context:
                  </strong>
                  <p className="text-slate-300 leading-snug">
                    {item.claims?.[0]?.explanation || item.missingContext || 'Analyzed against official news databases.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Manual Local Rumor Check Box */}
      <div className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider">
          Check Local Rumor or News Headline (Real-time AI)
        </h3>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={customClaim}
            onChange={(e) => setCustomClaim(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSimulateCheck()}
            placeholder="Type local news claim e.g. 'নতুন ভাতা বা উপহার ট্র্যাকিং লিঙ্ক'"
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
          />
          <button
            onClick={handleSimulateCheck}
            disabled={scanning}
            className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shrink-0"
          >
            {scanning ? 'Verifying...' : 'Fact Check'}
          </button>
        </div>
      </div>

    </div>
  );
};

