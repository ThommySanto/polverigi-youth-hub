import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  { auth: { persistSession: false } }
)

export async function POST(request: Request) {
  try {
    const { username, email, password } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Tutti i campi sono obbligatori.' }, { status: 400 })
    }

    const cleanUsername = username.trim().toLowerCase()
    const cleanEmail = email.trim().toLowerCase()

    // 1. Crea l'utente su Supabase Auth con l'email reale
    const { data, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { username: cleanUsername },
    })

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 })
    }

    const userId = data.user.id

    // 2. Salva il record nella tabella profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert([{ id: userId, username: cleanUsername, email: cleanEmail }])

    if (profileError) {
      await supabaseAdmin.auth.admin.deleteUser(userId) // Rollback di sicurezza se fallisce il profilo
      return NextResponse.json({ error: profileError.message }, { status: 400 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Errore interno del server.' }, { status: 500 })
  }
}