import { createClient } from '@supabase/supabase-js'
import { MercadoPagoConfig, PreApproval } from 'mercadopago'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const mpClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!
})

const preApprovalClient = new PreApproval(mpClient)

function mapStatus(status: string) {
  switch (status) {
    case 'authorized':
      return 'active'
    case 'pending':
      return 'trial'
    case 'paused':
      return 'paused'
    case 'cancelled':
      return 'cancelled'
    case 'expired':
      return 'expired'
    default:
      return 'unknown'
  }
}

export async function processSubscriptionEvent(event: any) {
  console.log('🔄 Processando evento:', event)

  // 1️⃣ Validar tipo de evento
  if (event?.type !== 'preapproval') {
    console.log('❌ Tipo de evento inválido')
    return { success: false }
  }

  // 2️⃣ Extrair ID da assinatura
  const subscriptionId = event?.data?.id

  if (!subscriptionId) {
    console.log('❌ Evento sem subscription id')
    return { success: false }
  }

  console.log('📌 Subscription ID recebido:', subscriptionId)

  // 3️⃣ Buscar dados reais da assinatura no Mercado Pago
  let subscriptionData
  try {
    subscriptionData = await preApprovalClient.get({ id: subscriptionId })
    console.log('✅ Dados da assinatura obtidos:', subscriptionData)
  } catch (error) {
    console.log('❌ Erro ao buscar assinatura no Mercado Pago:', error)
    return { success: false }
  }

  if (!subscriptionData) {
    console.log('❌ Assinatura não encontrada')
    return { success: false }
  }

  // 4️⃣ Buscar subscription existente pelo provider_subscription_id
  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('id, customer_id')
    .eq('provider_subscription_id', subscriptionId)
    .single()

  if (!existingSubscription) {
    console.log('❌ Subscription não encontrada no banco')
    return { success: false }
  }

  console.log('📌 Subscription existente encontrada:', existingSubscription.id)

  // 5️⃣ Preparar dados para atualização
  const updateData: any = {
    status: mapStatus(subscriptionData.status),
    current_period_end: subscriptionData.next_payment_date
  }

  if (subscriptionData.last_modified) {
    updateData.current_period_start = subscriptionData.last_modified
  }

  // 6️⃣ Atualizar subscription existente (idempotente)
  const { error: subError } = await supabase
    .from('subscriptions')
    .update(updateData)
    .eq('id', existingSubscription.id)

  if (subError) {
    console.log('❌ Erro ao atualizar subscription:', subError)
    return { success: false }
  }

  console.log('✅ Subscription atualizada com sucesso')

  return { success: true }
}
