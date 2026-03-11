// /app/api/route/route.ts
import { google } from "googleapis";
import nodemailer from "nodemailer";

// Charge les credentials du service account pour Google Sheets
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const GOOGLE_CLIENT_EMAIL = process.env.GOOGLE_CLIENT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"); // Attention aux \n

export async function POST(req: Request): Promise<Response> {
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

    // PHOTOS
    const photos = formData.getAll("photos") as File[];
    const attachments = await Promise.all(
      photos.slice(0, 3).map(async (photo) => {
        if (!photo || photo.size === 0) return null;
        const buffer = Buffer.from(await photo.arrayBuffer());
        return { filename: photo.name, content: buffer, contentType: photo.type };
      })
    );
    const filteredAttachments = attachments.filter(Boolean);

    // --- Nodemailer ---
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Mail plombier
    await transporter.sendMail({
      from: `"French Plomberie" <${process.env.SMTP_USER}>`,
      to: "frenchplomberie@gmail.com",
      subject: "🚰 Nouvelle demande plomberie",
      text: `
Nouvelle demande client
Nom: ${prenom} ${nom}
Téléphone: ${tel}
Email: ${email}
Adresse: ${adresse}
Prestation: ${prestation}
Message: ${message}
RGPD: ${rgpd}
${mapLink ? "Localisation: " + mapLink : ""}
      `,
      attachments: filteredAttachments,
    });

    // Mail client
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

    // --- Google Sheets ---
    if (SHEET_ID && GOOGLE_CLIENT_EMAIL && GOOGLE_PRIVATE_KEY) {
      const auth = new google.auth.JWT(
        GOOGLE_CLIENT_EMAIL,
        undefined,
        GOOGLE_PRIVATE_KEY,
        ["https://www.googleapis.com/auth/spreadsheets"]
      );

      const sheets = google.sheets({ version: "v4", auth });

      await sheets.spreadsheets.values.append({
        spreadsheetId: SHEET_ID,
        range: "Feuille1!A1",
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [
            [
              new Date().toLocaleString(),
              prenom,
              nom,
              tel,
              email,
              adresse,
              prestation,
              message,
              rgpd,
              mapLink,
              photos.length,
            ],
          ],
        },
      });
    } else {
      console.warn("Variables Google Sheets non configurées.");
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Erreur route.ts:", error);
    return Response.json({ success: false, error: error.toString() }, { status: 500 });
  }
}
