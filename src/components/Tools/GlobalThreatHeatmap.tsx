import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useSentinel } from '../../context/SentinelContext';
import { RegionalFakeNewsTracker } from './RegionalFakeNewsTracker';
import {
  Globe,
  ShieldAlert,
  Cpu,
  Radio,
  Activity,
  Filter,
  Sparkles,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Zap,
  RefreshCw
} from 'lucide-react';

// Lightweight world continents GeoJSON approximation for instant rendering without external CDN lag
const WORLD_CONTINENTS_GEOJSON: any = {
  type: 'FeatureCollection',
  features: [
    // North America
    {
      type: 'Feature',
      properties: { name: 'North America' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-168, 70], [-140, 70], [-120, 60], [-130, 50], [-125, 40],
            [-118, 33], [-105, 20], [-90, 16], [-80, 8], [-78, 10],
            [-80, 25], [-82, 30], [-75, 36], [-65, 45], [-55, 50],
            [-60, 60], [-80, 72], [-120, 75], [-168, 70]
          ]
        ]
      }
    },
    // South America
    {
      type: 'Feature',
      properties: { name: 'South America' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-80, 10], [-60, 10], [-50, 0], [-35, -8], [-38, -20],
            [-48, -28], [-52, -35], [-68, -55], [-75, -50], [-72, -30],
            [-78, -15], [-81, -5], [-80, 10]
          ]
        ]
      }
    },
    // Europe
    {
      type: 'Feature',
      properties: { name: 'Europe' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-10, 36], [0, 42], [3, 43], [15, 38], [25, 36],
            [30, 42], [40, 45], [60, 60], [40, 70], [25, 71],
            [10, 58], [0, 50], [-10, 44], [-10, 36]
          ]
        ]
      }
    },
    // Africa
    {
      type: 'Feature',
      properties: { name: 'Africa' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-18, 15], [-10, 35], [10, 37], [32, 31], [43, 12],
            [52, 12], [42, -5], [40, -18], [35, -30], [20, -35],
            [12, -25], [10, -5], [5, 5], [-15, 8], [-18, 15]
          ]
        ]
      }
    },
    // Asia
    {
      type: 'Feature',
      properties: { name: 'Asia' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [40, 45], [60, 60], [70, 70], [140, 72], [170, 65],
            [160, 55], [140, 45], [130, 32], [120, 22], [105, 10],
            [100, 5], [80, 8], [70, 20], [60, 24], [45, 30],
            [35, 36], [40, 45]
          ]
        ]
      }
    },
    // Australia
    {
      type: 'Feature',
      properties: { name: 'Australia' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [114, -22], [130, -12], [143, -11], [153, -25],
            [150, -38], [140, -38], [130, -32], [115, -34],
            [114, -22]
          ]
        ]
      }
    }
  ]
};

interface ThreatOrigin {
  id: string;
  city: string;
  country: string;
  coords: [number, number]; // [lon, lat]
  type: 'phishing' | 'malware' | 'fakenews';
  intensity: number;
  targetCity: string;
  targetCoords: [number, number];
  domain: string;
  timestamp: string;
}

