import React, { useState } from 'react';
import { useSentinel } from '../../context/SentinelContext';
import { analyzeFakeNews } from '../../services/api';
import { FakeNewsReport } from '../../types';
import { Newspaper, Search, ShieldCheck, ShieldAlert, AlertCircle, FileText, Scale, Info, Sparkles, CheckCircle2 } from 'lucide-react';

export const FakeNewsAnalyzer: React.FC = () => {
  const { logFakeNewsReport, consumeApiCredit, apiQuota } = useSentinel();
  const [inputText, setInputText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<FakeNewsReport | null>(null);

  const handleVerify = async (textToVerify?: string) => {
    const text = textToVerify || inputText;
    if (!text.trim()) return;

    if (apiQuota.remaining <= 0) {
      alert('API Limit Reached! (0 credits remaining). Unlock Pro/Enterprise or Refill API quota.');
      return;
    }

    setLoading(true);
    setReport(null);
    consumeApiCredit();

    try {
      const result = await analyzeFakeNews(text, sourceUrl);
      setReport(result);

      logFakeNewsReport({
        contentHash: result.contentHash,
        contentText: result.contentText,
        sourceUrl: result.sourceUrl,
        sourceDomain: result.sourceDomain,
        fakeScore: result.fakeScore,
        confidence: result.confidence,
        isFake: result.isFake,
        biasScore: result.biasScore,
        claims: result.claims,
        missingContext: result.missingContext,
        status: result.status
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Title Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-cyan-950/30 border border-amber-500/20 glass-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">AI Fake News & BERT Claim Fact-Checker</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            BERT NLP claim extraction, cross-web search verification, emotional bias detection, and missing context highlighter.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-slate-300">Model: </span>
          <span className="text-cyan-300 font-bold">BERT-FactCheck-V2</span>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Paste Headline, Post or News Content
          </label>
          <textarea
            rows={4}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste text or claim e.g. 'Government announced 10,000 taka gift...'"
            className="w-full bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl p-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-all"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <input
            type="text"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="Source URL (Optional) e.g. https://news-site.com/article"
            className="w-full sm:w-80 bg-slate-900 border border-slate-700 focus:border-amber-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
          />

          <button
            onClick={() => handleVerify()}
            disabled={loading || !inputText.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-extrabold text-sm shadow-lg shadow-amber-500/20 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'AI Verifying Claims...' : 'Verify Factuality'}
          </button>
        </div>
      </div>

      {/* Verification Output Report */}
      {report && (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6 animate-fadeIn">
          
          {/* Main Status Badge */}
          <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-4 ${
            report.isFake
              ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
              : 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
          }`}>
            <div className="flex items-center gap-3">
              {report.isFake ? (
                <ShieldAlert className="w-10 h-10 text-rose-500 shrink-0" />
              ) : (
                <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
              )}
              <div>
                <span className="text-xs font-mono uppercase tracking-widest font-bold block opacity-80">
                  FACT-CHECK CONCLUSION: {report.isFake ? 'MISLEADING / FAKE NEWS' : 'VERIFIED FACTUAL'}
                </span>
                <h3 className="text-xl font-extrabold uppercase tracking-wide">
                  Fake News Risk: {report.fakeScore}%
                </h3>
                <span className="text-xs font-mono opacity-80">
                  BERT Model Confidence: {report.confidence}%
                </span>
              </div>
            </div>

            {/* Bias Score Meter */}
            <div className="bg-black/40 px-4 py-3 rounded-xl border border-white/10 text-center font-mono text-xs">
              <span className="text-slate-400 block text-[10px]">POLITICAL & EMOTIONAL BIAS</span>
              <span className={`text-base font-bold ${report.biasScore > 50 ? 'text-amber-400' : 'text-cyan-400'}`}>
                {report.biasScore}% {report.biasScore > 50 ? '(High Bias)' : '(Neutral)'}
              </span>
            </div>
          </div>

          {/* Claim-by-Claim Breakdown */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4 text-cyan-400" />
              <span>Claim-By-Claim Fact Breakdown</span>
            </h4>

            <div className="space-y-2">
              {report.claims.map((c, i) => (
                <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Claim #{i + 1}: "{c.claim}"</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                      c.rating === 'FALSE' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {c.rating}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed pt-1">{c.explanation}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Missing Context Section */}
          {report.missingContext && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs space-y-1">
              <span className="font-bold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Omitted / Missing Essential Context</span>
              </span>
              <p className="text-slate-300 leading-relaxed">{report.missingContext}</p>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
