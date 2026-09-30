"use client"

import { useEffect, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "../context/AuthContext"

export default function NextAuthGate({ children }) {
  const { user, logout, hydrated } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const isOfficerRoute = pathname === "/demand-application/officer"
  // Applicant entry and its payment return route remain public.  All other
  // management routes use the existing Admin / legacy Officer session.
  const isDemandPublicRoute = pathname === "/demand-application"
    || pathname === "/application-status"
    || pathname.startsWith("/demand-application/payment/")
  // `/` immediately redirects to the public Demand Application landing page.
  // It must remain public during hydration so that redirect is not raced by
  // the management-route login guard.
  const isRootRedirectRoute = pathname === "/"
  const isPublicRoute = isDemandPublicRoute || isRootRedirectRoute
  const isLoginRoute = pathname === "/login" || pathname === "/officer-login"
  const officerRoles = ["je", "os", "assistantcommissioner", "ac"]
  const managementRole = String(user?.role || "").trim().toLowerCase()
  const isOfficerUser = officerRoles.includes(managementRole)
  const wasInOfficerArea = useRef(false)
  const hasManagementAccess = ["admin", "officer"].includes(managementRole)
  const isManagementRoute = !isLoginRoute && !isPublicRoute && !isOfficerRoute

  useEffect(() => {
    if (hydrated && !user && isOfficerRoute) router.replace("/officer-login")
    if (hydrated && isManagementRoute && !hasManagementAccess) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`)
    }
  }, [hydrated, user, isOfficerRoute, isManagementRoute, hasManagementAccess, router])

  useEffect(() => {
    if (!hydrated) return
    // An officer session is valid only within its dedicated workflow area. The
    // existing logout mechanism clears only smc_token and smc_user, leaving all
    // applicant/correction/certificate browser data untouched.
    if (wasInOfficerArea.current && !isOfficerRoute && isOfficerUser) {
      wasInOfficerArea.current = false
      logout()
      return
    }
    if (isOfficerRoute && isOfficerUser) wasInOfficerArea.current = true
  }, [hydrated, isOfficerRoute, isOfficerUser, logout])

  if (isLoginRoute || isPublicRoute) return children
  if (!hydrated) return <RouteLoading message="Loading..." />
  if (isManagementRoute && !hasManagementAccess) return <RouteLoading message="Redirecting to login..." />
  if (!isOfficerRoute) return children
  if (!hydrated) return <RouteLoading message="सत्र तपासत आहे..." />
  if (!user) return <RouteLoading message="अधिकारी लॉगिन पृष्ठाकडे जात आहे..." />
  return children
}

function RouteLoading({ message }) {
  return (
    <main className="route-loading" role="status" aria-live="polite">
      <div className="route-loading-card">
        <span className="route-loading-spinner" aria-hidden="true" />
        <span>{message}</span>
      </div>
    </main>
  )
}