const SAMPLE_ORIGINS: ThreatOrigin[] = [
  {
    id: 'th-1',
    city: 'Moscow',
    country: 'Russia',
    coords: [37.6173, 55.7558],
    type: 'phishing',
    intensity: 96,
    targetCity: 'New York',
    targetCoords: [-74.006, 40.7128],
    domain: 'paypal-verify-secure.xyz',
    timestamp: 'Just now'
  },
  {
    id: 'th-2',
    city: 'Lagos',
    country: 'Nigeria',
    coords: [3.3792, 6.5244],
    type: 'phishing',
    intensity: 91,
    targetCity: 'London',
    targetCoords: [-0.1276, 51.5072],
    domain: 'bank-login-auth.top',
    timestamp: '14s ago'
  },
  {
    id: 'th-3',
    city: 'Pyongyang',
    country: 'North Korea',
    coords: [125.7625, 39.0392],
    type: 'malware',
    intensity: 98,
    targetCity: 'Tokyo',
    targetCoords: [139.6917, 35.6895],
    domain: 'cdn-download-mirror.net',
    timestamp: '28s ago'
  },
  {
    id: 'th-4',
    city: 'Tehran',
    country: 'Iran',
    coords: [51.389, 35.6892],
    type: 'malware',
    intensity: 89,
    targetCity: 'Frankfurt',
    targetCoords: [8.6821, 50.1109],
    domain: 'invoice_scan_09.exe',
    timestamp: '41s ago'
  },
  {
    id: 'th-5',
    city: 'Dhaka',
    country: 'Bangladesh',
    coords: [90.4125, 23.8103],
    type: 'fakenews',
    intensity: 94,
    targetCity: 'Chittagong',
    targetCoords: [91.7832, 22.3569],
    domain: 'bkash-free-gift-10000.top',
    timestamp: 'Live'
  },
  {
    id: 'th-6',
    city: 'Bucharest',
    country: 'Romania',
    coords: [26.1025, 44.4268],
    type: 'phishing',
    intensity: 87,
    targetCity: 'Paris',
    targetCoords: [2.3522, 48.8566],
    domain: 'apple-id-confirm-support.net',
    timestamp: '1m ago'
  },
  {
    id: 'th-7',
    city: 'Sao Paulo',
    country: 'Brazil',
    coords: [-46.6333, -23.5505],
    type: 'phishing',
    intensity: 85,
    targetCity: 'Miami',
    targetCoords: [-80.1918, 25.7617],
    domain: 'secure-wallet-verify.com',
    timestamp: '2m ago'
  }
];

