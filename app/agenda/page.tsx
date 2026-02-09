"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function AgendaPage() {
  const [customerId, setCustomerId] = useState("");
  const [data, setData] = useState("");
  const [horario, setHorario] = useState("");
  const [endereco, setEndereco] = useState("");
  const [valor, setValor] = useState("");
  const [msg, setMsg] = useState("");

  async function salvarAgendamento() {
    if (!customerId || !data || !horario) {
      setMsg("Preencha cliente, data e horário");
      return;
    }

    setMsg("Salvando agendamento...");

    // Converte valor em formato brasileiro (145,00) para número
    let valorNumerico = null;
    if (valor) {
      const valorLimpo = valor.replace(",", ".");
      valorNumerico = parseFloat(valorLimpo);
      if (isNaN(valorNumerico)) {
        setMsg("Valor inválido. Use formato 145,00");
        return;
      }
    }

    const { error } = await supabase.from("appointments").insert([
      {
        customer_id: customerId,
        data,
        horario,
        endereco,
        valor: valorNumerico,
      },
    ]);

    if (error) {
      console.error(error);
      setMsg(error.message);
      return;
    }

    setMsg("Agendamento salvo com sucesso ✅");
    setCustomerId("");
    setData("");
    setHorario("");
    setEndereco("");
    setValor("");
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>Agenda de Serviços</h1>

      <input
        placeholder="Customer ID (UUID)"
        value={customerId}
        onChange={(e) => setCustomerId(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: 300 }}
      />

      <input
        type="date"
        value={data}
        onChange={(e) => setData(e.target.value)}
        style={{ display: "block", marginBottom: 8 }}
      />

      <input
        type="time"
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
        style={{ display: "block", marginBottom: 8 }}
      />

      <input
        placeholder="Endereço"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: 300 }}
      />

      <input
        type="text"
        placeholder="Valor combinado (ex: 145,00)"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
        style={{ display: "block", marginBottom: 8, width: 300 }}
      />

      <button onClick={salvarAgendamento}>Salvar</button>

      <p style={{ marginTop: 20 }}>{msg}</p>
    </main>
  );
}
