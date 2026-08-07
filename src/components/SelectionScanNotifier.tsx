import React, { useEffect, useState } from 'react';
import { useSentinel } from '../context/SentinelContext';
import { analyzeFakeNews, analyzeUrlThreat } from '../services/api';
import { ShieldAlert, ShieldCheck, Search, Sparkles } from 'lucide-react';

export const SelectionScanNotifier: React.FC = () => {
  const { logFakeNewsReport, logThreat } = useSentinel();
  const [notification, setNotification] = useState<{
    text: string;
    isScanning: boolean;
    isFakeOrDangerous?: boolean;
    verdictTitle?: string;
    verdictDetails?: string;
  } | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const handleCopy = (e: ClipboardEvent) => {
      const selected = window.getSelection()?.toString().trim() || '';
      if (selected.length > 5) {
        runScan(selected);
      }
    };

    const handleMouseUp = () => {
      const selected = window.getSelection()?.toString().trim() || '';
      if (selected.length > 15) {
        runScan(selected);
      }
    };

    window.addEventListener('copy', handleCopy);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('copy', handleCopy);
      window.removeEventListener('mouseup', handleMouseUp);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const runScan = async (rawText: string) => {
    setNotification({
      text: rawText,
      isScanning: true
    });

    const isUrl = /^https?:\/\//i.test(rawText) || /^[a-z0-9-]+\.[a-z]{2,}/i.test(rawText);

    if (isUrl) {
      const urlRes = await analyzeUrlThreat(rawText);
      const isDangerous = urlRes.status === 'dangerous' || urlRes.status === 'suspicious';
      
      setNotification({
        text: rawText,
        isScanning: false,
        isFakeOrDangerous: isDangerous,
        verdictTitle: isDangerous ? `🔴 PHISHING / DANGEROUS LINK (${urlRes.threatScore}%)` : '🟢 SECURE & VERIFIED LINK',
        verdictDetails: urlRes.recommendation
      });

      if (isDangerous) {
        logThreat({
          url: urlRes.url,
          domain: urlRes.domain,
          threatType: 'phishing',
          severity: urlRes.threatScore,
          isBlocked: true,
          details: urlRes.recommendation
        });
      }
    } else {
      const report = await analyzeFakeNews(rawText);
      
      setNotification({
        text: rawText,
        isScanning: false,
        isFakeOrDangerous: report.isFake,
        verdictTitle: report.isFake ? `🔴 FAKE NEWS DETECTED (${report.fakeScore}%)` : '🟢 VERIFIED FACTUAL NEWS',
        verdictDetails: report.claims[0]?.explanation || report.missingContext || 'Fact-checked against AI archives.'
      });

      logFakeNewsReport({
        contentHash: report.contentHash,
        contentText: report.contentText,
        sourceUrl: report.sourceUrl,
        sourceDomain: report.sourceDomain,
        fakeScore: report.fakeScore,
        confidence: report.confidence,
        isFake: report.isFake,
        biasScore: report.biasScore,
        claims: report.claims,
        missingContext: report.missingContext,
        status: report.status
      });
    }

    // Auto disappear after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  if (!notification) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-[#0b0f19]/95 backdrop-blur-md border border-cyan-500/40 rounded-2xl p-4 shadow-2xl animate-bounce-short space-y-2 text-white">
      {notification.isScanning ? (
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />
          <div>
            <span className="text-xs font-bold text-cyan-300 block uppercase tracking-wider">Scanning Selection...</span>
            <p className="text-[11px] text-slate-300 font-mono truncate max-w-[240px]">"{notification.text}"</p>
          </div>
        </div>
      ) : (
        <div className="space-y-1 animate-fadeIn">
          <div className="flex items-center gap-2">
            {notification.isFakeOrDangerous ? (
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0" />
            ) : (
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            )}
            <span className="text-xs font-extrabold uppercase tracking-wide">
              {notification.verdictTitle}
            </span>
          </div>

          <p className="text-xs text-slate-300 line-clamp-2 leading-tight pl-7">
            {notification.verdictDetails}
          </p>

          <div className="pt-1 flex justify-between items-center text-[10px] text-slate-400 pl-7">
            <span>Saved to Database Log</span>
            <span className="text-cyan-400">Closing in 3s...</span>
          </div>
        </div>
      )}
    </div>
  );
};
