import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nom, prenom, tel, mail, adresse, prestations, gps } = body;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'frenchplomberie@gmail.com',
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const mailOptions = {
      from: 'frenchplomberie@gmail.com',
      to: 'frenchplomberie@gmail.com',
      subject: `Nouveau RDV : ${prenom} ${nom}`,
      text: `
        Nouveau message de l'app French Plomberie :
        
        Client : ${prenom} ${nom}
        Tél : ${tel}
        Email : ${mail}
        Adresse : ${adresse}
        Prestations : ${prestations.join(', ')}
        Coordonnées GPS : ${gps || 'Non fournies'}
      `,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: "Email envoyé" }, { status: 200 });
    
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Erreur envoi" }, { status: 500 });
  }
}
