import { createClient } from '@supabase/supabase-js'

// 🟢 للـ Client (يستخدم في الـ Components)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// 🟢 للـ Server (يستخدم في الـ API Routes, Server Components)
const supabaseServer = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export { supabase, supabaseServer }
