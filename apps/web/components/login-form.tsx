"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeClosed  } from "lucide-react"

export function LoginForm() {
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
      setError(result.error || "Invalid email or password")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Selly Base</CardTitle>
          <CardDescription className="text-center">Sign in to your account to access the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
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
                  Remember me
                </label>
            </div>
            <Button type="submit" className="w-full mt-1" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-6 text-sm text-muted-foreground">
            <p className="font-medium mb-2">Demo Accounts:</p>
            <div className="space-y-1">
              <p>User: user@selly.com / password123</p>
              <p>Staff: staff@selly.com / staff123</p>
              <p>Admin: admin@selly.com / admin123</p>
              <p className="text-purple-600 font-medium">Platform Admin: platform@albaly.com / platform123</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
