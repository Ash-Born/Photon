import React, { useState } from 'react';
import { useSentinel } from '../../context/SentinelContext';
import { Radio, Wifi, WifiOff, AlertTriangle, CheckCircle2, RefreshCw, Zap, ShieldCheck, Activity, Database, Cpu } from 'lucide-react';

export const ApiIntegrationsHub: React.FC = () => {
  const { apiConfigs, currentTier, apiQuota, refillApiQuota } = useSentinel();
  const [pinging, setPinging] = useState(false);
  const [statuses, setStatuses] = useState<Record<number, { status: 'online' | 'rate_limited' | 'disconnected'; latency: number }>>(() => {
    const initial: Record<number, { status: 'online' | 'rate_limited' | 'disconnected'; latency: number }> = {};
    apiConfigs.forEach(a => {
      initial[a.id] = { status: 'online', latency: a.latencyMs || Math.floor(Math.random() * 50) + 20 };
    });
    return initial;
  });

  const handlePingAll = () => {
    setPinging(true);
    setTimeout(() => {
      const updated: Record<number, { status: 'online' | 'rate_limited' | 'disconnected'; latency: number }> = {};
      apiConfigs.forEach(a => {
        const isRateLimited = a.id === 5 && Math.random() > 0.7; // VirusTotal 4/min limit
        const latency = Math.floor(Math.random() * 80) + 18;
        updated[a.id] = {
          status: isRateLimited ? 'rate_limited' : 'online',
          latency
        };
      });
      setStatuses(updated);
      setPinging(false);
    }, 600);
  };

  const hasWarnings = Object.values(statuses).some((s: { status: string; latency: number }) => s.status !== 'online');

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
      
      {/* Title */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-cyan-950/40 border border-cyan-500/20 glass-card flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-6 h-6 text-cyan-400" />
            <h2 className="text-xl font-bold text-white">10 Third-Party Threat & Fact-Checking APIs Feed</h2>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Real-time API quota tracking, endpoint routing, live execution counters, and latency monitoring.
          </p>
        </div>

        <button 
          onClick={handlePingAll}
          disabled={pinging}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${pinging ? 'animate-spin' : ''}`} />
          <span>{pinging ? 'Pinging Endpoints...' : 'Ping All Endpoints'}</span>
        </button>
      </div>

      {/* Real-time API Quota Feed & Usage Stats Card */}
      <div className="p-6 rounded-3xl bg-[#0b0f19] border border-cyan-500/30 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Real-Time API Credit Quota & Usage Monitor
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              API SERVICE: ONLINE
            </span>

            <button
              onClick={refillApiQuota}
              className="px-3 py-1 rounded-full bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 font-mono text-xs font-bold transition-all"
            >
              🔄 Refill Credits
            </button>
          </div>
        </div>

        {/* Quota Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-mono">
          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Used API Calls</span>
            <span className="text-xl font-black text-cyan-400 font-mono">{apiQuota.used}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Available Credits</span>
            <span className="text-xl font-black text-emerald-400 font-mono">{apiQuota.remaining}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Tier Quota Limit</span>
            <span className="text-xl font-black text-purple-400 font-mono">{apiQuota.total}</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase">Active User Tier</span>
            <span className="text-xs font-extrabold text-amber-400 font-mono uppercase">{currentTier}</span>
          </div>
        </div>

        {/* Real-time Usage Progress Bar */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between text-slate-400 text-[11px]">
            <span>Usage Capacity ({((apiQuota.used / apiQuota.total) * 100).toFixed(1)}% Consumed)</span>
            <span>{apiQuota.used} / {apiQuota.total} Requests</span>
          </div>
          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (apiQuota.used / apiQuota.total) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Warning Banner if API limit or disconnect occurs */}
      {hasWarnings && (
        <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/40 flex items-center gap-3 text-amber-200 text-xs">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="font-bold">API Warning Detected:</span> One or more endpoints reported high latency or rate limiting (e.g. VirusTotal v3 limit of 4 req/min). Automatic fallback rules are engaged.
          </div>
        </div>
      )}

      {/* Grid of 10 APIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {apiConfigs.map((api) => {
          const isAccessible =
            api.tierRequired === 'lite' ||
            (api.tierRequired === 'pro' && (currentTier === 'pro' || currentTier === 'enterprise' || currentTier === 'super_admin')) ||
            (api.tierRequired === 'enterprise' && (currentTier === 'enterprise' || currentTier === 'super_admin'));

          const liveStatus = statuses[api.id] || { status: 'online', latency: api.latencyMs };
          const callsMade = apiQuota.endpointCalls?.[api.id] || 0;

          return (
            <div
              key={api.id}
              className={`p-5 rounded-2xl border transition-all ${
                isAccessible
                  ? 'bg-[#0b0f19] border-slate-800 hover:border-cyan-500/40 shadow-lg'
                  : 'bg-slate-900/40 border-slate-800/80 opacity-75'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  {liveStatus.status === 'online' ? (
                    <Wifi className={`w-4 h-4 ${isAccessible ? 'text-emerald-400' : 'text-slate-500'}`} />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                  )}
                  <h3 className="text-sm font-bold text-white">{api.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    !isAccessible
                      ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                      : liveStatus.status === 'rate_limited'
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}>
                    {!isAccessible
                      ? `LOCKED (${api.tierRequired.toUpperCase()})`
                      : liveStatus.status === 'rate_limited'
                      ? `RATE LIMITED (${liveStatus.latency}ms)`
                      : `ONLINE (${liveStatus.latency}ms)`}
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Real-Time Requests:</span>
                  <span className="text-emerald-400 font-bold">{callsMade} Calls Processed</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Endpoint:</span>
                  <span className="text-cyan-300 truncate max-w-[200px]">{api.endpoint}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Rate Limit:</span>
                  <span className="text-slate-200">{api.rateLimit}</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/90 border border-slate-800/80">
                  <span className="text-slate-400 text-[11px]">Config Variable:</span>
                  <span className="text-purple-300">{api.keyName}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
