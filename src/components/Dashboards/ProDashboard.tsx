import React, { useState } from 'react';
import { useSentinel } from '../../context/SentinelContext';
import { Layers, Sliders, Database, Search, Plus, Trash2, Shield, Lock } from 'lucide-react';

export const ProDashboard: React.FC = () => {
  const { threatLogs, currentTier, setUnlockModalOpen, logAudit } = useSentinel();
  const [filterQuery, setFilterQuery] = useState('');
  const [customRules, setCustomRules] = useState([
    { id: 1, condition: 'Domain contains ".xyz"', score: '+35', type: 'Phishing Weight' },
    { id: 2, condition: 'Missing SSL / HTTP Protocol', score: '+20', type: 'Transport Risk' },
    { id: 3, condition: 'Executable PE Entropy > 7.0', score: '+45', type: 'Packer Warning' }
  ]);
  const [newRuleCondition, setNewRuleCondition] = useState('');
  const [newRuleScore, setNewRuleScore] = useState('+25');

  const isProOrAbove = currentTier === 'pro' || currentTier === 'enterprise' || currentTier === 'super_admin';

  const handleAddRule = () => {
    if (!newRuleCondition.trim()) return;
    const rule = {
      id: Date.now(),
      condition: newRuleCondition,
      score: newRuleScore,
      type: 'Custom Weight'
    };
    setCustomRules([...customRules, rule]);
    setNewRuleCondition('');
    logAudit(`Added custom scoring rule: ${newRuleCondition}`, 'policy', `Score adjustment: ${newRuleScore}`);
  };

  const handleRemoveRule = (id: number) => {
    setCustomRules(customRules.filter(r => r.id !== id));
  };

  const filteredLogs = threatLogs.filter(t =>
    t.domain.toLowerCase().includes(filterQuery.toLowerCase()) ||
    t.threatType.toLowerCase().includes(filterQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/30 via-slate-900 to-cyan-950/30 border border-amber-500/20 glass-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-6 h-6 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Pro Security Dashboard & Rule Engine</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            30-day threat archives, heuristic custom score rule manager, and high-speed local cache metrics.
          </p>
        </div>

        {!isProOrAbove && (
          <button
            onClick={() => setUnlockModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-amber-500/20"
          >
            <Lock className="w-4 h-4" />
            <span>Unlock Pro Access</span>
          </button>
        )}
      </div>

      {/* 30-Day Simulated Visual Bar Graph */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-white">30-Day Threat Interception Trend</h3>
          <span className="text-xs font-mono text-cyan-400">Total Scans: 14,280</span>
        </div>

        {/* Bar Chart Simulation */}
        <div className="h-32 flex items-end justify-between gap-1 sm:gap-2 pt-4 px-2">
          {[40, 65, 30, 85, 45, 90, 70, 50, 100, 75, 60, 40, 95, 80, 55, 70, 85, 40, 60, 90, 100, 75, 50, 65, 80, 90, 45, 60, 85, 95].map((val, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
              <div
                style={{ height: `${val}%` }}
                className="w-full bg-gradient-to-t from-cyan-600 to-cyan-400 rounded-t-sm group-hover:from-cyan-400 group-hover:to-cyan-200 transition-all"
              />
              <div className="absolute -top-7 hidden group-hover:block bg-black text-cyan-300 font-mono text-[9px] px-1.5 py-0.5 rounded border border-cyan-800 whitespace-nowrap z-10">
                Day {i + 1}: {val * 3} Threats
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
          <span>30 Days Ago</span>
          <span>15 Days Ago</span>
          <span>Today</span>
        </div>
      </div>

      {/* Custom Scoring Rules Engine */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Custom Threat Weight Scoring Rules</h3>
          </div>
          <span className="text-xs text-slate-400 font-mono">{customRules.length} Active Rules</span>
        </div>

        {/* Add New Rule Input */}
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={newRuleCondition}
            onChange={(e) => setNewRuleCondition(e.target.value)}
            placeholder="e.g. Domain matches sub.fake-auth.*"
            className="flex-1 w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
          />
          <select
            value={newRuleScore}
            onChange={(e) => setNewRuleScore(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-mono focus:outline-none"
          >
            <option value="+15">+15 (Low Risk)</option>
            <option value="+25">+25 (Medium Risk)</option>
            <option value="+45">+45 (High Risk)</option>
            <option value="+65">+65 (Immediate Red Screen)</option>
          </select>
          <button
            onClick={handleAddRule}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Rule</span>
          </button>
        </div>

        {/* Rules List */}
        <div className="space-y-2">
          {customRules.map((rule) => (
            <div key={rule.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="font-semibold text-white">{rule.condition}</span>
                <span className="text-[10px] text-slate-500 ml-3">• {rule.type}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                  {rule.score} Risk
                </span>
                <button
                  onClick={() => handleRemoveRule(rule.id)}
                  className="text-slate-500 hover:text-rose-400 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filterable History Logs Archive */}
      <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <h3 className="text-sm font-bold text-white">Full Threat Archive Search</h3>
          
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search domain or threat..."
              className="w-full bg-slate-900 border border-slate-700 focus:border-cyan-400 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none font-mono"
            />
          </div>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 font-sans space-y-2">
              <Shield className="w-8 h-8 text-cyan-400 mx-auto" />
              <p className="font-bold text-white">Live Threat Archive Ready</p>
              <p className="text-slate-400">All scanned URLs and threat detections will automatically be recorded here in real-time.</p>
            </div>
          ) : (
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Domain</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Severity</th>
                  <th className="pb-2">User</th>
                  <th className="pb-2">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/50">
                    <td className="py-2.5 font-semibold text-white">{log.domain}</td>
                    <td className="py-2.5">{log.threatType.toUpperCase()}</td>
                    <td className="py-2.5 font-bold text-rose-400">{log.severity}%</td>
                    <td className="py-2.5 text-slate-400">{log.userName || 'System Guard'}</td>
                    <td className="py-2.5 text-slate-500">{new Date(log.detectedAt).toLocaleTimeString()}</td>
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
