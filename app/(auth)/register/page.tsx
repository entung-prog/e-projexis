'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const passwordStrength = () => {
    if (password.length === 0) return { level: 0, text: '', color: '' }
    if (password.length < 6) return { level: 1, text: 'Lemah', color: 'bg-red-500' }
    if (password.length < 10) return { level: 2, text: 'Sedang', color: 'bg-yellow-500' }
    return { level: 3, text: 'Kuat', color: 'bg-emerald-500' }
  }

  const strength = passwordStrength()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password minimal 6 karakter')
      return
    }

    setLoading(true)

    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    })

    if (res.ok) {
      router.push('/login')
    } else {
      const data = await res.json()
      setError(data.error || 'Registrasi gagal. Silakan coba lagi.')
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 text-white max-w-md">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-xl font-bold">
              EP
            </div>
            <h1 className="text-2xl font-bold">E-Projexis</h1>
          </div>
          <h2 className="text-4xl font-bold leading-tight mb-6">
            Mulai kelola proyek Anda hari ini
          </h2>
          <div className="space-y-4">
            {[
              'Kanban board dengan drag & drop',
              'Analitik produktivitas tim',
              'Kalender deadline otomatis'
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-300 flex-shrink-0" />
                <span className="text-white/90">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Register Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
              EP
            </div>
            <h1 className="text-xl font-bold">E-Projexis</h1>
          </div>

          <Card className="border-border/50 shadow-xl shadow-black/5">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold">Daftar</CardTitle>
              <CardDescription>
                Buat akun baru untuk memulai
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nama@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimal 6 karakter"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((level) => (
                          <div
                            key={level}
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              level <= strength.level ? strength.color : 'bg-border'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Kekuatan password: {strength.text}
                      </p>
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full h-11 shadow-lg shadow-primary/25" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Mendaftar...
                    </>
                  ) : (
                    'Daftar'
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Sudah punya akun?{' '}
                  <Link href="/login" className="text-primary font-medium hover:underline">
                    Masuk
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}