import React, { useState } from 'react';
import { useSentinel } from '../../context/SentinelContext';
import { UserTier } from '../../types';
import { Users, AlertTriangle, ToggleLeft, Globe, FileText, Lock, Plus, Trash2, ShieldCheck, Power, Search, Key } from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    currentTier,
    usersList,
    updateUserTier,
    toggleUserActive,
    featureToggles,
    toggleFeature,
    blocklist,
    addBlocklistItem,
    removeBlocklistItem,
    auditLogs,
    setUnlockModalOpen
  } = useSentinel();

  const [activeAdminSubtab, setActiveAdminSubtab] = useState<'users' | 'suspicious' | 'features' | 'blocklist' | 'audit'>('users');
  const [newBlockDomain, setNewBlockDomain] = useState('');
  const [newBlockType, setNewBlockType] = useState('Phishing');
  const [newBlockSeverity, setNewBlockSeverity] = useState(90);
  const [userSearch, setUserSearch] = useState('');

  const isSuperAdminOrEnterprise = currentTier === 'enterprise' || currentTier === 'super_admin';

  const handleAddBlocklist = () => {
    if (!newBlockDomain.trim()) return;
    addBlocklistItem(newBlockDomain, newBlockType, newBlockSeverity);
    setNewBlockDomain('');
  };

  const filteredUsers = usersList.filter(u =>
    u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const suspiciousUsers = usersList.filter(u => u.threatCount > 15);

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Admin Title Header */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-rose-950/40 border border-purple-500/30 glass-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-6 h-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Super Admin Control & System Console</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Global tier management, feature toggling, domain blocklists, and system audit logs.
          </p>
        </div>

        {!isSuperAdminOrEnterprise ? (
          <button
            onClick={() => setUnlockModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-lg shadow-purple-500/20"
          >
            <Key className="w-4 h-4" />
            <span>Unlock Admin Console</span>
          </button>
        ) : (
          <span className="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40">
            ADMIN LEVEL: {currentTier.toUpperCase()}
          </span>
        )}
      </div>

      {!isSuperAdminOrEnterprise ? (
        <div className="p-8 rounded-3xl bg-slate-900/80 border border-purple-500/30 text-center space-y-4">
          <Lock className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
          <h3 className="text-lg font-bold text-white">Super Admin Credentials Required</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please enter your security password in the Unlock Modal to access the admin console.
          </p>
          <button
            onClick={() => setUnlockModalOpen(true)}
            className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs transition-all shadow-lg shadow-purple-500/20"
          >
            Unlock Access Now
          </button>
        </div>
      ) : (
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          
          {/* Admin Navigation Subtabs */}
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveAdminSubtab('users')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminSubtab === 'users' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>User Directory ({usersList.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminSubtab('suspicious')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminSubtab === 'suspicious' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              <span>Suspicious Users ({suspiciousUsers.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminSubtab('features')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminSubtab === 'features' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <ToggleLeft className="w-3.5 h-3.5" />
              <span>Feature Toggles (35)</span>
            </button>

            <button
              onClick={() => setActiveAdminSubtab('blocklist')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminSubtab === 'blocklist' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Global Blocklist ({blocklist.length})</span>
            </button>

            <button
              onClick={() => setActiveAdminSubtab('audit')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeAdminSubtab === 'audit' ? 'bg-purple-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Audit Log Trail</span>
            </button>
          </div>

          {/* Subtab 1: User Management Directory */}
          {activeAdminSubtab === 'users' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">Registered Extension Endpoints</h3>
                <div className="relative w-64">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search user email or name..."
                    className="w-full bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="overflow-x-auto no-scrollbar">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                      <th className="pb-3">User</th>
                      <th className="pb-3">Current Tier</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Threats Blocked</th>
                      <th className="pb-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-slate-300">
                    {filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-900/50">
                        <td className="py-3">
                          <div className="font-bold text-white">{u.fullName}</div>
                          <div className="text-[10px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="py-3">
                          <select
                            value={u.tier}
                            onChange={(e) => updateUserTier(u.id, e.target.value as UserTier)}
                            className="bg-slate-900 border border-slate-700 text-cyan-300 rounded-lg px-2 py-1 text-xs focus:outline-none"
                          >
                            <option value="lite">LITE</option>
                            <option value="pro">PRO</option>
                            <option value="enterprise">ENTERPRISE</option>
                            <option value="super_admin">SUPER ADMIN</option>
                          </select>
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            u.isActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {u.isActive ? 'ACTIVE' : 'SUSPENDED'}
                          </span>
                        </td>
                        <td className="py-3 font-bold text-cyan-400">{u.threatCount}</td>
                        <td className="py-3">
                          <button
                            onClick={() => toggleUserActive(u.id)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all ${
                              u.isActive
                                ? 'bg-rose-950/60 border-rose-800 text-rose-300 hover:bg-rose-900'
                                : 'bg-emerald-950/60 border-emerald-800 text-emerald-300 hover:bg-emerald-900'
                            }`}
                          >
                            {u.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab 2: Suspicious Users Tracker */}
          {activeAdminSubtab === 'suspicious' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-xs text-amber-200">
                <strong>High Threat Anomaly Warning:</strong> Users listed below have intercepted &gt;15 high-risk payload downloads or phishing link clicks within 24 hours.
              </div>

              <div className="space-y-3">
                {suspiciousUsers.map((su) => (
                  <div key={su.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <h4 className="font-bold text-white">{su.fullName} ({su.email})</h4>
                      <span className="text-rose-400 font-mono text-[11px] block mt-0.5">
                        High Risk Trigger Count: {su.threatCount} Events
                      </span>
                    </div>

                    <button
                      onClick={() => toggleUserActive(su.id)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-all text-xs"
                    >
                      {su.isActive ? 'Suspend Account' : 'Re-Activate'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 3: Feature Toggles (35 Features) */}
          {activeAdminSubtab === 'features' && (
            <div className="space-y-4 animate-fadeIn">
              <h3 className="text-sm font-bold text-white">Central Feature Matrix Enforcer</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {featureToggles.map((ft) => (
                  <div
                    key={ft.key}
                    onClick={() => toggleFeature(ft.key)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      ft.isActive ? 'bg-slate-900 border-purple-500/40 text-white' : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                  >
                    <div className="space-y-0.5 max-w-[80%]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs">{ft.name}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/40 text-purple-300 font-mono uppercase">
                          {ft.tierRequired}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 line-clamp-1">{ft.description}</p>
                    </div>

                    <div className={`w-8 h-4 rounded-full transition-all relative ${
                      ft.isActive ? 'bg-purple-500' : 'bg-slate-800'
                    }`}>
                      <div className={`w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all ${
                        ft.isActive ? 'right-0.5' : 'left-0.5'
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 4: Global Blocklist Editor */}
          {activeAdminSubtab === 'blocklist' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  value={newBlockDomain}
                  onChange={(e) => setNewBlockDomain(e.target.value)}
                  placeholder="Domain to block e.g. malware-domain.xyz"
                  className="flex-1 w-full bg-slate-900 border border-slate-700 focus:border-purple-400 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none"
                />
                <select
                  value={newBlockType}
                  onChange={(e) => setNewBlockType(e.target.value)}
                  className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-mono"
                >
                  <option value="Phishing">Phishing</option>
                  <option value="Malware">Malware</option>
                  <option value="Fake News Host">Fake News Host</option>
                </select>
                <button
                  onClick={handleAddBlocklist}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-1 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Block Domain</span>
                </button>
              </div>

              <div className="space-y-2">
                {blocklist.map((b) => (
                  <div key={b.id} className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-mono">
                    <div>
                      <span className="font-bold text-white">{b.domain}</span>
                      <span className="text-slate-400 ml-3 text-[10px]">• {b.threatType} ({b.severity}%)</span>
                    </div>

                    <button
                      onClick={() => removeBlocklistItem(b.id)}
                      className="text-slate-500 hover:text-rose-400 transition-all"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subtab 5: Audit Log Trail */}
          {activeAdminSubtab === 'audit' && (
            <div className="space-y-3 animate-fadeIn font-mono text-xs">
              <h3 className="text-sm font-bold text-white font-sans">System Audit Logs</h3>

              <div className="space-y-2">
                {auditLogs.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-cyan-400 font-bold">{a.userName}</span>
                      <span className="text-slate-200 ml-2">{a.action}</span>
                      <p className="text-[10px] text-slate-500 mt-0.5">{a.details}</p>
                    </div>
                    <span className="text-[10px] text-slate-500">{a.createdAt}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
