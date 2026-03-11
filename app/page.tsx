"use client";

import { useState, useEffect } from "react";

export default function Home() {
  const [status, setStatus] = useState("");
  const [prestation, setPrestation] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [location, setLocation] = useState<{lat:number,lng:number}|null>(null);
  const [history, setHistory] = useState<{date:string,prestation:string}[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  // --- INSTALL PWA ---
  useEffect(() => {
    const stored = localStorage.getItem("demandes");
    if (stored) setHistory(JSON.parse(stored));

    window.addEventListener("beforeinstallprompt", (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    });
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
  };

  // --- GEOLOCALISATION ---
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Impossible d'obtenir la localisation")
    );
  };

  // --- CONVERTIR PHOTO EN JPEG ---
  const convertFileToJpeg = async (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(file);
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" })
              );
            } else resolve(file);
          },
          "image/jpeg",
          0.8
        );
      };
      img.onerror = () => resolve(file);
      img.src = URL.createObjectURL(file);
    });
  };

  // --- GESTION DES PHOTOS (max 3) ---
  const handlePhotos = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 3); // max 3 photos
    const converted = await Promise.all(files.map((f) => convertFileToJpeg(f)));
    setPhotos(converted);
  };

  // --- ENVOI FORMULAIRE ---
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prestation) return setStatus("⚠️ Veuillez choisir une prestation");

    const formData = new FormData(e.currentTarget);
    formData.append("prestation", prestation);

    if (location) {
      formData.append("latitude", location.lat.toString());
      formData.append("longitude", location.lng.toString());
    }

    photos.forEach((photo) => formData.append("photos", photo));

    try {
      const res = await fetch("/api/send", { method: "POST", body: formData });

      if (res.ok) {
        setStatus("✅ Demande envoyée !");

        // --- WhatsApp message complet ---
        const prenom = formData.get("prenom") || "";
        const nom = formData.get("nom") || "";
        const tel = formData.get("tel") || "";
        const adresse = formData.get("adresse") || "";
        const msg = `Nouvelle demande plomberie :
Nom : ${prenom} ${nom}
Téléphone : ${tel}
Adresse : ${adresse}
Prestation : ${prestation}
Photos : ${photos.length}`;

        const waLink = `https://wa.me/33658908674?text=${encodeURIComponent(msg)}`;
        window.open(waLink, "_blank");

        const newHistory = [
          ...history,
          { date: new Date().toLocaleString(), prestation },
        ];
        setHistory(newHistory);
        localStorage.setItem("demandes", JSON.stringify(newHistory));
        e.currentTarget.reset();
        setPhotos([]);
      } else setStatus("❌ Erreur lors de l'envoi");
    } catch {
      setStatus("❌ Impossible d'envoyer la demande");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 30, fontFamily: "Arial" }}>
      {/* Logo */}
      <div style={{ textAlign: "center" }}>
        <img src="/logo.png" style={{ width: 140 }} />
      </div>

      <h1 style={{ textAlign: "center" }}>Plombier disponible rapidement</h1>
      <p style={{ textAlign: "center", color: "#555" }}>
        Dépannage • Chauffage / Ballon d'eau chaude • Cuisine • Salle de bain
      </p>

      <form
        onSubmit={handleSubmit}
        style={{ background: "#f9f9f9", padding: 25, borderRadius: 10 }}
      >
        <h2>Vos informations</h2>
        <input name="prenom" placeholder="Prénom" required />
        <input name="nom" placeholder="Nom" required />
        <input name="tel" placeholder="Téléphone" required />
        <input name="email" placeholder="Email" />
        <input name="adresse" placeholder="Adresse intervention" required />

        <h3 style={{ marginTop: 20 }}>Prestation</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {[
            { id: "depannage", label: "🔧 Dépannage fuite" },
            { id: "chauffage", label: "🔥 Chauffage / Ballon ECS" },
            { id: "cuisine", label: "🍳 Cuisine" },
            { id: "sdb", label: "🛁 Salle de bain" },
          ].map((p) => (
            <button
              type="button"
              key={p.id}
              onClick={() => setPrestation(p.id)}
              style={{
                padding: 15,
                borderRadius: 8,
                border: prestation === p.id ? "2px solid #0070f3" : "1px solid #ccc",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <h3 style={{ marginTop: 20 }}>Photos du problème (max 3)</h3>
        <input type="file" multiple accept="image/*" onChange={handlePhotos} />
        {photos.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {photos.map((photo, i) => (
              <img
                key={i}
                src={URL.createObjectURL(photo)}
                style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={getLocation}
          style={{ marginTop: 15, padding: 10, background: "#eee", border: "none", borderRadius: 6 }}
        >
          📍 Ajouter ma position
        </button>
        {location && <p style={{ fontSize: 13, color: "#666" }}>Position enregistrée</p>}

        <textarea
          name="message"
          placeholder="Décrivez votre problème"
          style={{ width: "100%", marginTop: 20, padding: 10, borderRadius: 6 }}
        />

        <button
          type="submit"
          style={{ marginTop: 25, width: "100%", padding: 14, background: "black", color: "white", border: "none", borderRadius: 6 }}
        >
          Envoyer la demande
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 20 }}>{status}</p>

      {history.length > 0 && (
        <div style={{ marginTop: 40 }}>
          <h3>Historique des demandes</h3>
          {history.map((h, i) => (
            <div key={i} style={{ padding: 10, borderBottom: "1px solid #ddd" }}>
              {h.date} — {h.prestation}
            </div>
          ))}
        </div>
      )}

      {/* Bouton urgence */}
      <a
        href="tel:0658908674"
        style={{
          position: "fixed",
          bottom: 25,
          right: 25,
          background: "red",
          color: "white",
          width: 65,
          height: 65,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 28,
          textDecoration: "none",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
        }}
      >
        📞
      </a>

      {/* Installation PWA */}
      {showInstall && (
        <button onClick={installApp} style={{ position: "fixed", bottom: 100, right: 25 }}>
          Installer l'application
        </button>
      )}
    </div>
  );
}
