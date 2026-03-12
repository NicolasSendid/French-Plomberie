import nodemailer from "nodemailer";

export async function POST(req: Request) {

  try {

    const formData = await req.formData();

    const prenom = formData.get("prenom");
    const nom = formData.get("nom");
    const tel = formData.get("tel");
    const email = formData.get("email");
    const adresse = formData.get("adresse");
    const prestation = formData.get("prestation");
    const message = formData.get("message");

    const photos = formData.getAll("photos");

    const transporter = nodemailer.createTransport({

      host: process.env.SMTP_HOST,
      port: 587,
      secure: false,

      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }

    });

    const attachments = await Promise.all(

      photos.map(async (photo:any) => {

        if (!photo || photo.size === 0) return null;

        const buffer = Buffer.from(await photo.arrayBuffer());

        return {
          filename: photo.name,
          content: buffer
        };

      })

    );

    const filtered = attachments.filter(Boolean);

    await transporter.sendMail({

      from: `"French Plomberie" <${process.env.SMTP_USER}>`,

      to: "frenchplomberie@gmail.com",

      subject: "🚰 Nouvelle demande plomberie",

      text: `
Nom : ${prenom} ${nom}
Téléphone : ${tel}
Email : ${email}

Adresse : ${adresse}

Prestation : ${prestation}

Message :
${message}
      `,

      attachments: filtered

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
