"use client";
import React, { useState, useEffect } from 'react';
import { Phone, Droplets, Flame, Bath, Utensils, Send, MapPin, Check, Plus } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', tel: '', mail: '', adresse: '', 
    prestations: [] as string[], rgpd: false, gps: ''
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  const prestationsList = [
    { id: 'Eau Chaude', icon: <Droplets size={20} />, desc: 'Systèmes de chauffe' },
    { id: 'Chauffage', icon: <Flame size={20} />, desc: 'Solutions thermiques' },
    { id: 'Salle de bains', icon: <Bath size={20} />, desc: 'Sanitaires & Douches' },
    { id: 'Cuisine', icon: <Utensils size={20} />, desc: 'Réseaux & Éviers' },
  ];

  const togglePrestation = (id: string) => {
    setFormData(prev => ({
      ...prev,
      prestations: prev.prestations.includes(id) 
        ? prev.prestations.filter(p => p !== id) 
        : [...prev.prestations, id]
    }));
  };

  const getGPS = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({...prev, gps: `${pos.coords.latitude}, ${pos.coords.longitude}`}));
        alert("📍 Position GPS synchronisée.");
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.rgpd) return alert("Veuillez valider le traitement des données.");
    
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if(res.ok) {
      alert("✅ Demande reçue. Nous vous recontactons rapidement.");
      setFormData({ nom: '', prenom: '', tel: '', mail: '', adresse: '', prestations: [], rgpd: false, gps: '' });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFC] pb-20 font-sans text-slate-800 antialiased">
      
      {/* Header Raffiné & Compact */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100/60 px-4 md:px-8 py-3">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          
          <div className="flex items-center gap-3">
            {/* LOGO CADRÉ : Max 44px pour éviter l'effet "énorme" */}
            <div className="relative w-11 h-11 flex-shrink-0 bg-[#F5F5F3] rounded-xl overflow-hidden border border-slate-100 shadow-sm flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-full h-full object-contain p-1" // object-contain pour garder les proportions sans déformer
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.parentElement?.querySelector('.placeholder-icon')?.classList.remove('hidden');
                }} 
              />
              <Droplets className="placeholder-icon hidden text-blue-600" size={20} strokeWidth={2} />
            </div>
            
            <div className="hidden xs:block">
              <h1 className="font-extrabold text-base md:text-lg leading-none tracking-tight text-slate-900 uppercase">
                French<span className="text-blue-600">.</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Plomberie</p>
            </div>
          </div>

          <a href="tel:0658908674" className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-full flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-blue-100 text-[12px]">
            <Phone size={16} strokeWidth={2.5} />
            <span className="tracking-wide">URGENCE 24/7</span>
          </a>
        </div>
      </header>

      {/* Contenu Centré et Étroit pour un look pro */}
      <div className="max-w-md mx-auto px-6 mt-12 md:mt-20 space-y-12">
        
        {/* Titre Minimaliste */}
        <section className="text-center space-y-3">
          <div className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
            Service Premium
          </div>
          <h2 className="text-3xl font-extrabold text-slate-950 tracking-tight leading-tight">Artisan Plombier<br/>de confiance.</h2>
          <p className="text-slate-500 text-[13px] leading-relaxed">Intervention rapide à domicile, qualité garantie.</p>
        </section>

        {/* Services Grid (2 colonnes) */}
        <section className="space-y-5">
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] ml-1">Prestations</h3>
          <div className="grid grid-cols-2 gap-4">
            {prestationsList.map((p) => {
              const active = formData.prestations.includes(p.id);
              return (
                <button 
                  key={p.id} 
                  type="button"
                  onClick={() => togglePrestation(p.id)}
                  className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col items-start text-left gap-3 relative overflow-hidden ${
                    active ? 'border-blue-600 bg-blue-50/30 ring-1 ring-blue-100' : 'bg-white border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className={`p-2 rounded-lg ${active ? 'bg-blue-600 text-white' : 'bg-slate-50 text-slate-400'}`}>
                    {p.icon}
                  </div>
                  <div>
                    <p className="font-bold text-[13px] text-slate-900 tracking-tight">{p.id}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">{p.desc}</p>
                  </div>
                  {active && <Check size={14} strokeWidth={4} className="absolute top-3 right-3 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Formulaire Épuré */}
        <section className="bg-white p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100">
          <h3 className="text-xl font-extrabold mb-8 text-slate-900 tracking-tight">Prendre rendez-vous</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Prénom</label>
                <input required placeholder="Jean" className="w-full p-3.5 bg-slate-50 rounded-xl border border-transparent focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all outline-none text-[13px]" 
                  value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom</label>
                <input required placeholder="Dupont" className="w-full p-3.5 bg-slate-50 rounded-xl border border-transparent focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all outline-none text-[13px]" 
                  value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Téléphone</label>
              <input required type="tel" placeholder="06 00 00 00 00" className="w-full p-3.5 bg-slate-50 rounded-xl border border-transparent focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all outline-none text-[13px]" 
                value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Adresse</label>
              <div className="relative group">
                <input required placeholder="Votre adresse" className="w-full p-3.5 bg-slate-50 rounded-xl border border-transparent focus:ring-1 focus:ring-blue-400 focus:bg-white transition-all outline-none pr-12 text-[13px]" 
                  value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
                <button type="button" onClick={getGPS} className="absolute right-2 top-2 p-1.5 text-slate-400 hover:text-blue-600 transition-colors">
                  <MapPin size={18}/>
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl bg-slate-50/50 cursor-pointer group hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
              <input type="checkbox" required checked={formData.rgpd} onChange={e => setFormData({...formData, rgpd: e.target.checked})} 
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-400 transition-all" />
              <span className="text-[10px] leading-relaxed text-slate-500">
                J'accepte le traitement de mes données pour la prise de contact (RGPD).
              </span>
            </label>

            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-4.5 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-[12px] tracking-[0.1em] uppercase mt-4">
              <Send size={14} /> Envoyer la demande
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-slate-100">
          <p className="text-slate-400 text-[9px] font-bold tracking-[0.3em] uppercase">French Plomberie • 2024</p>
        </footer>
      </div>
    </main>
  );
}
