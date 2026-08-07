import React from 'react';
import { SentinelProvider, useSentinel } from './context/SentinelContext';
import { Header } from './components/Header';
import { UnlockModal } from './components/UnlockModal';
import { RedScreenOverlay } from './components/RedScreenOverlay';
import { SelectionScanNotifier } from './components/SelectionScanNotifier';
import { PopupSimulator } from './components/PopupSimulator';
import { RegionalFakeNewsTracker } from './components/Tools/RegionalFakeNewsTracker';
import { UrlScanner } from './components/Tools/UrlScanner';
import { MalwarePeAnalyzer } from './components/Tools/MalwarePeAnalyzer';
import { FakeNewsAnalyzer } from './components/Tools/FakeNewsAnalyzer';
import { DeepfakeMediaScanner } from './components/Tools/DeepfakeMediaScanner';
import { ApiIntegrationsHub } from './components/Tools/ApiIntegrationsHub';
import { ThreatActivityLog } from './components/Tools/ThreatActivityLog';
import { GlobalThreatHeatmap } from './components/Tools/GlobalThreatHeatmap';
import { LiteDashboard } from './components/Dashboards/LiteDashboard';
import { ProDashboard } from './components/Dashboards/ProDashboard';
import { EnterpriseDashboard } from './components/Dashboards/EnterpriseDashboard';
import { AdminPanel } from './components/Dashboards/AdminPanel';
import { Shield } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, currentTier } = useSentinel();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'extension_popup':
        return <PopupSimulator />;
      case 'threat_activity_log':
        return <ThreatActivityLog />;
      case 'global_threat_heatmap':
        return <GlobalThreatHeatmap />;
      case 'fake_news_map':
        return <RegionalFakeNewsTracker />;
      case 'url_scanner':
        return <UrlScanner />;
      case 'malware_analyzer':
        return <MalwarePeAnalyzer />;
      case 'fake_news':
        return <FakeNewsAnalyzer />;
      case 'deepfake':
        return <DeepfakeMediaScanner />;
      case 'dashboard':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-lg font-bold text-white">ZENITH Security Dashboards</h2>
              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="text-slate-400">Current View:</span>
                <span className="text-cyan-400 font-bold uppercase">{currentTier} Level</span>
              </div>
            </div>

            <LiteDashboard />

            {/* Render Pro & Enterprise Dashboard sections */}
            <div className="border-t border-slate-800 pt-8 space-y-8">
              <ProDashboard />
            </div>

            <div className="border-t border-slate-800 pt-8 space-y-8">
              <EnterpriseDashboard />
            </div>
          </div>
        );
      case 'admin':
        return <AdminPanel />;
      case 'api_integrations':
        return <ApiIntegrationsHub />;
      default:
        return <PopupSimulator />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      
      {/* Top Sticky Header */}
      <Header />

      {/* Main Container View */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {renderActiveView()}
      </main>

      {/* Global Modals & Overlays */}
      <UnlockModal />
      <RedScreenOverlay />
      <SelectionScanNotifier />

      {/* Clean & Simple Footer */}
      <footer className="border-t border-slate-800 bg-[#070a14] py-4 px-4 mt-8 text-center text-xs text-slate-500">
        <div className="flex items-center justify-center gap-2 text-slate-400 font-medium">
          <Shield className="w-4 h-4 text-cyan-400" />
          <span>ZENITH Security Suite</span>
        </div>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <SentinelProvider>
      <MainContent />
    </SentinelProvider>
  );
}
