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

    let mapLink = "";

    if (latitude && longitude) {
      mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    const transporter = nodemailer.createTransport({

      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }

    });

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif"
    ];

    const attachments = await Promise.all(

      photos.slice(0,3).map(async (photo) => {

        if (!photo || photo.size === 0) return null;

        if (photo.size > 8 * 1024 * 1024) {
          console.log("Photo trop lourde ignorée");
          return null;
        }

        let mimeType = photo.type;

        if (!allowedTypes.includes(mimeType)) {
          mimeType = "image/jpeg";
        }

        let filename = photo.name;

        const ext = filename.split(".").pop()?.toLowerCase();

        if (ext === "heic" || ext === "heif") {
          filename = filename.replace(/\.[^/.]+$/, ".jpg");
          mimeType = "image/jpeg";
        }

        const buffer = Buffer.from(await photo.arrayBuffer());

        return {
          filename,
          content: buffer,
          contentType: mimeType
        };

      })

    );

    const filteredAttachments = attachments.filter(Boolean);

    // EMAIL PLOMBIER

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

    // EMAIL CLIENT

    if (email) {

      await transporter.sendMail({

        from: `"French Plomberie" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Votre demande plomberie a bien été reçue",

        text: `

Bonjour ${prenom} ${nom},

Nous avons bien reçu votre demande.

Notre équipe va vous recontacter rapidement.

Récapitulatif :

Nom : ${prenom} ${nom}
Téléphone : ${tel}
Adresse : ${adresse}

Prestation :
${prestation}

Message :
${message}

Merci pour votre confiance.

French Plomberie
📞 06 58 90 86 74

        `

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
