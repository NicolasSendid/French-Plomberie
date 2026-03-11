import nodemailer from "nodemailer";

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();

    // Récupération des champs
    const prenom = formData.get("prenom") as string || "";
    const nom = formData.get("nom") as string || "";
    const tel = formData.get("tel") as string || "";
    const email = formData.get("email") as string || "";
    const adresse = formData.get("adresse") as string || "";
    const prestation = formData.get("prestation") as string || "";
    const message = formData.get("message") as string || "";
    const latitude = formData.get("latitude") as string || "";
    const longitude = formData.get("longitude") as string || "";

    const mapLink = latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : "";

    // Récupération et filtrage des photos
    const rawPhotos = formData.getAll("photos") as File[];
    const photos = rawPhotos.slice(0, 3).filter(p => p && p.size > 0);

    // Configuration du transporteur nodemailer
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
        try {
          let filename = photo.name;
          // Conversion HEIC/HEIF
          const ext = filename.split(".").pop()?.toLowerCase();
          if (ext === "heic" || ext === "heif") filename = filename.replace(/\.[^/.]+$/, ".jpg");

          const buffer = Buffer.from(await photo.arrayBuffer());
          return {
            filename,
            content: buffer,
            contentType: photo.type.startsWith("image/") ? photo.type : "image/jpeg",
          };
        } catch (err) {
          console.warn("Erreur conversion photo :", photo.name, err);
          return null;
        }
      })
    );

    const filteredAttachments = attachments.filter((a): a is NonNullable<typeof a> => a !== null);

    // --- Envoi email au plombier ---
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
    return Response.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
