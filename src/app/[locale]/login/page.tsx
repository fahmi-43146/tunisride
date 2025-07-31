"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "next-intl"
import { supabase } from "@/lib/supabase/client"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [loading, setLoading] = useState(false)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(false)
  const { toast } = useToast()
  const t = useTranslations()
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🔄 Login: Starting sign in process for:", formData.email)
    setLoading(true)
    setEmailNotConfirmed(false)

    try {
      console.log("🔄 Login: Calling supabase.auth.signInWithPassword")
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      })

      if (error) {
        console.error("❌ Login: Sign in error:", error)
        if (error.message.includes("Email not confirmed")) {
          console.log("❌ Login: Email not confirmed")
          setEmailNotConfirmed(true)
          throw new Error(t("emailNotConfirmed"))
        }
        throw error
      }

      console.log("✅ Login: Sign in successful, user:", data.user?.email)
      toast({
        title: t("welcomeBack"),
        description: t("youHaveSuccessfullyLoggedIn"),
      })

      const redirectUrl = searchParams.get("redirect")
      console.log("🔄 Login: Redirecting to:", redirectUrl || "/dashboard")
      if (redirectUrl) {
        router.push(redirectUrl)
      } else {
        router.push("/dashboard")
      }
    } catch (error: any) {
      console.error("❌ Login: Exception during sign in:", error)
      toast({
        title: t("loginError"),
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendConfirmation = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: formData.email,
      })

      if (error) throw error

      toast({
        title: t("emailSent"),
        description: t("checkInboxConfirmation"),
      })
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("login")}</CardTitle>
          <CardDescription>{t("signInToYourAccount")}</CardDescription>
        </CardHeader>
        <CardContent>
          {emailNotConfirmed && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {t("emailNotConfirmed")}
                <Button variant="link" className="p-0 h-auto font-normal" onClick={handleResendConfirmation}>
                  {t("resendConfirmationEmail")}
                </Button>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder={t("enterEmailAddress")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t("enterYourPassword")}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("signingIn") : t("login")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("dontHaveAccount")}{" "}
              <Link href="/register" className="text-primary hover:underline">
                {t("register")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
