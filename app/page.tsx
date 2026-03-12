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

  useEffect(() => {
    const stored = localStorage.getItem("demandes");
    if (stored) setHistory(JSON.parse(stored));

    window.addEventListener("beforeinstallprompt", (e:any) => {
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

  const getLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => alert("Impossible d'obtenir la localisation")
    );
  };

  const handlePhotos = (e:any) => {
    const files = Array.from(e.target.files).slice(0, 3) as File[];
    setPhotos(files);
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    setStatus("Envoi en cours...");

    if (!prestation) {
      setStatus("❌ Veuillez choisir une prestation");
      return;
    }

    const formData = new FormData(e.target);

    formData.append("prestation", prestation);

    photos.forEach(photo => {
      formData.append("photos", photo);
    });

    if (location) {
      formData.append("latitude", location.lat.toString());
      formData.append("longitude", location.lng.toString());
    }

    try {

      const res = await fetch("/api/send", {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {

        setStatus("✅ Demande envoyée");

        const prenom = formData.get("prenom");
        const nom = formData.get("nom");
        const tel = formData.get("tel");
        const adresse = formData.get("adresse");
        const message = formData.get("message");

        const whatsappMessage =
`Nouvelle demande plomberie

Nom: ${prenom} ${nom}
Tel: ${tel}
Adresse: ${adresse}
Prestation: ${prestation}
Message: ${message}`;

        window.open(
          `https://wa.me/33658908674?text=${encodeURIComponent(whatsappMessage)}`,
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

      <h1 style={{ textAlign: "center" }}>Artisan Plombier de proximité</h1>

      <p style={{ textAlign: "center", color: "#555" }}>
        Dépannage • Chauffage / Ballon d'eau chaude • Cuisine • Salle de bain
      </p>

      <form onSubmit={handleSubmit} style={{ background: "#f9f9f9", padding: 25, borderRadius: 10 }}>

        <h2>Vos informations</h2>

        <input name="prenom" placeholder="Prénom" required />
        <input name="nom" placeholder="Nom" required />
        <input name="tel" placeholder="Téléphone" required />
        <input name="email" placeholder="Email" />
        <input name="adresse" placeholder="Adresse intervention" required />

        <h3 style={{ marginTop: 20 }}>Prestation</h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>

          <button type="button" onClick={() => setPrestation("Dépannage fuite")}>
            🔧 Dépannage fuite
          </button>

          <button type="button" onClick={() => setPrestation("Chauffage / Ballon ECS")}>
            🔥 Chauffage / Ballon ECS
          </button>

          <button type="button" onClick={() => setPrestation("Cuisine")}>
            🍳 Cuisine
          </button>

          <button type="button" onClick={() => setPrestation("Salle de bain")}>
            🛁 Salle de bain
          </button>

        </div>

        <h3 style={{ marginTop: 20 }}>Photos du problème (max 3)</h3>

        <input type="file" multiple accept="image/*" onChange={handlePhotos} />

        {photos.length > 0 && (
          <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
            {photos.map((photo, i) => (
              <img
                key={i}
                src={URL.createObjectURL(photo)}
                style={{
                  width: 70,
                  height: 70,
                  objectFit: "cover",
                  borderRadius: 6
                }}
              />
            ))}
          </div>
        )}

        <button
          type="button"
          onClick={getLocation}
          style={{
            marginTop: 15,
            padding: 10,
            background: "#eee",
            border: "none",
            borderRadius: 6
          }}
        >
          📍 Ajouter ma position
        </button>

        {location && (
          <p style={{ fontSize: 13 }}>Position enregistrée</p>
        )}

        <textarea
          name="message"
          placeholder="Décrivez votre problème"
          style={{
            width: "100%",
            marginTop: 20,
            padding: 10,
            borderRadius: 6
          }}
        />

        <div style={{ marginTop: 15, fontSize: 14 }}>
          <label>
            <input type="checkbox" name="rgpd" required />
            J'autorise French Plomberie à traiter mes données personnelles afin de répondre à ma demande d'intervention, conformément à la réglementation RGPD.
          </label>
        </div>

        <button
          type="submit"
          style={{
            marginTop: 25,
            width: "100%",
            padding: 14,
            background: "black",
            color: "white",
            border: "none",
            borderRadius: 6
          }}
        >
          Envoyer la demande
        </button>

      </form>

      <p style={{ textAlign: "center", marginTop: 20 }}>{status}</p>

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
          textDecoration: "none"
        }}
      >
        📞
      </a>

      {showInstall && (
        <button
          onClick={installApp}
          style={{
            position: "fixed",
            bottom: 100,
            right: 25,
            padding: 10,
            borderRadius: 8,
            background: "#0070f3",
            color: "#fff"
          }}
        >
          Installer l'application
        </button>
      )}

    </div>
  );
}
