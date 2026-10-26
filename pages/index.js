import Head from 'next/head';
import Script from 'next/script';
import { useEffect, useState } from 'react';

const tourStops = [
  'overview',
  'servers',
  'heatex',
  'piping',
  'greenhouse',
  'microgrid',
  'wind',
  'substation',
  'smr',
  'topdown'
];

const keyViewMap = {
  '1': 'overview',
  '2': 'servers',
  '3': 'heatex',
  '4': 'piping',
  '5': 'greenhouse',
  '6': 'microgrid',
  '7': 'wind',
  '8': 'substation',
  '9': 'smr',
  '0': 'topdown'
};

export default function Home() {
  const [activeInfo, setActiveInfo] = useState(null);
  const [activeKey, setActiveKey] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [telemetryOpen, setTelemetryOpen] = useState(false);
  const [hotkeysOpen, setHotkeysOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState(-1);
  const [isRotating, setIsRotating] = useState(true);
  const [roofRaised, setRoofRaised] = useState(false);
  const [isCutaway, setIsCutaway] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('day');
  const [showPins, setShowPins] = useState(false);
  const [screenHotspots, setScreenHotspots] = useState([]);

  const [metrics, setMetrics] = useState({
    pue: 1.031,
    wue: 0.018,
    heatTemp: 59.4,
    solarKw: 428,
    windKw: 672,
    bessPct: 93
  });

  useEffect(() => {
    window.showSubsystemInfo = (info, key) => {
      setActiveInfo(info);
      if (key) setActiveKey(key);
    };

    window.onViewChanged = (key) => {
      setActiveKey(key);
    };

    window.updateHotspotScreenPositions = (list) => {
      setScreenHotspots(list);
    };

    const s = document.createElement('script');
    s.src = '/diorama.js';
    s.async = true;
    document.body.appendChild(s);

    const interval = setInterval(() => {
      setMetrics(prev => ({
        pue: +(1.028 + Math.random() * 0.006).toFixed(3),
        wue: +(0.016 + Math.random() * 0.004).toFixed(3),
        heatTemp: +(58.8 + Math.random() * 1.2).toFixed(1),
        solarKw: Math.round(420 + Math.random() * 15),
        windKw: Math.round(660 + Math.random() * 25),
        bessPct: Math.round(92 + Math.random() * 2)
      }));
    }, 2500);

    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      const k = e.key.toLowerCase();

      if (keyViewMap[k]) {
        e.preventDefault();
        selectView(keyViewMap[k]);
        return;
      }

      if (k === ' ') {
        e.preventDefault();
        toggleRotation();
      } else if (k === 'r') {
        toggleRoof();
      } else if (k === 'c') {
        toggleCut();
      } else if (k === 't') {
        cycleTheme();
      } else if (k === 'p') {
        togglePins();
      } else if (k === 'm') {
        setTelemetryOpen(v => !v);
      } else if (k === 'h' || k === '?') {
        setHotkeysOpen(v => !v);
      } else if (k === 'escape') {
        setActiveInfo(null);
        setTelemetryOpen(false);
        setHotkeysOpen(false);
        setTourIndex(-1);
      } else if (k === 'arrowright') {
        nextTour();
      } else if (k === 'arrowleft') {
        prevTour();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyDown);
      if (document.body.contains(s)) document.body.removeChild(s);
    };
  }, []);

  const selectView = (key) => {
    setActiveKey(key);
    if (tourIndex >= 0) {
      const idx = tourStops.indexOf(key);
      if (idx !== -1) setTourIndex(idx);
    }
    if (window.focusComponent) window.focusComponent(key);
  };

  const handleReset = () => {
    setActiveKey('overview');
    setTourIndex(-1);
    if (window.resetView) window.resetView();
  };

  const toggleRotation = () => {
    if (window.toggleAutoRotate) {
      const state = window.toggleAutoRotate();
      setIsRotating(state);
    }
  };

  const toggleRoof = () => {
    if (window.toggleRoof) {
      const state = window.toggleRoof();
      setRoofRaised(state);
    }
  };

  const toggleCut = () => {
    if (window.cutaway) {
      const state = window.cutaway();
      setIsCutaway(state);
      setRoofRaised(state);
    }
  };

  const switchTheme = (themeName) => {
    if (window.setTheme) {
      const res = window.setTheme(themeName);
      setCurrentTheme(res);
    }
  };

  const cycleTheme = () => {
    const list = ['day', 'sunset', 'night'];
    const next = list[(list.indexOf(currentTheme) + 1) % list.length];
    switchTheme(next);
  };

  const togglePins = () => {
    setShowPins(prev => {
      const next = !prev;
      if (window.toggleHotspots) window.toggleHotspots(next);
      return next;
    });
  };

  const startTour = () => {
    setTourIndex(0);
    selectView(tourStops[0]);
  };

  const nextTour = () => {
    const nextIdx = (tourIndex + 1) % tourStops.length;
    setTourIndex(nextIdx);
    selectView(tourStops[nextIdx]);
  };

  const prevTour = () => {
    const prevIdx = (tourIndex - 1 + tourStops.length) % tourStops.length;
    setTourIndex(prevIdx);
    selectView(tourStops[prevIdx]);
  };

  const stopTour = () => {
    setTourIndex(-1);
    handleReset();
  };

  return (
    <>
      <Head>
        <title>AI Data Center - 3D EVS Model | Group 21 LTCE</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>{`
          body,html{margin:0;padding:0;width:100%;height:100%;overflow:hidden;font-family:Inter,system-ui,sans-serif;background:#090d16;user-select:none}
          #webgl-canvas{width:100%;height:100%;display:block}
          .solid-panel{
            background:#0f172a;
            border:1px solid #334155;
            box-shadow:0 4px 20px rgba(0,0,0,0.5);
          }
          .custom-scrollbar::-webkit-scrollbar{width:4px}
          .custom-scrollbar::-webkit-scrollbar-track{background:transparent}
          .custom-scrollbar::-webkit-scrollbar-thumb{background:#475569;border-radius:2px}
        `}</style>
      </Head>
      <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" strategy="beforeInteractive" />
      <Script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js" strategy="beforeInteractive" />
      
      <div className="relative w-screen h-screen overflow-hidden text-white font-sans">
        <canvas id="webgl-canvas"></canvas>

        {/* ------------------------------------------------------------------ */}
        {/* 3D FLOATING HOTSPOT LABELS (Solid, minimal, no emojis)             */}
        {/* ------------------------------------------------------------------ */}
        {showPins && screenHotspots.map(spot => {
          if (!spot.visible) return null;
          const isSelected = activeKey === spot.id;
          return (
            <div
              key={spot.id + spot.label}
              style={{
                position: 'absolute',
                left: spot.x,
                top: spot.y,
                transform: 'translate(-50%, -100%)',
                pointerEvents: 'auto'
              }}
              onClick={() => selectView(spot.id)}
              className={`cursor-pointer transition-all duration-150 z-10 ${
                isSelected ? 'scale-105' : 'hover:scale-105'
              }`}
            >
              <div className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide border shadow-md transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white border-emerald-400'
                  : 'bg-slate-900 text-slate-200 border-slate-700 hover:border-emerald-500 hover:text-white'
              }`}>
                {spot.label}
              </div>
              <div className="w-0 h-0 mx-auto border-x-3 border-x-transparent border-t-3 border-t-slate-800"></div>
            </div>
          );
        })}

        {/* ------------------------------------------------------------------ */}
        {/* TOP BAR: Solid, compact, no emojis, no blur                       */}
        {/* ------------------------------------------------------------------ */}
        <div className="absolute top-3 left-3 right-3 flex justify-between items-center pointer-events-none z-20 gap-2">
          
          {/* Left Title */}
          <div className="solid-panel px-3 py-1.5 rounded-lg flex items-center gap-2.5 pointer-events-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <div>
              <div className="text-xs font-bold tracking-tight text-white">Green AI Data Center</div>
              <div className="text-[10px] text-slate-400">EVS Group 21 | LTCE</div>
            </div>
          </div>

          {/* Center Lighting Mode Toggles */}
          <div className="solid-panel p-1 rounded-lg hidden md:flex items-center gap-1 pointer-events-auto text-[11px]">
            <button
              onClick={() => switchTheme('day')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                currentTheme === 'day' ? 'bg-slate-800 text-white border border-slate-600' : 'text-slate-400 hover:text-white'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => switchTheme('sunset')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                currentTheme === 'sunset' ? 'bg-slate-800 text-amber-300 border border-slate-600' : 'text-slate-400 hover:text-white'
              }`}
            >
              Sunset
            </button>
            <button
              onClick={() => switchTheme('night')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                currentTheme === 'night' ? 'bg-slate-800 text-sky-300 border border-slate-600' : 'text-slate-400 hover:text-white'
              }`}
            >
              Night
            </button>
            <div className="w-px h-3.5 bg-slate-700 mx-1"></div>
            <button
              onClick={togglePins}
              className={`px-2 py-1 rounded font-medium transition-all ${
                showPins ? 'bg-emerald-950 text-emerald-300 border border-emerald-600' : 'text-slate-400 hover:text-white'
              }`}
            >
              Pins: {showPins ? 'On' : 'Off'}
            </button>
          </div>

          {/* Right Action Buttons */}
          <div className="solid-panel p-1 rounded-lg flex items-center gap-1 text-[11px] pointer-events-auto">
            <button
              onClick={tourIndex >= 0 ? stopTour : startTour}
              className={`px-2.5 py-1 rounded font-semibold transition-all ${
                tourIndex >= 0
                  ? 'bg-rose-900/60 text-rose-200 border border-rose-600'
                  : 'bg-emerald-900/50 text-emerald-300 border border-emerald-600 hover:bg-emerald-900'
              }`}
            >
              {tourIndex >= 0 ? 'Stop Tour' : 'Tour'}
            </button>

            <button
              onClick={() => setTelemetryOpen(v => !v)}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                telemetryOpen ? 'bg-slate-800 text-white border border-slate-600' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Metrics
            </button>

            <div className="w-px h-4 bg-slate-700 mx-0.5"></div>

            <button
              onClick={toggleRoof}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                roofRaised ? 'bg-amber-950 text-amber-300 border border-amber-600' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {roofRaised ? 'Lower Roof' : 'Roof'}
            </button>

            <button
              onClick={toggleCut}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                isCutaway ? 'bg-sky-950 text-sky-300 border border-sky-600' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              Cutaway
            </button>

            <button
              onClick={toggleRotation}
              className="px-2 py-1 rounded font-medium text-slate-300 hover:bg-slate-800"
              title="Toggle Auto-Rotate (Space)"
            >
              {isRotating ? 'Pause' : 'Rotate'}
            </button>

            <button
              onClick={handleReset}
              className="px-2 py-1 rounded font-medium text-slate-300 hover:bg-slate-800"
              title="Reset View (1)"
            >
              Reset
            </button>

            <button
              onClick={() => setHotkeysOpen(true)}
              className="w-6 h-6 flex items-center justify-center rounded font-bold text-slate-400 hover:text-white hover:bg-slate-800"
              title="Keyboard Shortcuts (?)"
            >
              ?
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* LEFT SYSTEM VIEWS DRAWER: Solid, clean, compact                    */}
        {/* ------------------------------------------------------------------ */}
        <div className={`absolute top-16 left-3 z-20 transition-all duration-150 pointer-events-auto ${
          sidebarOpen ? 'w-56' : 'w-9'
        }`}>
          <div className="solid-panel rounded-lg p-1.5">
            
            {/* Header */}
            <div className="flex justify-between items-center px-2 py-1 text-xs border-b border-slate-800 pb-1.5">
              {sidebarOpen && (
                <div className="font-bold uppercase tracking-wider text-[10px] text-slate-400">
                  Views (1–0)
                </div>
              )}
              <button
                onClick={() => setSidebarOpen(v => !v)}
                className="w-5 h-5 rounded hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-[10px] ml-auto"
                title={sidebarOpen ? 'Collapse' : 'Expand'}
              >
                {sidebarOpen ? '‹' : '›'}
              </button>
            </div>

            {/* View List */}
            {sidebarOpen && (
              <div className="mt-1 flex flex-col gap-0.5 max-h-[64vh] overflow-y-auto custom-scrollbar pr-0.5 text-xs">
                
                <div className="text-[9px] uppercase font-bold text-slate-400 px-2 pt-1 pb-0.5">Campus</div>
                {[
                  { id: 'overview', label: 'Overview', key: '1' },
                  { id: 'topdown', label: 'Top View', key: '0' },
                  { id: 'isometric', label: 'Isometric' },
                  { id: 'cinematic', label: 'Cinematic' },
                  { id: 'aerial', label: 'Aerial' }
                ].map(v => (
                  <button
                    key={v.id}
                    onClick={() => selectView(v.id)}
                    className={`px-2 py-1 rounded flex items-center justify-between text-left transition-colors ${
                      activeKey === v.id
                        ? 'bg-slate-800 text-emerald-400 font-semibold border-l-2 border-emerald-500'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{v.label}</span>
                    {v.key && (
                      <span className="font-mono text-[10px] text-slate-400 px-1 py-0.2 rounded bg-slate-800">
                        {v.key}
                      </span>
                    )}
                  </button>
                ))}

                <div className="text-[9px] uppercase font-bold text-slate-400 px-2 pt-2 pb-0.5 border-t border-slate-800 mt-1">
                  Cooling & Heat
                </div>
                {[
                  { id: 'servers', label: 'Immersion Hall', key: '2' },
                  { id: 'heatex', label: 'Heat Exchanger', key: '3' },
                  { id: 'piping', label: 'Heat Pipe Gantry', key: '4' },
                  { id: 'greenhouse', label: 'Greenhouse', key: '5' }
                ].map(v => (
                  <button
                    key={v.id}
                    onClick={() => selectView(v.id)}
                    className={`px-2 py-1 rounded flex items-center justify-between text-left transition-colors ${
                      activeKey === v.id
                        ? 'bg-slate-800 text-cyan-400 font-semibold border-l-2 border-cyan-500'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{v.label}</span>
                    {v.key && (
                      <span className="font-mono text-[10px] text-cyan-400 px-1 py-0.2 rounded bg-slate-800">
                        {v.key}
                      </span>
                    )}
                  </button>
                ))}

                <div className="text-[9px] uppercase font-bold text-slate-400 px-2 pt-2 pb-0.5 border-t border-slate-800 mt-1">
                  Microgrid
                </div>
                {[
                  { id: 'microgrid', label: 'Solar & BESS', key: '6' },
                  { id: 'wind', label: 'Wind Turbine', key: '7' },
                  { id: 'substation', label: 'Substation', key: '8' },
                  { id: 'smr', label: 'SMR Baseload', key: '9' }
                ].map(v => (
                  <button
                    key={v.id}
                    onClick={() => selectView(v.id)}
                    className={`px-2 py-1 rounded flex items-center justify-between text-left transition-colors ${
                      activeKey === v.id
                        ? 'bg-slate-800 text-amber-400 font-semibold border-l-2 border-amber-500'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span>{v.label}</span>
                    {v.key && (
                      <span className="font-mono text-[10px] text-amber-400 px-1 py-0.2 rounded bg-slate-800">
                        {v.key}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* GUIDED TOUR CONTROLS: Solid, clean                                 */}
        {/* ------------------------------------------------------------------ */}
        {tourIndex >= 0 && (
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 solid-panel py-1.5 px-3.5 rounded-lg flex items-center gap-3 z-30 pointer-events-auto">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-semibold text-emerald-300">
                Stop {tourIndex + 1} / {tourStops.length}
              </span>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                Key {tourIndex === 9 ? '0' : tourIndex + 1}
              </span>
            </div>

            <div className="w-px h-4 bg-slate-700"></div>

            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={prevTour}
                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
              >
                ← Prev
              </button>
              <button
                onClick={nextTour}
                className="px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
              >
                Next →
              </button>
              <button
                onClick={stopTour}
                className="px-2 py-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                title="Exit Tour (Esc)"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* SUBSYSTEM DETAIL CARD: Solid, concise, specs bullets               */}
        {/* ------------------------------------------------------------------ */}
        {activeInfo && (
          <div className="solid-panel absolute top-16 right-3 p-3.5 rounded-lg text-white w-80 pointer-events-auto z-20">
            <div className="flex justify-between items-start gap-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  {activeInfo.tagline}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {activeInfo.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveInfo(null)}
                className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center text-xs text-slate-400 hover:text-white"
                title="Close (Esc)"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-800 border border-slate-700/80 rounded px-2.5 py-1.5 mt-2 text-[11px] text-emerald-300 font-mono tracking-tight">
              {activeInfo.metrics}
            </div>

            <p className="text-xs text-slate-300 mt-2 font-medium leading-relaxed">
              {activeInfo.desc}
            </p>

            {activeInfo.specs && activeInfo.specs.length > 0 && (
              <ul className="mt-2.5 space-y-1.5 border-t border-slate-800 pt-2 text-[11px] text-slate-300">
                {activeInfo.specs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-1.5 leading-snug">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1 shrink-0"></span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
              <span className="font-mono">Group 21 LTCE</span>
              <div className="flex gap-1.5">
                <button
                  onClick={toggleRoof}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium"
                >
                  Roof (R)
                </button>
                <button
                  onClick={() => setTelemetryOpen(true)}
                  className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 font-medium"
                >
                  Metrics (M)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* TELEMETRY DRAWER: Solid, clean, no blur                            */}
        {/* ------------------------------------------------------------------ */}
        {telemetryOpen && (
          <div className="solid-panel absolute top-16 right-3 bottom-16 w-72 p-4 rounded-lg z-30 pointer-events-auto flex flex-col justify-between overflow-y-auto custom-scrollbar">
            <div>
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Live Telemetry</span>
                <button
                  onClick={() => setTelemetryOpen(false)}
                  className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* PUE */}
              <div className="mt-3 p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>PUE Efficiency</span>
                  <span className="text-emerald-400 font-mono font-bold">-38% Energy</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-emerald-400">{metrics.pue}</span>
                  <span className="text-[10px] text-slate-400">vs 1.57 air</span>
                </div>
              </div>

              {/* WUE */}
              <div className="mt-2.5 p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Water Usage (WUE)</span>
                  <span className="text-cyan-400 font-mono font-bold">Closed Loop</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-cyan-400">{metrics.wue}</span>
                  <span className="text-[10px] text-slate-400">L/kWh (0 evaporation)</span>
                </div>
              </div>

              {/* Waste Heat */}
              <div className="mt-2.5 p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Waste Heat Supply</span>
                  <span className="text-amber-400 font-mono font-bold">Reuse</span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono text-amber-400">{metrics.heatTemp} °C</span>
                  <span className="text-[10px] text-slate-400">to Greenhouse</span>
                </div>
              </div>

              {/* Microgrid */}
              <div className="mt-2.5 p-2.5 rounded bg-slate-800/60 border border-slate-700">
                <div className="text-[11px] text-slate-400 mb-1.5">Clean Generation</div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="p-1.5 rounded bg-slate-800">
                    <div className="text-[10px] text-slate-400">Solar</div>
                    <div className="font-mono font-bold text-amber-300">{metrics.solarKw} kW</div>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800">
                    <div className="text-[10px] text-slate-400">Wind</div>
                    <div className="font-mono font-bold text-sky-300">{metrics.windKw} kW</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2 flex justify-between">
                  <span>BESS Storage:</span>
                  <span className="font-mono text-emerald-400 font-bold">{metrics.bessPct}% (4 MWh)</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>SMR Baseload:</span>
                  <span className="font-mono text-indigo-400 font-bold">50 MWe (24/7)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-500 text-center">
              Empirical data based on Group 21 presentation slides.
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* KEYBOARD SHORTCUTS MODAL: Solid                                    */}
        {/* ------------------------------------------------------------------ */}
        {hotkeysOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 pointer-events-auto">
            <div className="solid-panel p-5 rounded-lg max-w-md w-full">
              <div className="flex justify-between items-center pb-2.5 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-white">Keyboard Hotkeys</span>
                <button
                  onClick={() => setHotkeysOpen(false)}
                  className="w-5 h-5 rounded hover:bg-slate-800 flex items-center justify-center text-xs text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-3">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Subsystem Travel (Keys 1–0)
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">1. Overview</span>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">1</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">2. Immersion Hall</span>
                    <span className="font-mono text-cyan-400 font-bold text-[10px]">2</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">3. Heat Exchanger</span>
                    <span className="font-mono text-cyan-400 font-bold text-[10px]">3</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">4. Heat Gantry</span>
                    <span className="font-mono text-amber-400 font-bold text-[10px]">4</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">5. Greenhouse</span>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">5</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">6. Solar & BESS</span>
                    <span className="font-mono text-amber-400 font-bold text-[10px]">6</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">7. Wind Turbine</span>
                    <span className="font-mono text-amber-400 font-bold text-[10px]">7</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">8. Substation</span>
                    <span className="font-mono text-amber-400 font-bold text-[10px]">8</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">9. SMR Baseload</span>
                    <span className="font-mono text-indigo-400 font-bold text-[10px]">9</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">0. Top View</span>
                    <span className="font-mono text-emerald-400 font-bold text-[10px]">0</span>
                  </div>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Controls
                </div>
                <div className="grid grid-cols-2 gap-1.5 text-xs">
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Next / Prev Stop</span>
                    <span className="font-mono text-slate-400 text-[10px]">→ / ←</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Auto Rotate</span>
                    <span className="font-mono text-slate-400 text-[10px]">Space</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Lift Roof</span>
                    <span className="font-mono text-slate-400 text-[10px]">R</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Cutaway Mode</span>
                    <span className="font-mono text-slate-400 text-[10px]">C</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Day / Night</span>
                    <span className="font-mono text-slate-400 text-[10px]">T</span>
                  </div>
                  <div className="p-1.5 rounded bg-slate-800 flex justify-between items-center">
                    <span className="text-slate-300">Toggle Pins</span>
                    <span className="font-mono text-slate-400 text-[10px]">P</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2.5 border-t border-slate-800 text-right">
                <button
                  onClick={() => setHotkeysOpen(false)}
                  className="px-4 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------------ */}
        {/* BOTTOM METRICS BANNER: Solid, concise                              */}
        {/* ------------------------------------------------------------------ */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 solid-panel px-4 py-1.5 rounded-lg text-xs text-slate-300 flex flex-wrap justify-center items-center gap-x-5 gap-y-1 z-10 pointer-events-auto">
          <span>PUE: <strong className="text-emerald-400 font-mono font-semibold">1.03</strong></span>
          <span className="text-slate-600">|</span>
          <span>WUE: <strong className="text-cyan-400 font-mono font-semibold">&lt; 0.02 L/kWh</strong></span>
          <span className="text-slate-600">|</span>
          <span>Waste Heat: <strong className="text-amber-400 font-mono font-semibold">60°C Reused</strong></span>
          <span className="text-slate-600">|</span>
          <span>Clean Energy: <strong className="text-indigo-400 font-semibold">Solar + Wind + BESS</strong></span>
        </div>

        {/* Bottom Right Hint */}
        <div className="absolute bottom-3 right-3 solid-panel px-2.5 py-1 rounded text-[10px] text-slate-400 hidden xl:block z-10">
          Keys 1–0 Travel | Hotkeys: ?
        </div>
      </div>
    </>
  );
}
