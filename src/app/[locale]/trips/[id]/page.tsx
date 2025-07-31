"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Calendar, MapPin, DollarSign, Users, Car, Phone, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useTranslations } from "next-intl"
import { usePathname } from "@/i18n/navigation"
import { supabase } from "@/lib/supabase/client"
import type { Profile, Trip, Language } from "@/lib/types"
import { getCityName, getGovernorateName } from "@/lib/utils"

export default function TripDetailPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const [trip, setTrip] = useState<Trip | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [accepting, setAccepting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations()

  // Extract current locale from pathname
  const language: Language = pathname.startsWith('/ar') ? 'ar' : pathname.startsWith('/fr') ? 'fr' : 'en'

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get trip ID from params
        const { id } = await params
        
        // Load user profile
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single()
          setProfile(profileData)
        }

        // Load trip details
        const { data: tripData, error: tripError } = await supabase
          .from("trips")
          .select(`
            *,
            from_city:cities!trips_from_city_id_fkey(
              id, name_en, name_ar, name_fr,
              governorate:governorates(id, name_en, name_ar, name_fr)
            ),
            to_city:cities!trips_to_city_id_fkey(
              id, name_en, name_ar, name_fr,
              governorate:governorates(id, name_en, name_ar, name_fr)
            ),
            passenger:profiles!trips_passenger_id_fkey(id, full_name, email, phone),
            driver:profiles!trips_driver_id_fkey(id, full_name, email, phone)
          `)
          .eq("id", id)
          .single()

        if (tripError) {
          throw new Error(tripError.message)
        }

        if (!tripData) {
          throw new Error("Trip not found")
        }

        setTrip(tripData)
      } catch (error: any) {
        console.error("Trip detail error:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [params])

  const handleAcceptTrip = async () => {
    if (!trip || !profile) return

    try {
      setAccepting(true)
      
      const { error } = await supabase
        .from("trips")
        .update({ 
          driver_id: profile.id,
          status: "accepted",
          updated_at: new Date().toISOString()
        })
        .eq("id", trip.id)

      if (error) {
        throw new Error(error.message)
      }

      // Refresh trip data
      const { data: updatedTrip } = await supabase
        .from("trips")
        .select(`
          *,
          from_city:cities!trips_from_city_id_fkey(
            id, name_en, name_ar, name_fr,
            governorate:governorates(id, name_en, name_ar, name_fr)
          ),
          to_city:cities!trips_to_city_id_fkey(
            id, name_en, name_ar, name_fr,
            governorate:governorates(id, name_en, name_ar, name_fr)
          ),
          passenger:profiles!trips_passenger_id_fkey(id, full_name, email, phone),
          driver:profiles!trips_driver_id_fkey(id, full_name, email, phone)
        `)
        .eq("id", trip.id)
        .single()

      setTrip(updatedTrip)
    } catch (error: any) {
      console.error("Accept trip error:", error)
      setError(error.message)
    } finally {
      setAccepting(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
      accepted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
      completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
      cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
    }
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!trip) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <AlertDescription>{t("tripNotFound")}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("goBack")}
        </Button>
        
        <h1 className="text-3xl font-bold">{t("tripDetails")}</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Trip Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              {t("tripInformation")}
              <Badge className={getStatusBadge(trip.status)}>
                {t(trip.status)}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("from")}</p>
                  <p className="text-sm text-muted-foreground">
                    {getCityName(trip.from_city, language)}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("to")}</p>
                  <p className="text-sm text-muted-foreground">
                    {getCityName(trip.to_city, language)}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("departureDate")}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(trip.departure_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {trip.departure_time && (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t("departureTime")}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.departure_time}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("fare")}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.fare_offered} {t("tnd")}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("passengerCount")}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.passenger_count}
                  </p>
                </div>
              </div>
            </div>

            {trip.notes && (
              <div>
                <p className="text-sm font-medium mb-1">{t("notes")}</p>
                <p className="text-sm text-muted-foreground">{trip.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Passenger Information */}
        <Card>
          <CardHeader>
            <CardTitle>{t("passengerDetails")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Car className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">{t("fullName")}</p>
                <p className="text-sm text-muted-foreground">
                  {trip.passenger?.full_name || trip.passenger?.email || "N/A"}
                </p>
              </div>
            </div>
            
            {trip.passenger?.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("phone")}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.passenger.phone}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Information (if trip is accepted) */}
        {trip.driver && (
          <Card>
            <CardHeader>
              <CardTitle>{t("driverDetails")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Car className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">{t("fullName")}</p>
                  <p className="text-sm text-muted-foreground">
                    {trip.driver.full_name || trip.driver.email}
                  </p>
                </div>
              </div>
              
              {trip.driver.phone && (
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{t("phone")}</p>
                    <p className="text-sm text-muted-foreground">
                      {trip.driver.phone}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Accept Trip Button (for drivers) */}
        {profile?.user_type === "driver" && trip.status === "pending" && (
          <Card>
            <CardHeader>
              <CardTitle>{t("tripActions")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleAcceptTrip} 
                disabled={accepting}
                className="w-full"
              >
                {accepting ? t("loading") : t("acceptTrip")}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
} 