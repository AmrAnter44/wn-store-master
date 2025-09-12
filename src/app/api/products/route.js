import { supabase } from "@/lib/supabaseClient"
import { supabaseServer } from "@/lib/supabaseServer";



export async function POST(req) {
  try {
    const body = await req.json()
    console.log("Body received:", body) // للتأكد من البيانات

    const { data, error } = await supabase.from("products").insert([body])
    if (error) {
      console.error("Insert error:", error)
      return new Response(JSON.stringify({ error: error.message }), { status: 400 })
    }

    return new Response(JSON.stringify(data), { status: 200 })
  } catch (err) {
    console.error("API error:", err)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 })
  }
}
