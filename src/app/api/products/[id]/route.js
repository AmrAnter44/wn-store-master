import { supabaseServer } from '@/lib/supabaseClient'

export async function GET(req, { params }) {
  const { id } = params
  const { data, error } = await supabaseServer
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  return new Response(JSON.stringify(data), { status: 200 })
}
