import { createClient } from '@supabase/supabase-js'

type AccessResult =
  | { allowed: true }
  | { allowed: false; reason: 'no-subscription' | 'trial-expired' | 'inactive' }

export async function hasActiveSubscription(
  customerId: string
): Promise<AccessResult> {
    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

  const { data: subscription, error } = await supabase
    .from('subscriptions')
    .select('status, trial_ends_at')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error || !subscription) {
    return { allowed: false, reason: 'no-subscription' }
  }

  const now = new Date()

  if (subscription.status === 'active') {
    return { allowed: true }
  }

  if (
    subscription.status === 'trial' &&
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) > now
  ) {
    return { allowed: true }
  }

  if (subscription.status === 'trial') {
    return { allowed: false, reason: 'trial-expired' }
  }

  return { allowed: false, reason: 'inactive' }
}
