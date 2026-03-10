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
      
      {/* HEADER CORRIGÉ - TAILLE LOGO FORCÉE */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 px-6 h-16 flex items-center">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
          
          <div className="flex items-center gap-4">
            {/* On force la boîte à 32px par 32px quoi qu'il arrive */}
            <div style={{ width: '32px', height: '32px', position: 'relative' }} className="flex-shrink-0 overflow-hidden rounded-md bg-slate-50 flex items-center justify-center border border-slate-100">
              <img 
                src="/logo.png" 
                alt="Logo" 
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                onError={(e) => (e.currentTarget.style.display = 'none')} 
              />
              <Droplets className="text-blue-500 absolute" size={14} style={{ zIndex: -1 }} />
            </div>
            <span className="font-bold text-sm tracking-widest uppercase">French<span className="text-blue-600">.</span></span>
          </div>

          <a href="tel:0658908674" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-bold transition-all active:scale-95 text-[11px] shadow-sm">
            <Phone size={14} strokeWidth={3} />
            <span>APPELER</span>
          </a>
        </div>
      </header>

      {/* Contenu - Largeur maîtrisée */}
      <div className="max-w-[400px] mx-auto px-6 mt-12 space-y-12">
        
        <section className="space-y-2 text-center md:text-left">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">Demande d'intervention.</h2>
          <p className="text-slate-500 text-xs leading-relaxed font-medium">Réponse immédiate • Devis gratuit sur place</p>
        </section>

        <section className="space-y-4">
          <h3 className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] ml-1">Service requis</h3>
          <div className="grid grid-cols-2 gap-3">
            {prestationsList.map((p) => {
              const active = formData.prestations.includes(p.id);
              return (
                <button 
                  key={p.id} 
                  type="button"
                  onClick={() => togglePrestation(p.id)}
                  className={`p-4 rounded-xl border transition-all duration-200 flex items-center gap-3 relative ${
                    active ? 'border-blue-600 bg-blue-50/50 ring-1 ring-blue-100' : 'bg-white border-slate-100 hover:border-slate-200'
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

        <section className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Prénom" className="w-full p-3.5 bg-white rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all outline-none text-[13px]" 
                value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
              <input required placeholder="Nom" className="w-full p-3.5 bg-white rounded-xl border border-slate-200 focus:border-blue-400 focus:ring-
