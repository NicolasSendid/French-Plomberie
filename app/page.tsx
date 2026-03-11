"use client";

import { useState, useEffect } from "react";

export default function Home() {

const [status,setStatus]=useState("");
const [prestation,setPrestation]=useState("");
const [showInstall,setShowInstall]=useState(false);
const [deferredPrompt,setDeferredPrompt]=useState(null);

useEffect(()=>{

window.addEventListener("beforeinstallprompt",(e)=>{
e.preventDefault();
setDeferredPrompt(e);
setShowInstall(true);
});

},[]);

const installApp=async()=>{

if(!deferredPrompt) return;

deferredPrompt.prompt();

const choice=await deferredPrompt.userChoice;

if(choice.outcome==="accepted"){
setShowInstall(false);
}

};

const handleSubmit=async(e)=>{

e.preventDefault();

const formData=new FormData(e.target);
const data=Object.fromEntries(formData.entries());

data.prestation=prestation;

try{

const response=await fetch("/api/send",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify(data)
});

if(response.ok){

setStatus("✅ Votre demande a bien été envoyée !");
e.target.reset();
setPrestation("");

}else{

setStatus("❌ Une erreur est survenue.");

}

}catch{

setStatus("❌ Impossible d'envoyer la demande.");

}

};

return(

<div style={{
maxWidth:"700px",
margin:"auto",
padding:"30px",
fontFamily:"Arial",
position:"relative"
}}>

{/* LOGO */}

<div style={{textAlign:"center",marginBottom:"20px"}}>
<img src="/logo.png" style={{width:"140px"}}/>
</div>

{/* TITRE */}

<h1 style={{textAlign:"center"}}>
Plombier disponible rapidement
</h1>

<p style={{
textAlign:"center",
color:"#555",
marginBottom:"30px"
}}>
Dépannage • Chauffage • Cuisine • Salle de bain
</p>

<form onSubmit={handleSubmit} style={{
background:"#f9f9f9",
padding:"25px",
borderRadius:"10px"
}}>

{/* CLIENT */}

<h2>Vos informations</h2>

<input name="prenom" placeholder="Prénom" required />
<input name="nom" placeholder="Nom" required />
<input name="tel" placeholder="Téléphone" required />
<input name="email" placeholder="Email" />
<input name="adresse" placeholder="Adresse intervention" required />

{/* PRESTATIONS */}

<h3 style={{marginTop:"25px"}}>Choisissez la prestation</h3>

<div style={{
display:"grid",
gridTemplateColumns:"1fr 1fr",
gap:"10px",
marginTop:"10px"
}}>

<button
type="button"
onClick={()=>setPrestation("depannage")}
style={{
padding:"15px",
borderRadius:"8px",
border:prestation==="depannage"?"2px solid #0070f3":"1px solid #ccc",
background:prestation==="depannage"?"#eef4ff":"white",
cursor:"pointer"
}}
>
🔧 Dépannage fuite
</button>

<button
type="button"
onClick={()=>setPrestation("chauffage")}
style={{
padding:"15px",
borderRadius:"8px",
border:prestation==="chauffage"?"2px solid #0070f3":"1px solid #ccc",
background:prestation==="chauffage"?"#eef4ff":"white"
}}
>
🔥 Chauffage / chaudière
</button>

<button
type="button"
onClick={()=>setPrestation("cuisine")}
style={{
padding:"15px",
borderRadius:"8px",
border:prestation==="cuisine"?"2px solid #0070f3":"1px solid #ccc",
background:prestation==="cuisine"?"#eef4ff":"white"
}}
>
🍳 Installation cuisine
</button>

<button
type="button"
onClick={()=>setPrestation("sdb")}
style={{
padding:"15px",
borderRadius:"8px",
border:prestation==="sdb"?"2px solid #0070f3":"1px solid #ccc",
background:prestation==="sdb"?"#eef4ff":"white"
}}
>
🛁 Salle de bain
</button>

</div>

{/* MESSAGE */}

<textarea
name="message"
placeholder="Décrivez votre problème..."
style={{
width:"100%",
marginTop:"20px",
padding:"10px",
borderRadius:"6px",
border:"1px solid #ccc"
}}
/>

{/* BOUTON */}

<button type="submit" style={{
marginTop:"25px",
width:"100%",
padding:"14px",
background:"black",
color:"white",
border:"none",
borderRadius:"6px",
fontSize:"16px"
}}>
Envoyer la demande
</button>

</form>

{/* STATUS */}

<p style={{
marginTop:"20px",
textAlign:"center",
fontWeight:"bold"
}}>
{status}
</p>

{/* URGENCE FLOAT */}

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
fontSize:"26px",
textDecoration:"none",
boxShadow:"0 4px 12px rgba(0,0,0,0.3)"
}}
>
📞
</a>

{/* INSTALL APP */}

{showInstall &&(

<div style={{
position:"fixed",
bottom:"20px",
left:"20px",
right:"20px",
background:"white",
padding:"15px",
borderRadius:"10px",
boxShadow:"0 4px 20px rgba(0,0,0,0.2)",
display:"flex",
justifyContent:"space-between",
alignItems:"center"
}}>

<div style={{fontSize:"14px"}}>
Installer l'application plomberie
</div>

<button
onClick={installApp}
style={{
background:"#0070f3",
color:"white",
border:"none",
padding:"8px 12px",
borderRadius:"6px"
}}
>
Installer
</button>

</div>

)}

</div>

);

}
