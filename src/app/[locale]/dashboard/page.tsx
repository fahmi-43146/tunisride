"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Plus, MapPin, Calendar, DollarSign, Users, Car } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useLanguage } from "@/lib/language-context"
import { supabase } from "@/lib/supabase/client"
import type { Profile, Trip } from "@/lib/types"
import { getCityName } from "@/lib/utils" // Import getCityName from utils

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const { t, language } = useLanguage() // Destructure language from useLanguage
  const router = useRouter()

  useEffect(() => {
    const getProfileAndTrips = async () => {
      try {
        setLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push("/login")
          return
        }

        // Use maybeSingle() to handle cases where profile might not exist yet
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) {
          console.error("Error fetching profile:", profileError)
          // Handle error, maybe redirect to an error page or show a message
          return
        }

        if (!profileData) {
          // If no profile, redirect to complete profile page
          router.push("/complete-profile")
          return
        }

        setProfile(profileData)

        // Get user's trips based on their type
        let query = supabase.from("trips").select(`
          *,
          from_city:cities!trips_from_city_id_fkey(
            id, name_en, name_ar, name_fr,
            governorate:governorates(id, name_en, name_ar, name_fr)
          ),
          to_city:cities!trips_to_city_id_fkey(
            id, name_en, name_ar, name_fr,
            governorate:governorates(id, name_en, name_ar, name_fr)
          ),
          passenger:profiles!trips_passenger_id_fkey(id, full_name, email),
          driver:profiles!trips_driver_id_fkey(id, full_name, email)
        `)

        if (profileData.user_type === "passenger") {
          query = query.eq("passenger_id", user.id)
        } else {
          query = query.eq("driver_id", user.id)
        }

        const { data: tripsData, error: tripsError } = await query.order("created_at", { ascending: false })

        if (tripsError) {
          console.error("Error fetching trips:", tripsError)
          // Handle error
          return
        }

        setTrips(tripsData || [])
      } catch (error) {
        console.error("Dashboard initialization error:", error)
      } finally {
        setLoading(false)
      }
    }

    getProfileAndTrips()
  }, [router])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "accepted":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "completed":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "cancelled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">
          {t("welcomeBack")}, {profile?.full_name || t("user")}!
        </h1>
        <p className="text-muted-foreground mt-2">
          {profile?.user_type === "passenger" ? t("manageTripRequestsBookings") : t("browseAcceptAvailableRides")}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {profile?.user_type === "passenger" ? (
          <>
            <Link href="/trips/new">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <Plus className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <h3 className="font-semibold">{t("postTrip")}</h3>
                    <p className="text-sm text-muted-foreground">{t("createNewTripRequest")}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Card>
              <CardContent className="flex items-center p-6">
                <Calendar className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <h3 className="font-semibold">{t("activeTrips")}</h3>
                  <p className="text-2xl font-bold">{trips.filter((t) => t.status === "accepted").length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <MapPin className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <h3 className="font-semibold">{t("pendingRequests")}</h3>
                  <p className="text-2xl font-bold">{trips.filter((t) => t.status === "pending").length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <DollarSign className="h-8 w-8 text-purple-500 mr-4" />
                <div>
                  <h3 className="font-semibold">{t("totalSpent")}</h3>
                  <p className="text-2xl font-bold">
                    {trips.filter((t) => t.status === "completed").reduce((sum, t) => sum + Number(t.fare_offered), 0)}{" "}
                    {t("tnd")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Link href="/trips">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="flex items-center p-6">
                  <Car className="h-8 w-8 text-primary mr-4" />
                  <div>
                    <h3 className="font-semibold">{t("browseTrips")}</h3>
                    <p className="text-sm text-muted-foreground">{t("findAvailableTrips")}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            <Card>
              <CardContent className="flex items-center p-6">
                <Users className="h-8 w-8 text-blue-500 mr-4" />
                <div>
                  <h3 className="font-semibold">{t("acceptedTrips")}</h3>
                  <p className="text-2xl font-bold">{trips.filter((t) => t.status === "accepted").length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <MapPin className="h-8 w-8 text-green-500 mr-4" />
                <div>
                  <h3 className="font-semibold">{t("completedTrips")}</h3>
                  <p className="text-2xl font-bold">{trips.filter((t) => t.status === "completed").length}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="flex items-center p-6">
                <DollarSign className="h-8 w-8 text-purple-500 mr-4" />
                <div>
                  <h3 className="font-semibold">{t("totalEarned")}</h3>
                  <p className="text-2xl font-bold">
                    {trips.filter((t) => t.status === "completed").reduce((sum, t) => sum + Number(t.fare_offered), 0)}{" "}
                    {t("tnd")}
                  </p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Recent Trips */}
      <Card>
        <CardHeader>
          <CardTitle>{t("recentTrips")}</CardTitle>
          <CardDescription>
            {profile?.user_type === "passenger" ? t("yourLatestTripRequests") : t("yourLatestTripAcceptances")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">{t("noTripsFound")}</p>
              {profile?.user_type === "passenger" ? (
                <Link href="/trips/new">
                  <Button className="mt-4">
                    <Plus className="h-4 w-4 mr-2" />
                    {t("postTrip")}
                  </Button>
                </Link>
              ) : (
                <Link href="/trips">
                  <Button className="mt-4">
                    <Car className="h-4 w-4 mr-2" />
                    {t("browseTrips")}
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {trips.slice(0, 5).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {getCityName(trip.from_city, language)} → {getCityName(trip.to_city, language)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{trip.departure_date}</span>
                      {trip.departure_time && <span>{trip.departure_time}</span>}
                      <span>
                        {trip.fare_offered} {t("tnd")}
                      </span>
                    </div>
                  </div>
                  <Badge className={getStatusColor(trip.status)}>{t(trip.status as any)}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
