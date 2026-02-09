import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

/**
 * Endpoint POST para autenticação via Magic Link
 * 
 * Recebe um email e envia um link mágico para o usuário.
 * O link contém um código que será processado na rota de callback.
 */
export async function POST(request: Request) {
  try {
    // Extrai o email do corpo da requisição
    const { email } = await request.json()

    // Valida se o email foi fornecido
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email é obrigatório' },
        { status: 400 }
      )
    }

    // Cria o cliente Supabase
    const supabase = await createClient()

    // Envia o magic link para o email do usuário
    // O redirectTo especifica para onde o usuário será redirecionado após clicar no link
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // URL de callback que processará o código de autenticação
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`,
      },
    })

    // Verifica se houve erro ao enviar o magic link
    if (error) {
      console.error('Erro ao enviar magic link:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Retorna sucesso
    return NextResponse.json({
      success: true,
      message: 'Magic link enviado! Verifique seu email.',
    })
  } catch (error) {
    console.error('Erro no endpoint de login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
