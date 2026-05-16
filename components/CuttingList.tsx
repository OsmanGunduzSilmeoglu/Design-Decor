import React, { useState, useMemo, useEffect } from 'react';
import { AppModules, CuttingPart, SavedCabinet, SavedProject } from '../types';
import { Lock, Unlock, Library, Calculator, Save, Copy, Check, Trash2, FolderOpen, Replace } from 'lucide-react';

interface CuttingListProps {
  navigate?: (module: AppModules) => void;
}

const CuttingList: React.FC<CuttingListProps> = ({ navigate }) => {
  const [view, setView] = useState<'CALC' | 'LIBRARY'>('CALC');
  const [type, setType] = useState<'BASE' | 'WALL'>('BASE');
  
  // Varsayılan değerler: Alt Dolap (h:77, d:60)
  const [dims, setDims] = useState({ h: '77', w: '', d: '60' });
  
  const [shelves, setShelves] = useState(''); 
  const [cabQty, setCabQty] = useState('1');

  // Kilitli alanlar
  const [lockedDims, setLockedDims] = useState({ h: false, w: false, d: false, shelves: false });
  
  // Mevcut çalışma listesi
  const [savedCabinets, setSavedCabinets] = useState<SavedCabinet[]>([]);
  
  // Kaydedilen projeler (LocalStorage)
  const [projects, setProjects] = useState<SavedProject[]>([]);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [isCopied, setIsCopied] = useState(false);

  const THICKNESS = 1.8;

  useEffect(() => {
    const saved = localStorage.getItem('um_projects');
    if (saved) {
      try {
        setProjects(JSON.parse(saved));
      } catch (e) {
        console.error("Projeler yüklenemedi", e);
      }
    }
  }, []);

  const saveProject = () => {
    if (!projectName.trim()) return;
    
    const newProject: SavedProject = {
      id: Date.now().toString(),
      name: projectName,
      date: new Date().toLocaleDateString('tr-TR'),
      cabinets: savedCabinets
    };

    const updatedProjects = [newProject, ...projects];
    setProjects(updatedProjects);
    localStorage.setItem('um_projects', JSON.stringify(updatedProjects));
    
    setShowSaveModal(false);
    setProjectName('');
    setView('LIBRARY');
  };

  const deleteProject = (id: string) => {
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    localStorage.setItem('um_projects', JSON.stringify(updated));
  };

  const loadProject = (project: SavedProject) => {
    setSavedCabinets(project.cabinets);
    setView('CALC');
  };

  const currentParts = useMemo(() => {
    const h = parseFloat(dims.h);
    const w = parseFloat(dims.w);
    const d = parseFloat(dims.d);
    const s = parseInt(shelves) || 0;
    const q = parseInt(cabQty) || 1;

    if (isNaN(h) || isNaN(w) || isNaN(d)) return [];

    const parts: CuttingPart[] = [];

    if (type === 'BASE') {
      parts.push({ name: 'Alt Tabla', width: w, height: d, count: 1 * q, description: 'Kasa Alt Parçası' });
      parts.push({ name: 'Yan Dikme', width: Number((h - THICKNESS).toFixed(2)), height: d, count: 2 * q, description: 'Yan Paneller' });
      parts.push({ name: 'Üst Kuşak (Kayıt)', width: Number((w - (THICKNESS * 2)).toFixed(2)), height: 10, count: 2 * q, description: 'Kasa Üst Bağlantı' });
      if (s > 0) {
        parts.push({ 
          name: 'İç Raf', 
          width: Number((w - (THICKNESS * 2)).toFixed(2)), 
          height: d, 
          count: s * q, 
          description: 'İç Raf' 
        });
      }
    } else {
      parts.push({ name: 'Yan Dikme', width: h, height: d, count: 2 * q, description: 'Tam Boy Yanlar' });
      parts.push({ name: 'Alt-Üst Tabla', width: Number((w - (THICKNESS * 2)).toFixed(2)), height: d, count: 2 * q, description: 'Alt ve Üst Paneller' });
      if (s > 0) {
        parts.push({ 
          name: 'İç Raf', 
          width: Number((w - (THICKNESS * 2)).toFixed(2)), 
          height: d, 
          count: s * q, 
          description: 'İç Raf (Alt/Üst ile Aynı)' 
        });
      }
    }

    return parts;
  }, [type, dims, shelves, cabQty]);

  const addCabinetToList = () => {
    if (currentParts.length === 0) return;

    const newCabinet: SavedCabinet = {
      id: Date.now(),
      type,
      dims: { ...dims },
      shelves: shelves || '0',
      quantity: parseInt(cabQty) || 1,
      parts: [...currentParts],
    };

    setSavedCabinets(prev => [...prev, newCabinet]);
    setDims(prev => ({ ...prev, w: '' })); 
    setCabQty('1');
  };

  const removeCabinet = (id: number) => {
    setSavedCabinets(prev => prev.filter(c => c.id !== id));
  };

  const handleInput = (key: string, val: string) => {
    setDims(prev => ({ ...prev, [key]: val }));
  };

  const toggleLock = (field: 'h' | 'w' | 'd' | 'shelves') => {
    setLockedDims(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const aggregatedParts = useMemo(() => {
    const map = new Map<string, CuttingPart>();
    savedCabinets.forEach(cab => {
      cab.parts.forEach(part => {
        const key = `${part.width}x${part.height}`;
        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.count += part.count;
          if (!existing.name.includes(part.name)) {
            existing.name = `${existing.name} + ${part.name}`;
          }
          if (existing.description && part.description && !existing.description.includes(part.description)) {
            existing.description = `${existing.description} / ${part.description}`;
          }
        } else {
          map.set(key, { ...part });
        }
      });
    });
    return Array.from(map.values()).sort((a, b) => b.width - a.width); 
  }, [savedCabinets]);

  const totalModuleCount = savedCabinets.reduce((acc, cab) => acc + cab.quantity, 0);

  const copyToClipboard = () => {
    const text = aggregatedParts.map(part => `${part.width} x ${part.height} = ${part.count} ADET`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Kopyalama başarısız', err);
    });
  };

  const exportToCuttingModule = () => {
    const partsToExport = aggregatedParts.map((part, idx) => ({
      id: Date.now().toString() + idx,
      name: part.name,
      w: part.width,
      h: part.height,
      count: part.count,
      rotatable: true
    }));
    localStorage.setItem('um_pending_cutlist_parts', JSON.stringify(partsToExport));
    if (navigate) {
      navigate(AppModules.CUTTING);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-6 text-brand-900 relative">
      
      {/* View Switcher Tabs */}
      <div className="bg-brand-200 p-1.5 rounded-2xl border border-brand-900/10 w-full flex mb-6 print:hidden shadow-sm">
        <button 
          onClick={() => setView('CALC')}
          className={`flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${view === 'CALC' ? 'bg-brand-900 text-brand-100 shadow-md' : 'text-brand-900/60 hover:text-brand-900'}`}
        >
          <Calculator size={18} /> Hesaplama
        </button>
        <button 
          onClick={() => setView('LIBRARY')}
          className={`flex-1 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${view === 'LIBRARY' ? 'bg-brand-500 text-brand-900 shadow-md' : 'text-brand-900/60 hover:text-brand-900'}`}
        >
          <Library size={18} /> Arşiv
        </button>
      </div>

      {view === 'LIBRARY' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slideUp">
          {projects.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-20 text-brand-900/40">
              <FolderOpen size={64} strokeWidth={1.5} className="mb-4 text-brand-900/20" />
              <p className="font-bold text-lg">Henüz kaydedilmiş proje yok.</p>
            </div>
          )}
          {projects.map(project => (
            <div key={project.id} className="bg-brand-200 border border-brand-900/10 p-6 rounded-3xl relative group active:scale-[0.98] transition-all shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                   <h3 className="text-xl font-bold text-brand-900 leading-tight mb-1">{project.name}</h3>
                   <span className="text-xs text-brand-900/50 font-mono font-medium">{project.date}</span>
                </div>
                <button onClick={() => deleteProject(project.id)} className="p-2 rounded-xl text-brand-900/30 hover:bg-red-50 hover:text-red-500 transition-colors cursor-pointer">
                   <Trash2 size={20} />
                </button>
              </div>
              <div className="flex gap-2 mb-6">
                <div className="text-[10px] text-brand-900 bg-brand-100 px-3 py-1.5 rounded-lg font-bold border border-brand-900/5">
                  {project.cabinets.length} Dolap
                </div>
                <div className="text-[10px] text-brand-900 bg-brand-100 px-3 py-1.5 rounded-lg font-bold border border-brand-900/5">
                   {project.cabinets.reduce((acc, c) => acc + c.parts.length, 0)} Parça
                </div>
              </div>
              <button 
                onClick={() => loadProject(project)}
                className="w-full py-3.5 rounded-xl bg-brand-900 hover:bg-brand-900/90 text-brand-100 font-bold shadow-md active:translate-y-1 transition-all"
              >
                Projeyi Yükle
              </button>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* CALCULATOR VIEW */}
          {/* Type Selector  */}
          <div className="grid grid-cols-2 gap-4 mb-6 print:hidden">
            <button
              onClick={() => {
                setType('BASE');
                setDims(prev => ({
                  ...prev,
                  h: lockedDims.h ? prev.h : '77',
                  d: lockedDims.d ? prev.d : '60'
                }));
              }}
              className={`py-5 rounded-2xl font-black text-sm tracking-widest transition-all flex items-center justify-center border-2 shadow-sm ${
                type === 'BASE' 
                ? 'bg-brand-500 border-brand-500 text-brand-900 shadow-md shadow-brand-500/20' 
                : 'bg-brand-200 border-brand-900/10 text-brand-900/50 hover:bg-brand-200/80 hover:text-brand-900/80'
              }`}
            >
              ALT DOLAP
            </button>
            <button
              onClick={() => {
                setType('WALL');
                setDims(prev => ({
                  ...prev,
                  h: lockedDims.h ? prev.h : '',
                  d: lockedDims.d ? prev.d : '32'
                }));
              }}
              className={`py-5 rounded-2xl font-black text-sm tracking-widest transition-all flex items-center justify-center border-2 shadow-sm ${
                type === 'WALL' 
                ? 'bg-brand-500 border-brand-500 text-brand-900 shadow-md shadow-brand-500/20' 
                : 'bg-brand-200 border-brand-900/10 text-brand-900/50 hover:bg-brand-200/80 hover:text-brand-900/80'
              }`}
            >
              ÜST DOLAP
            </button>
          </div>

          {/* Inputs - MOBILE GRID LAYOUT */}
          <div className="bg-brand-200 p-6 rounded-[2rem] shadow-sm border border-brand-900/10 relative print:hidden">
             
             <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* HEIGHT */}
                <div className="bg-brand-100 p-3 rounded-[1.25rem] border border-brand-900/5 relative group shadow-inner">
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <button 
                      onClick={() => toggleLock('h')}
                      className={`p-1.5 rounded-lg transition-all ${lockedDims.h ? 'bg-brand-500/20 text-brand-900' : 'text-brand-900/30 hover:text-brand-900/60'}`}
                    >
                      {lockedDims.h ? <Lock size={16} strokeWidth={2.5} /> : <Unlock size={16} strokeWidth={2.5} />}
                    </button>
                  </div>
                  <label className="block text-[10px] text-center text-brand-900/50 font-black uppercase mt-1 tracking-widest">Yükseklik</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={dims.h}
                    onChange={(e) => handleInput('h', e.target.value)}
                    placeholder="0"
                    className={`w-full bg-transparent text-center text-4xl font-black py-2 outline-none transition-colors ${lockedDims.h ? 'text-brand-500' : 'text-brand-900 placeholder:text-brand-900/10'}`}
                  />
                </div>
                {/* WIDTH */}
                <div className="bg-brand-100 p-3 rounded-[1.25rem] border border-brand-900/5 relative group shadow-inner">
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <button 
                      onClick={() => toggleLock('w')}
                      className={`p-1.5 rounded-lg transition-all ${lockedDims.w ? 'bg-brand-500/20 text-brand-900' : 'text-brand-900/30 hover:text-brand-900/60'}`}
                    >
                      {lockedDims.w ? <Lock size={16} strokeWidth={2.5} /> : <Unlock size={16} strokeWidth={2.5} />}
                    </button>
                  </div>
                  <label className="block text-[10px] text-center text-brand-900/50 font-black uppercase mt-1 tracking-widest">Genişlik</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={dims.w}
                    onChange={(e) => handleInput('w', e.target.value)}
                    placeholder="0"
                    className={`w-full bg-transparent text-center text-4xl font-black py-2 outline-none transition-colors ${lockedDims.w ? 'text-brand-500' : 'text-brand-900 placeholder:text-brand-900/10'}`}
                  />
                </div>
                {/* DEPTH */}
                <div className="bg-brand-100 p-3 rounded-[1.25rem] border border-brand-900/5 relative group shadow-inner">
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <button 
                      onClick={() => toggleLock('d')}
                      className={`p-1.5 rounded-lg transition-all ${lockedDims.d ? 'bg-brand-500/20 text-brand-900' : 'text-brand-900/30 hover:text-brand-900/60'}`}
                    >
                      {lockedDims.d ? <Lock size={16} strokeWidth={2.5} /> : <Unlock size={16} strokeWidth={2.5} />}
                    </button>
                  </div>
                  <label className="block text-[10px] text-center text-brand-900/50 font-black uppercase mt-1 tracking-widest">Derinlik</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={dims.d}
                    onChange={(e) => handleInput('d', e.target.value)}
                    placeholder="0"
                    className={`w-full bg-transparent text-center text-4xl font-black py-2 outline-none transition-colors ${lockedDims.d ? 'text-brand-500' : 'text-brand-900 placeholder:text-brand-900/10'}`}
                  />
                </div>
                {/* SHELVES */}
                <div className="bg-brand-100 p-3 rounded-[1.25rem] border border-brand-900/5 relative group shadow-inner">
                  <div className="absolute top-2.5 right-2.5 z-10">
                    <button 
                      onClick={() => toggleLock('shelves')}
                      className={`p-1.5 rounded-lg transition-all ${lockedDims.shelves ? 'bg-brand-500/20 text-brand-900' : 'text-brand-900/30 hover:text-brand-900/60'}`}
                    >
                      {lockedDims.shelves ? <Lock size={16} strokeWidth={2.5} /> : <Unlock size={16} strokeWidth={2.5} />}
                    </button>
                  </div>
                  <label className="block text-[10px] text-center text-brand-900/50 font-black uppercase mt-1 tracking-widest">Raf Sayısı</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={shelves}
                    onChange={(e) => setShelves(e.target.value)}
                    placeholder="0"
                    className={`w-full bg-transparent text-center text-4xl font-black py-2 outline-none transition-colors ${lockedDims.shelves ? 'text-brand-500' : 'text-brand-900 placeholder:text-brand-900/10'}`}
                  />
                </div>
             </div>

             <div className="flex gap-4">
                <div className="w-1/3">
                  <div className="relative h-16 group">
                    <input 
                      type="number"
                      inputMode="numeric"
                      min="1"
                      value={cabQty}
                      onChange={(e) => setCabQty(e.target.value)}
                      placeholder="1"
                      className="w-full h-full bg-brand-100 border border-brand-900/10 rounded-2xl px-4 text-center font-bold text-xl text-brand-900 outline-none shadow-sm focus:border-brand-500 transition-colors placeholder:text-brand-900/20"
                    />
                    <div className="absolute top-1 text-[9px] w-full text-center text-brand-900/40 font-black uppercase tracking-widest pointer-events-none mt-1">ADET</div>
                  </div>
                </div>
                <button
                  onClick={addCabinetToList}
                  disabled={currentParts.length === 0}
                  className={`w-2/3 h-16 rounded-2xl font-black text-xl tracking-widest shadow-md flex items-center justify-center gap-2 active:scale-95 transition-all ${
                    currentParts.length > 0 
                    ? 'bg-brand-900 text-brand-100 hover:bg-brand-900/90 shadow-brand-900/20' 
                    : 'bg-brand-100 text-brand-900/30 border border-brand-900/10 cursor-not-allowed shadow-none'
                  }`}
                >
                  EKLE <span className="text-3xl leading-none -mt-1">+</span>
                </button>
             </div>
          </div>

          {/* Saved Summary Chips */}
          {savedCabinets.length > 0 && (
            <div className="flex flex-wrap gap-2 print:hidden mb-6 mt-4">
              {savedCabinets.map((cab) => (
                <div key={cab.id} className="bg-brand-200 text-brand-900 pl-4 pr-1.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 animate-fadeIn border border-brand-900/10 shadow-sm shrink-0">
                  <span className="text-brand-500 bg-brand-100 px-2.5 py-1 rounded-full border border-brand-900/5">{cab.quantity}x</span>
                  <span className="tracking-wide">{cab.type === 'BASE' ? 'Alt' : 'Üst'} {cab.dims.w}x{cab.dims.h}</span>
                  <button 
                    onClick={() => removeCabinet(cab.id)}
                    className="bg-brand-100 w-7 h-7 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors ml-1 text-brand-900/50 hover:border-red-500 border border-brand-900/5"
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setSavedCabinets([])}
                className="bg-red-50/50 text-red-500 px-5 py-2 rounded-full text-xs font-bold hover:bg-red-500 hover:text-white transition-colors border border-red-500/10 shrink-0"
              >
                Temizle
              </button>
            </div>
          )}

          {/* PDF Header - Print only */}
          <div className="hidden print:block border-b-4 border-brand-900 pb-6 mb-8 text-brand-900">
            <h1 className="text-4xl font-black italic">DizaynDekor</h1>
            <p>Liste Raporu</p>
          </div>

          {/* Final Cutting List Table */}
          {aggregatedParts.length > 0 ? (
            <div className="bg-brand-200 rounded-[2rem] shadow-sm border border-brand-900/10 overflow-hidden animate-slideUp print:shadow-none print:bg-white print:border-brand-900 print:rounded-none mt-6">
              <div className="bg-brand-900 px-6 py-5 flex justify-between items-center print:bg-brand-100 print:border-b-2 print:border-brand-900 border-b border-brand-900/10">
                <div className="flex flex-col">
                  <h3 className="text-brand-100 font-black text-lg flex items-center gap-2 print:text-brand-900 tracking-wide">
                    LİSTE
                  </h3>
                  <p className="text-brand-100/60 text-[10px] font-bold uppercase tracking-widest print:text-brand-900/60">MDF 1.8cm</p>
                </div>
                <div className="bg-brand-500 px-4 py-1.5 rounded-lg text-xs font-black text-brand-900 shadow-sm border border-brand-500/50">
                  {totalModuleCount} Modül
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-brand-100/50 text-[10px] font-black text-brand-900/50 uppercase tracking-widest border-b border-brand-900/5 print:bg-white print:border-brand-900 print:text-black">
                      <th className="px-6 py-4 whitespace-nowrap">PARÇA</th>
                      <th className="px-6 py-4 whitespace-nowrap">ÖLÇÜ (cm)</th>
                      <th className="px-6 py-4 text-center whitespace-nowrap">ADET</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5 print:divide-brand-900">
                    {aggregatedParts.map((part, idx) => (
                      <tr key={idx} className="group hover:bg-brand-100/50 transition-colors print:hover:bg-transparent print:text-black">
                        <td className="px-6 py-5">
                          <div className="font-extrabold text-brand-900 text-sm tracking-wide">{part.name}</div>
                          <div className="text-[10px] text-brand-900/50 font-bold uppercase tracking-widest mt-0.5">{part.description}</div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xl font-black text-brand-900">{part.width}</span>
                            <span className="text-brand-900/40 font-bold text-xs print:text-brand-900">x</span>
                            <span className="font-mono text-xl font-black text-brand-900">{part.height}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-center">
                          <div className="bg-brand-100 rounded-xl py-1 px-4 inline-block border border-brand-900/5 shadow-inner print:bg-transparent print:p-0 print:border-none print:shadow-none">
                            <span className="text-2xl font-black text-brand-500 print:text-brand-900">
                              {part.count}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="p-6 bg-brand-100/50 border-t border-brand-900/5 flex flex-col gap-4 print:bg-white print:border-brand-900">
                 <div className="grid grid-cols-2 gap-4 print:hidden">
                    {/* SAVE BUTTON */}
                    <button 
                      className="bg-brand-100 text-brand-900 py-4 rounded-2xl text-sm font-bold border border-brand-900/10 hover:bg-brand-200 active:scale-95 transition-all shadow-sm flex items-center justify-center gap-2 tracking-wide"
                      onClick={() => setShowSaveModal(true)}
                    >
                      <Save size={18} strokeWidth={2.5} /> KAYDET
                    </button>

                    {/* COPY BUTTON */}
                    <button 
                      className={`${isCopied ? 'bg-brand-500/80 text-brand-900' : 'bg-brand-500 text-brand-900'} py-4 rounded-2xl text-sm font-black shadow-md hover:bg-brand-500/90 active:scale-95 transition-all border border-brand-900/10 flex items-center justify-center gap-2 tracking-wide`}
                      onClick={copyToClipboard}
                    >
                      {isCopied ? <Check size={18} strokeWidth={2.5} /> : <Copy size={18} strokeWidth={2.5} />}
                      {isCopied ? 'KOPYALANDI' : 'KOPYALA'}
                    </button>
                 </div>
                 
                 {/* SEND TO CUTTING MODULE BUTTON */}
                 <div className="print:hidden">
                   <button 
                     onClick={exportToCuttingModule}
                     className="w-full bg-brand-900 text-brand-100 py-4 rounded-2xl text-sm font-black tracking-widest flex items-center justify-center gap-2 hover:bg-brand-900/90 active:scale-95 transition-all shadow-md"
                   >
                     <Replace size={18} strokeWidth={2.5} /> KESİME AKTAR
                   </button>
                 </div>
              </div>
            </div>
          ) : (
            <div className="bg-brand-200/50 border border-brand-900/5 rounded-[2rem] p-12 text-center print:hidden shadow-inner mt-6">
              <Calculator size={48} strokeWidth={1.5} className="mx-auto mb-4 text-brand-900/20" />
              <h4 className="font-bold text-brand-900/50 text-sm uppercase tracking-widest mb-2">Liste Boş</h4>
              <p className="text-xs text-brand-900/40">Ölçüleri girin ve ekleyin.</p>
            </div>
          )}
        </>
      )}

      {/* SAVE PROJECT MODAL */}
      {showSaveModal && (
        <div className="fixed inset-0 z-[100] bg-brand-900/40 backdrop-blur-md flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-brand-100 border border-brand-900/10 p-8 rounded-[2rem] w-full max-w-sm shadow-2xl relative">
             <button onClick={() => setShowSaveModal(false)} className="absolute top-4 right-4 bg-brand-200 w-8 h-8 rounded-full text-brand-900/50 hover:text-brand-900 hover:bg-brand-200/80 transition-colors flex items-center justify-center">✕</button>
             <h3 className="text-2xl font-black text-brand-900 mb-2 tracking-tight">Projeyi Kaydet</h3>
             <p className="text-brand-900/50 text-sm mb-6 font-medium">Arşivine eklemek için projeye bir isim ver.</p>
             <input 
               autoFocus
               value={projectName}
               onChange={(e) => setProjectName(e.target.value)}
               placeholder="Örn: Mutfak Dolabı 1"
               className="w-full bg-brand-200 border border-brand-900/10 rounded-xl px-4 py-4 text-brand-900 text-lg font-bold outline-none focus:border-brand-500 mb-6 shadow-inner placeholder:text-brand-900/30"
               onKeyDown={(e) => e.key === 'Enter' && saveProject()}
             />
             <button onClick={saveProject} className="w-full py-4 rounded-xl bg-brand-900 text-brand-100 font-bold text-lg shadow-md active:scale-95 transition-transform hover:bg-brand-900/90 tracking-wide">
               Tamamla
             </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default CuttingList;
