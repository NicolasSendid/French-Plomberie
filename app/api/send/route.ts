import nodemailer from "nodemailer";
import fetch from "node-fetch";
import sharp from "sharp";

export async function POST(req: Request): Promise<Response> {
  try {
    const formData = await req.formData();

    const prenom = (formData.get("prenom") as string) || "";
    const nom = (formData.get("nom") as string) || "";
    const tel = (formData.get("tel") as string) || "";
    const email = (formData.get("email") as string) || "";
    const adresse = (formData.get("adresse") as string) || "";
    const prestation = (formData.get("prestation") as string) || "";
    const message = (formData.get("message") as string) || "";
    const rgpd = (formData.get("rgpd") as string) === "on";
    const latitude = (formData.get("latitude") as string) || "";
    const longitude = (formData.get("longitude") as string) || "";

    const mapLink = latitude && longitude ? `https://www.google.com/maps?q=${latitude},${longitude}` : "";

    // --- Gestion des photos ---
    const photos = formData.getAll("photos") as File[];
    const attachments = await Promise.all(
      photos.slice(0, 3).map(async (photo) => {
        if (!photo || photo.size === 0 || photo.size > 5 * 1024 * 1024) return null;

        const ext = photo.name.split(".").pop()?.toLowerCase();
        const filename =
          ext === "heic" || ext === "heif"
            ? photo.name.replace(/\.[^/.]+$/, ".jpg")
            : photo.name;

        let buffer;
        try {
          buffer = Buffer.from(await photo.arrayBuffer());
          // compression
          buffer = await sharp(buffer)
            .jpeg({ quality: 80 })
            .toBuffer();
        } catch (err) {
          console.warn("Erreur conversion photo :", photo.name, err);
          return null;
        }

        return { filename, content: buffer, contentType: "image/jpeg" };
      })
    );

    const filteredAttachments = attachments.filter(Boolean);

    // --- Envoi mail plombier ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

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

    // GOOGLE SHEETS

    await fetch("https://script.google.com/macros/s/AKfycbz24q3b1w7B_mi4NysPDlkqim8XGjXRGqFtrm1_ay8wfad8tCE4kcMG544D8-VMEIYoyg/exec", {

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

    });

    return Response.json({ success: true });

  } catch (error) {

    console.error("Erreur API :", error);

    return Response.json(
      { success: false },
      { status: 500 }
    );

  }

}
