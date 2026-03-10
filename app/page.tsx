"use client";
import React, { useState, useEffect } from 'react';
import { Phone, Droplets, Flame, Bath, Utensils, Send, MapPin, Download, CheckCircle2 } from 'lucide-react';

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
    { id: 'Eau Chaude', icon: <Droplets size={28} />, desc: 'Ballon & Chauffe-eau' },
    { id: 'Chauffage', icon: <Flame size={28} />, desc: 'Radiateur & Chaudière' },
    { id: 'Salle de bains', icon: <Bath size={28} />, desc: 'Douche & Robinetterie' },
    { id: 'Cuisine', icon: <Utensils size={28} />, desc: 'Évier & Lave-vaisselle' },
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
        alert("📍 Position récupérée avec succès !");
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.rgpd) return alert("Veuillez accepter les conditions (RGPD)");
    
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if(res.ok) {
      alert("🚀 Demande envoyée ! Nous vous rappelons rapidement.");
      setFormData({ nom: '', prenom: '', tel: '', mail: '', adresse: '', prestations: [], rgpd: false, gps: '' });
    }
  };

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-12 font-sans text-slate-900">
      {/* Banner Installation PWA */}
      {deferredPrompt && (
        <div className="bg-blue-600 p-2 text-white text-center text-sm font-medium flex items-center justify-center gap-3 animate-pulse">
          <span>Installer l'application sur votre écran ?</span>
          <button onClick={handleInstallClick} className="bg-white text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">Installer</button>
        </div>
      )}

      {/* Header Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 px-5 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          {/* LOGO ICI */}
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center overflow-hidden shadow-lg shadow-blue-200">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
            <Droplets className="text-white absolute" size={20} /> 
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight tracking-tighter text-slate-800">FRENCH<br/><span className="text-blue-600">PLOMBERIE</span></h1>
          </div>
        </div>
        <a href="tel:0658908674" className="group bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 font-bold transition-all active:scale-95 shadow-lg shadow-red-200">
          <Phone size={18} className="group-hover:animate-bounce" />
          <span className="hidden sm:inline">URGENCE 24/7</span>
        </a>
      </header>

      <div className="max-w-xl mx-auto px-5 pt-8 space-y-10">
        {/* Hero Section */}
        <section className="text-center space-y-3">
          <span className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Services Professionnels</span>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Dépannage Rapide & <br/>Installation de Qualité</h2>
          <p className="text-slate-500 text-sm">Intervention sous 1h pour toutes vos urgences plomberie et chauffage.</p>
        </section>

        {/* Services Grid */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h3 className="text-lg font-bold">Choisissez un service</h3>
            <span className="text-xs text-slate-400 font-medium">{formData.prestations.length} sélectionné(s)</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {prestationsList.map((p) => {
              const active = formData.prestations.includes(p.id);
              return (
                <button 
                  key={p.id} 
                  type="button"
                  onClick={() => togglePrestation(p.id)}
                  className={`relative p-5 rounded-3xl border-2 transition-all duration-300 flex flex-col items-start text-left gap-4 overflow-hidden group ${
                    active ? 'border-blue-600 bg-blue-50/50 ring-4 ring-blue-50' : 'bg-white border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className={`p-3 rounded-2xl transition-colors ${active ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-100'}`}>
                    {p.icon}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">{p.id}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wide">{p.desc}</p>
                  </div>
                  {active && <CheckCircle2 size={20} className="absolute top-4 right-4 text-blue-600 animate-in fade-in zoom-in" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* Form Card */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-blue-600"></div>
          <h3 className="text-2xl font-black mb-8 text-slate-800">Prendre rendez-vous</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Prénom</label>
                <input required placeholder="Jean" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 transition-all outline-none text-sm" 
                  value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Nom</label>
                <input required placeholder="Dupont" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 transition-all outline-none text-sm" 
                  value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Téléphone</label>
              <input required type="tel" placeholder="06 00 00 00 00" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 transition-all outline-none text-sm" 
                value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-400 uppercase ml-1">Adresse d'intervention</label>
              <div className="relative group">
                <input required placeholder="12 rue des Fleurs, 75000" className="w-full p-4 bg-slate-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-600 transition-all outline-none pr-14 text-sm" 
                  value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
                <button type="button" onClick={getGPS} className="absolute right-2 top-2 p-2.5 bg-white shadow-sm rounded-xl text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-90">
                  <MapPin size={22}/>
                </button>
              </div>
            </div>

            <label className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50/50 cursor-pointer group">
              <div className="relative flex items-center">
                <input type="checkbox" required checked={formData.rgpd} onChange={e => setFormData({...formData, rgpd: e.target.checked})} 
                  className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              </div>
              <span className="text-[11px] leading-relaxed text-slate-500 group-hover:text-slate-700 transition-colors">
                En cochant cette case, j'accepte que mes données soient utilisées pour la prise de contact liée à ma demande.
              </span>
            </label>

            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-5 rounded-2xl shadow-xl shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 text-sm tracking-wide uppercase">
              <Send size={18} /> Confirmer la demande
            </button>
          </form>
        </section>

        {/* Footer */}
        <footer className="text-center space-y-4">
          <p className="text-slate-400 text-[10px] font-medium tracking-widest uppercase">French Plomberie © 2024 • Qualité Garantie</p>
        </footer>
      </div>
    </main>
  );
}
