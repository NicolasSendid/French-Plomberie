"use client";
import React, { useState, useEffect } from 'react';
import { Phone, Droplets, Flame, Bath, Utensils, Send, MapPin, Download } from 'lucide-react';

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
    { id: 'Ballon et chaudiere', icon: <Droplets size={32} /> },
    { id: 'Chauffage', icon: <Flame size={32} /> },
    { id: 'Salle de bains', icon: <Bath size={32} /> },
    { id: 'Cuisine', icon: <Utensils size={32} /> },
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
        alert("📍 Position GPS récupérée !");
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.rgpd) return alert("Veuillez accepter le RGPD");
    
    const res = await fetch('/api/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });
    
    if(res.ok) {
      alert("✅ Demande envoyée !");
      setFormData({ nom: '', prenom: '', tel: '', mail: '', adresse: '', prestations: [], rgpd: false, gps: '' });
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-12 font-sans">
      {deferredPrompt && (
        <button 
          onClick={handleInstallClick}
          className="w-full bg-yellow-400 text-black text-center py-3 font-bold text-sm flex items-center justify-center gap-2"
        >
          <Download size={16} /> INSTALLER L'APPLICATION
        </button>
      )}

      <header className="bg-blue-600 text-white p-5 sticky top-0 z-50 flex justify-between items-center shadow-lg">
        <div>
          <h1 className="font-extrabold text-xl tracking-tight">FRENCH PLOMBERIE</h1>
        </div>
        <a href="tel:0658908674" className="bg-red-500 px-4 py-2 rounded-full flex items-center gap-2 font-bold shadow-md">
          <Phone size={18} /> URGENCE
        </a>
      </header>

      <div className="max-w-md mx-auto p-4 space-y-8">
        <section>
          <h2 className="text-xl font-bold mb-4 text-slate-800 border-l-4 border-blue-600 pl-3">Nos Prestations</h2>
          <div className="grid grid-cols-2 gap-3">
            {prestationsList.map((p) => (
              <button 
                key={p.id} 
                type="button"
                onClick={() => togglePrestation(p.id)}
                className={`p-5 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                  formData.prestations.includes(p.id) ? 'border-blue-600 bg-blue-50' : 'bg-white border-transparent shadow-sm'
                }`}
              >
                <div className={formData.prestations.includes(p.id) ? 'text-blue-600' : 'text-slate-400'}>
                  {p.icon}
                </div>
                <span className="text-xs font-bold uppercase">{p.id}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Prendre RDV</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <input required placeholder="Prénom" className="p-4 bg-slate-50 rounded-xl w-full border" 
                value={formData.prenom} onChange={e => setFormData({...formData, prenom: e.target.value})} />
              <input required placeholder="Nom" className="p-4 bg-slate-50 rounded-xl w-full border" 
                value={formData.nom} onChange={e => setFormData({...formData, nom: e.target.value})} />
            </div>
            <input required type="tel" placeholder="Téléphone" className="p-4 bg-slate-50 rounded-xl w-full border" 
              value={formData.tel} onChange={e => setFormData({...formData, tel: e.target.value})} />
            <input required type="email" placeholder="Email" className="p-4 bg-slate-50 rounded-xl w-full border" 
              value={formData.mail} onChange={e => setFormData({...formData, mail: e.target.value})} />
            <div className="relative">
              <input required placeholder="Adresse" className="p-4 bg-slate-50 rounded-xl w-full border pr-12" 
                value={formData.adresse} onChange={e => setFormData({...formData, adresse: e.target.value})} />
              <button type="button" onClick={getGPS} className="absolute right-3 top-4 text-blue-600">
                <MapPin size={24}/>
              </button>
            </div>
            <label className="flex items-start gap-3 text-[11px] text-slate-500 cursor-pointer">
              <input type="checkbox" required checked={formData.rgpd} onChange={e => setFormData({...formData, rgpd: e.target.checked})} />
              <span>J'accepte que mes coordonnées soient transmises pour le RDV (RGPD).</span>
            </label>
            <button type="submit" className="w-full bg-blue-600 text-white font-black py-5 rounded-2xl shadow-lg flex items-center justify-center gap-3">
              <Send size={20} /> ENVOYER
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
