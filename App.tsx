
import React, { useState } from 'react';
import { AppModules } from './types';
import ShelfCalculator from './components/ShelfCalculator';
import Sidebar from './components/Sidebar';
import CuttingList from './components/CuttingList';
import CuttingModule from './components/CuttingModule';
import SettingsModule from './components/SettingsModule';
import { Settings } from 'lucide-react';

const App: React.FC = () => {
  const [activeModule, setActiveModule] = useState<AppModules>(AppModules.CUTTING_LIST);

  const renderModule = () => {
    switch (activeModule) {
      case AppModules.CUTTING_LIST:
        return <CuttingList navigate={setActiveModule} />;
      case AppModules.SHELF_CALC:
        return <ShelfCalculator />;
      case AppModules.CUTTING:
        return <CuttingModule />;
      case AppModules.SETTINGS:
        return <SettingsModule />;
      default:
        return <CuttingList navigate={setActiveModule} />;
    }
  };

  return (
    <div className="min-h-screen bg-brand-100 text-brand-900 flex flex-col md:flex-row antialiased select-none overflow-hidden">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} />
      
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="absolute top-4 left-4 md:top-6 md:left-6 z-20 print:hidden">
          <button 
            onClick={() => setActiveModule(AppModules.SETTINGS)}
            className={`p-2.5 rounded-xl shadow-sm transition-all active:scale-95 border ${
              activeModule === AppModules.SETTINGS 
              ? 'bg-brand-500 text-white border-brand-500' 
              : 'bg-brand-200 text-brand-900 border-brand-900/10 hover:bg-brand-500 hover:text-white'
            }`}
             title="Ayarlar"
          >
            <Settings size={20} strokeWidth={2.5} />
          </button>
        </div>

        <main className="flex-1 overflow-y-auto overflow-x-hidden touch-pan-y p-4 pt-16 pb-20 md:p-8 md:pb-8 scroll-smooth no-scrollbar">
          <div className="max-w-4xl mx-auto w-full">
            {renderModule()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;
