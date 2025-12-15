"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { useTranslation } from 'react-i18next'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeClosed  } from "lucide-react"

export function LoginForm() {
  const { t } = useTranslation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showPassword, setShowPassword] = useState(false)

  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    const result = await login(email, password)
    if (!result.success) {
      setError(result.error || t('login.invalid_credentials'))
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">{t('app.title')}</CardTitle>
          <CardDescription className="text-center">{t('login.description')}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('login.email_label')}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t('login.email_placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('login.password_label')}</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t('login.password_placeholder')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-pressed={showPassword}
                >
                  {showPassword ? 
                    (<Eye className="h-5 w-5" />) : (<EyeClosed className="h-5 w-5" />)
                  }
                </button>
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}
            <div className="mt-4 flex items-center">
                <input
                  id="remember" 
                  type="checkbox" 
                  className="h-4 w-4 appearance-none rounded-[4px] border border-gray-300
                    focus-visible:ring-blue-500/30 focus-visible:border-blue-500 transition-colors
                  "
                />
                <label className="ml-2 font-medium text-sm">
                  {t('login.remember_me')}
                </label>
            </div>
            <Button type="submit" className="w-full mt-1" disabled={isLoading}>
              {isLoading ? t('login.signing_in') : t('login.sign_in')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
