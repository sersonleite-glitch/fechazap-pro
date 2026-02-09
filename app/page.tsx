"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Page() {
  const [telefone, setTelefone] = useState("");
  const [msg, setMsg] = useState("");

  async function salvarLead() {
    if (!telefone) {
      setMsg("Informe um telefone válido");
      return;
    }

    setMsg("Enviando...");

    const { error } = await supabase
      .from("leads")
      .insert([{ telefone }]);

    if (error) {
      console.error("SUPABASE ERROR:", error);
      setMsg(error.message);
      return;
    }

    setMsg("Redirecionando para o WhatsApp...");

    // 🔁 redirecionamento WhatsApp (Click to Chat)
    setTimeout(() => {
      window.location.href =
        "https://wa.me/5511994041811?text=Olá,%20quero%20conhecer%20o%20FechaZap%20Pro";
    }, 800);
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>FechaZap Pro</h1>

      <input
        type="tel"
        placeholder="Seu WhatsApp (DDD + número)"
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
        style={{ padding: 8, width: 260 }}
      />

      <br />
      <br />

      <button onClick={salvarLead} style={{ padding: "8px 16px" }}>
        Enviar
      </button>

      <p style={{ marginTop: 20 }}>{msg}</p>
    </main>
  );
}
