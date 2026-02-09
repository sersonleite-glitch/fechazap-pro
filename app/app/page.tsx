import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { hasActiveSubscription } from '@/app/lib/subscription/hasActiveSubscription'

export default async function AppPage() {
  // Criar cliente Supabase para o servidor
  const supabase = await createClient()

  // Obter o usuário autenticado
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  // Se não houver usuário, redirecionar para login
  if (!user || authError) {
    redirect('/auth/login')
  }

  // Verificar se o usuário tem assinatura ativa
  const subscriptionStatus = await hasActiveSubscription(user.id)

  // Se não tiver assinatura ativa, redirecionar para billing
  if (!subscriptionStatus.allowed) {
    redirect('/billing')
  }

  // Renderizar a página com assinatura ativa
  return (
    <div>
      <h1>App carregado com assinatura ativa</h1>
    </div>
  )
}
