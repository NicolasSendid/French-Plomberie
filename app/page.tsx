"use client";
import React, { useState, useEffect } from 'react';
import { Phone, Droplets, Flame, Bath, Utensils, Send, MapPin, Check } from 'lucide-react';

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

  const prestationsList = [
    { id: 'Eau Chaude', icon: <Droplets size={20} /> },
    { id: 'Chauffage', icon: <Flame size={20} /> },
    { id: 'Sanitaires', icon: <Bath size={20} /> },
    { id: 'Cuisine', icon: <Utensils size={20} /> },
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
        alert("📍 Localisation enregistrée.");
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.rgpd) return alert("Validation requise.");
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    if(res.ok) {
      alert("✅ Message envoyé.");
      setFormData({ nom: '', prenom: '', tel: '', mail: '', adresse: '', prestations: [], rgpd: false, gps: '' });
    }
  };

  return (
    <main className="min-h-screen bg-[#FBFBFA] pb-24 font-sans text-slate-900 antialiased">
      
      {/* HEADER : Plus haut et Logo plus grand */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-100 px-6 h-20 flex items-center shadow-sm">
        <div className="max-w-5xl mx-auto w-full flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            {/* TAILLE LOGO : 48px - L'équilibre parfait */}
            <div style={{ width: '48px', height: '48px' }} className="flex-shrink-0 overflow-hidden rounded-xl bg-white flex items-center justify-center border border-slate-100 shadow-sm relative">
              <img 
                src="/logo.png" 
                alt="French Plomberie" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', padding: '4px' }}
                onError={(e) => (e.currentTarget.style.display = 'none')} 
              />
              <Droplets className="text-blue-500 opacity-10 absolute" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-base tracking-tighter uppercase leading-none">French<span className="text-blue-600">.</span></span>
              <span className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-1">Plomberie</span>
            </div>
          </div>

          <a href="tel:0658908674" className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-2 font-bold transition-all active:scale-95 text-[12px] shadow-lg shadow-red-100">
            <Phone size={16} strokeWidth={3} />
            <span className="hidden sm:inline tracking-wide">URGENCE 24/7</span>
            <span className="sm:hidden tracking-wide">APPELER</span>
          </a>
        </div>
      </header>

      {/* CONTENU : Marges augmentées (mt-20 et space-y-20) */}
      <div className="max-w-lg mx-auto px-6 mt-16 space-y-20">
        
        {/* HERO SECTION */}
        <section className="text-center space-y-4">
          <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-950 leading-tight">Artisan Plombier<br/>de confiance.</h2>
          <p className="text-slate-500 text-sm font-medium max-w-xs mx-auto">Interventions urgentes et installations durables sur toute la région.</p>
        </section>

        {/* PRESTATIONS : Plus d'espace et cartes plus confortables */}
        <section className="space-y-8">
          <div className="flex flex-col items-center gap-2">
            <h3 className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.3em]">Services Pro</h3>
            <div className="w-12 h-1 bg-blue-600 rounded-full opacity-20"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-5">
            {prestationsList.map((p) => {
              const active = formData.prestations.includes(p.id);
              return (
                <button 
                  key={p.id} 
                  type="button"
                  onClick={() => togglePrestation(p.id)}
                  className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col items-center text-center gap-4 relative ${
                    active ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-100' : 'bg-white border-slate-100 hover:border-blue-200 shadow-sm'
                  }`}
                >
                  <div className={`p-3 rounded-2xl ${active ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-50 text-slate-400'}`}>
                    {p.icon}
                  </div>
                  <span className="font-bold text-[13px] tracking-tight">{p.id}</span>
                  {active && <Check size={16} strokeWidth={4} className="absolute top-4 right-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* FORMULAIRE : Isolé avec plus d'espace autour */}
        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/40 border border-slate-100 space-y-8">
          <div className="space-y-2">
             <h3 className="text-2xl font-black text-slate-900 tracking-tight">Intervention sous 1h.</h3>
             <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Remplissez vos coordonnées</p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <input required placeholder="Prénom" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 transition-all outline-none text-[14px] font-medium" 
                value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
              <input required placeholder="Nom" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 transition-all outline-none text-[14px] font-medium" 
                value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
            </div>

            <input required type="tel" placeholder="Téléphone mobile" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 transition-all outline-none text-[14px] font-medium" 
              value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} />

            <div className="relative group">
              <input required placeholder="Adresse précise" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-100 transition-all outline-none pr-14 text-[14px] font-medium" 
                value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
              <button type="button" onClick={getGPS} className="absolute right-2 top-2 p-2.5 bg-white shadow-sm rounded-xl text-slate-400 hover:text-blue-600 transition-colors">
                <MapPin size={20} strokeWidth={2}/>
              </button>
            </div>

            <label className="flex items-start gap-3 cursor-pointer pt-4 group">
              <input type="checkbox" required checked={formData.rgpd} onChange={e => setFormData({...formData, rgpd: e.target.checked})} 
                className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-400" />
              <span className="text-[11px] leading-relaxed text-slate-500 font-medium group-hover:text-slate-800 transition-colors">
                J'autorise French Plomberie à traiter mes données pour cette intervention.
              </span>
            </label>

            <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-extrabold py-5 rounded-2xl shadow-xl shadow-slate-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-[13px] tracking-[0.2em] uppercase mt-4">
              <Send size={16} strokeWidth={2.5} /> Envoyer la demande
            </button>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="text-center pt-4">
          <p className="text-slate-300 text-[10px] font-bold tracking-[0.5em] uppercase">Artisan Qualifié • 2024</p>
        </footer>
      </div>
    </main>
  );
}
