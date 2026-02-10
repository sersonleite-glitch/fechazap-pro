export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

/**
 * Endpoint POST para criar assinatura (pré-aprovação) no Mercado Pago
 * 
 * Fluxo:
 * 1. Valida autenticação do usuário via Supabase
 * 2. Obtém dados do cliente autenticado
 * 3. Cria pré-aprovação (PreApproval) no Mercado Pago
 * 4. Persiste a assinatura no Supabase
 * 5. Retorna URL de confirmação para o cliente
 */
export async function POST(request: NextRequest) {
  try {
    // 1. Cria cliente Supabase para validar autenticação
    const supabase = await createClient()

    // 2. Obtém dados da sessão do usuário autenticado
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    // Valida se usuário está autenticado
    if (error || !user) {
      return NextResponse.json(
        { error: 'Usuário não autenticado' },
        { status: 401 }
      )
    }

    const { MercadoPagoConfig, PreApproval } = await import("mercadopago");

    // Configura o SDK do Mercado Pago
    const client = new MercadoPagoConfig({
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
    })

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const preapprovalBody = {
      reason: 'Plano Teste FechaZap',
      payer_email: 'testuser936135278945979556@testuser.com',
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: 29.9,
        currency_id: 'BRL',
      },
      back_url: `${baseUrl}/app`,
      external_reference: 'fechazap-test-001',
    }

    const preapproval = new PreApproval(client)
    
    console.log('📦 Payload Mercado Pago:', JSON.stringify(preapprovalBody, null, 2))
    
    try {
      const response = await preapproval.create({ body: preapprovalBody })

      return NextResponse.json({
        init_point: response.init_point,
        initPoint: response.init_point,
      })
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('❌ Mercado Pago ERRO REAL:', error.cause ?? error.message)
        throw error
      }

      console.error('❌ Mercado Pago ERRO REAL:', error)
      throw new Error('Erro desconhecido no Mercado Pago')
    }
  } catch (error) {
    console.error('Erro ao processar assinatura:', error)
    return NextResponse.json(
      {
        error: 'Erro ao processar assinatura',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    )
  }
}
