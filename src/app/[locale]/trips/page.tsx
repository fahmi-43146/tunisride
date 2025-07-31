"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { MapPin, Calendar, DollarSign, Users, Filter, Plus, Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useLanguage } from "@/lib/language-context"
import { supabase } from "@/lib/supabase/client"
import type { Profile, Trip, Governorate, City } from "@/lib/types"
import { getCityName, getGovernorateName, cn } from "@/lib/utils" // Import cn from utils
import { Command, CommandList, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export default function TripsPage() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [trips, setTrips] = useState<Trip[]>([])
  const [governorates, setGovernorates] = useState<Governorate[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    governorate: "",
    fromCity: "",
    toCity: "",
    minFare: "",
    maxFare: "",
    date: "",
  })
  const { t, language } = useLanguage()
  const router = useRouter()

  // State for Combobox open/close
  const [openGovernorate, setOpenGovernorate] = useState(false)
  const [openFromCity, setOpenFromCity] = useState(false)
  const [openToCity, setOpenToCity] = useState(false)

  useEffect(() => {
    const initializePage = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check authentication status
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          console.error("Auth error:", authError)
          // Do not redirect, just log the error. User can still view public trips.
        }

        let userProfile: Profile | null = null
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .maybeSingle()

          if (profileError) {
            console.error("Profile error:", profileError)
            throw new Error(`Failed to load profile: ${profileError.message}`)
          }
          userProfile = profileData || null
        }
        setProfile(userProfile)

        // Load governorates and cities in parallel
        const [govResponse, citiesResponse] = await Promise.all([
          supabase.from("governorates").select("*").order("name_en"),
          supabase.from("cities").select("*, governorate:governorates(*)").order("name_en"),
        ])

        if (govResponse.error) {
          console.error("Governorates error:", govResponse.error)
          throw new Error(`Failed to load governorates: ${govResponse.error.message}`)
        }

        if (citiesResponse.error) {
          console.error("Cities error:", citiesResponse.error)
          throw new Error(`Failed to load cities: ${citiesResponse.error.message}`)
        }

        setGovernorates(govResponse.data || [])
        setCities(citiesResponse.data || [])

        // Load trips based on user type or for public view
        await loadTrips(userProfile)
      } catch (error: any) {
        console.error("Page initialization error:", error)
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    initializePage()
  }, [router])

  const loadTrips = async (userProfile: Profile | null) => {
    try {
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

      if (userProfile?.user_type === "passenger") {
        // Passengers see their own trips
        query = query.eq("passenger_id", userProfile.id)
      } else if (userProfile?.user_type === "driver") {
        // Drivers see all pending trips or their accepted trips
        query = query.or(`status.eq.pending,driver_id.eq.${userProfile.id}`)
      } else {
        // Unauthenticated users see only pending trips
        query = query.eq("status", "pending")
      }

      // Apply filters
      if (filters.fromCity && filters.fromCity !== "all") {
        query = query.eq("from_city_id", filters.fromCity)
      }
      if (filters.toCity && filters.toCity !== "all") {
        query = query.eq("to_city_id", filters.toCity)
      }
      if (filters.minFare) {
        query = query.gte("fare_offered", filters.minFare)
      }
      if (filters.maxFare) {
        query = query.lte("fare_offered", filters.maxFare)
      }
      if (filters.date) {
        query = query.eq("departure_date", filters.date)
      }

      const { data: tripsData, error: tripsError } = await query.order("created_at", { ascending: false })

      if (tripsError) {
        console.error("Trips error:", tripsError)
        throw new Error(`Failed to load trips: ${tripsError.message}`)
      }

      setTrips(tripsData || [])
    } catch (error: any) {
      console.error("Load trips error:", error)
      setError(error.message)
    }
  }

  // Reload trips when filters change or profile changes (if it was null initially)
  useEffect(() => {
    // Only re-load if profile changes from null to a value, or if filters change
    // This prevents infinite loops if profile is always null
    if (!loading) {
      // Ensure initial loading is done
      loadTrips(profile)
    }
  }, [filters, profile, loading])

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

  const getGovernorateCity = (governorateId: string) => {
    return cities.filter((city) => city.governorate_id === Number.parseInt(governorateId))
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading trips...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Alert variant="destructive">
          <AlertDescription>
            <strong>Error loading page:</strong> {error}
            <div className="mt-2">
              <Button variant="outline" onClick={() => window.location.reload()} className="bg-transparent">
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">{t("trips")}</h1>
          <p className="text-muted-foreground mt-2">
            {profile?.user_type === "passenger"
              ? "Manage your trip requests"
              : profile?.user_type === "driver"
                ? "Browse and accept available trips"
                : "Browse available trips"}
          </p>
        </div>
        {profile?.user_type === "passenger" && (
          <Link href="/trips/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              {t("postTrip")}
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Governorate</Label>
              <Popover open={openGovernorate} onOpenChange={setOpenGovernorate}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openGovernorate}
                    className="w-full justify-between text-foreground bg-background"
                  >
                    {filters.governorate
                      ? getGovernorateName(
                          governorates.find((gov) => gov.id.toString() === filters.governorate) || {
                            id: 0,
                            name_en: "",
                            name_ar: "",
                            name_fr: "",
                          },
                          language,
                        )
                      : t("selectGovernorate")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder={t("selectGovernorate")} />
                    <CommandList>
                      <CommandEmpty>{t("noDataAvailable")}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setFilters({ ...filters, governorate: "all", fromCity: "", toCity: "" })
                            setOpenGovernorate(false)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", filters.governorate === "all" ? "opacity-100" : "opacity-0")}
                          />
                          {t("allGovernorates")}
                        </CommandItem>
                        {governorates.map((gov) => (
                          <CommandItem
                            key={gov.id}
                            value={getGovernorateName(gov, language)}
                            onSelect={() => {
                              setFilters({ ...filters, governorate: gov.id.toString(), fromCity: "", toCity: "" })
                              setOpenGovernorate(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filters.governorate === gov.id.toString() ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {getGovernorateName(gov, language)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{t("from")}</Label>
              <Popover open={openFromCity} onOpenChange={setOpenFromCity}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openFromCity}
                    className="w-full justify-between text-foreground bg-background"
                  >
                    {filters.fromCity
                      ? getCityName(
                          (filters.governorate ? getGovernorateCity(filters.governorate) : cities).find(
                            (city) => city.id.toString() === filters.fromCity,
                          ) || { id: 0, governorate_id: 0, name_en: "", name_ar: "", name_fr: "" },
                          language,
                        )
                      : t("selectCity")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder={t("selectCity")} />
                    <CommandList>
                      <CommandEmpty>{t("noDataAvailable")}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setFilters({ ...filters, fromCity: "all" })
                            setOpenFromCity(false)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", filters.fromCity === "all" ? "opacity-100" : "opacity-0")}
                          />
                          {t("allCities")}
                        </CommandItem>
                        {(filters.governorate ? getGovernorateCity(filters.governorate) : cities).map((city) => (
                          <CommandItem
                            key={city.id}
                            value={getCityName(city, language)}
                            onSelect={() => {
                              setFilters({ ...filters, fromCity: city.id.toString() })
                              setOpenFromCity(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filters.fromCity === city.id.toString() ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {getCityName(city, language)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{t("to")}</Label>
              <Popover open={openToCity} onOpenChange={setOpenToCity}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openToCity}
                    className="w-full justify-between text-foreground bg-background"
                  >
                    {filters.toCity
                      ? getCityName(
                          (filters.governorate ? getGovernorateCity(filters.governorate) : cities).find(
                            (city) => city.id.toString() === filters.toCity,
                          ) || { id: 0, governorate_id: 0, name_en: "", name_ar: "", name_fr: "" },
                          language,
                        )
                      : t("selectCity")}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                  <Command>
                    <CommandInput placeholder={t("selectCity")} />
                    <CommandList>
                      <CommandEmpty>{t("noDataAvailable")}</CommandEmpty>
                      <CommandGroup>
                        <CommandItem
                          value="all"
                          onSelect={() => {
                            setFilters({ ...filters, toCity: "all" })
                            setOpenToCity(false)
                          }}
                        >
                          <Check
                            className={cn("mr-2 h-4 w-4", filters.toCity === "all" ? "opacity-100" : "opacity-0")}
                          />
                          {t("allCities")}
                        </CommandItem>
                        {(filters.governorate ? getGovernorateCity(filters.governorate) : cities).map((city) => (
                          <CommandItem
                            key={city.id}
                            value={getCityName(city, language)}
                            onSelect={() => {
                              setFilters({ ...filters, toCity: city.id.toString() })
                              setOpenToCity(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                filters.toCity === city.id.toString() ? "opacity-100" : "opacity-0",
                              )}
                            />
                            {getCityName(city, language)}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>
                Min {t("fare")} ({t("tnd")})
              </Label>
              <Input
                type="number"
                placeholder="0"
                value={filters.minFare}
                onChange={(e) => setFilters({ ...filters, minFare: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>
                Max {t("fare")} ({t("tnd")})
              </Label>
              <Input
                type="number"
                placeholder="1000"
                value={filters.maxFare}
                onChange={(e) => setFilters({ ...filters, maxFare: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>{t("date")}</Label>
              <Input
                type="date"
                value={filters.date}
                onChange={(e) => setFilters({ ...filters, date: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Trips List */}
      <div className="space-y-6">
        {trips.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-muted-foreground mb-4">No trips found</p>
              {profile?.user_type === "passenger" && (
                <Link href="/trips/new">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t("postTrip")}
                  </Button>
                </Link>
              )}
              {!profile && (
                <p className="text-sm text-muted-foreground mt-4">
                  <Link href="/register" className="text-primary hover:underline">
                    Register
                  </Link>{" "}
                  or{" "}
                  <Link href="/login" className="text-primary hover:underline">
                    Login
                  </Link>{" "}
                  to post a trip or accept rides.
                </p>
              )}
            </CardContent>
          </Card>
        ) : (
          trips.map((trip) => (
            <Link key={trip.id} href={`/trips/${trip.id}`}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="h-5 w-5 text-primary" />
                        <span className="text-lg font-semibold">
                          {getCityName(trip.from_city, language)} → {getCityName(trip.to_city, language)}
                        </span>
                        <Badge className={getStatusColor(trip.status)}>{t(trip.status as any)}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{trip.departure_date}</span>
                        </div>
                        {trip.departure_time && (
                          <div className="flex items-center space-x-2">
                            <span className="text-muted-foreground">Time:</span>
                            <span>{trip.departure_time}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <DollarSign className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">
                            {trip.fare_offered} {t("tnd")}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {trip.passenger_count} {trip.passenger_count === 1 ? "passenger" : "passengers"}
                          </span>
                        </div>
                      </div>

                      {trip.notes && (
                        <div className="mt-3 p-3 bg-muted rounded-lg">
                          <p className="text-sm">{trip.notes}</p>
                        </div>
                      )}

                      <div className="mt-3 text-sm text-muted-foreground">
                        {profile?.user_type === "driver" && (
                          <span>Passenger: {trip.passenger?.full_name || trip.passenger?.email}</span>
                        )}
                        {profile?.user_type === "passenger" && trip.driver && (
                          <span>Driver: {trip.driver.full_name || trip.driver.email}</span>
                        )}
                        {!profile && ( // For unauthenticated users, show generic info
                          <span>Passenger: {trip.passenger?.full_name || "N/A"}</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 md:mt-0 md:ml-6 flex flex-col space-y-2">
                      {profile?.user_type === "driver" && trip.status === "pending" && (
                        <Link href={`/trips/${trip.id}/accept`}>
                          <Button className="w-full md:w-auto">{t("acceptTrip")}</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
