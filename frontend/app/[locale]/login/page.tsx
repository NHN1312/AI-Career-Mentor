'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createClient } from '@/utils/supabase/client'
import { BrainCircuit, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'success' } | null>(null)
  const t = useTranslations('Login')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setMessage({ text: t('successLogin'), type: 'success' })
      window.location.href = '/dashboard'
    }
    setLoading(false)
  }

  const handleSignUp = async () => {
    setLoading(true)
    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${location.origin}/auth/callback` },
    })
    if (error) {
      setMessage({ text: error.message, type: 'error' })
    } else {
      setMessage({ text: t('successSignup'), type: 'success' })
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <header className="border-b px-6 h-14 flex items-center">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold">
          <BrainCircuit className="w-5 h-5 text-primary" />
          AI Career Mentor
        </Link>
      </header>

      {/* Center form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
            <p className="text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">{t('email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t('password')}</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Message */}
            {message && (
              <div className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 ${message.type === 'error'
                  ? 'bg-destructive/10 text-destructive'
                  : 'bg-muted text-foreground'
                }`}>
                {message.type === 'error'
                  ? <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  : <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : t('login')}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs text-muted-foreground">
              <span className="bg-background px-2">{t('orSignUp')}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleSignUp}
            disabled={loading}
          >
            {t('signUp')}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors underline underline-offset-4">
              ← {t('backToHome')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
