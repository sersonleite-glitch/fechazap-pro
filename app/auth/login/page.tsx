'use client'

import { useState, useEffect, FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

/**
 * Página de Login com Magic Link
 * 
 * Formulário simples que coleta o email do usuário e envia
 * uma requisição para o endpoint de autenticação.
 */
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  /**
   * Verifica se o usuário já está autenticado
   */
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        router.push('/app')
      }
    }
    checkSession()
  }, [router])

  /**
   * Processa o envio do formulário
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    setError('')
    setSuccess(false)
    setLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      // Sempre ler resposta como texto primeiro
      const text = await response.text()
      
      let data: { error?: string; success?: boolean } = {}

      // Só parsear JSON se houver conteúdo
      if (text.trim()) {
        try {
          data = JSON.parse(text)
        } catch {
          throw new Error('Resposta inválida do servidor')
        }
      } else if (!response.ok) {
        throw new Error('Resposta vazia da API')
      }

      if (!response.ok) {
        setError(data.error || 'Erro ao enviar magic link')
        return
      }

      setSuccess(true)
      setEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de conexão. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        maxWidth: '400px',
        width: '100%',
      }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: 'bold',
          marginBottom: '8px',
          textAlign: 'center',
        }}>
          Entrar com Magic Link
        </h1>
        
        <p style={{
          color: '#666',
          marginBottom: '24px',
          textAlign: 'center',
        }}>
          Digite seu email para receber um link de acesso
        </p>

        {/* Mensagem de sucesso */}
        {success && (
          <div style={{
            padding: '12px',
            backgroundColor: '#d4edda',
            color: '#155724',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            ✓ Magic link enviado! Verifique seu email.
          </div>
        )}

        {/* Mensagem de erro */}
        {error && (
          <div style={{
            padding: '12px',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '4px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            ✗ {error}
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label 
              htmlFor="email"
              style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="seu@email.com"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: loading ? '#ccc' : '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Enviando...' : 'Enviar Magic Link'}
          </button>
        </form>
      </div>
    </div>
  )
}
