"use client";

import { useState, useEffect } from "react";

export default function Home() {

const [status,setStatus]=useState("");
const [prestation,setPrestation]=useState("");
const [photos,setPhotos]=useState([]);
const [location,setLocation]=useState(null);
const [history,setHistory]=useState([]);
const [showInstall,setShowInstall]=useState(false);
const [deferredPrompt,setDeferredPrompt]=useState(null);

useEffect(()=>{

const stored = localStorage.getItem("demandes");
if(stored){
setHistory(JSON.parse(stored));
}

window.addEventListener("beforeinstallprompt",(e)=>{
e.preventDefault();
setDeferredPrompt(e);
setShowInstall(true);
});

},[]);

const installApp=async()=>{

if(!deferredPrompt) return;

deferredPrompt.prompt();
await deferredPrompt.userChoice;

};

/* GEOLOCALISATION */

const getLocation=()=>{

navigator.geolocation.getCurrentPosition((pos)=>{

const coords={
lat:pos.coords.latitude,
lng:pos.coords.longitude
};

setLocation(coords);

},()=>{
alert("Impossible d'obtenir la localisation");
});

};

/* PHOTOS */

const handlePhotos=(e)=>{

const files=Array.from(e.target.files).slice(0,3);

setPhotos(files);

};

/* ENVOI FORMULAIRE */

const handleSubmit=async(e)=>{

e.preventDefault();

const formData=new FormData(e.target);

formData.append("prestation",prestation);

if(location){
formData.append("latitude",location.lat);
formData.append("longitude",location.lng);
}

photos.forEach((photo)=>{
formData.append("photos",photo);
});

try{

const response=await fetch("/api/send",{
method:"POST",
body:formData
});

if(response.ok){

setStatus("✅ Demande envoyée !");

const newHistory=[...history,{
date:new Date().toLocaleString(),
prestation
}];

setHistory(newHistory);
localStorage.setItem("demandes",JSON.stringify(newHistory));

e.target.reset();
setPhotos([]);

}else{

setStatus("❌ Erreur lors de l'envoi");

}

}catch{

setStatus("❌ Impossible d'envoyer la demande");

}

};

return(

<div style={{
maxWidth:"700px",
margin:"auto",
padding:"30px",
fontFamily:"Arial"
}}>

<div style={{textAlign:"center"}}>
<img src="/logo.png" style={{width:"140px"}}/>
</div>

<h1 style={{textAlign:"center"}}>
Plombier disponible rapidement
</h1>

<p style={{textAlign:"center",color:"#555"}}>
Dépannage • Chauffage • Cuisine • Salle de bain
</p>

<form onSubmit={handleSubmit} style={{
background:"#f9f9f9",
padding:"25px",
borderRadius:"10px"
}}>

<h2>Vos informations</h2>

<input name="prenom" placeholder="Prénom" required />
<input name="nom" placeholder="Nom" required />
<input name="tel" placeholder="Téléphone" required />
<input name="email" placeholder="Email" />
<input name="adresse" placeholder="Adresse intervention" required />

{/* PRESTATIONS */}

<h3 style={{marginTop:"20px"}}>Prestation</h3>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"10px"
}}>

<button type="button"
onClick={()=>setPrestation("depannage")}
style={{
padding:"15px",
borderRadius:"8px",
border:prestation==="depannage"?"2px solid #0070f3":"1px solid #ccc"
}}>
🔧 Dépannage fuite
</button>

<button type="button"
onClick={()=>setPrestation("chauffage")}
style={{
padding:"15px",
borderRadius:"8px",
border:prestation==="chauffage"?"2px solid #0070f3":"1px solid #ccc"
}}>
🔥 Chauffage
</button>

<button type="button"
onClick={()=>setPrestation("cuisine")}
style={{
padding:"15px",
borderRadius:"8px",
border:prestation==="cuisine"?"2px solid #0070f3":"1px solid #ccc"
}}>
🍳 Cuisine
</button>

<button type="button"
onClick={()=>setPrestation("sdb")}
style={{
padding:"15px",
borderRadius:"8px",
border:prestation==="sdb"?"2px solid #0070f3":"1px solid #ccc"
}}>
🛁 Salle de bain
</button>

</div>

{/* PHOTOS */}

<h3 style={{marginTop:"20px"}}>Photos du problème</h3>

<input
type="file"
multiple
accept="image/*"
onChange={handlePhotos}
/>

{photos.length>0 &&(

<div style={{display:"flex",gap:"10px",marginTop:"10px"}}>

{photos.map((photo,i)=>{

const url=URL.createObjectURL(photo);

return(
<img
key={i}
src={url}
style={{
width:"70px",
height:"70px",
objectFit:"cover",
borderRadius:"6px"
}}
/>
);

})}

</div>

)}

{/* GEOLOCALISATION */}

<button
type="button"
onClick={getLocation}
style={{
marginTop:"15px",
padding:"10px",
background:"#eee",
border:"none",
borderRadius:"6px"
}}
>
📍 Ajouter ma position
</button>

{location &&(

<p style={{fontSize:"13px",color:"#666"}}>
Position enregistrée
</p>

)}

<textarea
name="message"
placeholder="Décrivez votre problème"
style={{
width:"100%",
marginTop:"20px",
padding:"10px",
borderRadius:"6px"
}}
/>

<button type="submit" style={{
marginTop:"25px",
width:"100%",
padding:"14px",
background:"black",
color:"white",
border:"none",
borderRadius:"6px"
}}>
Envoyer la demande
</button>

</form>

<p style={{textAlign:"center",marginTop:"20px"}}>
{status}
</p>

{/* HISTORIQUE */}

{history.length>0 &&(

<div style={{marginTop:"40px"}}>

<h3>Historique des demandes</h3>

{history.map((h,i)=>(
<div key={i} style={{
padding:"10px",
borderBottom:"1px solid #ddd"
}}>
{h.date} — {h.prestation}
</div>
))}

</div>

)}

{/* BOUTON URGENCE */}

<a
href="tel:0658908674"
style={{
position:"fixed",
bottom:"25px",
right:"25px",
background:"red",
color:"white",
width:"65px",
height:"65px",
borderRadius:"50%",
display:"flex",
alignItems:"center",
justifyContent:"center",
fontSize:"28px",
textDecoration:"none",
boxShadow:"0 4px 12px rgba(0,0,0,0.3)"
}}
>
📞
</a>

</div>

);

}
