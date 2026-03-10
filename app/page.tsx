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
    { id: 'Eau Chaude', icon: <Droplets size={18} /> },
    { id: 'Chauffage', icon: <Flame size={18} /> },
    { id: 'Sanitaires', icon: <Bath size={18} /> },
    { id: 'Cuisine', icon: <Utensils size={18} /> },
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
    <main className="min-h-screen bg-[#FBFBFA] pb-20 font-sans text-slate-900 antialiased">
      
      {/* Header avec Logo Ultra-Contrôlé */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 h-16 flex items-center">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            {/* Conteneur de taille fixe absolue */}
            <div style={{ width: '32px', height: '32px' }} className="flex-shrink-0 overflow-hidden rounded-md bg-slate-50 flex items-center justify-center border border-slate-100 relative">
              <img 
                src="/logo.png" 
                alt="" 
                style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
                onError={(e) => (e.currentTarget.style.display = 'none')} 
              />
              <Droplets className="text-blue-500 opacity-20 absolute" size={14} />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase">French<span className="text-blue-600">.</span></span>
          </div>

          <a href="tel:0658908674" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-[11px] shadow-sm active:scale-95 transition-transform">
            APPELER
          </a>
        </div>
      </header>

      {/* Contenu Centré - Largeur Smartphone même sur PC pour le style Premium */}
      <div className="max-w-[400px] mx-auto px-6 mt-12 space-y-12">
        
        <section className="space-y-2 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 leading-tight">Demande d'intervention.</h2>
          <p className="text-slate-500 text-[13px] font-medium">Artisan qualifié • Intervention sous 1h</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] text-center">Service requis</h3>
          <div className="grid grid-cols-2 gap-3">
            {prestationsList.map((p) => {
              const active = formData.prestations.includes(p.id);
              return (
                <button 
                  key={p.id} 
                  type="button"
                  onClick={() => togglePrestation(p.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 relative ${
                    active ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-100' : 'bg-white border-slate-100 hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className={`${active ? 'text-blue-600' : 'text-slate-400'}`}>
                    {p.icon}
                  </div>
                  <span className="font-bold text-[12px] tracking-tight">{p.id}</span>
                  {active && <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full" />}
                </button>
              );
            })}
          </div>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-5">
          <div className="grid grid-cols-2 gap-3">
            <input required placeholder="Prénom" className="w-full p-3.5 bg-slate-50 rounded-xl border border-transparent focus:border-blue-400 focus:bg-white transition-all outline-none text-[13px]" 
              value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
            <input required placeholder="Nom" className="w-full p-3.5 bg-slate-50 rounded-xl border border-transparent focus:border-blue-400 focus:bg-white transition-all outline-none text-[13px]" 
              value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
          </div>

          <input required type="tel" placeholder="Téléphone" className="w-full p-3.5 bg-slate-50 rounded-xl border border-transparent focus:border-blue-400 focus:bg-white transition-all outline-none text-[13px]" 
            value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} />

          <div className="relative">
            <input required placeholder="Adresse" className="w-full p-3.5 bg-slate-50 rounded-xl border border-transparent focus:border-blue-400 focus:bg-white transition-all outline-none pr-12 text-[13px]" 
              value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
            <button type="button" onClick={getGPS} className="absolute right-3 top-3.5 text-slate-400 hover:text-blue-600">
              <MapPin size={18} strokeWidth={2}/>
            </button>
          </div>

          <label className="flex items-center gap-3 cursor-pointer pt-2">
            <input type="checkbox" required checked={formData.rgpd} onChange={e => setFormData({...formData, rgpd: e.target.checked})} 
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400" />
            <span className="text-[10px] text-slate-400 font-medium italic">J'accepte le traitement des données (RGPD)</span>
          </label>

          <button type="submit" className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-[12px] tracking-widest uppercase mt-2">
            <Send size={14} strokeWidth={2.5} /> Envoyer la demande
          </button>
        </section>

        <footer className="text-center pt-4">
          <p className="text-slate-300 text-[9px] font-bold tracking-[0.4em] uppercase">Artisan Qualifié • 2024</p>
        </footer>
      </div>
    </main>
  );
}
