import nodemailer from "nodemailer";

export async function POST(req) {

try{

const formData = await req.formData();

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

if(latitude && longitude){
mapLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/* récupération des photos */

const photos = formData.getAll("photos");

/* configuration mail */

const transporter = nodemailer.createTransport({

service:"gmail",

auth:{
user:process.env.EMAIL_USER,
pass:process.env.EMAIL_PASS
}

});

/* préparation pièces jointes */

const attachments = await Promise.all(

photos.map(async(photo)=>{

const buffer = Buffer.from(await photo.arrayBuffer());

return{
filename:photo.name,
content:buffer
};

})

);

/* email plombier */

await transporter.sendMail({

from:process.env.EMAIL_USER,

to:"frenchplomberie@gmail.com",

subject:"🚰 Nouvelle demande plomberie",

text:`
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

attachments

});

/* accusé réception client */

if(email){

await transporter.sendMail({

from:process.env.EMAIL_USER,

to:email,

subject:"Votre demande plomberie a bien été reçue",

text:`
Bonjour ${prenom},

Merci pour votre demande.

Nous avons bien reçu votre message concernant :

${prestation}

Un plombier vous contactera très rapidement.

French Plomberie
📞 06 58 90 86 74

`

});

}

return Response.json({success:true});

}catch(error){

console.error(error);

return Response.json({success:false},{status:500});

}

}
