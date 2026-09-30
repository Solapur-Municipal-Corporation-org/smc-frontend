"use client"

import { useCitizenAuth } from "@/context/CitizenAuthContext"
import { ExternalAuthProvider } from "./AuthContext"

export default function CitizenBhoomiAuthBridge({ children }) {
  const { citizen, loading, logout } = useCitizenAuth()

  const bhoomiUser = citizen
    ? {
        ...citizen,
        username: citizen.mobileNumber,
        role: "Citizen",
      }
    : null

  return (
    <ExternalAuthProvider
      user={bhoomiUser}
      hydrated={!loading}
      logout={logout}
    >
      {children}
    </ExternalAuthProvider>
  )
}