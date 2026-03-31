"use client";
import { useState, useEffect } from "react";

export default function Home() {
  const [status, setStatus] = useState("");
  const [prestation, setPrestation] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstall, setShowInstall] = useState(false);

  // Historique + PWA install
  useEffect(() => {
    const stored = localStorage.getItem("demandes");
    if (stored) setHistory(JSON.parse(stored));

    window.addEventListener("beforeinstallprompt", (e) => {
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

  // 🔗 PARTAGE
  const handleShare = async () => {
    const shareData = {
      title: "French Plomberie",
      text: "Besoin d’un plombier rapidement ?",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        alert("Lien copié 👍");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Géolocalisation
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Impossible d'obtenir la localisation")
    );
  };

  // Compression images
  const compressImage = (file: File, maxWidth = 1920, quality = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const scale = Math.min(1, maxWidth / img.width);
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;
          const ctx = canvas.getContext("2d");
          if (!ctx) return reject("Erreur canvas");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: "image/jpeg" }));
              } else reject("Erreur compression");
            },
            "image/jpeg",
            quality
          );
        };
        if (event.target?.result) img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handlePhotos = async (e: any) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const compressedFiles: File[] = [];

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
      } catch {
        compressedFiles.push(file);
      }
    }

    setPhotos(compressedFiles);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!prestation) {
      setStatus("❌ Veuillez choisir une prestation");
      return;
    }

    const formData = new FormData(e.target);
    formData.append("prestation", prestation);

    if (location) {
      formData.append("latitude", location.lat.toString());
      formData.append("longitude", location.lng.toString());
    }

    photos.forEach((photo) => formData.append("photos", photo));

    try {
      const response = await fetch("/api/send", { method: "POST", body: formData });

      if (response.ok) {
        setStatus("✅ Demande envoyée !");

        const prenom = formData.get("prenom");
        const nom = formData.get("nom");
        const tel = formData.get("tel");
        const adresse = formData.get("adresse");
        const message = formData.get("message");

        window.open(
          `https://wa.me/33658908674?text=Nouvelle demande\nNom: ${prenom} ${nom}\nTel: ${tel}\nAdresse: ${adresse}\nPrestation: ${prestation}\nMessage: ${message}`,
          "_blank"
        );

        const newHistory = [...history, { date: new Date().toLocaleString(), prestation }];
        setHistory(newHistory);
        localStorage.setItem("demandes", JSON.stringify(newHistory));

        e.target.reset();
        setPhotos([]);
        setPrestation("");
        setLocation(null);
      } else {
        setStatus("❌ Erreur lors de l'envoi");
      }
    } catch {
      setStatus("❌ Impossible d'envoyer la demande");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 30, fontFamily: "Arial" }}>
      
      {/* HEADER LOGO + PARTAGE */}
      <div style={{ textAlign: "center", position: "relative" }}>
        
        <button
          onClick={handleShare}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            background: "transparent",
            border: "none",
            fontSize: 20,
            cursor: "pointer",
            opacity: 0.6
          }}
          title="Partager"
        >
          🔗
        </button>

        <img src="/logo.png" style={{ width: 140 }} />
      </div>

      <h1 style={{ textAlign: "center" }}>Artisan Plombier de proximité</h1>

      <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: 25, borderRadius: 10 }}>

        <input name="prenom" placeholder="Prénom" required />
        <input name="nom" placeholder="Nom" required />
        <input name="tel" placeholder="Téléphone" required />
        <input name="email" placeholder="Email" />
        <input name="adresse" placeholder="Adresse" required />

        <h3>Prestation</h3>

        <button type="button" onClick={() => setPrestation("Dépannage fuite")}>🔧 Dépannage</button>
        <button type="button" onClick={() => setPrestation("Chauffage")}>🔥 Chauffage</button>
        <button type="button" onClick={() => setPrestation("Cuisine")}>🍳 Cuisine</button>
        <button type="button" onClick={() => setPrestation("Salle de bain")}>🛁 Salle de bain</button>

        <h3>Photos</h3>
        <input type="file" multiple onChange={handlePhotos} />

        <button type="button" onClick={getLocation}>📍 Ajouter position</button>

        <textarea name="message" placeholder="Votre message" />

        <button type="submit">Envoyer</button>

      </form>

      <p>{status}</p>

      <a href="tel:0658908674" style={{
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
        fontSize: 28
      }}>📞</a>

    </div>
  );
}
