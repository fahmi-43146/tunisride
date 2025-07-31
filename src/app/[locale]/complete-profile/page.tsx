"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Car, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { useTranslations } from "next-intl"
import { supabase } from "@/lib/supabase/client"
import { createProfile } from "@/app/actions/profile"

export default function CompleteProfilePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    userType: "passenger" as "passenger" | "driver",
  })
  const [loading, setLoading] = useState(true)
  const [userAuthenticated, setUserAuthenticated] = useState(false)
  const { toast } = useToast()
  const t = useTranslations()
  const router = useRouter()

  useEffect(() => {
    const checkUserAndProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/login")
        return
      }

      const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle()
      if (profile) {
        // Profile already exists, redirect to dashboard
        router.push("/dashboard")
        return
      }

      setUserAuthenticated(true)
      setLoading(false)
    }
    checkUserAndProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await createProfile(formData)

      if (!result.success) {
        throw new Error(result.error)
      }

      toast({
        title: t("profileCreatedSuccess"),
        description: t("nowAccessPlatform"),
      })
      router.push("/dashboard")
    } catch (error: any) {
      console.error(t("profileCreationError"), error)
      toast({
        title: t("error"),
        description: error.message || t("failedToCreateProfile"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!userAuthenticated) {
    return null // Should redirect by useEffect
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">{t("completeYourProfile")}</CardTitle>
          <CardDescription>{t("pleaseProvideDetails")}</CardDescription>
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

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("savingProfile") : t("completeProfile")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
