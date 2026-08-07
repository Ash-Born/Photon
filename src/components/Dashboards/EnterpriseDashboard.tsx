import React, { useState } from 'react';
import { useSentinel } from '../../context/SentinelContext';
import { Sliders, MapPin, Shield, Check, Lock, Radio, Activity, Globe } from 'lucide-react';

export const EnterpriseDashboard: React.FC = () => {
  const { currentTier, setUnlockModalOpen, logAudit } = useSentinel();

  const isEnterprise = currentTier === 'enterprise' || currentTier === 'super_admin';

  const [policies, setPolicies] = useState([
    { id: 'p1', name: 'Enforce Pre-Download PE Malware Block', enabled: true, category: 'Malware' },
    { id: 'p2', name: 'Enforce Emergency Red Screen on Score ≥ 80%', enabled: true, category: 'Phishing' },
    { id: 'p3', name: 'DOM Mutation XSS Guard Injection Interception', enabled: true, category: 'Scripting' },
    { id: 'p4', name: 'SSL Certificate Pinning & MITM Spoof Guard', enabled: true, category: 'Network' },
    { id: 'p5', name: 'DDoS Anomaly Rate-Limiting Filter', enabled: true, category: 'Network' },
    { id: 'p6', name: 'CNN Deepfake Image & Video Content Inspection', enabled: true, category: 'Media' },
  ]);

  const districtData = [
    { district: 'Dhaka Division', count: 142, riskLevel: 'HIGH', topCategory: 'Financial Gift Scams' },
    { district: 'Chattogram Division', count: 88, riskLevel: 'MEDIUM', topCategory: 'Port Customs Phishing' },
    { district: 'Sylhet Division', count: 54, riskLevel: 'MEDIUM', topCategory: 'Expat Travel Fraud' },
    { district: 'Rajshahi Division', count: 41, riskLevel: 'LOW', topCategory: 'Crop Subsidy Rumors' },
    { district: 'Khulna Division', count: 39, riskLevel: 'LOW', topCategory: 'Job Portal Scams' },
  ];

  const togglePolicy = (id: string) => {
    setPolicies(policies.map(p => {
      if (p.id === id) {
        const nextState = !p.enabled;
        logAudit(`Enterprise Policy Modified: ${p.name}`, 'policy', `New status: ${nextState ? 'ENABLED' : 'DISABLED'}`);
        return { ...p, enabled: nextState };
      }
      return p;
    }));
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-cyan-950/40 border border-purple-500/20 glass-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Enterprise Central Policy & Heatmap Control</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Centralized security enforcement across enterprise browser deployments with regional threat intelligence.
          </p>
        </div>

        {!isEnterprise && (
          <button
            onClick={() => setUnlockModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20"
          >
            <Lock className="w-4 h-4" />
            <span>Unlock Enterprise Access</span>
          </button>
        )}
      </div>

      {!isEnterprise ? (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 text-center space-y-4">
          <Shield className="w-12 h-12 text-purple-400 mx-auto animate-pulse" />
          <h3 className="text-lg font-bold text-white">Enterprise Policy Editor Locked</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Centralized organization policy management, WebSocket streaming, and district-wise threat heatmaps require Enterprise access.
          </p>
        </div>
      ) : (
        <>
          {/* Policy Enforcer Grid */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Organization Security Policy Rules</h3>
              </div>
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> WebSocket Live Sync
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {policies.map((p) => (
                <div
                  key={p.id}
                  onClick={() => togglePolicy(p.id)}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                    p.enabled
                      ? 'bg-cyan-950/40 border-cyan-500/40 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-cyan-400 border border-cyan-900">
                      {p.category}
                    </span>
                    <h4 className="text-xs font-bold leading-snug">{p.name}</h4>
                  </div>

                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${
                    p.enabled ? 'bg-cyan-500 border-cyan-400 text-slate-950' : 'bg-slate-800 border-slate-700 text-transparent'
                  }`}>
                    <Check className="w-4 h-4 font-black" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* District-wise Threat Heatmap Table */}
          <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">District-Wise Fake News & Threat Distribution</h3>
              </div>
              <span className="text-xs text-slate-400 font-mono">5 Regions Monitored</span>
            </div>

            <div className="overflow-x-auto no-scrollbar">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="pb-3">Region / Division</th>
                    <th className="pb-3">Incident Count</th>
                    <th className="pb-3">Risk Severity</th>
                    <th className="pb-3">Primary Threat Vector</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {districtData.map((d, i) => (
                    <tr key={i} className="hover:bg-slate-900/50">
                      <td className="py-3 font-bold text-white flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{d.district}</span>
                      </td>
                      <td className="py-3 font-bold text-cyan-300">{d.count} Events</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          d.riskLevel === 'HIGH' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}>
                          {d.riskLevel}
                        </span>
                      </td>
                      <td className="py-3 text-slate-400">{d.topCategory}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
};
