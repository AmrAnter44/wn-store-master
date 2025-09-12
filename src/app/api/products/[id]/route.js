import { supabaseServer } from "@/lib/supabaseClient";

export async function GET(req) {
  const { data, error } = await supabaseServer().from("products").select("*"); // ✅ call the function
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  return new Response(JSON.stringify(data), { status: 200 });
}

export async function POST(req) {
  const body = await req.json();
  const { data, error } = await supabaseServer().from("products").insert([body]); // ✅ call the function
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 400 });
  return new Response(JSON.stringify(data), { status: 200 });
}
