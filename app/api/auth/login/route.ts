import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function POST(request: Request) {
  console.log('[API] POST /api/auth/login - Iniciando')
  
  try {
    let body: { email?: unknown }

    try {
      body = await request.json()
      console.log('[API] Body recebido:', body)
    } catch {
      console.error('[API] Erro ao parsear body')
      return NextResponse.json(
        { error: 'Corpo da requisição inválido' },
        { status: 400 }
      )
    }

    const email =
      typeof body.email === 'string'
        ? body.email.trim()
        : ''

    if (!email) {
      console.error('[API] Email vazio ou inválido')
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    console.log('[API] Criando cliente Supabase')
    const supabase = await createClient()

    console.log('[API] Enviando OTP para:', email)
    console.log('[API] Redirect URL:', `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`)
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
      },
    })

    if (error) {
      console.error('[API] Erro Supabase:', error)
      return NextResponse.json(
        { error: error.message || 'Erro ao enviar magic link' },
        { status: 400 }
      )
    }

    console.log('[API] Magic link enviado com sucesso')
    return NextResponse.json(
      { success: true },
      { status: 200 }
    )
  } catch (err) {
    console.error('[API] Erro inesperado:', err)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
