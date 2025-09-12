import { supabase } from "@/lib/supabaseClient"

export async function DELETE(req, { params }) {
  const { id } = params;

  if (!id) {
    return new Response(JSON.stringify({ error: "Product ID is required" }), { status: 400 });
  }

  const { data, error } = await supabase.from("products").delete().eq("id", id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Product deleted successfully", data }), { status: 200 });
}
