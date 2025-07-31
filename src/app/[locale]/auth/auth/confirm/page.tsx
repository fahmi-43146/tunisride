"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase/client"
import { useI18n } from "@/lib/i18n" // Import useI18n

export default function ConfirmPage() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState("")
  const router = useRouter()
  const searchParams = useSearchParams()
  const t = useI18n() // Initialize useI18n

  useEffect(() => {
    const confirmEmail = async () => {
      try {
        const token_hash = searchParams.get("token_hash")
        const type = searchParams.get("type")

        if (!token_hash || type !== "email") {
          throw new Error(t("invalidConfirmationLink")) // Use translation
        }

        const { data, error } = await supabase.auth.verifyOtp({
          token_hash,
          type: "email",
        })

        if (error) throw error

        setStatus("success")
        setMessage(t("emailConfirmedSuccess")) // Use translation

        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } catch (error: any) {
        console.error("Email confirmation error:", error)
        setStatus("error")
        setMessage(error.message || t("failedToConfirmEmail")) // Use translation
      }
    }

    confirmEmail()
  }, [searchParams, router, t]) // Add t to dependency array

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {status === "loading" && <Loader2 className="h-16 w-16 text-primary animate-spin" />}
            {status === "success" && <CheckCircle className="h-16 w-16 text-green-500" />}
            {status === "error" && <XCircle className="h-16 w-16 text-red-500" />}
          </div>
          <CardTitle className="text-2xl font-bold">
            {status === "loading" && t("confirmingEmail")}
            {status === "success" && t("emailConfirmed")}
            {status === "error" && t("confirmationFailed")}
          </CardTitle>
          <CardDescription>{message}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          {status === "success" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("redirectingToLogin")}</p>
              <Link href="/login">
                <Button className="w-full">{t("continueToLogin")}</Button>
              </Link>
            </div>
          )}
          {status === "error" && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{t("tryRegisteringAgain")}</p>
              <div className="flex space-x-2">
                <Link href="/register" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    {t("registerAgain")}
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button className="w-full">{t("backToLogin")}</Button>
                </Link>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
