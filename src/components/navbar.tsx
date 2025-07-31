"use client"

import { useState, useEffect } from "react"
import { Car, Menu, X, LogOut, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSelector } from "@/components/language-selector"
import { useTranslations } from "next-intl"
import { Link, useRouter } from "@/i18n/navigation"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const t = useTranslations()
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return // Don't run until mounted
    
    const getUser = async () => {
      console.log("🔄 Navbar: Starting getUser function")
      try {
        console.log("🔄 Navbar: Calling supabase.auth.getUser()")
        const {
          data: { user },
        } = await supabase.auth.getUser()
        console.log("✅ Navbar: getUser successful, user:", user ? user.email : "null")
        setUser(user)

        if (user) {
          console.log("🔄 Navbar: Fetching profile for user:", user.id)
          // Fetch profile including the new 'role' field
          const { data: profile, error: profileError } = await supabase.from("profiles").select("*, role").eq("id", user.id).maybeSingle()
          console.log("✅ Navbar: Profile fetch result:", profile ? "found" : "not found", "error:", profileError)
          if (profile) {
            console.log("✅ Navbar: Setting profile data:", { id: profile.id, email: profile.email, role: profile.role })
            setProfile({
              id: profile.id as string,
              email: profile.email as string,
              full_name: profile.full_name as string | undefined,
              phone: profile.phone as string | undefined,
              user_type: profile.user_type as "passenger" | "driver",
              created_at: profile.created_at as string,
              updated_at: profile.updated_at as string,
              is_subscribed: profile.is_subscribed as boolean | undefined,
              subscription_ends_at: profile.subscription_ends_at as string | undefined,
              role: profile.role as "user" | "admin" | undefined,
              is_approved: profile.is_approved as boolean | undefined,
            })
          } else {
            console.log("❌ Navbar: No profile found, setting profile to null")
            setProfile(null)
          }
        } else {
          console.log("❌ Navbar: No user found, setting profile to null")
          setProfile(null)
        }
      } catch (error) {
        console.error("❌ Navbar: Error getting user:", error)
        setUser(null)
        setProfile(null)
      }
    }

    getUser()

    try {
      console.log("🔄 Navbar: Setting up auth state change listener")
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        console.log("🔄 Navbar: Auth state changed:", event, "user:", session?.user?.email || "null")
        setUser(session?.user || null)
        if (!session?.user) {
          console.log("❌ Navbar: No session user, clearing profile")
          setProfile(null)
        } else {
          console.log("✅ Navbar: Session user found, re-fetching profile")
          // Re-fetch profile on auth state change to get updated role
          getUser()
        }
      })

      return () => subscription.unsubscribe()
    } catch (error) {
      console.error("❌ Navbar: Error setting up auth listener:", error)
    }
  }, [mounted])

  const handleLogout = async () => {
    console.log("🔄 Navbar: Starting logout process")
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("❌ Navbar: Logout error:", error)
      } else {
        console.log("✅ Navbar: Logout successful")
      }
      router.push("/")
    } catch (error) {
      console.error("❌ Navbar: Logout exception:", error)
      router.push("/")
    }
  }

  // Show loading state until mounted
  if (!mounted) {
    return (
      <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <Car className="h-8 w-8 text-primary" />
                <span className="font-bold text-xl">TunisRide</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl">TunisRide</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/trips">
              <Button variant="ghost">{t("trips")}</Button>
            </Link>
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">{t("dashboard")}</Button>
                </Link>
                {profile?.role === "admin" && ( // Conditionally render Admin Dashboard link
                  <Link href="/admin/dashboard">
                    <Button variant="ghost">{t("adminDashboard")}</Button>
                  </Link>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span className="text-sm">{profile?.full_name || user.email}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem className="flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>{profile?.full_name || user.email}</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <Link href="/dashboard">
                      <DropdownMenuItem className="flex items-center space-x-2">
                        <Settings className="h-4 w-4" />
                        <span>{t("dashboard")}</span>
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      <span>{t("logout")}</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">{t("login")}</Button>
                </Link>
                <Link href="/register">
                  <Button>{t("register")}</Button>
                </Link>
              </>
            )}
            <LanguageSelector />
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <LanguageSelector />
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/trips" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  {t("trips")}
                </Button>
              </Link>
              {user ? (
                <>
                  <Link href="/dashboard" className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      {t("dashboard")}
                    </Button>
                  </Link>
                  {profile?.role === "admin" && ( // Conditionally render Admin Dashboard link
                    <Link href="/admin/dashboard" className="block">
                      <Button variant="ghost" className="w-full justify-start">
                        {t("adminDashboard")}
                      </Button>
                    </Link>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="w-full justify-start">
                        <User className="h-4 w-4 mr-2" />
                        {profile?.full_name || user.email}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{profile?.full_name || user.email}</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <Link href="/dashboard">
                        <DropdownMenuItem className="flex items-center space-x-2">
                          <Settings className="h-4 w-4" />
                          <span>{t("dashboard")}</span>
                        </DropdownMenuItem>
                      </Link>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="flex items-center space-x-2 text-red-600 focus:text-red-600"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t("logout")}</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link href="/login" className="block">
                    <Button variant="ghost" className="w-full justify-start">
                      {t("login")}
                    </Button>
                  </Link>
                  <Link href="/register" className="block">
                    <Button className="w-full justify-start">{t("register")}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
