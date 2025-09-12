"use client"
import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"

export default function AddProduct() {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")
  const [files, setFiles] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [colors, setColors] = useState([])
  const [sizes, setSizes] = useState([])
  const [type, setType] = useState("") 
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [showColorOptions, setShowColorOptions] = useState(false)
  const [newprice, setnewprice] = useState("")

  const colorOptions = [
    "white","black","red","blue","green","yellow","orange","purple",
    "pink","brown","gray","beige","cyan","magenta","lime","indigo",
    "violet","turquoise","gold","silver","navy","maroon","olive","teal"
  ]
  const sizeOptions = ["S", "M", "L", "XL"]
  const typeOptions = ["dress", "casual"]

  const handleCheckboxChange = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((v) => v !== value))
    } else {
      setState([...state, value])
    }
  }

  const resizeAndPreviewFiles = async (selectedFiles) => {
    const resizedFiles = []
    const previews = []

    for (let file of selectedFiles) {
      const img = new Image()
      const reader = new FileReader()

      const resizedFile = await new Promise((resolve) => {
        reader.onload = (e) => { img.src = e.target.result }

        img.onload = () => {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          const targetWidth = 768
          const targetHeight = 950
          canvas.width = targetWidth
          canvas.height = targetHeight
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
          canvas.toBlob((blob) => {
            const newFile = new File([blob], file.name, { type: file.type })
            resolve(newFile)
            previews.push(URL.createObjectURL(newFile))
          }, file.type)
        }

        reader.readAsDataURL(file)
      })

      resizedFiles.push(resizedFile)
    }

    setFiles(resizedFiles)
    setPreviewUrls(previews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (!name || !price || colors.length === 0 || sizes.length === 0 || !type || files.length === 0) {
      setMessage("Please fill in all required fields.")
      setLoading(false)
      return
    }

    try {
      let pictureUrls = []

      for (let file of files) {
        const fileName = `${Date.now()}-${file.name.replace(/\s/g, "-")}`

        // رفع الصورة
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("products")
          .upload(fileName, file)

        if (uploadError) {
          console.error("Storage upload error:", uploadError)
          continue
        }

        // الحصول على public URL
        const { data: urlData, error: urlError } = supabase.storage
          .from("products")
          .getPublicUrl(fileName)

        if (urlError) {
          console.error("Get public URL error:", urlError)
          continue
        }

        pictureUrls.push(urlData.publicUrl)
      }

      const product = {
        name,
        price: Number(price),
        newprice: newprice ? Number(newprice) : null,
        description: description || "",
        pictures: pictureUrls,
        colors,
        sizes,
        type,
        owner_id: "dev-user-123"
      }

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(product),
      })

      const result = await res.json()

      if (res.ok) {
        setMessage("Product added successfully!")
        setName("")
        setPrice("")
        setnewprice("")
        setDescription("")
        setFiles([])
        setPreviewUrls([])
        setColors([])
        setSizes([])
        setType("")
      } else {
        setMessage(result.error || "Error adding product")
      }

      console.log("Response:", result)
    } catch (err) {
      console.error(err)
      setMessage(err.message)
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      <input type="text" placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="p-2 border rounded-md w-full" required />
      <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} className="p-2 border rounded-md w-full" required />
      <input type="number" placeholder="New Price (optional)" value={newprice} onChange={(e) => setnewprice(e.target.value)} className="p-2 border rounded-md w-full" />
      <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className="p-2 border rounded-md w-full" />

      {/* Colors */}
      <div className="relative">
        <button type="button" onClick={() => setShowColorOptions(!showColorOptions)} className="w-full border p-2 rounded-md text-left flex justify-between items-center">
          Colors (required) <span>{showColorOptions ? "▲" : "▼"}</span>
        </button>
        {showColorOptions && (
          <div className="mt-2 border rounded-md p-2 flex flex-wrap gap-2 max-h-60 overflow-y-auto">
            {colorOptions.map((color) => (
              <label key={color} className="flex items-center gap-2 cursor-pointer transition-all hover:scale-105 p-1 rounded">
                <input type="checkbox" className="w-4 h-4 accent-purple-600" checked={colors.includes(color)} onChange={() => handleCheckboxChange(color, colors, setColors)} />
                <span className="w-5 h-5 rounded border" style={{ backgroundColor: color }}></span>
                <span className="capitalize">{color}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Sizes */}
      <div>
        <p className="mb-2 font-semibold">Sizes (required):</p>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <button key={size} type="button" onClick={() => handleCheckboxChange(size, sizes, setSizes)} className={`px-3 py-1 rounded-full transition-all duration-300 ${sizes.includes(size) ? "bg-[#b09dc1da]" : "hover:bg-[#b09dc1da]"}`}>{size}</button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div>
        <p className="mb-2 font-semibold">Type (required):</p>
        <div className="flex flex-wrap gap-2">
          {typeOptions.map((t) => (
            <button key={t} type="button" onClick={() => setType(t)} className={`px-3 py-1 rounded-full transition-all duration-300 ${type === t ? "bg-[#b09dc1da]" : "hover:bg-[#b09dc1da]"}`}>{t}</button>
          ))}
        </div>
      </div>

      {/* Images */}
      <input type="file" multiple accept="image/*" onChange={(e) => resizeAndPreviewFiles([...e.target.files])} className="border p-2 rounded-md" required />
      {previewUrls.length > 0 && (
        <div className="flex gap-2 flex-wrap mt-2">
          {previewUrls.map((url, i) => (
            <img key={i} src={url} alt={`preview-${i}`} className="w-24 h-32 object-cover rounded-md" />
          ))}
        </div>
      )}

      <button type="submit" disabled={loading} className="mt-3 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 transition">
        {loading ? "Adding..." : "Add Product"}
      </button>

      {message && <p className="mt-2 text-center text-gray-600">{message}</p>}
    </form>
  )
}
