"use client"

import { useState } from "react"
import { Phone,Wrench,Flame,Bath,Utensils,Send,Camera,CheckCircle } from "lucide-react"

export default function Home(){

const [status,setStatus] = useState("idle")

const [formData,setFormData] = useState({
prenom:"",
nom:"",
tel:"",
mail:"",
adresse:"",
prestation:""
})

const [photos,setPhotos] = useState<File[]>([])

const prestations = [

{ id:"depannage",label:"Dépannage fuite",icon:<Wrench size={20}/> },
{ id:"chauffage",label:"Installation chauffage / chaudière",icon:<Flame size={20}/> },
{ id:"cuisine",label:"Installation cuisine",icon:<Utensils size={20}/> },
{ id:"sdb",label:"Installation salle de bain",icon:<Bath size={20}/> }

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

}

return(

<main className="min-h-screen bg-gray-50 pb-24">

<header className="bg-white shadow-sm">

<div className="max-w-4xl mx-auto flex justify-between items-center p-6">

<h1 className="font-bold text-lg">
French<span className="text-blue-600">.</span>Plomberie
</h1>

<a
href="tel:0658908674"
className="bg-red-600 text-white px-4 py-2 rounded-full flex items-center gap-2"
>

<Phone size={18}/>
Urgence

</a>

</div>

</header>

<section className="max-w-xl mx-auto p-6">

<form
onSubmit={handleSubmit}
className="bg-white p-8 rounded-2xl shadow space-y-5"
>

<h2 className="text-xl font-bold">
Demande d'intervention
</h2>

<div className="grid grid-cols-2 gap-4">

<input
required
placeholder="Prénom"
className="p-3 bg-gray-100 rounded"
value={formData.prenom}
onChange={(e)=>setFormData({...formData,prenom:e.target.value})}
/>

<input
required
placeholder="Nom"
className="p-3 bg-gray-100 rounded"
value={formData.nom}
onChange={(e)=>setFormData({...formData,nom:e.target.value})}
/>

</div>

<input
required
placeholder="Téléphone"
className="p-3 bg-gray-100 rounded w-full"
value={formData.tel}
onChange={(e)=>setFormData({...formData,tel:e.target.value})}
/>

<input
required
placeholder="Email"
className="p-3 bg-gray-100 rounded w-full"
value={formData.mail}
onChange={(e)=>setFormData({...formData,mail:e.target.value})}
/>

<input
required
placeholder="Adresse"
className="p-3 bg-gray-100 rounded w-full"
value={formData.adresse}
onChange={(e)=>setFormData({...formData,adresse:e.target.value})}
/>

<div className="space-y-2">

<p className="font-semibold text-sm">
Prestation
</p>

{prestations.map(p=>{

const active = formData.prestation===p.id

return(

<button
type="button"
key={p.id}
onClick={()=>setFormData({...formData,prestation:p.id})}
className={`w-full flex justify-between items-center p-3 border rounded
${active?"border-blue-500 bg-blue-50":"border-gray-200"}
`}
>

<div className="flex gap-2 items-center">

{p.icon}
<span>{p.label}</span>

</div>

{active && <CheckCircle size={18}/>}

</button>

)

})}

</div>

<div>

<label className="border-dashed border-2 p-6 rounded flex items-center justify-center gap-2 cursor-pointer">

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

</div>

<button
type="submit"
className="bg-black text-white w-full py-3 rounded flex items-center justify-center gap-2"
>

<Send size={18}/>
Envoyer

</button>

{status==="success" && (
<p className="text-green-600 text-sm">
Demande envoyée avec succès
</p>
)}

{status==="error" && (
<p className="text-red-600 text-sm">
Erreur lors de l'envoi
</p>
)}

</form>

</section>

</main>

)

}
