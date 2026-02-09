"use client"

import { useState } from "react"

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubscribe = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/mercadopago/subscribe", {
        method: "POST",
        credentials: "include",
      })

      if (!response.ok) {
        throw new Error("Falha ao iniciar assinatura")
      }

      const data = (await response.json()) as { initPoint?: string; init_point?: string }

      const initPoint = data.initPoint || data.init_point
      if (!initPoint) {
        throw new Error("Resposta invalida do servidor")
      }

      window.location.href = initPoint
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erro inesperado"
      setErrorMessage(message)
      setIsLoading(false)
    }
  }

  return (
    <div>
      <h1>Pagina de pagamento / assinatura</h1>
      <button type="button" onClick={handleSubscribe} disabled={isLoading}>
        {isLoading ? "Processando..." : "Assinar agora"}
      </button>
      {errorMessage ? <p>{errorMessage}</p> : null}
    </div>
  )
}
