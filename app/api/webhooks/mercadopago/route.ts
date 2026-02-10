export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // Teste de variáveis de ambiente
  console.log("ENV CHECK", {
    hasMpToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  try {
    const body = await req.json();

    console.log("📩 Webhook recebido:", body);

    const { processSubscriptionEvent } = await import("../../../lib/mercadopago/processSubscriptionEvent");

    await processSubscriptionEvent(body);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("❌ Erro no webhook:", error);

    return NextResponse.json(
      { error: "Webhook error" },
      { status: 500 }
    );
  }
}
