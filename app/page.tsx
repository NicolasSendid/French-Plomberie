"use client"

import { useState } from "react"
import {
Phone,
Camera,
Send,
MapPin,
Star,
MessageCircle
} from "lucide-react"

export default function Home(){

const [status,setStatus] = useState("idle")

const [formData,setFormData] = useState({
prenom:"",
nom:"",
tel:"",
mail:"",
adresse:"",
prestation:"",
gps:""
})

const [photos,setPhotos] = useState<File[]>([])

const handlePhotos=(e:any)=>{
const files = Array.from(e.target.files).slice(0,3)
setPhotos(files as File[])
}

const getGPS=()=>{

if("geolocation" in navigator){

navigator.geolocation.getCurrentPosition((pos)=>{

setFormData({
...formData,
gps:`${pos.coords.latitude},${pos.coords.longitude}`
})

})

}

}

const handleSubmit=async(e:any)=>{

e.preventDefault()

const data = new FormData()

Object.entries(formData).forEach(([k,v])=>{
data.append(k,v)
})

photos.forEach(photo=>{
data.append("photos",photo)
})

const res = await fetch("/api/send",{
method:"POST",
body:data
})

if(res.ok){

setStatus("success")

}else{

setStatus("error")

}

}

return(

<main className="min-h-screen bg-slate-50 pb-28">

{/* HEADER */}

<header className="bg-white border-b shadow-sm">

<div className="max-w-6xl mx-auto flex justify-between items-center p-6">

<div className="flex items-center gap-3">

<img
src="/logo.png"
className="w-12 h-12 object-contain"
/>

<div>

<p className="font-bold text-lg">
French<span className="text-blue-600">.</span>
</p>

<p className="text-xs text-gray-500">
Plomberie
</p>

</div>

</div>

<div className="flex gap-3">

<a
href="tel:0658908674"
className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2"
>

<Phone size={18}/>
Urgence

</a>

<a
href="https://wa.me/33658908674"
className="bg-green-500 text-white px-4 py-2 rounded-full flex items-center gap-2"
>

<MessageCircle size={18}/>
WhatsApp

</a>

</div>

</div>

</header>

{/* HERO */}

<section className="bg-blue-600 text-white py-16 text-center">

<h1 className="text-4xl font-extrabold mb-3">
Plombier intervention rapide
</h1>

<p>
Fuite • Chauffage • Cuisine • Salle de bain
</p>

</section>

{/* AVIS */}

<section className="max-w-6xl mx-auto px-6 py-12">

<h2 className="text-2xl font-bold mb-6 text-center">
Avis clients
</h2>

<div className="grid md:grid-cols-3 gap-6">

{[
"Intervention rapide et efficace",
"Plombier très professionnel",
"Travail propre et sérieux"
].map((avis,i)=>(

<div
key={i}
className="bg-white p-6 rounded-2xl shadow"
>

<div className="flex text-yellow-400 mb-2">

<Star/>
<Star/>
<Star/>
<Star/>
<Star/>

</div>

<p className="text-sm text-gray-600">
{avis}
</p>

</div>

))}

</div>

</section>

{/* FORMULAIRE */}

<section className="max-w-xl mx-auto px-6">

<form
onSubmit={handleSubmit}
className="bg-white p-8 rounded-3xl shadow-xl space-y-5"
>

<h2 className="text-xl font-bold">
Demande d'intervention
</h2>

<div className="grid grid-cols-2 gap-4">

<input
required
placeholder="Prénom"
className="p-4 bg-gray-100 rounded-xl"
onChange={(e)=>setFormData({...formData,prenom:e.target.value})}
/>

<input
required
placeholder="Nom"
className="p-4 bg-gray-100 rounded-xl"
onChange={(e)=>setFormData({...formData,nom:e.target.value})}
/>

</div>

<input
required
placeholder="Téléphone"
className="p-4 bg-gray-100 rounded-xl w-full"
onChange={(e)=>setFormData({...formData,tel:e.target.value})}
/>

<input
required
placeholder="Email"
className="p-4 bg-gray-100 rounded-xl w-full"
onChange={(e)=>setFormData({...formData,mail:e.target.value})}
/>

<input
required
placeholder="Adresse"
className="p-4 bg-gray-100 rounded-xl w-full"
onChange={(e)=>setFormData({...formData,adresse:e.target.value})}
/>

{/* GPS */}

<button
type="button"
onClick={getGPS}
className="flex items-center gap-2 text-sm text-blue-600"
>

<MapPin size={16}/>
Partager ma localisation

</button>

{/* PHOTOS */}

<label className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center gap-2 cursor-pointer">

<Camera size={18}/>
Ajouter photos

<input
type="file"
accept="image/*"
multiple
capture="environment"
className="hidden"
onChange={handlePhotos}
/>

</label>

<button
type="submit"
className="bg-slate-900 text-white w-full py-4 rounded-xl flex items-center justify-center gap-2 font-bold"
>

<Send size={18}/>
Envoyer

</button>

{status==="success" &&(
<p className="text-green-600 text-sm">
Votre demande a été envoyée
</p>
)}

{status==="error" &&(
<p className="text-red-600 text-sm">
Erreur lors de l'envoi
</p>
)}

</form>

</section>

{/* GOOGLE MAP */}

<section className="max-w-6xl mx-auto px-6 py-16">

<h2 className="text-2xl font-bold mb-6 text-center">
Zone d'intervention
</h2>

<div className="rounded-2xl overflow-hidden shadow">

<iframe
src="https://maps.google.com/maps?q=Amiens&t=&z=11&ie=UTF8&iwloc=&output=embed"
className="w-full h-96"
/>

</div>

</section>

{/* BOUTONS FLOTTANTS */}

<div className="fixed bottom-6 right-6 flex flex-col gap-3">

<a
href="tel:0658908674"
className="bg-red-600 text-white p-4 rounded-full shadow-xl"
>

<Phone/>

</a>

<a
href="https://wa.me/33658908674"
className="bg-green-500 text-white p-4 rounded-full shadow-xl"
>

<MessageCircle/>

</a>

</div>

</main>

)

}
