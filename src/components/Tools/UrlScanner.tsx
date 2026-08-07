import React, { useState } from 'react';
import { useSentinel } from '../../context/SentinelContext';
import { analyzeUrlThreat } from '../../services/api';
import { UrlScanResult } from '../../types';
import { Radio, Search, ShieldAlert, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ExternalLink, Zap } from 'lucide-react';

export const UrlScanner: React.FC = () => {
  const { logThreat, consumeApiCredit, apiQuota } = useSentinel();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UrlScanResult | null>(null);

  const handleScan = async (urlToScan?: string) => {
    const target = urlToScan || url;
    if (!target.trim()) return;

    if (apiQuota.remaining <= 0) {
      alert('API Limit Reached! (0 credits remaining). Unlock Pro/Enterprise or Refill API quota.');
      return;
    }

    setLoading(true);
    setResult(null);
    consumeApiCredit();

    try {
      const scan = await analyzeUrlThreat(target);
      setResult(scan);

      if (scan.status === 'dangerous' || scan.status === 'suspicious') {
        logThreat({
          url: scan.url,
          domain: scan.domain,
          threatType: 'phishing',
          severity: scan.threatScore,
          isBlocked: true,
          details: scan.recommendation
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/30 via-slate-900 to-blue-950/30 border border-cyan-500/20 glass-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">25-Feature ML Phishing & URL Inspector</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Combines Random Forest URL classification (ONNX), VirusTotal v3, PhishTank, and URLhaus threat feeds.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-slate-300">Engine Accuracy: </span>
          <span className="text-cyan-400 font-bold">96.4%</span>
        </div>
      </div>

      {/* Input Field */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
          Target Domain / URL Search
        </label>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleScan()}
              placeholder="e.g. https://paypal-verify.xyz or secure-bank-login.net"
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none transition-all font-mono"
            />
          </div>

          <button
            onClick={() => handleScan()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {loading ? 'Scanning Features...' : 'Inspect Link'}
          </button>
        </div>

        {/* No preset sample links - 100% real-time input */}
      </div>

      {/* Result Card */}
      {result && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          
          {/* Status Header */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            result.status === 'dangerous'
              ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
              : result.status === 'suspicious'
              ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
              : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {result.status === 'dangerous' ? (
                <ShieldAlert className="w-10 h-10 text-rose-500 shrink-0" />
              ) : result.status === 'suspicious' ? (
                <AlertTriangle className="w-10 h-10 text-amber-400 shrink-0" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-mono uppercase tracking-widest font-bold block opacity-80">
                  ASSESSMENT STATUS
                </span>
                <h3 className="text-xl font-extrabold uppercase tracking-wide">
                  {result.status.toUpperCase()} (Threat Score: {result.threatScore}%)
                </h3>
                <p className="text-xs font-mono mt-0.5 opacity-90 break-all">{result.url}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-black/40 px-4 py-3 rounded-xl border border-white/10 text-center font-mono">
              <div>
                <span className="text-[10px] text-slate-400 block">TRUST METRIC</span>
                <span className="text-lg font-bold text-cyan-400">{result.trustScore}%</span>
              </div>
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-cyan-400 block uppercase tracking-wider">
              ZENITH Recommendation
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">{result.recommendation}</p>
          </div>

          {/* 25-Feature Matrix Grid */}
          <div>
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
              Extracted Machine Learning Features
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">HTTPS Protocol</span>
                <span className={`font-bold flex items-center gap-1 mt-1 ${result.featuresAnalyzed.hasHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.featuresAnalyzed.hasHttps ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  {result.featuresAnalyzed.hasHttps ? 'Valid HTTPS' : 'Insecure HTTP'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Domain Age</span>
                <span className="font-bold text-cyan-300 mt-1 block">
                  {result.featuresAnalyzed.domainAgeDays} days
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">VirusTotal Detections</span>
                <span className={`font-bold mt-1 block ${result.featuresAnalyzed.virusTotalDetections > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {result.featuresAnalyzed.virusTotalDetections} / 70 Engines
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-400 block">Raw IP in Hostname</span>
                <span className={`font-bold flex items-center gap-1 mt-1 ${!result.featuresAnalyzed.ipInHost ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {result.featuresAnalyzed.ipInHost ? 'Yes (IP Obfuscated)' : 'No (Domain Host)'}
                </span>
              </div>

            </div>
          </div>

        </div>
      )}

    </div>
  );
};
