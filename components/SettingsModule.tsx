import React from 'react';
import { Mail, HelpCircle, Info, Settings, Trash2, Smartphone } from 'lucide-react';

const SettingsModule: React.FC = () => {
  return (
    <div className="flex flex-col gap-6 animate-fadeIn pb-20">
      <div className="bg-brand-200 p-6 md:p-8 rounded-[2rem] shadow-sm border border-brand-900/10">
        <div className="flex items-center gap-3 mb-8">
          <Settings size={24} className="text-brand-500" />
          <h2 className="text-xl font-black text-brand-900 tracking-widest uppercase">
            Ayarlar & Destek
          </h2>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-3xl border border-brand-900/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-bl-full pointer-events-none"></div>
            
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-900/60 mb-4 flex items-center gap-2">
              <HelpCircle size={16} /> Yardım ve İletişim
            </h3>
            
            <p className="text-sm text-brand-900/70 mb-6 max-w-lg">
              Uygulama ile ilgili yaşadığınız sorunlar, görüşleriniz veya yeni özellik önerileriniz için aşağıdaki e-posta adresinden bize ulaşabilirsiniz.
            </p>

            <div className="flex items-center gap-4 bg-brand-100 p-4 rounded-xl border border-brand-900/5">
              <div className="bg-brand-500 w-10 h-10 rounded-full flex items-center justify-center text-white shrink-0 shadow-sm">
                <Mail size={20} />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-brand-900/50 uppercase tracking-widest">E-Posta Adresi</span>
                <a href="mailto:osmangunduzsilmeoglu@gmail.com" className="font-black text-brand-900 hover:text-brand-500 transition-colors break-all">
                  osmangunduzsilmeoglu@gmail.com
                </a>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-3xl border border-brand-900/10 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-widest text-brand-900/60 mb-4 flex items-center gap-2">
              <Info size={16} /> Uygulama Hakkında
            </h3>
            <div className="flex flex-col gap-2 text-sm text-brand-900/70 font-medium">
              <div className="flex justify-between items-center py-2 border-b border-brand-900/5">
                <span>Versiyon</span>
                <span className="font-bold text-brand-900">v1.0.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-brand-900/5">
                <span>Geliştirici</span>
                <span className="font-bold text-brand-900">Osman Gündüz Silmeoğlu</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span>Lisans</span>
                <span className="font-bold text-brand-900">Tüm hakları saklıdır.</span>
              </div>
            </div>
          </section>

          <section className="bg-red-50 p-6 rounded-3xl border border-red-500/10 shadow-sm">
             <h3 className="text-sm font-bold uppercase tracking-widest text-red-600/80 mb-4 flex items-center gap-2">
              <Trash2 size={16} /> Veri Yönetimi
            </h3>
            <p className="text-sm text-red-900/60 mb-4">
              Uygulamanın yerel kayıtlarını (kaydedilmiş projeleri ve dolap listesini) tamamen silmek için aşağıdaki butonu kullanabilirsiniz.
            </p>
            <button 
              onClick={() => {
                if (window.confirm('Tüm projeleriniz ve oluşturduğunuz dolaplar kalıcı olarak silinecektir. Onaylıyor musunuz?')) {
                  localStorage.clear();
                  window.location.reload();
                }
              }}
              className="bg-white text-red-600 font-bold px-6 py-3 rounded-xl border border-red-200 hover:bg-red-600 hover:text-white transition-colors text-sm shadow-sm"
            >
              Tüm Verileri Temizle
            </button>
          </section>

        </div>
      </div>
    </div>
  );
};

export default SettingsModule;
