'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi, tokenStorage } from '@/lib/api'
import type { AuthUser } from '@/types'

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchMe = useCallback(async () => {
    const token = tokenStorage.get()
    if (!token) { setIsLoading(false); return }
    try {
      const res = await authApi.me() as { data?: AuthUser }
      setUser(res.data ?? null)
    } catch {
      tokenStorage.clear()
      setUser(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => { fetchMe() }, [fetchMe])

  const login = async (email: string, password: string) => {
    const res = await authApi.login(email, password) as {
      data?: { access_token: string; refresh_token: string; user: AuthUser }
    }
    if (res.data) {
      tokenStorage.set(res.data.access_token)
      tokenStorage.setRefresh(res.data.refresh_token)
      setUser(res.data.user)
    }
  }

  const logout = async () => {
    const refresh = tokenStorage.getRefresh()
    if (refresh) {
      try { await authApi.logout(refresh) } catch { /* ignore */ }
    }
    tokenStorage.clear()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
