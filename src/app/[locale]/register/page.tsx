"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Car, User, Mail, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { registerUser, resendConfirmationEmail } from "@/app/actions/auth"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    userType: "passenger" as "passenger" | "driver",
  })
  const [loading, setLoading] = useState(false)
  const [registrationComplete, setRegistrationComplete] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguage()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await registerUser(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      setRegistrationComplete(true)
      toast({
        title: t("accountCreatedSuccess"),
        description: t("checkInboxConfirmation"),
      })
    } catch (error: any) {
      console.error("Registration error:", error)
      toast({
        title: t("registrationError"),
        description: error.message || t("failedToCreateAccount"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResendEmail = async () => {
    setResendingEmail(true)
    try {
      const result = await resendConfirmationEmail(formData.email)
      if (result.success) {
        toast({
          title: t("emailSent"),
          description: t("checkInboxConfirmation"),
        })
      } else {
        throw new Error(result.error)
      }
    } catch (error: any) {
      toast({
        title: t("error"),
        description: error.message || t("failedToResendEmail"),
        variant: "destructive",
      })
    } finally {
      setResendingEmail(false)
    }
  }

  if (registrationComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Mail className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">{t("checkYourEmail")}</CardTitle>
            <CardDescription>{t("sentConfirmationLink")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                {t("accountCreatedSuccess")} <strong>{formData.email}</strong> {t("clickConfirmationLink")}
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-sm text-muted-foreground">{t("didntReceiveEmail")}</p>

              <Button
                variant="outline"
                onClick={handleResendEmail}
                disabled={resendingEmail}
                className="w-full bg-transparent"
              >
                {resendingEmail ? t("sending") : t("resendConfirmationEmail")}
              </Button>

              <div className="pt-4">
                <Link href="/login">
                  <Button variant="ghost" className="w-full">
                    {t("backToLogin")}
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("register")}</CardTitle>
          <CardDescription>{t("createAccountToStart")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="userType">{t("accountType")}</Label>
              <RadioGroup
                value={formData.userType}
                onValueChange={(value) => setFormData({ ...formData, userType: value as "passenger" | "driver" })}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="passenger" id="passenger" />
                  <Label htmlFor="passenger" className="flex items-center space-x-2 cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>{t("passenger")}</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="driver" id="driver" />
                  <Label htmlFor="driver" className="flex items-center space-x-2 cursor-pointer">
                    <Car className="h-4 w-4" />
                    <span>{t("driver")}</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName">{t("fullName")} *</Label>
              <Input
                id="fullName"
                type="text"
                required
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                placeholder={t("enterFullName")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">{t("email")} *</Label>
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
              <Label htmlFor="phone">{t("phone")} *</Label>
              <Input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder={t("enterPhoneNumber")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">{t("password")} *</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={t("enterSecurePassword")}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("creatingAccount") : t("register")}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("alreadyHaveAccount")}{" "}
              <Link href="/login" className="text-primary hover:underline">
                {t("login")}
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
