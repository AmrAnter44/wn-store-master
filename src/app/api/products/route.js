import { supabaseServer } from "@/lib/supabaseClient"

export async function POST(req) {
  try {
    const body = await req.json()

const { data, error } = await supabaseServer()
  .from("products")
  .insert([body])
  .select()
  .single()

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
