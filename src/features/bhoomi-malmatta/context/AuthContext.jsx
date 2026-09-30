"use client"

import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import client from '../api/client'

const AuthContext = createContext(null)

function clearStoredAuthState() {
  if (typeof window === 'undefined') return

  const localKeys = [
    'smc_token',
    'smc_user',
    'smc_role',
    'smc_officer_session',
    'smc_officer_user',
    'smc_officer_role',
    'smc_officer_auth',
    'smc_demand_officer_session',
    'smc_demand_officer_user',
  ]

  localKeys.forEach((key) => localStorage.removeItem(key))

  for (let i = localStorage.length - 1; i >= 0; i -= 1) {
    const key = localStorage.key(i)
    if (key && /^smc(_|[-])?(user|token|role|officer|session|auth)/i.test(key)) {
      localStorage.removeItem(key)
    }
  }

  for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
    const key = sessionStorage.key(i)
    if (key && /^smc(_|[-])?(user|token|role|officer|session|auth)/i.test(key)) {
      sessionStorage.removeItem(key)
    }
  }
}

function getStoredUser() {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem('smc_user')
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    // A stale/corrupted browser value must not crash the complete client tree.
    clearStoredAuthState()
    return null
  }
}

export function AuthProvider({ children }) {
  const [hydrated, setHydrated] = useState(false)
  // Keep the SSR markup and the browser's first render identical. Reading
  // localStorage here would make an existing officer session render a different
  // header before React has hydrated the server HTML.
  const [user, setUser] = useState(null)

  useEffect(() => {
    setUser(getStoredUser())
    setHydrated(true)
    const syncStoredSession = (event) => {
      if (event.key === 'smc_user' || event.key === 'smc_token') setUser(getStoredUser())
    }
    window.addEventListener('storage', syncStoredSession)
    return () => window.removeEventListener('storage', syncStoredSession)
  }, [])

  const login = useCallback(async (username, password) => {
    const res = await client.post('/auth/login', { username, password })
    const data = res.data.data
    localStorage.setItem('smc_token', data.token)
    localStorage.setItem('smc_user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    clearStoredAuthState()
    setUser(null)
  }, [])

  const hasRole = useCallback((...roles) => {
    if (!user) return false
    return roles.includes(user.role)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, hydrated }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

export function ExternalAuthProvider({
  children,
  user,
  hydrated = true,
  logout = () => {},
}) {
  const login = useCallback(async () => {
    throw new Error("External portal authentication is active.")
  }, [])

  const hasRole = useCallback(
    (...roles) => Boolean(user) && roles.includes(user.role),
    [user]
  )

  return (
    <AuthContext.Provider value={{ user, login, logout, hasRole, hydrated }}>
      {children}
    </AuthContext.Provider>
  )
}