"use client";

import { useState } from "react";

export default function Home() {

const [status,setStatus] = useState("");
const [prestation,setPrestation] = useState("");
const [photos,setPhotos] = useState<File[]>([]);
const [location,setLocation] = useState<{lat:number,lng:number}|null>(null);

function handlePhotos(e:React.ChangeEvent<HTMLInputElement>){

if(!e.target.files) return;

const files = Array.from(e.target.files).slice(0,3);

setPhotos(files);

}

function getLocation(){

navigator.geolocation.getCurrentPosition(

(pos)=>{

setLocation({

lat:pos.coords.latitude,
lng:pos.coords.longitude

});

},

()=>alert("Localisation impossible")

);

}

async function handleSubmit(e:React.FormEvent<HTMLFormElement>){

e.preventDefault();

const form = e.currentTarget;

const formData = new FormData(form);

photos.forEach((photo)=>{

formData.append("photos",photo);

});

if(location){

formData.append("latitude",location.lat.toString());
formData.append("longitude",location.lng.toString());

}

formData.append("prestation",prestation);

/* envoi vers route.ts (email + photos) */

const res = await fetch("/api/send",{

method:"POST",
body:formData

});

/* préparation JSON pour Google Sheets */

const data = {

prenom:formData.get("prenom"),
nom:formData.get("nom"),
tel:formData.get("tel"),
email:formData.get("email"),
adresse:formData.get("adresse"),
prestation:prestation,
message:formData.get("message"),
rgpd:formData.get("rgpd") ? true : false

};

/* envoi Google Sheets */

await fetch("TON_URL_APPS_SCRIPT",{

method:"POST",
body:JSON.stringify(data)

});

/* WhatsApp */

const whatsappMessage = `Nouvelle demande plomberie

Nom : ${data.prenom} ${data.nom}

Téléphone : ${data.tel}

Adresse : ${data.adresse}

Prestation : ${data.prestation}

Message :
${data.message}

${location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : ""}

`;

window.open(

`https://wa.me/33658908674?text=${encodeURIComponent(whatsappMessage)}`,
"_blank"

);

if(res.ok){

setStatus("Demande envoyée");

form.reset();
setPhotos([]);
setPrestation("");
setLocation(null);

}else{

setStatus("Erreur lors de l'envoi");

}

}

return(

<div style={{maxWidth:700,margin:"auto",padding:30,fontFamily:"Arial"}}>

<div style={{textAlign:"center"}}>

<img src="/logo.png" style={{width:140}} />

</div>

<h1 style={{textAlign:"center"}}>

Plombier disponible rapidement

</h1>

<div style={{textAlign:"center",marginBottom:20}}>

<a

href="tel:0658908674"

style={{

background:"red",
color:"white",
padding:"12px 20px",
borderRadius:8,
textDecoration:"none",
fontWeight:"bold"

}}

>

📞 Appeler maintenant

</a>

</div>

<form onSubmit={handleSubmit}>

<input name="prenom" placeholder="Prénom" required />

<input name="nom" placeholder="Nom" required />

<input name="tel" placeholder="Téléphone" required />

<input name="email" placeholder="Email" />

<input name="adresse" placeholder="Adresse intervention" required />

<h3>Prestation</h3>

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>

<button type="button" onClick={()=>setPrestation("Dépannage fuite")}>

🔧 Dépannage fuite

</button>

<button type="button" onClick={()=>setPrestation("Chauffage / ballon")}>

🔥 Chauffage / ballon

</button>

<button type="button" onClick={()=>setPrestation("Cuisine")}>

🍳 Cuisine

</button>

<button type="button" onClick={()=>setPrestation("Salle de bain")}>

🛁 Salle de bain

</button>

</div>

<h3 style={{marginTop:20}}>Photos (max 3)</h3>

<input

type="file"
accept="image/*"
multiple
onChange={handlePhotos}

/>

<button

type="button"
onClick={getLocation}
style={{marginTop:10}}

>

📍 Ajouter ma position

</button>

<textarea

name="message"
placeholder="Décrivez votre problème"
style={{width:"100%",marginTop:20}}

></textarea>

<div style={{marginTop:15,fontSize:14}}>

<label>

<input type="checkbox" name="rgpd" required />

 J'accepte l'utilisation de mes données pour traiter ma demande.

</label>

</div>

<button

type="submit"
style={{

marginTop:20,
width:"100%",
padding:14,
background:"black",
color:"white",
border:"none",
borderRadius:6

}}

>

Envoyer la demande

</button>

</form>

<p style={{textAlign:"center",marginTop:20}}>

{status}

</p>

</div>

);

}
