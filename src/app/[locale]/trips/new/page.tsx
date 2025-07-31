"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { useLanguage } from "@/lib/language-context"
import { supabase } from "@/lib/supabase/client"
import type { Profile, Governorate, City } from "@/lib/types"
import { getCityName, getGovernorateName } from "@/lib/utils"

export default function NewTripPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fromGovernorate: "",
    fromCity: "",
    toGovernorate: "",
    toCity: "",
    departureDate: "",
    departureTime: "",
    fareOffered: "",
    passengerCount: "1",
    notes: "",
  })
  const { toast } = useToast()
  const { t, language } = useLanguage()
  const router = useRouter()

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true)
        setError(null)

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          console.error("Auth error:", authError)
          throw new Error(t("authenticationFailed"))
        }

        if (!user) {
          router.push("/login")
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Profile error:", profileError)
          throw new Error(`${t("failedToLoadProfile")}: ${profileError.message}`)
        }

        if (!profileData) {
          router.push("/complete-profile")
          return
        }

        // --- New Profile Validation ---
        if (!profileData.full_name || !profileData.phone || !profileData.email) {
          toast({
            title: t("profileIncomplete"),
            description: t("pleaseCompleteProfileBeforePostingTrip"),
            variant: "destructive",
          })
          router.push("/complete-profile")
          return
        }
        // --- End New Profile Validation ---

        if (profileData.user_type !== "passenger") {
          router.push("/dashboard")
          return
        }

        setProfile(profileData)

        const [govResponse, citiesResponse] = await Promise.all([
          supabase.from("governorates").select("*").order("name_en"),
          supabase.from("cities").select("*, governorate:governorates(*)").order("name_en"),
        ])

        if (govResponse.error) {
          console.error("Governorates error:", govResponse.error)
          throw new Error(`${t("failedToLoadGovernorates")}: ${govResponse.error.message}`)
        }

        if (citiesResponse.error) {
          console.error("Cities error:", citiesResponse.error)
          throw new Error(`${t("failedToLoadCities")}: ${citiesResponse.error.message}`)
        }

        setGovernorates(govResponse.data || [])
        setCities(citiesResponse.data || [])
      } catch (err: any) {
        console.error("Page initialization error:", err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [router, t, toast]) // Added toast to dependency array

  const getGovernorateCity = (governorateId: string) => {
    return cities.filter((city) => city.governorate_id === Number.parseInt(governorateId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!profile) {
        const authUser = await supabase.auth.getUser()
        if (!authUser.data.user) {
          router.push("/login") // Redirect if user is truly not authenticated
          return
        }
        // If user exists but profile is null, it's an unexpected state, log it.
        console.error("Profile is null when submitting trip, but user is authenticated.")
        throw new Error(t("profileDataMissing"))
      }

      // --- New Form Data Validation ---
      if (!formData.departureDate) {
        throw new Error(t("departureDateRequired"))
      }
      const today = new Date().toISOString().split("T")[0]
      if (formData.departureDate < today) {
        throw new Error(t("departureDateInPast"))
      }

      if (!formData.fareOffered) {
        throw new Error(t("fareRequired"))
      }
      const fareOffered = Number.parseFloat(formData.fareOffered)
      if (isNaN(fareOffered) || fareOffered <= 0) {
        throw new Error(t("fareMustBePositive"))
      }

      if (!formData.passengerCount) {
        throw new Error(t("passengerCountRequired"))
      }
      const passengerCount = Number.parseInt(formData.passengerCount)
      if (isNaN(passengerCount) || passengerCount <= 0) {
        throw new Error(t("passengerCountMustBePositive"))
      }
      // --- End New Form Data Validation ---

      if (formData.fromCity === formData.toCity) {
        throw new Error(t("fromAndToCitiesSame"))
      }

      const fromCityId = Number.parseInt(formData.fromCity)
      const toCityId = Number.parseInt(formData.toCity)

      if (isNaN(fromCityId) || isNaN(toCityId)) {
        throw new Error(t("invalidCitySelection"))
      }

      // Log the data being prepared for insertion
      console.log("Attempting to insert trip with data:", {
        passenger_id: profile.id,
        from_city_id: fromCityId,
        to_city_id: toCityId,
        departure_date: formData.departureDate,
        departure_time: formData.departureTime || null,
        fare_offered: fareOffered,
        passenger_count: passengerCount,
        notes: formData.notes || null,
      })

      const { error } = await supabase.from("trips").insert({
        passenger_id: profile.id,
        from_city_id: fromCityId,
        to_city_id: toCityId,
        departure_date: formData.departureDate,
        departure_time: formData.departureTime || null,
        fare_offered: fareOffered,
        passenger_count: passengerCount,
        notes: formData.notes || null,
      })

      if (error) {
        console.error("Supabase insert error:", error) // Log the full Supabase error object
        throw error
      }

      toast({
        title: t("tripPostedSuccess"),
        description: t("driversCanNowSee"),
      })

      router.push("/dashboard")
    } catch (err: any) {
      console.error("Trip submission caught error:", err) // Log the caught error
      toast({
        title: t("error"),
        description: err.message || t("failedToPostTrip"),
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
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
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertDescription>
            <strong>{t("errorLoadingPage")}</strong> {error}
            <div className="mt-2">
              <Button variant="outline" onClick={() => window.location.reload()} className="bg-transparent">
                {t("tryAgain")}
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!profile) {
    // This case should ideally be handled by the redirect in useEffect,
    // but as a fallback, show a message.
    return (
      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Alert>
          <AlertDescription>
            {t("profileNotFound")} {t("please")}{" "}
            <Link href="/complete-profile" className="text-primary hover:underline">
              {t("completeYourProfile")}
            </Link>{" "}
            {t("or")}{" "}
            <Link href="/login" className="text-primary hover:underline">
              {t("login")}
            </Link>
            .
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{t("postTrip")}</CardTitle>
          <CardDescription>{t("createNewTripRequestForDrivers")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* From Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("fromGovernorate")}</Label>
                <Select
                  value={formData.fromGovernorate}
                  onValueChange={(value) => {
                    setFormData({ ...formData, fromGovernorate: value, fromCity: "" })
                  }}
                >
                  <SelectTrigger className="text-foreground bg-background">
                    <SelectValue placeholder={t("selectGovernorate")} />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id.toString()}>
                        {getGovernorateName(gov, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {t("from")} {t("city")}
                </Label>
                <Select
                  value={formData.fromCity}
                  onValueChange={(value) => setFormData({ ...formData, fromCity: value })}
                  disabled={!formData.fromGovernorate}
                >
                  <SelectTrigger className="text-foreground bg-background">
                    <SelectValue placeholder={t("selectCity")} />
                  </SelectTrigger>
                  <SelectContent>
                    {getGovernorateCity(formData.fromGovernorate).map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {getCityName(city, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* To Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("toGovernorate")}</Label>
                <Select
                  value={formData.toGovernorate}
                  onValueChange={(value) => {
                    setFormData({ ...formData, toGovernorate: value, toCity: "" })
                  }}
                >
                  <SelectTrigger className="text-foreground bg-background">
                    <SelectValue placeholder={t("selectGovernorate")} />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map((gov) => (
                      <SelectItem key={gov.id} value={gov.id.toString()}>
                        {getGovernorateName(gov, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>
                  {t("to")} {t("city")}
                </Label>
                <Select
                  value={formData.toCity}
                  onValueChange={(value) => setFormData({ ...formData, toCity: value })}
                  disabled={!formData.toGovernorate}
                >
                  <SelectTrigger className="text-foreground bg-background">
                    <SelectValue placeholder={t("selectCity")} />
                  </SelectTrigger>
                  <SelectContent>
                    {getGovernorateCity(formData.toGovernorate).map((city) => (
                      <SelectItem key={city.id} value={city.id.toString()}>
                        {getCityName(city, language)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="departureDate">{t("date")} *</Label>
                <Input
                  id="departureDate"
                  type="date"
                  required
                  min={new Date().toISOString().split("T")[0]}
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="departureTime">
                  {t("time")} ({t("optional")})
                </Label>
                <Input
                  id="departureTime"
                  type="time"
                  value={formData.departureTime}
                  onChange={(e) => setFormData({ ...formData, departureTime: e.target.value })}
                />
              </div>
            </div>

            {/* Fare and Passengers */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fareOffered">
                  {t("fare")} ({t("tnd")}) *
                </Label>
                <Input
                  id="fareOffered"
                  type="number"
                  required
                  min="1"
                  step="0.1"
                  placeholder="50.0"
                  value={formData.fareOffered}
                  onChange={(e) => setFormData({ ...formData, fareOffered: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="passengerCount">{t("numberOfPassengers")} *</Label>
                <Select
                  value={formData.passengerCount}
                  onValueChange={(value) => setFormData({ ...formData, passengerCount: value })}
                  required // Ensure this is required
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? t("passengerSingular") : t("passengerPlural")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                {t("notes")} ({t("optional")})
              </Label>
              <Textarea
                id="notes"
                placeholder={t("anyAdditionalInfoForDrivers")}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t("postingTrip") : t("postTrip")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