export const GlobalThreatHeatmap: React.FC = () => {
  const { threatLogs, fakeNewsReports, logThreat } = useSentinel();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'phishing' | 'malware' | 'fakenews'>('all');
  const [severityFilter, setSeverityFilter] = useState<'all' | 'critical' | 'high' | 'medium' | 'low' | 'sort_desc' | 'sort_asc'>('all');
  const [activeOrigins, setActiveOrigins] = useState<ThreatOrigin[]>(SAMPLE_ORIGINS);
  const [selectedOrigin, setSelectedOrigin] = useState<ThreatOrigin | null>(null);
  const [isSimulating, setIsSimulating] = useState(true);

  // Combine live threat logs into coordinates when available
  const displayOrigins = useMemo(() => {
    return activeOrigins
      .filter((origin) => {
        if (selectedFilter !== 'all' && origin.type !== selectedFilter) return false;

        // Severity filter (Critical: >=90, High: 75-89, Medium: 50-74, Low: <50)
        if (severityFilter === 'critical' && origin.intensity < 90) return false;
        if (severityFilter === 'high' && (origin.intensity < 75 || origin.intensity >= 90)) return false;
        if (severityFilter === 'medium' && (origin.intensity < 50 || origin.intensity >= 75)) return false;
        if (severityFilter === 'low' && origin.intensity >= 50) return false;

        return true;
      })
      .sort((a, b) => {
        if (severityFilter === 'sort_desc') {
          return b.intensity - a.intensity;
        }
        if (severityFilter === 'sort_asc') {
          return a.intensity - b.intensity;
        }
        return 0;
      });
  }, [activeOrigins, selectedFilter, severityFilter]);

  // Periodic random attack arc pulse
  useEffect(() => {
    if (!isSimulating) return;

    const timer = setInterval(() => {
      const cities = [
        { city: 'Jakarta', country: 'Indonesia', coords: [106.8456, -6.2088] as [number, number] },
        { city: 'Kyiv', country: 'Ukraine', coords: [30.5234, 50.4501] as [number, number] },
        { city: 'Almaty', country: 'Kazakhstan', coords: [76.9286, 43.2389] as [number, number] },
        { city: 'Hanoi', country: 'Vietnam', coords: [105.8342, 21.0278] as [number, number] },
        { city: 'Caracas', country: 'Venezuela', coords: [-66.9036, 10.4806] as [number, number] }
      ];
      const targets = [
        { city: 'Silicon Valley', coords: [-122.0838, 37.3861] as [number, number] },
        { city: 'London', coords: [-0.1276, 51.5072] as [number, number] },
        { city: 'Singapore', coords: [103.8198, 1.3521] as [number, number] },
        { city: 'Sydney', coords: [151.2093, -33.8688] as [number, number] }
      ];
      const types: ('phishing' | 'malware' | 'fakenews')[] = ['phishing', 'malware', 'fakenews'];
      const pickedCity = cities[Math.floor(Math.random() * cities.length)];
      const pickedTarget = targets[Math.floor(Math.random() * targets.length)];
      const pickedType = types[Math.floor(Math.random() * types.length)];

      const newOrigin: ThreatOrigin = {
        id: `th-${Date.now()}`,
        city: pickedCity.city,
        country: pickedCity.country,
        coords: pickedCity.coords,
        type: pickedType,
        intensity: Math.floor(Math.random() * 20) + 80,
        targetCity: pickedTarget.city,
        targetCoords: pickedTarget.coords,
        domain: pickedType === 'phishing' ? `login-${pickedCity.city.toLowerCase()}-verify.net` : `${pickedType}-payload.xyz`,
        timestamp: 'Live now'
      };

      setActiveOrigins((prev) => [newOrigin, ...prev.slice(0, 11)]);
    }, 4500);

    return () => clearInterval(timer);
  }, [isSimulating]);

  // Render D3 Geo Map
  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 960;
    const height = 480;

    // Define projection & path
    const projection = d3.geoMercator()
      .scale(130)
      .translate([width / 2, height / 1.7]);

    const pathGenerator = d3.geoPath().projection(projection);

    // Create container group
    const g = svg.append('g');

    // Add glowing gradient definitions
    const defs = svg.append('defs');

    // Phishing radial gradient
    const gradPhishing = defs.append('radialGradient')
      .attr('id', 'grad-phishing')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    gradPhishing.append('stop').attr('offset', '0%').attr('stop-color', '#f43f5e').attr('stop-opacity', 1);
    gradPhishing.append('stop').attr('offset', '100%').attr('stop-color', '#f43f5e').attr('stop-opacity', 0);

    // Malware radial gradient
    const gradMalware = defs.append('radialGradient')
      .attr('id', 'grad-malware')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    gradMalware.append('stop').attr('offset', '0%').attr('stop-color', '#a855f7').attr('stop-opacity', 1);
    gradMalware.append('stop').attr('offset', '100%').attr('stop-color', '#a855f7').attr('stop-opacity', 0);

    // Fake News radial gradient
    const gradFakeNews = defs.append('radialGradient')
      .attr('id', 'grad-fakenews')
      .attr('cx', '50%').attr('cy', '50%').attr('r', '50%');
    gradFakeNews.append('stop').attr('offset', '0%').attr('stop-color', '#f59e0b').attr('stop-opacity', 1);
    gradFakeNews.append('stop').attr('offset', '100%').attr('stop-color', '#f59e0b').attr('stop-opacity', 0);

    // Draw world continent polygons
    g.selectAll('path.continent')
      .data(WORLD_CONTINENTS_GEOJSON.features)
      .enter()
      .append('path')
      .attr('class', 'continent')
      .attr('d', pathGenerator as any)
      .attr('fill', '#111827')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 1.2)
      .attr('opacity', 0.85);

    // Add geographic grid lines (graticule)
    const graticule = d3.geoGraticule().step([30, 30]);
    g.append('path')
      .datum(graticule)
      .attr('d', pathGenerator as any)
      .attr('fill', 'none')
      .attr('stroke', '#1e293b')
      .attr('stroke-width', 0.5)
      .attr('stroke-opacity', 0.4);

    // Draw attack arcs between origin and target
    displayOrigins.forEach((origin) => {
      const sourcePt = projection(origin.coords);
      const targetPt = projection(origin.targetCoords);

      if (!sourcePt || !targetPt) return;

      const [sx, sy] = sourcePt;
      const [tx, ty] = targetPt;

      // Quadratic bezier curve arc
      const dx = tx - sx;
      const dy = ty - sy;
      const dr = Math.sqrt(dx * dx + dy * dy);
      const midX = (sx + tx) / 2;
      const midY = (sy + ty) / 2 - dr * 0.25;

      const color =
        origin.type === 'phishing'
          ? '#f43f5e'
          : origin.type === 'malware'
          ? '#a855f7'
          : '#f59e0b';

      // Arc path
      g.append('path')
        .attr('d', `M ${sx} ${sy} Q ${midX} ${midY} ${tx} ${ty}`)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 1.5)
        .attr('stroke-opacity', 0.6)
        .attr('stroke-dasharray', '4,3');

      // Origin outer pulsing glow circle
      g.append('circle')
        .attr('cx', sx)
        .attr('cy', sy)
        .attr('r', 12)
        .attr('fill', `url(#grad-${origin.type})`)
        .attr('opacity', 0.6);

      // Origin inner node point
      g.append('circle')
        .attr('cx', sx)
        .attr('cy', sy)
        .attr('r', 4.5)
        .attr('fill', color)
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('click', () => setSelectedOrigin(origin));

      // Target node point
      g.append('circle')
        .attr('cx', tx)
        .attr('cy', ty)
        .attr('r', 3)
        .attr('fill', '#38bdf8')
        .attr('opacity', 0.8);
    });

  }, [displayOrigins]);

  const handleTriggerManualBurst = () => {
    const customOrigins: ThreatOrigin[] = [
      {
        id: `th-${Date.now()}-1`,
        city: 'Shenzhen',
        country: 'China',
        coords: [114.0579, 22.5431],
        type: 'phishing',
        intensity: 99,
        targetCity: 'Frankfurt',
        targetCoords: [8.6821, 50.1109],
        domain: 'secure-crypto-wallet-login.xyz',
        timestamp: 'Live Burst'
      },
      {
        id: `th-${Date.now()}-2`,
        city: 'Algiers',
        country: 'Algeria',
        coords: [3.0588, 36.7538],
        type: 'malware',
        intensity: 95,
        targetCity: 'London',
        targetCoords: [-0.1276, 51.5072],
        domain: 'bank-verify-trojan.exe',
        timestamp: 'Live Burst'
      }
    ];

    setActiveOrigins((prev) => [...customOrigins, ...prev.slice(0, 10)]);
    setSelectedOrigin(customOrigins[0]);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-950/40 via-[#0a0e1a] to-blue-950/40 border border-cyan-500/30 glass-card flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Globe className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-wide">Global Cyber Threat &amp; Regional Fake News Map</h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                UNIFIED GEOGRAPHIC TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Interactive D3 geographical projection visualizing live phishing &amp; malware origins, combined with localized Regional Fake News tracking.
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              isSimulating
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isSimulating ? 'Live Feed Active' : 'Feed Paused'}</span>
          </button>

          <button
            onClick={handleTriggerManualBurst}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4" />
            <span>Trigger Attack Burst</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0b0f19] p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-slate-400 ml-1 mr-1" />
          <button
            onClick={() => setSelectedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedFilter === 'all'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Threat Origins ({activeOrigins.length})
          </button>

          <button
            onClick={() => setSelectedFilter('phishing')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedFilter === 'phishing'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Phishing Links ({activeOrigins.filter((o) => o.type === 'phishing').length})
          </button>

          <button
            onClick={() => setSelectedFilter('malware')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedFilter === 'malware'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            Malware PE ({activeOrigins.filter((o) => o.type === 'malware').length})
          </button>

          <button
            onClick={() => setSelectedFilter('fakenews')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              selectedFilter === 'fakenews'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            Fake News Campaigns ({activeOrigins.filter((o) => o.type === 'fakenews').length})
          </button>

          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 ml-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <select
              aria-label="Filter by Severity Level"
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="bg-transparent text-xs text-slate-200 font-medium focus:outline-none cursor-pointer py-1"
            >
              <option value="all" className="bg-[#0b0f19]">All Severity Levels</option>
              <option value="critical" className="bg-[#0b0f19]">Critical Severity (90-100% Risk)</option>
              <option value="high" className="bg-[#0b0f19]">High Severity (75-89% Risk)</option>
              <option value="medium" className="bg-[#0b0f19]">Medium Severity (50-74% Risk)</option>
              <option value="low" className="bg-[#0b0f19]">Low Severity (&lt;50% Risk)</option>
              <option value="sort_desc" className="bg-[#0b0f19]">Sort Severity: Critical → Low</option>
              <option value="sort_asc" className="bg-[#0b0f19]">Sort Severity: Low → Critical</option>
            </select>
          </div>
        </div>

        <div className="text-xs font-mono text-slate-400 pr-2">
          Click any origin node on the map to inspect telemetry
        </div>
      </div>

      {/* D3 Map Canvas & Selected Node Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Map Canvas (3 Cols) */}
        <div className="lg:col-span-3 bg-[#0a0e1a] border border-slate-800 rounded-3xl p-4 overflow-hidden relative shadow-2xl flex flex-col items-center justify-center">
          <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-950/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span>Phishing Origin</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
              <span>Malware C2</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>Fake News Source</span>
            </div>
          </div>

          <div className="w-full overflow-x-auto flex justify-center">
            <svg
              ref={svgRef}
              viewBox="0 0 960 480"
              className="w-full max-w-4xl h-auto"
            />
          </div>

          <div className="w-full mt-2 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono px-2">
            <span>Projection: D3 geoMercator (Scale 130)</span>
            <span>Real-time Sentinel Network Telemetry Stream</span>
          </div>
        </div>

        {/* Selected Origin / Live Feed Sidebar (1 Col) */}
        <div className="bg-[#0b0f19] border border-slate-800 rounded-3xl p-5 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              <span>Selected Attack Telemetry</span>
            </h3>

            {selectedOrigin ? (
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono uppercase px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {selectedOrigin.type.toUpperCase()}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {selectedOrigin.timestamp}
                  </span>
                </div>

                <div>
                  <div className="text-base font-bold text-white">
                    {selectedOrigin.city}, {selectedOrigin.country}
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    Origin Coords: {selectedOrigin.coords[1].toFixed(2)}°N, {selectedOrigin.coords[0].toFixed(2)}°E
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase">Target Destination:</div>
                  <div className="text-xs font-bold text-cyan-300">{selectedOrigin.targetCity}</div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400 uppercase">Domain / Payload:</div>
                  <div className="text-xs font-mono text-rose-300 truncate" title={selectedOrigin.domain}>
                    {selectedOrigin.domain}
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs font-mono pt-1">
                  <span className="text-slate-400">Risk Intensity:</span>
                  <span className="text-rose-400 font-bold">{selectedOrigin.intensity}%</span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center space-y-2">
                <Globe className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">
                  Click any colored origin node on the map to inspect source IP, city, target destination, and payload domain.
                </p>
              </div>
            )}
          </div>

          {/* Quick Stats list */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Recent Global Detections
            </h4>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {displayOrigins.slice(0, 5).map((org) => (
                <div
                  key={org.id}
                  onClick={() => setSelectedOrigin(org)}
                  className="p-2 rounded-xl bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 cursor-pointer transition-all flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        org.type === 'phishing'
                          ? 'bg-rose-500'
                          : org.type === 'malware'
                          ? 'bg-purple-500'
                          : 'bg-amber-500'
                      }`}
                    ></span>
                    <span className="font-semibold text-slate-200">{org.city}</span>
                  </div>
                  <span className="font-mono text-slate-400 text-[10px]">{org.intensity}% Risk</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Integrated Regional Fake News Map & Tracker */}
      <div className="mt-8 pt-8 border-t-2 border-slate-800/80">
        <RegionalFakeNewsTracker />
      </div>
    </div>
  );
};
