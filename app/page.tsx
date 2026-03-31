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

  // Compression des images côté client
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
          if (!ctx) return reject("Impossible de récupérer le contexte canvas");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".jpg"), {
                  type: "image/jpeg",
                  lastModified: Date.now(),
                });
                resolve(newFile);
              } else {
                reject("Erreur conversion image");
              }
            },
            "image/jpeg",
            quality
          );
        };
        if (event.target?.result) {
          img.src = event.target.result as string;
        }
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  // Gestion des photos (limite 3, compression)
  const handlePhotos = async (e: any) => {
    const files = Array.from(e.target.files).slice(0, 3);
    const compressedFiles: File[] = [];

    for (const file of files) {
      try {
        const compressed = await compressImage(file);
        compressedFiles.push(compressed);
      } catch (err) {
        console.warn("Impossible de compresser l'image :", file.name, err);
        compressedFiles.push(file); // ajoute brute si compression échoue
      }
    }

    setPhotos(compressedFiles);
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
      const response = await fetch("/api/send", { method: "POST", body: formData });

      if (response.ok) {
        setStatus("✅ Demande envoyée !");
        const prenom = formData.get("prenom");
        const nom = formData.get("nom");
        const tel = formData.get("tel");
        const adresse = formData.get("adresse");
        const message = formData.get("message");

        window.open(
          `https://wa.me/33658908674?text=Nouvelle demande\nNom: ${prenom} ${nom}\nTel: ${tel}\nAdresse: ${adresse}\nPrestation: ${prestation}\nMessage: ${message}\nPhotos: ${photos.length}`,
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

      <h1 style={{ textAlign: "center" }}>Artisan Plombier de proximité</h1>
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

      <footer
  style={{
    marginTop: 60,
    paddingTop: 20,
    borderTop: "1px solid #ddd",
    fontSize: 12,
    color: "#666",
    lineHeight: 1.6,
    textAlign: "center"
  }}
>
  <strong>Mentions légales</strong><br />

  French Plomberie - Aurélien Ballet<br />
  SIRET : 51368594100025<br />
  Adresse : 9 RUE MEURGE ETAGE 0, 60570 ANDEVILLE<br />
  Téléphone : 06 58 90 86 74<br />
  Email : frenchplomberie@gmail.com<br /><br />

  Directeur de publication : French Plomberie - Aurélien Ballet<br />
  Hébergement : Vercel<br /><br />

  Les informations recueillies via ce formulaire sont utilisées uniquemement
  pour le traitement de votre demande d'intervention ou de devis conformément au RGPD.
</footer>
  </div>
  );
}
