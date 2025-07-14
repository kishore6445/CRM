"use client"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/ui/sidebar"
import { CRMSidebar } from "@/components/crm-sidebar"
import { TopNavigation } from "@/components/top-navigation"
import { NotificationsSidebar } from "@/components/notifications-sidebar"
import { Landing } from "@/components/pages/landing"
import { Login } from "@/components/auth/login"
import { Register } from "@/components/auth/register"
import { ForgotPassword } from "@/components/auth/forgot-password"
import { ResetPassword } from "@/components/auth/reset-password"
import { Dashboard } from "@/components/pages/dashboard"
import { Leads } from "@/components/pages/leads"
import { Contacts } from "@/components/pages/contacts"
import { Deals } from "@/components/pages/deals"
import { Tasks } from "@/components/pages/tasks"
import { Reports } from "@/components/pages/reports"
import { AIAssistant } from "@/components/pages/ai-assistant"
import { Settings } from "@/components/pages/settings"
import { Toaster } from "@/components/ui/toaster"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

type AppState = "landing" | "login" | "register" | "forgot-password" | "reset-password" | "crm"
type AuthData = {
  email: string
  firstName?: string
  lastName?: string
  company?: string
}

export default function CRMApp() {
  const [appState, setAppState] = useState<AppState>("landing")
  const [currentPage, setCurrentPage] = useState("dashboard")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [authData, setAuthData] = useState<AuthData | null>(null)
  const [resetEmail, setResetEmail] = useState("")
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        router.replace("/login")
      }
    }
    checkAuth()
  }, [router])

  const handleLogin = (email: string, password: string) => {
    setAuthData({ email })
    setAppState("crm")
  }

  const handleRegister = (data: {
    firstName: string
    lastName: string
    email: string
    password: string
    company: string
  }) => {
    setAuthData({
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      company: data.company,
    })
    setAppState("crm")
  }

  const handleSignOut = () => {
    setAuthData(null)
    setCurrentPage("dashboard")
    setNotificationsOpen(false)
    setAppState("landing")
  }

  const handleResetSent = (email: string) => {
    setResetEmail(email)
    setAppState("reset-password")
  }

  const handlePasswordReset = () => {
    setAppState("login")
  }

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return <Dashboard />
      case "leads":
        return <Leads />
      case "contacts":
        return <Contacts />
      case "deals":
        return <Deals />
      case "tasks":
        return <Tasks />
      case "reports":
        return <Reports />
      case "ai-assistant":
        return <AIAssistant />
      case "settings":
        return <Settings />
      default:
        return <Dashboard />
    }
  }

  // Render based on app state
  switch (appState) {
    case "landing":
      return <Landing onGetStarted={() => setAppState("login")} />

    case "login":
      return (
        <Login
          onLogin={handleLogin}
          onSwitchToRegister={() => setAppState("register")}
          onForgotPassword={() => setAppState("forgot-password")}
          onBackToLanding={() => setAppState("landing")}
        />
      )

    case "register":
      return (
        <Register
          onRegister={handleRegister}
          onSwitchToLogin={() => setAppState("login")}
          onBackToLanding={() => setAppState("landing")}
        />
      )

    case "forgot-password":
      return <ForgotPassword onBackToLogin={() => setAppState("login")} onResetSent={handleResetSent} />

    case "reset-password":
      return <ResetPassword email={resetEmail} onPasswordReset={handlePasswordReset} />

    case "crm":
      return (
        <SidebarProvider>
          <div className="flex h-screen bg-slate-50 overflow-hidden w-full">
            <CRMSidebar currentPage={currentPage} onPageChange={setCurrentPage} onSignOut={handleSignOut} />
            <div className="flex-1 flex flex-col min-w-0 w-full">
              <TopNavigation
                onNotificationsToggle={() => setNotificationsOpen(!notificationsOpen)}
                notificationsOpen={notificationsOpen}
              />
              <main className="flex-1 p-6 overflow-auto w-full">
                <div className="w-full h-full">{renderPage()}</div>
              </main>
            </div>
            <NotificationsSidebar isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
          </div>
          <Toaster />
        </SidebarProvider>
      )

    default:
      return <Landing onGetStarted={() => setAppState("login")} />
  }
}
