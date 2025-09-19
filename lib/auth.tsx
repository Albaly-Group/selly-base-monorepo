"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User, UserRole } from "./types"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock users for authentication
const mockUsers: (User & { password: string })[] = [
  {
    id: "1",
    email: "user@selly.com",
    name: "John Doe",
    role: "user",
    password: "password123",
    createdAt: "2024-01-01",
  },
  {
    id: "2",
    email: "staff@selly.com",
    name: "Jane Smith",
    role: "staff",
    password: "staff123",
    createdAt: "2024-01-01",
  },
  {
    id: "3",
    email: "admin@selly.com",
    name: "Admin User",
    role: "admin",
    password: "admin123",
    createdAt: "2024-01-01",
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("selly-user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        if (!document.cookie.includes("selly-user=")) {
          document.cookie = `selly-user=${JSON.stringify(userData)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`
        }
      } catch (error) {
        localStorage.removeItem("selly-user")
      }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true)

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const foundUser = mockUsers.find((u) => u.email === email && u.password === password)

    if (foundUser) {
      const { password: _, ...userWithoutPassword } = foundUser
      setUser(userWithoutPassword)
      localStorage.setItem("selly-user", JSON.stringify(userWithoutPassword))

      document.cookie = `selly-user=${JSON.stringify(userWithoutPassword)}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`

      setIsLoading(false)
      return true
    }

    setIsLoading(false)
    return false
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("selly-user")

    document.cookie = "selly-user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
  }

  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function requireAuth(allowedRoles?: UserRole[]) {
  return (WrappedComponent: React.ComponentType<any>) =>
    function AuthenticatedComponent(props: any) {
      const { user, isLoading } = useAuth()

      if (isLoading) {
        return <div>Loading...</div>
      }

      if (!user) {
        return <div>Please log in to access this page.</div>
      }

      if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <div>You don't have permission to access this page.</div>
      }

      return <WrappedComponent {...props} />
    }
}
