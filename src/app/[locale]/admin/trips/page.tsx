"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import type { Trip } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { fetchTripsForAdmin, deleteTripAsAdmin } from "@/app/actions/admin-trips" // Import new actions
import { getCityName } from "@/lib/utils"
import { useI18n } from "@/lib/i18n"
import { useLanguage } from "@/lib/language-context"
import { Filter, Trash2, Edit } from "lucide-react" // Import new icons

export default function AdminTripsPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({ status: "all" })
  const router = useRouter()
  const { toast } = useToast()
  const t = useI18n()
  const { language } = useLanguage()

  useEffect(() => {
    const loadTrips = async () => {
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

        const result = await fetchTripsForAdmin()

        if (!result.success) {
          throw new Error(result.message || t("failedToFetchTrips"))
        }

        setTrips(result.data || [])
      } catch (err: any) {
        console.error("Error loading admin trips:", err)
        setError(err.message || t("unexpectedErrorLoadingTrips"))
      } finally {
        setLoading(false)
      }
    }

    loadTrips()
  }, [router, filters, t]) // Reload trips when filters change

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

  const handleDeleteTrip = async (tripId: string) => {
    if (!confirm(t("confirmDeleteTrip"))) {
      return
    }

    const originalTrips = [...trips] // Save current state for rollback
    setTrips(trips.filter((trip) => trip.id !== tripId)) // Optimistic UI update

    const result = await deleteTripAsAdmin(tripId)

    if (!result.success) {
      toast({
        title: t("error"),
        description: result.message || t("failedToDeleteTrip"),
        variant: "destructive",
      })
      setTrips(originalTrips) // Rollback on error
    } else {
      toast({
        title: t("success"),
        description: t("tripDeletedSuccess"),
      })
    }
  }

  // Placeholder for edit functionality - for now, links to trip details page
  const handleEditTrip = (tripId: string) => {
    router.push(`/trips/${tripId}`)
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
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("manageTrips")}</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">← {t("backToAdminDashboard")}</Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="h-5 w-5 mr-2" />
            {t("filters")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t("status")}</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters({ ...filters, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectStatus")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t("allStatuses")}</SelectItem>
                  <SelectItem value="pending">{t("pending")}</SelectItem>
                  <SelectItem value="accepted">{t("accepted")}</SelectItem>
                  <SelectItem value="completed">{t("completed")}</SelectItem>
                  <SelectItem value="cancelled">{t("cancelled")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("allTrips")}</CardTitle>
        </CardHeader>
        <CardContent>
          {trips.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("noTripsFound")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("id")}</TableHead>
                    <TableHead>{t("from")}</TableHead>
                    <TableHead>{t("to")}</TableHead>
                    <TableHead>{t("date")}</TableHead>
                    <TableHead>{t("fare")}</TableHead>
                    <TableHead>{t("passengers")}</TableHead>
                    <TableHead>{t("status")}</TableHead>
                    <TableHead>{t("passenger")}</TableHead>
                    <TableHead>{t("driver")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trips.map((trip) => (
                    <TableRow key={trip.id}>
                      <TableCell className="font-medium text-xs">{trip.id.substring(0, 8)}...</TableCell>
                      <TableCell>{String(trip.from_city || t("na"))}</TableCell>
                      <TableCell>{String(trip.to_city || t("na"))}</TableCell>
                      <TableCell>{trip.departure_date}</TableCell>
                      <TableCell>
                        {trip.fare_offered} {t("tnd")}
                      </TableCell>
                      <TableCell>{trip.passenger_count}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(trip.status)}>{trip.status}</Badge>
                      </TableCell>
                      <TableCell>{trip.passenger?.full_name || trip.passenger?.email || t("na")}</TableCell>
                      <TableCell>{trip.driver?.full_name || trip.driver?.email || t("na")}</TableCell>
                      <TableCell className="text-right flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleEditTrip(trip.id)}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">{t("edit")}</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteTrip(trip.id)}>
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">{t("delete")}</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
