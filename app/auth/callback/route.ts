import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

/**
 * Route Handler para processar o callback do Magic Link
 * 
 * Quando o usuário clica no link mágico no email, o Supabase redireciona
 * para esta rota com um código na URL. Este código é trocado por uma sessão válida.
 */
export async function GET(request: Request) {
  try {
    // Extrai os parâmetros da URL
    const { searchParams } = new URL(request.url)
    
    // Obtém o código de autenticação enviado pelo Supabase
    const code = searchParams.get('code')

    // Valida se o código foi fornecido
    if (!code) {
      // Redireciona para login com erro se não houver código
      return NextResponse.redirect(
        new URL('/auth/login?error=missing_code', request.url)
      )
    }

    // Cria o cliente Supabase
    const supabase = await createClient()

    // Troca o código por uma sessão válida
    // Isso cria automaticamente os cookies de sessão
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    // Verifica se houve erro na troca do código
    if (error) {
      console.error('Erro ao trocar código por sessão:', error)
      return NextResponse.redirect(
        new URL('/auth/login?error=invalid_code', request.url)
      )
    }

    // Autenticação bem-sucedida! Redireciona para a área logada
    // Você pode mudar '/app' para qualquer rota protegida do seu aplicativo
    return NextResponse.redirect(new URL('/app', request.url))
  } catch (error) {
    console.error('Erro no callback de autenticação:', error)
    return NextResponse.redirect(
      new URL('/auth/login?error=server_error', request.url)
    )
  }
}
