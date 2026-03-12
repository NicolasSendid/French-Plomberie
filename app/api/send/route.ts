import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();

    const prenom = formData.get("prenom") as string;
    const nom = formData.get("nom") as string;
    const tel = formData.get("tel") as string;
    const email = formData.get("email") as string;
    const adresse = formData.get("adresse") as string;
    const prestation = formData.get("prestation") as string;
    const message = formData.get("message") as string;
    const latitude = formData.get("latitude") as string;
    const longitude = formData.get("longitude") as string;

    const photos = formData.getAll("photos") as File[];

    // Lien Google Maps si localisation
    let mapLink = "";
    if (latitude && longitude) {
      mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    // SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

   // Traitement photos de manière sûre
const attachments = await Promise.all(
  photos
    .slice(0, 3) // limiter à 3 photos max
    .map(async (photo) => {
      try {
        if (!photo || photo.size === 0 || photo.size > 5 * 1024 * 1024) return null;

        // Nettoyage du nom de fichier
        let name = photo.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");

        const ext = name.split(".").pop()?.toLowerCase();
        // Forcer extension jpg pour HEIC/HEIF ou fichiers sans extension valide
        const validExtensions = ["jpg", "jpeg", "png", "gif"];
        if (!ext || !validExtensions.includes(ext)) {
          name = name.replace(/\.[^/.]+$/, "") + ".jpg";
        }

        const mimeType =
          photo.type && photo.type.startsWith("image/") ? photo.type : "image/jpeg";

        const buffer = Buffer.from(await photo.arrayBuffer());

        return { filename: name, content: buffer, contentType: mimeType };
      } catch {
        return null; // jamais planter
      }
    })
);

const filteredAttachments = attachments.filter(Boolean);
    
    // --- Email au plombier ---
    await transporter.sendMail({
      from: `"French Plomberie" <${process.env.SMTP_USER}>`,
      to: "frenchplomberie@gmail.com",
      subject: "🚰 Nouvelle demande plomberie",
      text: `
Nouvelle demande client

Nom : ${prenom} ${nom}
Téléphone : ${tel}
Email : ${email}
Adresse : ${adresse}
Prestation : ${prestation}
Message :
${message}
${mapLink ? "Localisation : " + mapLink : ""}
      `,
      attachments: filteredAttachments
    });

    // --- Accusé réception client ---
    if (email) {
      await transporter.sendMail({
        from: `"French Plomberie" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Votre demande plomberie a bien été reçue",
        text: `
Bonjour ${prenom} ${nom},

Nous avons bien reçu votre demande.

Récapitulatif :

Nom : ${prenom} ${nom}
Téléphone : ${tel}
Adresse : ${adresse}

Prestation demandée :
${prestation}

Message :
${message}

Notre équipe va vous recontacter rapidement.

French Plomberie
📞 06 58 90 86 74
        `
      });
    }

    // --- Google Sheets ---
    await fetch(
      "https://script.google.com/macros/s/AKfycbz24q3b1w7B_mi4NysPDlkqim8XGjXRGqFtrm1_ay8wfad8tCE4kcMG544D8-VMEIYoyg/exec",
      {
        method: "POST",
        body: JSON.stringify({
          prenom,
          nom,
          tel,
          email,
          adresse,
          prestation,
          message,
          mapLink
        })
      }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur API :", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
