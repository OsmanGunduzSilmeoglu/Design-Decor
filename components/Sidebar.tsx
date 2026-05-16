
import React from 'react';
import { AppModules } from '../types';
import { Ruler, ClipboardList, Disc3 } from 'lucide-react';

interface SidebarProps {
  activeModule: AppModules;
  setActiveModule: (module: AppModules) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule }) => {
  const navItems = [
    { id: AppModules.CUTTING_LIST, label: 'Liste', icon: <ClipboardList size={24} /> },
    { id: AppModules.SHELF_CALC, label: 'Raf', icon: <Ruler size={24} /> },
    { id: AppModules.CUTTING, label: 'Kesim', icon: <Disc3 size={24} /> },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex w-24 lg:w-48 bg-brand-200 border-r border-brand-900/10 h-screen flex-col z-30 shadow-sm transition-all md:pt-[max(1rem,env(safe-area-inset-top))]">
        <nav className="p-4 flex flex-col gap-3 mt-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`group flex flex-col xl:flex-row items-center gap-2 xl:gap-3 px-2 py-4 xl:px-4 xl:py-4 rounded-2xl transition-all duration-300 ${
                activeModule === item.id 
                  ? 'bg-brand-900 text-brand-100 shadow-md shadow-brand-900/20' 
                  : 'text-brand-900/60 hover:bg-brand-100 hover:text-brand-900'
              }`}
            >
              <span className="">{item.icon}</span>
              <span className={`font-bold text-sm tracking-wide hidden lg:block`}>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION - COMPACT */}
      <nav className="bottom-nav md:hidden fixed bottom-0 left-0 right-0 bg-brand-200/95 backdrop-blur-xl border-t border-brand-900/10 z-50 pb-[max(5px,env(safe-area-inset-bottom))]">
        <div className="flex justify-around items-center px-4 py-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-6 rounded-2xl transition-all active:scale-95 ${
                 activeModule === item.id 
                 ? 'bg-brand-900 text-brand-100 shadow-md shadow-brand-900/20' 
                 : 'text-brand-900/60 hover:text-brand-900 hover:bg-brand-100'
              }`}
            >
              <div className="mb-1">
                {item.icon}
              </div>
              <span className={`text-[10px] font-bold tracking-wide`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
};

export default Sidebar;
