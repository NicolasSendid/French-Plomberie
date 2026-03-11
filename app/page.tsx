"use client"

import { useState } from "react"
import {
Phone,
Wrench,
Flame,
Bath,
Utensils,
Send,
Camera,
Check
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

const prestations = [

{ id:"depannage",label:"Dépannage fuite",icon:<Wrench size={24}/> },
{ id:"chauffage",label:"Chaudière / chauffage",icon:<Flame size={24}/> },
{ id:"cuisine",label:"Installation cuisine",icon:<Utensils size={24}/> },
{ id:"sdb",label:"Salle de bain",icon:<Bath size={24}/> }

]

const handlePhotos=(e:any)=>{
const files = Array.from(e.target.files).slice(0,3)
setPhotos(files as File[])
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

<main className="min-h-screen bg-[#F7F8FA] pb-28">

{/* HEADER */}

<header className="bg-white border-b">

<div className="max-w-5xl mx-auto flex justify-between items-center p-6">

<div className="flex items-center gap-3">

<img
src="/logo.png"
className="w-9 h-9 object-contain"
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

<section className="max-w-5xl mx-auto px-6 py-16 text-center">

<h1 className="text-4xl font-extrabold mb-3">
Plombier disponible rapidement
</h1>

<p className="text-gray-500 mb-8">
Dépannage • Chauffage • Cuisine • Salle de bain
</p>

</section>

{/* FORM */}

<section className="max-w-xl mx-auto px-6">

<form
onSubmit={handleSubmit}
className="bg-white rounded-3xl shadow-lg p-8 space-y-6"
>

<h2 className="text-xl font-bold">
Demande d'intervention
</h2>

<div className="grid grid-cols-2 gap-4">

<input
required
placeholder="Prénom"
className="p-4 rounded-xl bg-gray-100"
/>

<input
required
placeholder="Nom"
className="p-4 rounded-xl bg-gray-100"
/>

</div>

<input
required
placeholder="Téléphone"
className="p-4 rounded-xl bg-gray-100 w-full"
/>

<input
required
placeholder="Email"
className="p-4 rounded-xl bg-gray-100 w-full"
/>

<input
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
${active?"border-blue-600 bg-blue-50":"border-gray-200"}
`}
>

<div className="text-blue-600">
{p.icon}
</div>

<span className="text-sm text-center">
{p.label}
</span>

{active && <Check size={16}/>}

</button>

)

})}

</div>

</div>

{/* PHOTOS */}

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

<button
type="submit"
className="bg-black text-white w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold"
>

<Send size={18}/>
Envoyer la demande

</button>

{status==="success" &&(
<p className="text-green-600 text-sm">
Demande envoyée avec succès
</p>
)}

{status==="error" &&(
<p className="text-red-600 text-sm">
Erreur lors de l'envoi
</p>
)}

</form>

</section>

{/* CALL FLOAT */}

<a
href="tel:0658908674"
className="fixed bottom-6 right-6 bg-red-600 text-white p-4 rounded-full shadow-xl"
>

<Phone/>

</a>

</main>

)

}
