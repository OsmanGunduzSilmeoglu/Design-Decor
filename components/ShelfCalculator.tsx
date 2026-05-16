
import React, { useState, useEffect } from 'react';
import { CalculationResult } from '../types';
import Visualizer from './Visualizer';
import { Ruler, ChevronDown } from 'lucide-react';

const ShelfCalculator: React.FC = () => {
  const [height, setHeight] = useState<string>('');
  const [shelves, setShelves] = useState<string>('');
  const [thickness, setThickness] = useState<number>(1.8);
  const [result, setResult] = useState<CalculationResult | null>(null);

  useEffect(() => {
    const h = parseFloat(height);
    const s = parseInt(shelves);

    if (!isNaN(h) && !isNaN(s) && s >= 0 && h > (s * thickness)) {
      const totalThickness = s * thickness;
      const availableSpace = h - totalThickness;
      const gap = availableSpace / (s + 1);

      const positions: number[] = [];
      let currentPos = 0;
      for (let i = 0; i < s; i++) {
        currentPos += gap;
        positions.push(Number(currentPos.toFixed(2)));
        currentPos += thickness;
      }

      setResult({
        gap: Number(gap.toFixed(2)),
        positions,
        totalHeight: h,
        shelfCount: s,
        thickness: thickness
      });
    } else {
      setResult(null);
    }
  }, [height, shelves, thickness]);

  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-20">
      
      <div className="bg-brand-200 p-8 rounded-[2rem] shadow-sm border border-brand-900/10">
        <h2 className="text-sm font-black text-brand-500 uppercase tracking-widest mb-8 flex items-center gap-2">
           <Ruler size={18} /> Eşit Raf Hesapla
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-brand-100 p-4 rounded-3xl border border-brand-900/5 shadow-inner">
            <label className="block text-[10px] text-center font-bold text-brand-900/60 uppercase tracking-wider mb-2">
              İç Yükseklik (cm)
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="0"
                className="w-full bg-transparent text-center text-4xl font-black text-brand-900 py-2 outline-none placeholder:text-brand-900/20"
              />
            </div>
          </div>
          <div className="bg-brand-100 p-4 rounded-3xl border border-brand-900/5 shadow-inner">
            <label className="block text-[10px] text-center font-bold text-brand-900/60 uppercase tracking-wider mb-2">
              Raf Adedi
            </label>
            <input
              type="number"
              inputMode="numeric"
              value={shelves}
              onChange={(e) => setShelves(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent text-center text-4xl font-black text-brand-900 py-2 outline-none placeholder:text-brand-900/20"
            />
          </div>
        </div>
        
        {/* Helper Note for Thickness dropdown */}
        <div className="mt-6 flex justify-center">
          <div className="relative inline-flex items-center">
            <span className="text-xs text-brand-900/60 mr-2 font-bold uppercase tracking-wider">Malzeme:</span>
            <div className="relative">
              <select
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className="appearance-none bg-brand-100 text-brand-900 font-bold text-sm px-4 py-2 pr-8 rounded-full shadow-sm border border-brand-900/5 outline-none focus:border-brand-500 transition-colors cursor-pointer"
              >
                <option value={1.8}>1.8 cm</option>
                <option value={3.6}>3.6 cm</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-brand-900/50">
                <ChevronDown size={14} strokeWidth={3} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {result && (
        <div className="bg-brand-900 p-8 rounded-[2rem] shadow-xl relative overflow-hidden animate-slideUp text-brand-100">
          <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-bl-[100px] -z-0"></div>
          <h3 className="font-black text-xl mb-6 flex items-center gap-2 relative z-10 opacity-90 tracking-wide">
             PİM LİSTESİ
          </h3>
          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center bg-black/20 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
              <span className="text-sm font-bold opacity-80 uppercase tracking-wide">Raf Aralığı (Net)</span>
              <span className="text-4xl font-black text-brand-500">{result.gap} <span className="text-sm opacity-60 text-brand-100">cm</span></span>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-4">
              {result.positions.map((pos, idx) => (
                <div key={idx} className="flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors p-4 px-5 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-brand-500 text-brand-900 rounded-full text-xs font-bold shadow-sm">
                      {idx + 1}
                    </span>
                    <span className="text-sm font-bold opacity-70 uppercase tracking-wide">Pim Merkezi</span>
                  </div>
                  <span className="font-mono text-2xl font-black tracking-tight">{pos}</span>
                </div>
              ))}
            </div>
            <p className="text-[11px] opacity-60 mt-6 text-center uppercase tracking-widest font-bold">
              Ölçüler alt tabandan yukarıya doğrudur.
            </p>
          </div>
        </div>
      )}

      <div className="bg-brand-200 p-6 rounded-[2rem] shadow-sm border border-brand-900/10 flex flex-col items-center min-h-[400px]">
        <h2 className="w-full text-xs font-black text-brand-900/50 uppercase tracking-widest mb-6 text-center">
           Görsel Şema
        </h2>
        <div className="flex-1 w-full flex items-center justify-center bg-brand-100 rounded-3xl border border-brand-900/5 shadow-inner p-6">
          {result ? (
            <Visualizer data={result} />
          ) : (
            <div className="text-center px-8 opacity-40">
              <Ruler size={48} className="mx-auto mb-4 text-brand-900/50" />
              <p className="text-sm font-bold text-brand-900">Veri girildiğinde şema oluşur.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShelfCalculator;
