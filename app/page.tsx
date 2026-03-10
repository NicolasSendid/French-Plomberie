"use client";
import React, { useState, useEffect } from 'react';
import { Phone, Droplets, Flame, Bath, Utensils, Send, MapPin, Download } from 'lucide-react';

export default function Home() {
  const [formData, setFormData] = useState({
    nom: '', prenom: '', tel: '', mail: '', adresse: '', 
    prestations: [] as string[], rgpd: false, gps: ''
  });

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Gestion de l'installation PWA
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  const prestationsList = [
    { id: 'Eau Chaude', icon: <Droplets /> },
    { id: 'Chauffage', icon: <Flame /> },
    { id: 'Salle de bains', icon: <Bath /> },
    { id: 'Cuisine', icon: <Utensils /> },
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
        alert("📍 Position GPS récupérée avec succès !");
      }, () => {
        alert("Impossible de récupérer la position. Vérifiez vos réglages.");
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!formData.rgpd) return alert("Veuillez accepter les conditions RGPD.");
    
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if(res.ok) {
        alert("✅ Demande envoyée ! French Plomberie vous recontactera rapidement.");
        setFormData({ nom: '', prenom: '', tel: '', mail: '', adresse: '', prestations: [], rgpd: false, gps: '' });
      } else {
        alert("Erreur lors de l'envoi. Réessayez plus tard.");
      }
    } catch (error) {
      alert("Une erreur est survenue.");
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 pb-12 font-sans">
      {/* Bouton Installation PWA (uniquement si disponible) */}
      {deferredPrompt && (
        <button 
          onClick={handleInstallClick}
          className="w-full bg-yellow-400 text-black text-center py-3 font-bold text-sm flex items-center justify-center gap-2
