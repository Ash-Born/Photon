import React from 'react';
import { useSentinel } from '../../context/SentinelContext';
import { downloadPdfReport, downloadCsvReport } from '../../services/pdfGenerator';
import { ShieldAlert, ShieldCheck, Newspaper, Cpu, Download, ArrowUpRight, Lock, Key, FileText } from 'lucide-react';

export const LiteDashboard: React.FC = () => {
  const {
    totalThreatsCount,
    phishingCount,
    malwareCount,
    fakeNewsCount,
    threatLogs,
    fakeNewsReports,
    currentTier,
    setUnlockModalOpen,
    auditLogs,
    setActiveTab
  } = useSentinel();

  const isProOrAbove = currentTier !== 'lite';

  const handleDownloadPdf = () => {
    if (!isProOrAbove) {
      setUnlockModalOpen(true);
      return;
    }
    downloadPdfReport(threatLogs, fakeNewsReports, currentTier);
  };

  const handleDownloadCsv = () => {
    if (!isProOrAbove) {
      setUnlockModalOpen(true);
      return;
    }
    downloadCsvReport(threatLogs, auditLogs);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Threats Blocked</span>
            <ShieldAlert className="w-5 h-5 text-rose-500" />
          </div>
          <div className="text-3xl font-black text-white">{totalThreatsCount}</div>
          <p className="text-[11px] text-slate-400">Real-time protection status</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Phishing Links</span>
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-300">{phishingCount}</div>
          <p className="text-[11px] text-slate-400">25-Feature ML & VirusTotal</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Malware PE Files</span>
            <Cpu className="w-5 h-5 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-300">{malwareCount}</div>
          <p className="text-[11px] text-slate-400">Random Forest 99.1% Classifier</p>
        </div>

        <div className="p-5 rounded-2xl bg-[#0b0f19] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Fake News Claims</span>
            <Newspaper className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">{fakeNewsCount}</div>
          <p className="text-[11px] text-slate-400">BERT + Web Search AI</p>
        </div>

      </div>

      {/* Recent Threat Logs Table */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white">Recent Intercepted Security Logs</h3>
            <p className="text-xs text-slate-400">Live feed of blocked phishing URLs and malicious downloads</p>
          </div>

          {/* Export Report Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('threat_activity_log')}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-500/30 hover:to-blue-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-3.5 h-3.5 text-cyan-400" />
              <span>Full Threat Activity Log</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/30 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF Report</span>
              {!isProOrAbove && <Lock className="w-3 h-3 text-amber-400" />}
            </button>

            <button
              onClick={handleDownloadCsv}
              className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
              {!isProOrAbove && <Lock className="w-3 h-3 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto no-scrollbar">
          {threatLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-sans space-y-2">
              <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
              <p className="font-bold text-white">System Active & Guarding in Real Time</p>
              <p className="text-slate-400">No security incidents logged yet. Copy a phishing URL or text selection to trigger real-time detection!</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-3 font-semibold">URI / Domain</th>
                  <th className="pb-3 font-semibold">Category</th>
                  <th className="pb-3 font-semibold">Severity</th>
                  <th className="pb-3 font-semibold">Action</th>
                  <th className="pb-3 font-semibold">Detected At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {threatLogs.slice(0, 8).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50 transition-all">
                    <td className="py-3 font-semibold text-white truncate max-w-[220px]">
                      {log.domain}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                        {log.threatType.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`font-bold ${log.severity >= 80 ? 'text-rose-400' : 'text-amber-400'}`}>
                        {log.severity}%
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        BLOCKED
                      </span>
                    </td>
                    <td className="py-3 text-slate-400 text-[11px]">
                      {new Date(log.detectedAt).toLocaleTimeString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>

    </div>
  );
};
