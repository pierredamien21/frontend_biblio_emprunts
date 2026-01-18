"use client"

import { useState, useEffect } from "react"
import { PublicCatalog } from "@/components/public/public-catalog"
import { LoginPage } from "@/components/auth/login-page"
import { MemberDashboard } from "@/components/member/member-dashboard"
import { StaffDashboard } from "@/components/staff/staff-dashboard"
import { AdminDashboard } from "@/components/admin/admin-dashboard"
import { CirculationDesk } from "@/components/staff/circulation-desk"
import { InventoryPage } from "@/components/staff/inventory-page"

type View = "catalog" | "login" | "member" | "staff" | "admin" | "circulation" | "inventory"

import { useAuth } from "@/hooks/use-auth"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { role, user, logout, isLoading, isAuthenticated } = useAuth()
  const [currentView, setCurrentView] = useState<View>("catalog")

  // Sync view with role on login
  useEffect(() => {
    if (isAuthenticated && role) {
      const lowerRole = role.toLowerCase()
      if (lowerRole === "membre") setCurrentView("member")
      else if (lowerRole === "agent" || lowerRole === "bibliothécaire" || lowerRole === "staff") setCurrentView("staff")
      else if (lowerRole === "admin" || lowerRole === "administrateur") setCurrentView("admin")
    } else {
      setCurrentView("catalog")
    }
  }, [isAuthenticated, role])

  // Handle unauthorized events from API client
  useEffect(() => {
    const handleUnauthorized = () => {
      setCurrentView("login")
    }
    window.addEventListener("auth:unauthorized", handleUnauthorized)
    return () => window.removeEventListener("auth:unauthorized", handleUnauthorized)
  }, [])

  const handleLogout = () => {
    logout()
  }

  const handleNavigate = (view: string) => {
    setCurrentView(view as View)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="min-h-screen animate-fade-in">
      {currentView === "catalog" && (
        <PublicCatalog
          onNavigateToLogin={() => setCurrentView("login")}
          onNavigateToDashboard={() => {
            if (role) {
              const lowerRole = role.toLowerCase()
              if (lowerRole === "membre") setCurrentView("member")
              else if (lowerRole === "agent" || lowerRole === "bibliothécaire" || lowerRole === "staff") setCurrentView("staff")
              else if (lowerRole === "admin" || lowerRole === "administrateur") setCurrentView("admin")
            }
          }}
        />
      )}
      {currentView === "login" && <LoginPage onBack={() => setCurrentView("catalog")} />}
      {currentView === "member" && <MemberDashboard onLogout={handleLogout} onNavigate={handleNavigate} />}
      {currentView === "staff" && <StaffDashboard onLogout={handleLogout} onNavigate={handleNavigate} />}
      {currentView === "admin" && <AdminDashboard onLogout={handleLogout} onNavigate={handleNavigate} />}
      {currentView === "circulation" && (
        <CirculationDesk onBack={() => setCurrentView("staff")} onLogout={handleLogout} />
      )}
      {currentView === "inventory" && <InventoryPage onBack={() => setCurrentView("staff")} onLogout={handleLogout} />}
    </main>
  )
}
