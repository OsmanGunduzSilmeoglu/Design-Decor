import React, { useState, useEffect } from 'react';
import { Disc3, Scissors, Settings2, RotateCw, Layers, LayoutPanelLeft, ChevronDown, X, ZoomIn, ZoomOut, Maximize } from 'lucide-react';
import { optimizeCutlist, OptResult, PartInput, StockInput, PlacedBin } from './GuillotinePacker';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

const CuttingModule: React.FC = () => {
  const [stocks, setStocks] = useState<StockInput[]>([
    { id: 's1', h: 280, w: 210, count: 5 },
    { id: 's2', h: 0, w: 0, count: 0 },
    { id: 's3', h: 0, w: 0, count: 0 },
    { id: 's4', h: 0, w: 0, count: 0 },
  ]);

  const [parts, setParts] = useState<PartInput[]>([
    { id: '1', name: '1', h: 72, w: 60, count: 2, rotatable: true },
    { id: '2', name: '2', h: 80, w: 60, count: 2, rotatable: true },
    { id: '3', name: '3', h: 76.4, w: 60, count: 1, rotatable: true },
    { id: '4', name: '', h: 0, w: 0, count: 0, rotatable: true },
    { id: '5', name: '', h: 0, w: 0, count: 0, rotatable: true },
    { id: '6', name: '', h: 0, w: 0, count: 0, rotatable: true },
    { id: '7', name: '', h: 0, w: 0, count: 0, rotatable: true },
  ]);
  const [kerf, setKerf] = useState<number>(0.3); // 3mm
  
  const [result, setResult] = useState<OptResult | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [selectedBin, setSelectedBin] = useState<PlacedBin | null>(null);

  useEffect(() => {
    const pendingParts = localStorage.getItem('um_pending_cutlist_parts');
    if (pendingParts) {
      try {
        const parsed = JSON.parse(pendingParts);
        if (parsed.length > 0) {
           // Create some empty rows to make the table look good
           while (parsed.length < 5) {
             parsed.push({ id: Date.now().toString() + parsed.length, name: '', h: 0, w: 0, count: 0, rotatable: true });
           }
           if (parsed[parsed.length - 1].h) {
             parsed.push({ id: Date.now().toString() + parsed.length, name: '', h: 0, w: 0, count: 0, rotatable: true });
           }
           setParts(parsed);
        }
      } catch (e) {
        console.error(e);
      }
      localStorage.removeItem('um_pending_cutlist_parts'); // Consume it
    }
  }, []);

  const updatePart = (index: number, field: keyof PartInput, value: any) => {
    const newParts = [...parts];
    newParts[index] = { ...newParts[index], [field]: value };
    // Add a new empty row if we edit the last row
    if (index === newParts.length - 1 && value) {
      newParts.push({ id: Date.now().toString(), name: '', h: 0, w: 0, count: 0, rotatable: true });
    }
    setParts(newParts);
  };

  const updateStock = (index: number, field: keyof StockInput, value: any) => {
    const newStocks = [...stocks];
    newStocks[index] = { ...newStocks[index], [field]: value };
    if (index === newStocks.length - 1 && value) {
      newStocks.push({ id: Date.now().toString(), h: 0, w: 0, count: 0 });
    }
    setStocks(newStocks);
  };

  const startOptimization = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      const res = optimizeCutlist(stocks, parts, kerf);
      setResult(res);
      setIsOptimizing(false);
    }, 100);
  };

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-20">
      
      {/* BAŞLIK & AYARLAR */}
      <div className="bg-brand-200 p-6 md:p-8 rounded-[2rem] shadow-sm border border-brand-900/10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <h2 className="text-sm font-black text-brand-500 uppercase tracking-widest flex items-center gap-2">
            <Disc3 size={20} /> 2D Kesim Optimizasyonu
          </h2>
          
          <div className="flex items-center gap-3 bg-brand-100 py-2 px-4 rounded-xl shadow-inner border border-brand-900/5">
             <Settings2 size={16} className="text-brand-900/40" />
             <span className="text-[10px] font-bold text-brand-900/60 uppercase tracking-widest">Bıçak Payı (Kerf):</span>
             <input 
                type="number" 
                value={kerf}
                onChange={(e) => setKerf(Number(e.target.value))}
                className="w-16 bg-transparent outline-none text-brand-900 font-black text-center"
             />
             <span className="text-[10px] font-bold text-brand-900/40">cm</span>
          </div>
        </div>

        {/* PARÇALAR TABLOSU */}
        <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden mb-6">
          <div className="bg-gray-200 px-4 py-3 border-b border-gray-300 flex items-center justify-between text-gray-700 font-bold">
            <div className="flex items-center gap-2">
              <LayoutPanelLeft size={18} />
              <span>Parçalar</span>
            </div>
            <ChevronDown size={18} />
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-sm border-b border-gray-300">
                <th className="font-bold py-2 px-3 border-r border-gray-300 w-1/4">Uzunluk</th>
                <th className="font-bold py-2 px-3 border-r border-gray-300 w-1/4">Genişlik</th>
                <th className="font-bold py-2 px-3 border-r border-gray-300 w-1/4">Adet</th>
                <th className="font-bold py-2 px-3 text-center w-1/4">Döndür</th>
              </tr>
            </thead>
            <tbody>
              {parts.map((p, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="border-r border-gray-300 p-0 hover:bg-blue-50 transition-colors">
                    <input 
                      type="number"
                      value={p.h || ''}
                      onChange={(e) => updatePart(idx, 'h', Number(e.target.value))}
                      className="w-full bg-transparent px-3 py-2 outline-none text-gray-800 font-medium"
                    />
                  </td>
                  <td className="border-r border-gray-300 p-0 hover:bg-blue-50 transition-colors">
                    <input 
                      type="number"
                      value={p.w || ''}
                      onChange={(e) => updatePart(idx, 'w', Number(e.target.value))}
                      className="w-full bg-transparent px-3 py-2 outline-none text-gray-800 font-medium"
                    />
                  </td>
                  <td className="border-r border-gray-300 p-0 hover:bg-blue-50 transition-colors">
                    <input 
                      type="number"
                      value={p.count || ''}
                      onChange={(e) => updatePart(idx, 'count', Number(e.target.value))}
                      className="w-full bg-transparent px-3 py-2 outline-none text-gray-800 font-medium"
                    />
                  </td>
                  <td className="p-0 text-center align-middle hover:bg-blue-50 transition-colors">
                    <button 
                      onClick={() => updatePart(idx, 'rotatable', !p.rotatable)}
                      className={`w-full h-full flex items-center justify-center p-2 transition-colors ${p.rotatable ? 'text-blue-600' : 'text-gray-400'}`}
                    >
                      <RotateCw size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MALZEME LEVHALARI TABLOSU */}
        <div className="bg-white rounded border border-gray-300 shadow-sm overflow-hidden mb-8">
          <div className="bg-gray-200 px-4 py-3 border-b border-gray-300 flex items-center justify-between text-gray-700 font-bold">
            <div className="flex items-center gap-2">
              <Layers size={18} />
              <span>Malzeme Levhaları</span>
            </div>
            <ChevronDown size={18} />
          </div>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-800 text-sm border-b border-gray-300">
                <th className="font-bold py-2 px-3 border-r border-gray-300 w-1/4">Uzunluk</th>
                <th className="font-bold py-2 px-3 border-r border-gray-300 w-1/4">Genişlik</th>
                <th className="font-bold py-2 px-3 border-r border-gray-300 w-1/4">Adet</th>
                <th className="font-bold py-2 px-3 text-center w-1/4">≡</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s, idx) => (
                <tr key={idx} className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                  <td className="border-r border-gray-300 p-0 hover:bg-blue-50 transition-colors">
                    <input 
                      type="number"
                      value={s.h || ''}
                      onChange={(e) => updateStock(idx, 'h', Number(e.target.value))}
                      className="w-full bg-transparent px-3 py-2 outline-none text-gray-800 font-medium"
                    />
                  </td>
                  <td className="border-r border-gray-300 p-0 hover:bg-blue-50 transition-colors">
                    <input 
                      type="number"
                      value={s.w || ''}
                      onChange={(e) => updateStock(idx, 'w', Number(e.target.value))}
                      className="w-full bg-transparent px-3 py-2 outline-none text-gray-800 font-medium"
                    />
                  </td>
                  <td className="border-r border-gray-300 p-0 hover:bg-blue-50 transition-colors">
                    <input 
                      type="number"
                      value={s.count || ''}
                      onChange={(e) => updateStock(idx, 'count', Number(e.target.value))}
                      className="w-full bg-transparent px-3 py-2 outline-none text-gray-800 font-medium"
                    />
                  </td>
                  <td className="p-0 text-center align-middle hover:bg-blue-50 transition-colors text-gray-400">
                    <span className="block p-2 cursor-pointer hover:text-gray-600">≡</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button 
           onClick={startOptimization}
           disabled={parts.every(p => !p.h || !p.w || !p.count) || isOptimizing}
           className="w-full bg-brand-500 hover:bg-brand-500/90 text-brand-900 py-4 rounded-xl font-black text-lg tracking-widest flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
        >
           {isOptimizing ? <Disc3 className="animate-spin" size={24} /> : <Scissors size={24} />}
           HESAPLA VE YERLEŞTİR
        </button>
      </div>
      
      {/* SONUÇLAR (SVG & İSTATİSTİKLER) */}
      {result && (
        <div className="animate-slideUp space-y-6">
          {/* Hata Mesajları (Sığmayan Parçalar) */}
          {result.unplaced.length > 0 && (
            <div className="bg-red-50 border border-red-500/20 p-6 rounded-3xl shadow-sm">
               <div className="font-bold text-red-600 mb-2 flex items-center gap-2">
                 <span>⚠️</span> BAZI PARÇALAR SIĞMADI! (Girdiğiniz Plaka Stoğu Yetersiz Olabilir)
               </div>
               <ul className="list-disc pl-5 text-sm text-red-500/80">
                 {result.unplaced.map((u, i) => (
                    <li key={i}>{u.part.name || 'İsimsiz'} ({u.part.w}x{u.part.h}) - {u.part.count} Adet</li>
                 ))}
               </ul>
            </div>
          )}

          {/* SVG Çizimleri */}
          <div className="space-y-8">
            {result.bins.map((bin, bIdx) => (
              <div key={bIdx} className="bg-white p-6 rounded-[2rem] shadow-md border border-brand-900/10">
                <div className="flex justify-between items-end mb-4 print:mb-2">
                  <h3 className="font-black text-brand-900 text-lg">PLAKA {bIdx + 1}</h3>
                  <div className="text-xs font-bold text-brand-900/50">Doluluk: %{bin.utilization.toFixed(1)}</div>
                </div>

                <div 
                  className="relative w-full overflow-hidden bg-brand-100 rounded-lg shadow-inner ring-1 ring-brand-900/10 cursor-pointer hover:ring-brand-500 hover:ring-2 transition-all" 
                  style={{ aspectRatio: `${bin.w} / ${bin.h}` }}
                  onClick={() => setSelectedBin({ ...bin, index: bIdx + 1 } as any)}
                >
                   <svg 
                     viewBox={`0 0 ${bin.w} ${bin.h}`} 
                     className="absolute inset-0 w-full h-full pointer-events-none"
                     preserveAspectRatio="xMidYMid meet"
                     xmlns="http://www.w3.org/2000/svg"
                   >
                      <rect width={bin.w} height={bin.h} fill="#FFF8E8" />
                      
                      {bin.placed.map((p, pIdx) => {
                        const isSmall = p.w < 20 || p.h < 20;
                        return (
                          <g key={pIdx}>
                            <rect 
                              x={p.x} 
                              y={p.y} 
                              width={p.w} 
                              height={p.h} 
                              fill="#AAB396" // brand-500
                              stroke="#674636" // brand-900
                              strokeWidth={0.5}
                              className="opacity-90"
                            />
                            <text 
                              x={p.x + p.w / 2} 
                              y={p.y + p.h / 2 - (isSmall ? 0 : 3)} 
                              textAnchor="middle" 
                              dominantBaseline="middle"
                              fill="#674636"
                              fontSize={Math.min(p.w, p.h) / (isSmall ? 3 : 5)}
                              fontWeight="bold"
                            >
                              {p.w}x{p.h}
                            </text>
                            {!isSmall && p.rotated && (
                              <svg 
                                x={p.x + p.w / 2 - 4} 
                                y={p.y + p.h / 2 + 2} 
                                width="8" height="8" 
                                viewBox="0 0 24 24" fill="none" stroke="#674636" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                              >
                                 <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                 <path d="M21 3v5h-5" />
                              </svg>
                            )}
                          </g>
                        );
                      })}
                   </svg>
                   <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-brand-900/10 backdrop-blur-[1px] transition-opacity">
                      <div className="bg-white/90 text-brand-900 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
                        <ZoomIn size={16} /> BÜYÜT
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-brand-200 border border-brand-900/10 p-4 rounded-3xl shadow-sm text-center">
               <div className="text-[10px] font-bold text-brand-900/50 uppercase tracking-widest mb-1">KULLANILAN PLAKA</div>
               <div className="text-3xl font-black text-brand-900">{result.stats.totalBins}</div>
            </div>
            <div className="bg-brand-200 border border-brand-900/10 p-4 rounded-3xl shadow-sm text-center">
               <div className="text-[10px] font-bold text-brand-900/50 uppercase tracking-widest mb-1">FİRE ORANI</div>
               <div className="text-3xl font-black text-red-500/80">%{result.stats.wastePercent.toFixed(1)}</div>
            </div>
            <div className="bg-brand-200 border border-brand-900/10 p-4 rounded-3xl shadow-sm text-center">
               <div className="text-[10px] font-bold text-brand-900/50 uppercase tracking-widest mb-1">TOPLAM ALAN</div>
               <div className="text-3xl font-black text-brand-900">{(result.stats.totalArea / 10000).toFixed(2)}<span className="text-lg">m²</span></div>
            </div>
            <div className="bg-brand-200 border border-brand-900/10 p-4 rounded-3xl shadow-sm text-center">
               <div className="text-[10px] font-bold text-brand-900/50 uppercase tracking-widest mb-1">NET KULLANIM</div>
               <div className="text-3xl font-black text-brand-500">{(result.stats.usedArea / 10000).toFixed(2)}<span className="text-lg">m²</span></div>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM MODAL */}
      {selectedBin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full h-[90vh] md:h-[95vh] max-w-6xl rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
            <div className="flex justify-between items-center p-4 border-b border-brand-900/10 bg-brand-100/50">
              <h3 className="font-black text-brand-900 text-lg flex items-center gap-2">
                PLAKA {(selectedBin as any).index || ''}
                <span className="text-xs font-bold text-brand-900/50 ml-2">({selectedBin.w}x{selectedBin.h}cm)</span>
              </h3>
              <button 
                onClick={() => setSelectedBin(null)}
                className="p-2 rounded-full hover:bg-brand-900/10 text-brand-900 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 w-full bg-brand-200 relative overflow-hidden">
              <TransformWrapper
                initialScale={1}
                minScale={0.1}
                maxScale={10}
                centerOnInit
                wheel={{ step: 0.1 }}
              >
                {({ zoomIn, zoomOut, resetTransform, centerView }) => (
                  <>
                    <div className="absolute bottom-6 right-6 z-10 flex flex-col gap-2 bg-white/90 p-2 rounded-2xl shadow-lg border border-brand-900/5">
                       <button onClick={() => zoomIn()} className="p-3 bg-brand-100 text-brand-900 rounded-xl hover:bg-brand-500 transition-colors" title="Büyüt">
                         <ZoomIn size={20} />
                       </button>
                       <button onClick={() => zoomOut()} className="p-3 bg-brand-100 text-brand-900 rounded-xl hover:bg-brand-500 transition-colors" title="Küçült">
                         <ZoomOut size={20} />
                       </button>
                       <button onClick={() => centerView()} className="p-3 bg-brand-100 text-brand-900 rounded-xl hover:bg-brand-500 transition-colors" title="Ortala">
                         <Maximize size={20} />
                       </button>
                    </div>
                    
                    <TransformComponent
                      wrapperClass="w-full h-full cursor-grab active:cursor-grabbing"
                      contentClass="w-full h-full flex items-center justify-center"
                    >
                      <div 
                        className="bg-brand-100 shadow-2xl ring-1 ring-brand-900/20" 
                        style={{ 
                          width: `${selectedBin.w * 3}px`, 
                          height: `${selectedBin.h * 3}px`,
                          maxWidth: '80vw',
                          maxHeight: '80vh',
                          aspectRatio: `${selectedBin.w} / ${selectedBin.h}` 
                        }}
                      >
                       <svg 
                         viewBox={`0 0 ${selectedBin.w} ${selectedBin.h}`} 
                         className="w-full h-full"
                         preserveAspectRatio="xMidYMid meet"
                         xmlns="http://www.w3.org/2000/svg"
                       >
                          <rect width={selectedBin.w} height={selectedBin.h} fill="#FFF8E8" />
                          
                          {selectedBin.placed.map((p, pIdx) => {
                            const isSmall = p.w < 20 || p.h < 20;
                            return (
                              <g key={pIdx}>
                                <rect 
                                  x={p.x} 
                                  y={p.y} 
                                  width={p.w} 
                                  height={p.h} 
                                  fill="#AAB396" // brand-500
                                  stroke="#674636" // brand-900
                                  strokeWidth={0.5}
                                  className="opacity-90"
                                />
                                <text 
                                  x={p.x + p.w / 2} 
                                  y={p.y + p.h / 2 - (isSmall ? 0 : 3)} 
                                  textAnchor="middle" 
                                  dominantBaseline="middle"
                                  fill="#674636"
                                  fontSize={Math.min(p.w, p.h) / (isSmall ? 3 : 5)}
                                  fontWeight="bold"
                                  pointerEvents="none"
                                >
                                  {p.w}x{p.h}
                                </text>
                                {!isSmall && p.rotated && (
                                  <svg 
                                    x={p.x + p.w / 2 - 4} 
                                    y={p.y + p.h / 2 + 2} 
                                    width="8" height="8" 
                                    viewBox="0 0 24 24" fill="none" stroke="#674636" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
                                  >
                                     <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                                     <path d="M21 3v5h-5" />
                                  </svg>
                                )}
                              </g>
                            );
                          })}
                       </svg>
                      </div>
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CuttingModule;
