"use client"

import { useState,useEffect } from "react"
import {
Phone,
Wrench,
Flame,
Bath,
Utensils,
Send,
Camera,
Check,
X
} from "lucide-react"

export default function Home(){

const [formData,setFormData] = useState({
prenom:"",
nom:"",
tel:"",
mail:"",
adresse:"",
prestation:""
})

const [photos,setPhotos] = useState<File[]>([])
const [status,setStatus] = useState("idle")
const [showInstall,setShowInstall] = useState(false)
const [deferredPrompt,setDeferredPrompt] = useState<any>(null)

const prestations=[

{ id:"depannage",label:"Fuite / dépannage",icon:<Wrench size={28}/> },
{ id:"chauffage",label:"Chaudière / chauffage",icon:<Flame size={28}/> },
{ id:"cuisine",label:"Installation cuisine",icon:<Utensils size={28}/> },
{ id:"sdb",label:"Salle de bain",icon:<Bath size={28}/> }

]

/* INSTALL PWA */

useEffect(()=>{

window.addEventListener("beforeinstallprompt",(e:any)=>{

e.preventDefault()
setDeferredPrompt(e)
setShowInstall(true)

})

},[])

const installApp=async()=>{

if(!deferredPrompt) return

deferredPrompt.prompt()

const choice=await deferredPrompt.userChoice

if(choice.outcome==="accepted"){
setShowInstall(false)
}

}

/* PHOTOS */

const handlePhotos=(e:any)=>{

const files=Array.from(e.target.files).slice(0,3)

setPhotos(files as File[])

}

/* SUBMIT */

const handleSubmit=async(e:any)=>{

e.preventDefault()

setStatus("loading")

try{

const data=new FormData()

Object.entries(formData).forEach(([k,v])=>{
data.append(k,v)
})

photos.forEach(photo=>{
data.append("photos",photo)
})

const res=await fetch("/api/send",{
method:"POST",
body:data
})

if(res.ok){

setStatus("success")

setFormData({
prenom:"",
nom:"",
tel:"",
mail:"",
adresse:"",
prestation:""
})

setPhotos([])

}else{

setStatus("error")

}

}catch{

setStatus("error")

}

}

/* INPUT HANDLER */

const handleChange=(e:any)=>{

setFormData({
...formData,
[e.target.name]:e.target.value
})

}

return(

<main className="min-h-screen bg-[#F5F7FB] pb-32">

{/* HEADER */}

<header className="bg-white border-b sticky top-0 z-20">

<div className="max-w-5xl mx-auto flex justify-between items-center p-5">

<div className="flex items-center gap-3">

<img
src="/logo.png"
className="w-10 h-10 object-contain"
/>

<p className="font-bold text-lg">
French<span className="text-blue-600">.</span>Plomberie
</p>

</div>

<a
href="tel:0658908674"
className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold shadow"
>

<Phone size={18}/>
Urgence

</a>

</div>

</header>

{/* HERO */}

<section className="max-w-5xl mx-auto px-6 py-14 text-center">

<h1 className="text-4xl font-extrabold mb-3">
Plombier rapide et fiable
</h1>

<p className="text-gray-500">
Dépannage • Chauffage • Cuisine • Salle de bain
</p>

</section>

{/* FORMULAIRE */}

<section className="max-w-xl mx-auto px-6">

<form
onSubmit={handleSubmit}
className="bg-white rounded-3xl shadow-xl p-8 space-y-6"
>

<h2 className="text-xl font-bold">
Demande d'intervention
</h2>

<div className="grid grid-cols-2 gap-4">

<input
name="prenom"
value={formData.prenom}
onChange={handleChange}
required
placeholder="Prénom"
className="p-4 rounded-xl bg-gray-100"
/>

<input
name="nom"
value={formData.nom}
onChange={handleChange}
required
placeholder="Nom"
className="p-4 rounded-xl bg-gray-100"
/>

</div>

<input
name="tel"
value={formData.tel}
onChange={handleChange}
required
placeholder="Téléphone"
className="p-4 rounded-xl bg-gray-100 w-full"
/>

<input
name="mail"
value={formData.mail}
onChange={handleChange}
required
placeholder="Email"
className="p-4 rounded-xl bg-gray-100 w-full"
/>

<input
name="adresse"
value={formData.adresse}
onChange={handleChange}
required
placeholder="Adresse"
className="p-4 rounded-xl bg-gray-100 w-full"
/>

{/* PRESTATIONS */}

<div>

<p className="text-sm font-semibold mb-3">
Choisissez la prestation
</p>

<div className="grid grid-cols-2 gap-3">

{prestations.map(p=>{

const active=formData.prestation===p.id

return(

<button
type="button"
key={p.id}
onClick={()=>setFormData({...formData,prestation:p.id})}
className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition
${active?"border-blue-600 bg-blue-50":"border-gray-200 hover:bg-gray-50"}
`}
>

<div className="text-blue-600">
{p.icon}
</div>

<span className="text-sm text-center">
{p.label}
</span>

{active && <Check size={18}/>}

</button>

)

})}

</div>

</div>

{/* PHOTOS */}

<div>

<label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center gap-2 cursor-pointer">

<Camera size={18}/>
Ajouter photos

<input
type="file"
multiple
accept="image/*"
className="hidden"
onChange={handlePhotos}
/>

</label>

{photos.length>0 &&(

<div className="flex gap-2 mt-3">

{photos.map((photo,i)=>{

const url=URL.createObjectURL(photo)

return(

<img
key={i}
src={url}
className="w-16 h-16 object-cover rounded-lg"
/>

)

})}

</div>

)}

</div>

<button
type="submit"
className="bg-black text-white w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold hover:bg-gray-900"
>

<Send size={18}/>
Envoyer la demande

</button>

{/* STATUS */}

{status==="loading" &&(
<p className="text-sm text-gray-500">
Envoi en cours...
</p>
)}

{status==="success" &&(
<p className="text-green-600 text-sm">
Demande envoyée avec succès ✅
</p>
)}

{status==="error" &&(
<p className="text-red-600 text-sm">
Erreur lors de l'envoi ❌
</p>
)}

</form>

</section>

{/* BOUTON APPEL FLOTTANT */}

<a
href="tel:0658908674"
className="fixed bottom-6 right-6 bg-red-600 text-white p-5 rounded-full shadow-2xl hover:bg-red-700"
>

<Phone/>

</a>

{/* POPUP INSTALLATION APP */}

{showInstall &&(

<div className="fixed bottom-6 left-6 right-6 bg-white shadow-xl rounded-2xl p-5 flex items-center justify-between">

<p className="text-sm font-medium">
Installer l'application plomberie
</p>

<div className="flex gap-3">

<button
onClick={installApp}
className="bg-blue-600 text-white px-4 py-2 rounded-lg"
>

Installer

</button>

<button
onClick={()=>setShowInstall(false)}
className="p-2"
>

<X size={18}/>

</button>

</div>

</div>

)}

</main>

)

}
