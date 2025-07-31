"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import type { PlatformSetting } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { useI18n } from "@/lib/i18n"
import { fetchPlatformSettings, updatePlatformSetting } from "@/app/actions/platform-settings"
import { SettingsIcon } from "lucide-react" // Renamed to avoid conflict

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const t = useI18n()
  const router = useRouter()

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user) {
          router.push("/login")
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .maybeSingle()

        if (profileError || !profileData || profileData.role !== "admin") {
          router.push("/dashboard")
          return
        }

        const result = await fetchPlatformSettings()

        if (!result.success) {
          throw new Error(result.error || t("failedToFetchSettings"))
        }

        setSettings(result.settings || [])
      } catch (err: any) {
        console.error("Error loading admin settings:", err)
        setError(err.message || t("unexpectedErrorLoadingSettings"))
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [router, t])

  const handleSettingChange = (key: string, value: string | boolean) => {
    setSettings((prevSettings) =>
      prevSettings.map((setting) => (setting.key === key ? { ...setting, value: String(value) } : setting)),
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      for (const setting of settings) {
        const result = await updatePlatformSetting(setting.key, setting.value)
        if (!result.success) {
          throw new Error(result.error || `Failed to update setting: ${setting.key}`)
        }
      }
      toast({
        title: t("success"),
        description: t("settingsUpdatedSuccess"),
      })
    } catch (err: any) {
      console.error("Error saving settings:", err)
      toast({
        title: t("error"),
        description: err.message || t("failedToUpdateSettings"),
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const getSettingValue = (key: string) => {
    return settings.find((s) => s.key === key)?.value
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">{t("error")}!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("platformSettings")}</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">← {t("backToAdminDashboard")}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            {t("configureGlobalSettings")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Default Driver Approval */}
            <div className="flex items-center justify-between">
              <Label htmlFor="default_driver_approval">{t("defaultDriverApproval")}</Label>
              <Switch
                id="default_driver_approval"
                checked={getSettingValue("default_driver_approval") === "true"}
                onCheckedChange={(checked) => handleSettingChange("default_driver_approval", checked)}
              />
            </div>

            {/* Minimum Fare */}
            <div className="space-y-2">
              <Label htmlFor="min_fare_tnd">{t("minFareTND")}</Label>
              <Input
                id="min_fare_tnd"
                type="number"
                step="0.1"
                value={getSettingValue("min_fare_tnd") || ""}
                onChange={(e) => handleSettingChange("min_fare_tnd", e.target.value)}
              />
            </div>

            {/* Max Passengers per Trip */}
            <div className="space-y-2">
              <Label htmlFor="max_passengers_per_trip">{t("maxPassengersPerTrip")}</Label>
              <Input
                id="max_passengers_per_trip"
                type="number"
                min="1"
                value={getSettingValue("max_passengers_per_trip") || ""}
                onChange={(e) => handleSettingChange("max_passengers_per_trip", e.target.value)}
              />
            </div>

            {/* Contact Email */}
            <div className="space-y-2">
              <Label htmlFor="contact_email">{t("contactEmail")}</Label>
              <Input
                id="contact_email"
                type="email"
                value={getSettingValue("contact_email") || ""}
                onChange={(e) => handleSettingChange("contact_email", e.target.value)}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? t("savingSettings") : t("saveSettings")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
