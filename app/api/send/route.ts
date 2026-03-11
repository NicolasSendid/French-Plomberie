import nodemailer from "nodemailer";

export async function POST(req: Request): Promise<Response> {
  try {
    // --- FormData ---
    const formData = await req.formData();

    const prenom = (formData.get("prenom") as string) || "";
    const nom = (formData.get("nom") as string) || "";
    const tel = (formData.get("tel") as string) || "";
    const email = (formData.get("email") as string) || "";
    const adresse = (formData.get("adresse") as string) || "";
    const prestation = (formData.get("prestation") as string) || "";
    const message = (formData.get("message") as string) || "";
    const latitude = formData.get("latitude") as string | null;
    const longitude = formData.get("longitude") as string | null;

    const mapLink = latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : "";

    // --- Photos ---
    const photos = formData.getAll("photos") as File[];

    const attachments = await Promise.all(
      photos.map(async (photo) => {
        // Filtrer fichiers vides
        if (!photo || photo.size === 0) return null;

        // Limite taille max 5Mo
        if (photo.size > 5 * 1024 * 1024) return null;

        const buffer = Buffer.from(await photo.arrayBuffer());

        // Si le type n'est pas défini, on force en JPEG
        const mimeType = photo.type.startsWith("image/") ? photo.type : "image/jpeg";

        return {
          filename: photo.name,
          content: buffer,
          contentType: mimeType,
        };
      })
    );

    const filteredAttachments = attachments.filter(Boolean);

    // --- Nodemailer ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

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

Notre équipe va vous contacter rapidement.

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
