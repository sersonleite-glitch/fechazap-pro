"use client";

import { useState } from "react";
import { getSupabaseClient } from "../../lib/supabaseClient";

export default function OrcamentoPage() {
  const supabase = getSupabaseClient();

  const [telefone, setTelefone] = useState("");
  const [valor, setValor] = useState("");
  const [msg, setMsg] = useState("");

  async function enviarOrcamento() {
    if (!telefone || !valor) {
      setMsg("Preencha telefone e valor do orçamento");
      return;
    }

    setMsg("Processando orçamento...");

    try {
      // 1️⃣ buscar cliente pelo telefone
      const { data: customers, error: searchError } = await supabase
        .from("customers")
        .select("id")
        .eq("telefone", telefone);

      if (searchError) {
        throw new Error(searchError.message);
      }

      let customerId: string;

      if (customers && customers.length > 0) {
        // Cliente encontrado
        customerId = customers[0].id;
      } else {
        // Cliente não encontrado, criar novo
        const { data: newCustomer, error: createError } = await supabase
          .from("customers")
          .insert([
            {
              telefone,
              status: "Novo",
            },
          ])
          .select("id")
          .single();

        if (createError) {
          throw new Error(createError.message);
        }

        if (!newCustomer) {
          throw new Error("Erro ao criar cliente");
        }

        customerId = newCustomer.id;
      }

      const mensagem = `Olá! Seu orçamento ficou em R$ ${valor}. Posso confirmar o serviço?`;

      // 2️⃣ salvar orçamento
      const { error: quoteError } = await supabase.from("quotes").insert([
        {
          customer_id: customerId,
          valor: Number(valor.replace(",", ".")),
          mensagem,
          enviado_em: new Date().toISOString(),
        },
      ]);

      if (quoteError) {
        throw new Error(quoteError.message);
      }

      // 3️⃣ atualizar status do cliente
      const { error: statusError } = await supabase
        .from("customers")
        .update({ status: "Orçamento enviado" })
        .eq("id", customerId);

      if (statusError) {
        throw new Error(statusError.message);
      }

      // 4️⃣ abrir WhatsApp
      const whatsappUrl =
        "https://wa.me/55" +
        telefone +
        "?text=" +
        encodeURIComponent(mensagem);

      setMsg("Orçamento enviado com sucesso!");
      window.open(whatsappUrl, "_blank");

      // Limpar formulário
      setTelefone("");
      setValor("");
    } catch (error) {
      console.error(error);
      setMsg("Não foi possível enviar o orçamento. Tente novamente.");
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Enviar Orçamento</h1>

      <input
        placeholder="Telefone (somente números)"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: 320 }}
      />

      <input
        placeholder="Valor do orçamento (ex: 145,00)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: 320 }}
      />

      <button onClick={enviarOrcamento}>Enviar orçamento</button>

      <p style={{ marginTop: 20 }}>{msg}</p>
    </main>
  );
}
