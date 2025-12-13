import React, { useState, useEffect, useRef } from 'react';
import { 
  Trophy, Users, Settings, Image as ImageIcon, Download, 
  Shield, Zap, FileText, ChevronRight, Play, Plus, Trash2, 
  Save, RotateCcw, Layout, Type, Grid, Layers, Search, Crosshair,
  Award, UserPlus, BarChart, Upload, Move, Maximize, Camera
} from 'lucide-react';

// --- HELPERS & COMPONENTS (Moved to Top) ---

const NumberInput = ({ value, onChange, className }) => (
  <input 
    type="number" 
    value={value} 
    onChange={e => onChange(e.target.value)}
    className={`bg-transparent border-b border-zinc-700 focus:border-emerald-500 outline-none text-center font-mono ${className}`} 
  />
);

const Toggle = ({ label, checked, onChange }) => (
  <div className="flex items-center justify-between py-2">
    <span className="text-xs font-medium text-zinc-400">{label}</span>
    <button 
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 rounded-full relative transition-colors ${checked ? 'bg-emerald-500' : 'bg-zinc-700'}`}
    >
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  </div>
);

const NavBtn = ({ id, icon, label, active, set }) => (
  <button 
    onClick={() => set(id)} 
    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${active === id ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
  >
    {icon} <span className="hidden md:block font-medium">{label}</span>
  </button>
);

const ControlSlider = ({ label, val, min, max, set }) => (
    <div>
        <div className="flex justify-between text-[10px] text-zinc-400 mb-1"><span>{label}</span><span>{val}</span></div>
        <input type="range" min={min} max={max} value={val} onChange={e => set(parseInt(e.target.value))} className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer" />
    </div>
);

const StatBox = ({ label, value, color }) => (
    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
        <div className="text-sm uppercase tracking-widest text-zinc-400 mb-1">{label}</div>
        <div className="text-6xl font-black" style={{ color: color }}>{value}</div>
    </div>
);

// --- CONFIGURATION ---
const DEFAULT_POINT_SYSTEM = {
  killPoint: 1,
  placements: { 1: 15, 2: 12, 3: 10, 4: 8, 5: 6, 6: 4, 7: 2, 8: 1, 9: 1, 10: 1, 11: 1, 12: 1, 13: 0, 14: 0, 15: 0, 16: 0 }
};

const THEMES = {
  cyber: { label: 'Cyber', bg: 'bg-zinc-950', accent: '#00ff9d', text: 'white', cardBg: 'rgba(0,0,0,0.8)' },
  clean: { label: 'Clean', bg: 'bg-gray-100', accent: '#2563eb', text: 'black', cardBg: 'white' },
  gold: { label: 'Gold', bg: 'bg-neutral-900', accent: '#fbbf24', text: 'white', cardBg: 'rgba(20,20,20,0.9)' },
  red: { label: 'Red', bg: 'bg-red-950', accent: '#ef4444', text: 'white', cardBg: 'rgba(40,0,0,0.8)' },
  orange: { label: 'Orange', bg: 'bg-orange-950', accent: '#f97316', text: 'white', cardBg: 'rgba(30,10,0,0.9)' },
};

// --- MAIN APPLICATION ---

export default function ScrimMasterPro() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Data
  const [slots, setSlots] = useState(Array.from({ length: 20 }, (_, i) => ({ slot: i + 1, name: "", tag: "" })));
  const [matchData, setMatchData] = useState([]); 
  const [results, setResults] = useState([]);
  const [pointSystem, setPointSystem] = useState(DEFAULT_POINT_SYSTEM);
  
  // Special Data
  const [fraggers, setFraggers] = useState(Array.from({length: 5}, (_, i) => ({name: `Player ${i+1}`, team: "Team", kills: 0})));
  const [winnerInfo, setWinnerInfo] = useState({ name: "TEAM NAME", kills: 0, points: 0, wwcd: 1 });

  // Settings
  const [cardConfig, setCardConfig] = useState({
    mode: 'standings',
    title: "GRAND FINALS",
    subtitle: "MATCH 1 RESULT",
    organizer: "YOUR ORG NAME",
    theme: 'cyber',
    showWWCD: true,
    showTotal: true,
    customBg: null,
    customLogo: null,
    opacity: 90,
    scale: 1, 
    rowGap: 8,
    fontSize: 16,
    tableY: 0,
    tableX: 0,
    tableWidth: 100,
    useTwoColumns: false
  });

  const cardRef = useRef(null);
  const containerRef = useRef(null);

  // Initialize
  useEffect(() => {
    if (!document.getElementById('h2c')) {
      const script = document.createElement('script');
      script.id = 'h2c';
      script.src = "https://html2canvas.hertzen.com/dist/html2canvas.min.js";
      document.body.appendChild(script);
    }
    
    const handleResize = () => {
      if (containerRef.current) {
        const cw = containerRef.current.clientWidth;
        const ch = containerRef.current.clientHeight;
        // Calculate fit scale
        const scale = Math.min((cw - 40) / 1080, (ch - 40) / 1920, 1);
        setCardConfig(prev => ({ ...prev, scale: Math.max(0.2, scale) }));
      }
    };

    window.addEventListener('resize', handleResize);
    if (activeTab === 'studio') setTimeout(handleResize, 100);
    return () => window.removeEventListener('resize', handleResize);
  }, [activeTab]);

  // Calculations
  const handleCalculate = () => {
    const computed = matchData.map(data => {
      const team = slots.find(s => s.slot === data.slotId) || { name: `Slot ${data.slotId}`, tag: `S${data.slotId}` };
      const rank = parseInt(data.place) || 0;
      const kills = parseInt(data.kills) || 0;
      const placePts = pointSystem.placements[rank] || 0;
      const killPts = kills * pointSystem.killPoint;
      
      return {
        ...team, rank, kills, placePts, killPts,
        total: placePts + killPts,
        wwcd: rank === 1 ? 1 : 0
      };
    })
    .filter(r => r.rank > 0 || r.kills > 0)
    .sort((a, b) => b.total - a.total || b.killPts - a.killPts);

    setResults(computed);
    if(computed.length > 0) {
        setWinnerInfo({ name: computed[0].name, kills: computed[0].kills, points: computed[0].total, wwcd: computed[0].wwcd });
    }
    setActiveTab('studio');
  };

  const handleDownload = async () => {
    if (!window.html2canvas || !cardRef.current) return;
    try {
      const originalStyle = cardRef.current.style.transform;
      cardRef.current.style.transform = 'none'; // Reset scale for capture
      const canvas = await window.html2canvas(cardRef.current, {
        scale: 1, useCORS: true, backgroundColor: null,
        width: 1080, height: 1920, windowWidth: 1080, windowHeight: 1920
      });
      cardRef.current.style.transform = originalStyle;
      const link = document.createElement('a');
      link.download = `Result-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) { alert("Error downloading"); }
  };

  const handleBulkImport = (text) => {
    const lines = text.split('\n').filter(l => l.trim());
    const newSlots = [...slots];
    lines.forEach((line, i) => {
      if (i < 20) {
        if(line.includes(',')) {
            const [name, tag] = line.split(',');
            newSlots[i].name = name.trim();
            newSlots[i].tag = tag ? tag.trim() : name.trim().substring(0,4).toUpperCase();
        } else {
            newSlots[i].name = line.trim();
            newSlots[i].tag = line.trim().substring(0,4).toUpperCase();
        }
      }
    });
    setSlots(newSlots);
  };

  // --- RENDERERS ---

  const renderSidebar = () => (
    <div className="w-16 md:w-64 bg-zinc-950 border-r border-zinc-800 flex flex-col h-screen shrink-0 z-20">
      <div className="p-4 flex items-center gap-3 border-b border-zinc-800">
        <div className="w-8 h-8 bg-emerald-500 rounded flex items-center justify-center font-bold text-black">PC</div>
        <span className="font-bold text-white hidden md:block">PointCalc Pro</span>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 space-y-1 px-2">
        <NavBtn id="dashboard" icon={<Layout />} label="Dashboard" active={activeTab} set={setActiveTab} />
        <NavBtn id="slots" icon={<Users />} label="Teams List" active={activeTab} set={setActiveTab} />
        <NavBtn id="entry" icon={<Grid />} label="Enter Points" active={activeTab} set={setActiveTab} />
        <NavBtn id="studio" icon={<ImageIcon />} label="Card Studio" active={activeTab} set={setActiveTab} />
        <NavBtn id="settings" icon={<Settings />} label="Settings" active={activeTab} set={setActiveTab} />
      </nav>
    </div>
  );

  const activeTheme = THEMES[cardConfig.theme] || THEMES['cyber'];

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      {renderSidebar()}
      
      <main className="flex-1 h-screen overflow-hidden relative flex flex-col">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-fade-in">
                <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-6 text-emerald-400 border border-emerald-500/20 shadow-lg"><Zap size={48} /></div>
                <h1 className="text-5xl font-black text-white mb-4">POINTCALC PRO</h1>
                <p className="text-zinc-400 max-w-md mb-8">Professional Esports Management. Create Slots, Calculate Points, Generate HD Cards.</p>
                <div className="flex gap-4">
                    <button onClick={() => setActiveTab('slots')} className="bg-white text-black px-8 py-3 rounded-full font-bold hover:bg-emerald-400 transition-colors">Start New</button>
                </div>
            </div>
        )}

        {/* SLOTS */}
        {activeTab === 'slots' && (
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-4xl mx-auto">
                    <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Manage Teams</h2><button onClick={() => setSlots(slots.map(s => ({...s, name: '', tag: ''})))} className="text-red-400 text-sm flex gap-1"><Trash2 size={14}/> Clear</button></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-zinc-900 p-4 rounded-xl border border-zinc-800 h-fit">
                            <h3 className="text-sm font-bold text-zinc-400 mb-2">QUICK IMPORT</h3>
                            <textarea className="w-full h-48 bg-black border border-zinc-700 rounded p-3 text-sm text-white font-mono" placeholder="Paste team names here..." onChange={(e) => handleBulkImport(e.target.value)} />
                        </div>
                        <div className="space-y-2 h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
                            {slots.map((slot, i) => (
                                <div key={slot.slot} className="flex items-center gap-2 bg-zinc-900 p-2 rounded border border-zinc-800">
                                    <span className="w-8 text-center text-zinc-500 text-sm">{slot.slot}</span>
                                    <input value={slot.name} onChange={(e) => { const n=[...slots]; n[i].name=e.target.value; setSlots(n); }} placeholder="Team Name" className="flex-1 bg-transparent text-white text-sm outline-none" />
                                    <input value={slot.tag} onChange={(e) => { const n=[...slots]; n[i].tag=e.target.value; setSlots(n); }} placeholder="TAG" className="w-16 bg-black/30 text-emerald-400 text-xs text-center rounded py-1" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* ENTRY */}
        {activeTab === 'entry' && (
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold">Match Data</h2><button onClick={handleCalculate} className="bg-emerald-500 text-black px-6 py-2 rounded-full font-bold flex gap-2"><Play size={16}/> Calculate</button></div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-12 bg-black p-3 text-xs font-bold text-zinc-500 uppercase">
                            <div className="col-span-1 text-center">#</div><div className="col-span-7">Team</div><div className="col-span-2 text-center">Rank</div><div className="col-span-2 text-center">Kills</div>
                        </div>
                        <div className="divide-y divide-zinc-800">
                            {slots.map((slot) => {
                                const data = matchData.find(d => d.slotId === slot.slot) || { place: '', kills: '' };
                                return (
                                    <div key={slot.slot} className="grid grid-cols-12 p-2 items-center hover:bg-zinc-800/50">
                                        <div className="col-span-1 text-center text-zinc-600 text-xs">{slot.slot}</div>
                                        <div className="col-span-7 text-sm font-medium text-white truncate px-2 opacity-90">{slot.name || <span className="text-zinc-700 italic">Empty</span>}</div>
                                        <div className="col-span-2 px-1"><input type="number" value={data.place} onChange={(e) => { const n=matchData.filter(d=>d.slotId!==slot.slot); n.push({...data, slotId:slot.slot, place:e.target.value}); setMatchData(n); }} placeholder="-" className="w-full bg-black border border-zinc-700 text-white text-center rounded py-1 focus:border-emerald-500 outline-none" /></div>
                                        <div className="col-span-2 px-1"><input type="number" value={data.kills} onChange={(e) => { const n=matchData.filter(d=>d.slotId!==slot.slot); n.push({...data, slotId:slot.slot, kills:e.target.value}); setMatchData(n); }} placeholder="0" className="w-full bg-black border border-zinc-700 text-white text-center rounded py-1 focus:border-emerald-500 outline-none" /></div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* STUDIO */}
        {activeTab === 'studio' && (
            <div className="flex h-full bg-zinc-950 overflow-hidden">
                <div className="w-96 bg-zinc-900 border-r border-zinc-800 flex flex-col h-full shrink-0 z-10">
                    <div className="p-4 border-b border-zinc-800"><h2 className="font-bold text-white flex gap-2"><Settings size={16}/> Studio</h2></div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
                        
                        <div className="grid grid-cols-4 gap-1 p-1 bg-black rounded-lg">
                            {[
                                {id: 'standings', icon: <Grid size={14}/>, title: 'Table'},
                                {id: 'fraggers', icon: <Crosshair size={14}/>, title: 'MVP'},
                                {id: 'winner', icon: <Trophy size={14}/>, title: 'Win'},
                                {id: 'warheads', icon: <Award size={14}/>, title: 'Top 3'}
                            ].map(m => (
                                <button key={m.id} onClick={() => setCardConfig({...cardConfig, mode: m.id})} className={`flex flex-col items-center justify-center py-2 rounded ${cardConfig.mode === m.id ? 'bg-zinc-800 text-emerald-400' : 'text-zinc-500 hover:text-white'}`}>{m.icon} <span className="text-[10px] mt-1">{m.title}</span></button>
                            ))}
                        </div>

                        {cardConfig.mode === 'fraggers' && (
                            <div className="space-y-2 bg-black/30 p-3 rounded border border-zinc-800">
                                <label className="text-xs font-bold text-zinc-500 uppercase">Fraggers Data</label>
                                {fraggers.map((f, i) => (
                                <div key={i} className="flex gap-1">
                                    <input value={f.name} onChange={e => {const n=[...fraggers]; n[i].name=e.target.value; setFraggers(n)}} className="flex-1 bg-black border border-zinc-700 text-xs text-white p-1 rounded" placeholder="Player" />
                                    <input value={f.kills} onChange={e => {const n=[...fraggers]; n[i].kills=e.target.value; setFraggers(n)}} className="w-12 bg-black border border-zinc-700 text-xs text-white p-1 text-center rounded" placeholder="K" />
                                </div>
                                ))}
                            </div>
                        )}

                        <div className="space-y-3 bg-zinc-800/30 p-3 rounded border border-zinc-800">
                            <div className="flex justify-between items-center"><label className="text-xs font-bold text-zinc-400 uppercase flex items-center gap-2"><Move size={12}/> Overlay</label> <button onClick={() => setCardConfig({...cardConfig, tableX: 0, tableY: 0, tableWidth: 100})} className="text-[10px] text-emerald-400">Reset</button></div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                <ControlSlider label="Pos Y" val={cardConfig.tableY} min={-500} max={500} set={v => setCardConfig({...cardConfig, tableY: v})} />
                                <ControlSlider label="Pos X" val={cardConfig.tableX} min={-200} max={200} set={v => setCardConfig({...cardConfig, tableX: v})} />
                                <ControlSlider label="Width %" val={cardConfig.tableWidth} min={50} max={100} set={v => setCardConfig({...cardConfig, tableWidth: v})} />
                                <ControlSlider label="Row Gap" val={cardConfig.rowGap} min={0} max={30} set={v => setCardConfig({...cardConfig, rowGap: v})} />
                                <ControlSlider label="Font Size" val={cardConfig.fontSize} min={12} max={32} set={v => setCardConfig({...cardConfig, fontSize: v})} />
                                <ControlSlider label="Opacity" val={cardConfig.opacity} min={0} max={100} set={v => setCardConfig({...cardConfig, opacity: v})} />
                            </div>
                            {cardConfig.mode === 'standings' && (
                                <Toggle label="2 Columns Layout" checked={cardConfig.useTwoColumns} onChange={v => setCardConfig({...cardConfig, useTwoColumns: v})} />
                            )}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-500 uppercase block">Custom Assets</label>
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex flex-col items-center justify-center p-3 bg-black border border-zinc-700 border-dashed rounded cursor-pointer hover:border-emerald-500">
                                    <ImageIcon size={16} className="text-zinc-400 mb-1"/> <span className="text-[10px] text-zinc-500">BG Image</span>
                                    <input type="file" className="hidden" onChange={e => e.target.files[0] && setCardConfig({...cardConfig, customBg: URL.createObjectURL(e.target.files[0])})} />
                                </label>
                                <label className="flex flex-col items-center justify-center p-3 bg-black border border-zinc-700 border-dashed rounded cursor-pointer hover:border-emerald-500">
                                    <Shield size={16} className="text-zinc-400 mb-1"/> <span className="text-[10px] text-zinc-500">Logo</span>
                                    <input type="file" className="hidden" onChange={e => e.target.files[0] && setCardConfig({...cardConfig, customLogo: URL.createObjectURL(e.target.files[0])})} />
                                </label>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <input value={cardConfig.organizer} onChange={e => setCardConfig({...cardConfig, organizer: e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-xs text-white rounded" placeholder="Org Name" />
                            <input value={cardConfig.title} onChange={e => setCardConfig({...cardConfig, title: e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-xs text-white rounded" placeholder="Title" />
                            <input value={cardConfig.subtitle} onChange={e => setCardConfig({...cardConfig, subtitle: e.target.value})} className="w-full bg-black border border-zinc-700 p-2 text-xs text-white rounded" placeholder="Subtitle" />
                        </div>

                        <button onClick={handleDownload} className="w-full bg-emerald-500 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 mt-4 shadow-lg"><Download size={16} /> Download HD</button>
                    </div>
                </div>

                {/* PREVIEW */}
                <div ref={containerRef} className="flex-1 bg-zinc-950 flex items-center justify-center overflow-hidden relative p-10" style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                    <div 
                        ref={cardRef}
                        style={{ 
                            width: '1080px', height: '1920px', 
                            transform: `scale(${cardConfig.scale})`, transformOrigin: 'center',
                            boxShadow: '0 0 100px rgba(0,0,0,0.5)',
                            backgroundColor: cardConfig.theme === 'clean' ? '#fff' : '#000'
                        }}
                        className="relative shrink-0 overflow-hidden flex flex-col font-sans"
                    >
                        {/* BG */}
                        <div className="absolute inset-0">
                            {cardConfig.customBg ? ( <img src={cardConfig.customBg} className="w-full h-full object-cover" alt="bg" /> ) : ( <div className={`w-full h-full ${activeTheme.bg}`} /> )}
                            <div className="absolute inset-0 bg-black" style={{ opacity: 1 - (cardConfig.opacity / 100) }} />
                        </div>

                        {/* CONTENT */}
                        <div className="relative z-10 h-full flex flex-col p-12">
                            {/* HEADER */}
                            <div className="flex items-center gap-6 mb-8 pt-10">
                                <div className="w-32 h-32 rounded-full overflow-hidden flex items-center justify-center border-4" style={{ borderColor: activeTheme.accent, backgroundColor: 'rgba(0,0,0,0.3)' }}>
                                    {cardConfig.customLogo ? <img src={cardConfig.customLogo} className="w-full h-full object-cover" /> : <Shield size={48} color={activeTheme.accent}/>}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-bold tracking-[0.3em] uppercase opacity-80" style={{ color: cardConfig.theme === 'clean' ? '#000' : 'white' }}>{cardConfig.organizer}</h3>
                                    <h1 className="text-7xl font-black italic uppercase tracking-tighter" style={{ color: activeTheme.accent, textShadow: '0 4px 20px rgba(0,0,0,0.5)' }}>{cardConfig.title}</h1>
                                    <h2 className="text-3xl font-bold uppercase tracking-widest opacity-90" style={{ color: cardConfig.theme === 'clean' ? '#333' : 'white' }}>{cardConfig.subtitle}</h2>
                                </div>
                            </div>

                            {/* STANDINGS MODE */}
                            {cardConfig.mode === 'standings' && (
                                <div className="flex-1 transition-all duration-200" style={{ transform: `translate(${cardConfig.tableX}px, ${cardConfig.tableY}px)`, width: `${cardConfig.tableWidth}%`, margin: '0 auto' }}>
                                    {!cardConfig.useTwoColumns && (
                                        <div className="grid grid-cols-12 gap-4 px-6 py-4 rounded-lg mb-4 text-xl font-bold uppercase tracking-wider" style={{ backgroundColor: activeTheme.accent, color: 'black' }}>
                                            <div className="col-span-1 text-center">#</div><div className="col-span-5">Team</div>
                                            {cardConfig.showWWCD && <div className="col-span-2 text-center">WWCD</div>}<div className="col-span-2 text-center">Pos</div><div className="col-span-2 text-center">Total</div>
                                        </div>
                                    )}
                                    <div className={cardConfig.useTwoColumns ? "grid grid-cols-2 gap-x-12" : "flex flex-col"} style={{ gap: `${cardConfig.rowGap}px` }}>
                                        {results.slice(0, cardConfig.useTwoColumns ? 32 : 18).map((team, index) => (
                                            <div key={index} className="grid grid-cols-12 gap-4 items-center px-6 py-3 rounded-lg relative overflow-hidden backdrop-blur-sm shadow-sm"
                                                style={{ 
                                                    backgroundColor: index === 0 ? activeTheme.accent : activeTheme.cardBg,
                                                    color: index === 0 ? 'black' : activeTheme.text,
                                                    fontSize: `${cardConfig.fontSize}px`,
                                                    borderLeft: index === 0 ? 'none' : `6px solid ${activeTheme.accent}`
                                                }}>
                                                <div className="col-span-1 text-center font-black text-2xl opacity-70">{index + 1}</div>
                                                <div className="col-span-5 font-bold uppercase tracking-tight truncate flex items-center gap-3">{team.name} {index === 0 && <Trophy size={24} />}</div>
                                                {cardConfig.showWWCD && <div className="col-span-2 text-center font-bold text-xl">{team.wwcd > 0 ? team.wwcd : '-'}</div>}
                                                <div className="col-span-2 text-center font-bold text-xl opacity-80">{team.placePts}</div>
                                                <div className="col-span-2 text-center font-black text-3xl">{team.total}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* FRAGGERS MODE */}
                            {cardConfig.mode === 'fraggers' && (
                                <div className="flex-1 flex flex-col justify-center gap-6" style={{ transform: `translate(${cardConfig.tableX}px, ${cardConfig.tableY}px)` }}>
                                    {fraggers.map((f, i) => (
                                        <div key={i} className="flex items-center justify-between p-8 rounded-2xl border-l-[12px] bg-black/60 backdrop-blur-md" style={{ borderColor: i===0 ? activeTheme.accent : 'transparent', backgroundColor: activeTheme.cardBg }}>
                                            <div className="flex items-center gap-8"><span className="text-8xl font-black italic opacity-20" style={{ color: activeTheme.text }}>0{i+1}</span><div><div className="text-5xl font-black uppercase" style={{ color: activeTheme.text }}>{f.name}</div><div className="text-2xl opacity-70 uppercase tracking-widest" style={{ color: activeTheme.text }}>{f.team}</div></div></div>
                                            <div className="text-center"><div className="text-8xl font-black" style={{ color: activeTheme.accent }}>{f.kills}</div><div className="text-sm font-bold uppercase tracking-widest opacity-50" style={{ color: activeTheme.text }}>KILLS</div></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* WINNER MODE */}
                            {cardConfig.mode === 'winner' && (
                                <div className="flex-1 flex flex-col items-center justify-center text-center gap-8" style={{ transform: `translate(${cardConfig.tableX}px, ${cardConfig.tableY}px)` }}>
                                    <div className="w-64 h-64 rounded-full border-8 flex items-center justify-center bg-black/40 mb-8" style={{ borderColor: activeTheme.accent }}>
                                        {cardConfig.customLogo ? <img src={cardConfig.customLogo} className="w-full h-full object-cover rounded-full" /> : <Trophy size={100} color={activeTheme.accent} />}
                                    </div>
                                    <div className="bg-black/60 p-12 rounded-3xl border-2 border-white/10 backdrop-blur-xl w-full">
                                        <h2 className="text-4xl font-bold tracking-[0.5em] text-white mb-4">WINNER WINNER</h2>
                                        <h1 className="text-[120px] leading-none font-black italic uppercase mb-12" style={{ color: activeTheme.accent }}>{winnerInfo.name}</h1>
                                        <div className="grid grid-cols-3 gap-8">
                                            <StatBox label="Total Pts" value={winnerInfo.points} color={activeTheme.accent} />
                                            <StatBox label="WWCD" value={winnerInfo.wwcd} color={activeTheme.accent} />
                                            <StatBox label="Kills" value={winnerInfo.kills} color={activeTheme.accent} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* WARHEADS MODE */}
                            {cardConfig.mode === 'warheads' && (
                                <div className="flex-1 flex flex-col justify-center gap-8" style={{ transform: `translate(${cardConfig.tableX}px, ${cardConfig.tableY}px)` }}>
                                    {results.slice(0, 3).map((team, i) => (
                                        <div key={i} className="flex items-center p-8 rounded-xl bg-black/60 border border-white/10 relative overflow-hidden">
                                            <div className="absolute left-0 top-0 bottom-0 w-4" style={{ backgroundColor: i===0 ? '#FFD700' : i===1 ? '#C0C0C0' : '#CD7F32' }}></div>
                                            <div className="text-9xl font-black italic opacity-30 mr-8" style={{ color: 'white' }}>{i+1}</div>
                                            <div className="flex-1"><div className="text-6xl font-black uppercase text-white">{team.name}</div><div className="text-2xl text-emerald-400">{team.tag}</div></div>
                                            <div className="text-right"><div className="text-7xl font-black text-white">{team.total}</div><div className="text-sm uppercase tracking-widest opacity-60 text-white">Points</div></div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* FOOTER */}
                            <div className="mt-auto pt-8 border-t border-white/10 flex justify-between items-center opacity-60" style={{ color: cardConfig.theme === 'clean' ? '#000' : 'white' }}>
                                <span className="text-xl font-bold uppercase tracking-widest">Follow Us @{cardConfig.organizer}</span>
                                <span className="text-sm">POWERED BY SCRIMMASTER</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

      </main>
    </div>
  );
}