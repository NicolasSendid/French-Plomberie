"use client";

import { useState } from "react";

export default function Home() {

const [status, setStatus] = useState("");
const [prestation, setPrestation] = useState("");
const [photos, setPhotos] = useState<File[]>([]);
const [location, setLocation] = useState<{lat:number,lng:number} | null>(null);

function handlePhotos(e: React.ChangeEvent<HTMLInputElement>) {

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

async function handleSubmit(e: React.FormEvent<HTMLFormElement>){

e.preventDefault();

const form = e.currentTarget;

const formData = new FormData(form);

const data = {

prenom:formData.get("prenom"),
nom:formData.get("nom"),
tel:formData.get("tel"),
email:formData.get("email"),
adresse:formData.get("adresse"),
prestation:prestation,
message:formData.get("message"),
rgpd:formData.get("rgpd") ? true : false,
latitude:location?.lat || "",
longitude:location?.lng || ""

};

try{

const res = await fetch("https://script.google.com/macros/s/AKfycbz24q3b1w7B_mi4NysPDlkqim8XGjXRGqFtrm1_ay8wfad8tCE4kcMG544D8-VMEIYoyg/exec",{

method:"POST",
body:JSON.stringify(data)

});

if(res.ok){

setStatus("Demande envoyée");

const whatsappMessage = `Nouvelle demande plomberie

Nom : ${data.prenom} ${data.nom}

Téléphone : ${data.tel}

Adresse : ${data.adresse}

Prestation : ${data.prestation}

Message :
${data.message}

${location ? `https://www.google.com/maps?q=${location.lat},${location.lng}` : ""}`;

window.open(
`https://wa.me/33658908674?text=${encodeURIComponent(whatsappMessage)}`,
"_blank"
);

form.reset();
setPhotos([]);
setPrestation("");
setLocation(null);

}else{

setStatus("Erreur lors de l'envoi");

}

}catch{

setStatus("Erreur lors de l'envoi");

}

}

return (

<div style={{maxWidth:700,margin:"auto",padding:30,fontFamily:"Arial"}}>

<h1 style={{textAlign:"center"}}>

Artisan Plombier de proximité

</h1>

<form onSubmit={handleSubmit}>

<input name="prenom" placeholder="Prénom" required />

<input name="nom" placeholder="Nom" required />

<input name="tel" placeholder="Téléphone" required />

<input name="email" placeholder="Email" />

<input name="adresse" placeholder="Adresse" required />

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

<h3>Photos (max 3)</h3>

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

Ajouter ma position

</button>

<textarea
name="message"
placeholder="Décrivez votre problème"
style={{width:"100%",marginTop:20}}
/>

<div style={{marginTop:20}}>

<label>

<input type="checkbox" name="rgpd" required />

 J'accepte l'utilisation de mes données pour le traitement de ma demande.

</label>

</div>

<button
type="submit"
style={{marginTop:20,padding:12,width:"100%"}}
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
