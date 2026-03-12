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

  // Géolocalisation
  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Impossible d'obtenir la localisation")
    );
  };

  // Photos (limite 3) avec conversion HEIC/HEIF en JPEG
  const handlePhotos = (e: any) => {
    const files = Array.from(e.target.files).slice(0, 3);

    const convertFiles = files.map(async (file: File) => {
      // Si ce n'est pas HEIC/HEIF, on renvoie tel quel
      if (!file.name.toLowerCase().endsWith(".heic") && !file.name.toLowerCase().endsWith(".heif")) {
        return file;
      }

      return new Promise<File>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return reject("Impossible de récupérer le context");
            ctx.drawImage(img, 0, 0);

            canvas.toBlob((blob) => {
              if (!blob) return reject("Conversion échouée");
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
              resolve(newFile);
            }, "image/jpeg", 0.9); // qualité 90%
          };
          img.onerror = reject;
          img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(convertFiles)
      .then((converted) => setPhotos(converted))
      .catch((err) => {
        console.error("Erreur conversion photo :", err);
        setPhotos([]); // si problème, on vide la sélection
        alert("Erreur lors de la conversion des photos. Veuillez réessayer avec d'autres fichiers.");
      });
  };

  // Envoi formulaire
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
    formData.append("photosCount", photos.length.toString());
    photos.forEach((photo) => formData.append("photos", photo));

    try {
      const response = await fetch("/api/send", { // vers ton route.ts
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        setStatus("✅ Demande envoyée !");
        window.open(
          `https://wa.me/33658908674?text=Nouvelle demande\nNom: ${formData.get("prenom")} ${formData.get("nom")}\nTel: ${formData.get("tel")}\nAdresse: ${formData.get("adresse")}\nPrestation: ${prestation}\nMessage: ${formData.get("message")}\nPhotos: ${photos.length}`,
          "_blank"
        );

        const newHistory = [
          ...history,
          { date: new Date().toLocaleString(), prestation }
        ];
        setHistory(newHistory);
        localStorage.setItem("demandes", JSON.stringify(newHistory));

        e.target.reset();
        setPhotos([]);
        setPrestation("");
        setLocation(null);
      } else {
        setStatus("❌ Erreur lors de l'envoi");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Impossible d'envoyer la demande");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 30, fontFamily: "Arial" }}>
      <div style={{ textAlign: "center" }}>
        <img src="/logo.png" style={{ width: 140 }} />
      </div>

      <h1 style={{ textAlign: "center" }}>Plombier disponible rapidement</h1>
      <p style={{ textAlign: "center", color: "#555" }}>Dépannage • Chauffage / Ballon d'eau chaude • Cuisine • Salle de bain</p>

      <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: 25, borderRadius: 10 }}>
        <h2>Vos informations</h2>
        <input name="prenom" placeholder="Prénom" required />
        <input name="nom" placeholder="Nom" required />
        <input name="tel" placeholder="Téléphone" required />
        <input name="email" placeholder="Email" />
        <input name="adresse" placeholder="Adresse intervention" required />

        <h3 style={{ marginTop: 20 }}>Prestation</h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <button type="button" onClick={() => setPrestation("Dépannage fuite")} style={{ padding: 15, borderRadius: 8, border: prestation === "Dépannage fuite" ? "2px solid #0070f3" : "1px solid #ccc" }}>🔧 Dépannage fuite</button>
          <button type="button" onClick={() => setPrestation("Chauffage / Ballon ECS")} style={{ padding: 15, borderRadius: 8, border: prestation === "Chauffage / Ballon ECS" ? "2px solid #0070f3" : "1px solid #ccc" }}>🔥 Chauffage / Ballon ECS</button>
          <button type="button" onClick={() => setPrestation("Cuisine")} style={{ padding: 15, borderRadius: 8, border: prestation === "Cuisine" ? "2px solid #0070f3" : "1px solid #ccc" }}>🍳 Cuisine</button>
          <button type="button" onClick={() => setPrestation("Salle de bain")} style={{ padding: 15, borderRadius: 8, border: prestation === "Salle de bain" ? "2px solid #0070f3" : "1px solid #ccc" }}>🛁 Salle de bain</button>
        </div>

        <h3 style={{ marginTop: 20 }}>Photos du problème (max 3)</h3>
        <input type="file" multiple accept="image/*" onChange={handlePhotos} />
        {photos.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {photos.map((photo, i) => (
              <img key={i} src={URL.createObjectURL(photo)} style={{ width: 70, height: 70, objectFit: "cover", borderRadius: 6 }} />
            ))}
          </div>
        )}

        <button type="button" onClick={getLocation} style={{ marginTop: 15, padding: 10, background: "#eee", border: "none", borderRadius: 6 }}>📍 Ajouter ma position</button>
        {location && <p style={{ fontSize: 13, color: "#666" }}>Position enregistrée</p>}

        <textarea name="message" placeholder="Décrivez votre problème" style={{ width: "100%", marginTop: 20, padding: 10, borderRadius: 6 }} />

        {/* RGPD */}
        <div style={{ marginTop: 15, fontSize: 14 }}>
          <label>
            <input type="checkbox" name="rgpd" required style={{ marginRight: 8 }} />
            Je confirme avoir lu et accepté que mes données soient utilisées pour le traitement de ma demande conformément à la réglementation RGPD.
          </label>
        </div>

        <button type="submit" style={{ marginTop: 25, width: "100%", padding: 14, background: "black", color: "white", border: "none", borderRadius: 6 }}>Envoyer la demande</button>
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
        fontSize: 28,
        textDecoration: "none",
        boxShadow: "0 4px 12px rgba(0,0,0,0.3)"
      }}>📞</a>

      {showInstall && (
        <button onClick={installApp} style={{ position: "fixed", bottom: 100, right: 25, padding: 10, borderRadius: 8, background: "#0070f3", color: "#fff" }}>
          Installer l'application
        </button>
      )}
    </div>
  );
}
