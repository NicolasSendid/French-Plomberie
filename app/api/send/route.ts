import nodemailer from "nodemailer";

export async function POST(req) {
  try {
    const formData = await req.formData();

    // Récupération des champs
    const prenom = formData.get("prenom");
    const nom = formData.get("nom");
    const tel = formData.get("tel");
    const email = formData.get("email");
    const adresse = formData.get("adresse");
    const prestation = formData.get("prestation");
    const message = formData.get("message");
    const latitude = formData.get("latitude");
    const longitude = formData.get("longitude");

    let mapLink = "";
    if (latitude && longitude) {
      mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    // Récupération des photos
    const photos = formData.getAll("photos");

    // Création du transporteur SMTP
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Préparation des pièces jointes
    const attachments = await Promise.all(
      photos.map(async (photo) => {
        if (!photo || photo.size === 0) return null;
        if (photo.size > 5 * 1024 * 1024) return null; // ignore >5Mo

        // Correction HEIC/HEIF → JPG
        const ext = photo.name.split(".").pop().toLowerCase();
        const filename =
          ext === "heic" || ext === "heif"
            ? photo.name.replace(/\.[^/.]+$/, ".jpg")
            : photo.name;

        // Vérifie type MIME sinon force image/jpeg
        const mimeType = photo.type.startsWith("image/") ? photo.type : "image/jpeg";

        let buffer;
        try {
          buffer = Buffer.from(await photo.arrayBuffer());
        } catch (err) {
          console.warn("Erreur conversion photo :", photo.name, err);
          return null;
        }

        return {
          filename,
          content: buffer,
          contentType: mimeType,
        };
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
      attachments: filteredAttachments,
    });

    // --- Accusé réception client ---
    if (email) {
      await transporter.sendMail({
        from: `"French Plomberie" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Votre demande plomberie a bien été reçue",
        text: `
Bonjour ${prenom} ${nom},

Merci pour votre demande.

Nous avons bien reçu votre message concernant :

${prestation}

Notre équipe va vous recontacter rapidement.

French Plomberie
📞 06 58 90 86 74
        `,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur envoi email :", error);
    return Response.json({ success: false }, { status: 500 });
  }
}
