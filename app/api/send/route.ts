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
    const rgpd = formData.get("rgpd") ? "Oui" : "Non";
    const latitude = formData.get("latitude") as string | null;
    const longitude = formData.get("longitude") as string | null;

    const mapLink = latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : "";

    const photos = formData.getAll("photos") as File[];
    const attachments = await Promise.all(
      photos.slice(0, 3).map(async (photo) => {
        if (!photo || photo.size === 0) return null;
        const buffer = Buffer.from(await photo.arrayBuffer());
        return { filename: photo.name, content: buffer, contentType: photo.type };
      })
    );

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Email plombier
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
RGPD : ${rgpd}
${mapLink ? "Localisation : " + mapLink : ""}
      `,
      attachments: attachments.filter(Boolean),
    });

    // Accusé client
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
  } catch (err) {
    console.error("Erreur route.ts :", err);
    return Response.json({ success: false, error: err.toString() }, { status: 500 });
  }
}
