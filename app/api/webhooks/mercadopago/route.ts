import { NextRequest, NextResponse } from "next/server";
import { processSubscriptionEvent } from "../../../lib/mercadopago/processSubscriptionEvent";

export async function POST(req: NextRequest) {
  // Teste de variáveis de ambiente
  console.log("ENV CHECK", {
    hasMpToken: !!process.env.MERCADOPAGO_ACCESS_TOKEN,
    hasSupabaseUrl: !!process.env.SUPABASE_URL,
    hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  try {
    const body = await req.json();

    console.log("📩 Webhook recebido:", body);

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
