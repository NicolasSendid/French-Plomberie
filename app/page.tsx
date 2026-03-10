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
    { id: 'Eau Chaude', icon: <Droplets size={22} />, desc: 'Systèmes de chauffe' },
    { id: 'Chauffage', icon: <Flame size={22} />, desc: 'Solutions thermiques' },
    { id: 'Salle de bains', icon: <Bath size={22} />, desc: 'Aménagement & Sanitaires' },
    { id: 'Cuisine', icon: <Utensils size={22} />, desc: 'Réseaux & Équipements' },
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
        alert("📍 Coordonnées GPS synchronisées.");
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
      alert("✅ Demande reçue. Nous vous recontactons dans les plus brefs délais.");
      setFormData({ nom: '', prenom: '', tel: '', mail: '', adresse: '', prestations: [], rgpd: false, gps: '' });
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFDFC] pb-20 font-sans text-slate-800 antialiased">
      {/* Banner Installation PWA Subtile */}
      {deferredPrompt && (
        <div className="bg-slate-900 px-6 py-2.5 text-white/90 text-center text-[13px] font-medium flex items-center justify-center gap-4 tracking-wide">
          <span>Accédez plus rapidement à nos services depuis votre écran.</span>
          <button onClick={handleInstallClick} className="bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full font-bold uppercase text-[11px] transition-colors active:scale-95">Installer</button>
        </div>
      )}

      {/* Header Raffiné & Centré */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100/60 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* LOGO ICI (public/logo.png) */}
            <div className="w-11 h-11 bg-[#F5F5F3] rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100/80 group">
              <img src="/logo.png" alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={(e) => (e.currentTarget.style.display = 'none')} />
              <Droplets className="text-slate-400 absolute" size={18} strokeWidth={1.5} /> 
            </div>
            <div>
              <h1 className="font-extrabold text-xl leading-none tracking-tighter text-slate-900">French<span className="text-blue-600">.</span></h1>
              <p className="text-[11px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">Plomberie d'excellence</p>
            </div>
          </div>
          <a href="tel:0658908674" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full flex items-center gap-2.5 font-bold transition-all active:scale-95 shadow-md shadow-blue-100 text-[13px] tracking-wide">
            <Phone size={17} strokeWidth={2.5} />
            <span>URGENCE 24/7</span>
          </a>
        </div>
      </header>

      {/* Colonne centrale principale */}
      <div className="max-w-lg mx-auto px-6 mt-16 space-y-16">
        
        {/* Hero Section Fine */}
        <section className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#F5F5F3] border border-slate-100 text-slate-600 px-4 py-1.5 rounded-full text-xs font-semibold tracking-wide">
            <Droplets size={14} className="text-blue-600" /> Dépannage & Installation
          </div>
          <h2 className="text-4xl font-extrabold text-slate-950 leading-tight tracking-tighter">Votre confort,<br/>notre priorité.</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">Artisan qualifié pour interventions rapides et de haute qualité sur tous vos réseaux d'eau et chauffage.</p>
        </section>

        {/* Services Fine Grid */}
        <section className="space-y-6">
          <div className="flex justify-between items-baseline">
            <h3 className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-1">Prestations</h3>
            {formData.prestations.length > 0 && (
              <span className="text-xs text-blue-600 font-bold px-3 py-1 bg-blue-50 rounded-full animate-in fade-in zoom-in">{formData.prestations.length} sélectionné(s)</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-5">
            {prestationsList.map((p) => {
              const active = formData.prestations.includes(p.id);
              return (
                <button 
                  key={p.id} 
                  type="button"
                  onClick={() => togglePrestation(p.id)}
                  className={`p-6 rounded-3xl border transition-all duration-300 flex flex-col items-start text-left gap-4 group ${
                    active ? 'border-blue-600 bg-blue-50/20 ring-1 ring-blue-100' : 'bg-white/80 border-slate-100/70 hover:border-blue-200'
                  }`}
                >
                  <div className={`p-3 rounded-xl transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-[#F5F5F3] text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                    {p.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-tight text-slate-900">{p.id}</p>
                    <p className="text-[11px] text-slate-400 mt-1.5 leading-relaxed font-medium">{p.desc}</p>
                  </div>
                  <div className={`absolute top-4 right-4 transition-all duration-300 ${active ? 'bg-blue-600 text-white p-1 rounded-full' : 'text-slate-300 group-hover:text-blue-400'}`}>
                    {active ? <Check size={16} strokeWidth={3} /> : <Plus size={20} />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Premium Form Card */}
        <section className="bg-white/90 p-10 rounded-[2.5rem] shadow-xl shadow-slate-100/50 border border-slate-100/70 relative">
          <h3 className="text-2xl font-extrabold mb-10 text-slate-950 tracking-tight">Planifier une intervention</h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Prénom</label>
                <input required placeholder="Jean" className="w-full p-4 bg-[#F5F5F3] rounded-xl border border-transparent focus:ring-1 focus:ring-blue-600/50 focus:border-blue-300 focus:bg-white transition-all outline-none text-[13px]" 
                  value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nom</label>
                <input required placeholder="Dupont" className="w-full p-4 bg-[#F5F5F3] rounded-xl border border-transparent focus:ring-1 focus:ring-blue-600/50 focus:border-blue-300 focus:bg-white transition-all outline-none text-[13px]" 
                  value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Téléphone</label>
              <input required type="tel" placeholder="06 00 00 00 00" className="w-full p-4 bg-[#F5F5F3] rounded-xl border border-transparent focus:ring-1 focus:ring-blue-600/50 focus:border-blue-300 focus:bg-white transition-all outline-none text-[13px]" 
                value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider ml-1">Lieu d'intervention</label>
              <div className="relative group">
                <input required placeholder="12 rue des Fleurs, 75000" className="w-full p-4 bg-[#F5F5F3] rounded-xl border border-transparent focus:ring-1 focus:ring-blue-600/50 focus:border-blue-300 focus:bg-white transition-all outline-none pr-14 text-[13px]" 
                  value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
                <button type="button" onClick={getGPS} className="absolute right-2.5 top-2.5 p-2 bg-white shadow rounded-lg text-slate-400 hover:text-blue-600 transition-all hover:shadow-md active:scale-90">
                  <MapPin size={20} strokeWidth={1.5}/>
                </button>
              </div>
            </div>

            <label className="flex items-start gap-4 p-5 rounded-xl bg-[#F5F5F3]/60 cursor-pointer group border border-transparent hover:border-slate-100 transition-colors">
              <input type="checkbox" required checked={formData.rgpd} onChange={e => setFormData({...formData, rgpd: e.target.checked})} 
                className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 transition-all" />
              <span className="text-[11px] leading-relaxed text-slate-500 transition-colors">
                Je consens au traitement de mes informations personnelles pour la prise de contact liée à ma demande de rendez-vous (RGPD).
              </span>
            </label>

            <button type="submit" className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-5 rounded-2xl shadow-xl shadow-slate-200/60 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-xs tracking-widest uppercase mt-6 group">
              <Send size={16} strokeWidth={2} className="group-hover:translate-x-0.5 transition-transform" /> Confirmer la demande
            </button>
          </form>
        </section>

        {/* Fine Footer */}
        <footer className="text-center pt-8 border-t border-slate-100/60">
          <p className="text-slate-400 text-[11px] font-bold tracking-widest uppercase">French Plomberie © 2024</p>
          <p className="text-[10px] text-slate-300 mt-1.5">Artisan qualifié RGE • Interventions garanties</p>
        </footer>
      </div>
    </main>
  );
}
