"use server"

import { supabaseServer } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

export async function fetchTripsForAdmin() {

  const {
    data: { user },
  } = await supabaseServer.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.user_type !== "admin") {
    return { success: false, message: "Unauthorized", data: null }
  }

  try {
    const { data: trips, error } = await supabaseServer
      .from("trips")
      .select(`
        *,
        passenger:profiles!trips_passenger_id_fkey(full_name, email, phone),
        driver:profiles!trips_driver_id_fkey(full_name, email, phone)
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching trips:", error)
      return { success: false, message: error.message, data: null }
    }

    return { success: true, message: "Trips fetched successfully!", data: trips }
  } catch (error: any) {
    console.error("Unexpected error fetching trips:", error)
    return { success: false, message: error.message || "An unexpected error occurred.", data: null }
  }
}

export async function deleteTripAsAdmin(tripId: string) {
  const {
    data: { user },
  } = await supabaseServer.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("user_type")
    .eq("id", user.id)
    .single()

  if (profileError || profile?.user_type !== "admin") {
    return { success: false, message: "Unauthorized" }
  }

  try {
    const { error } = await supabaseServer.from("trips").delete().eq("id", tripId)

    if (error) {
      console.error("Error deleting trip:", error)
      return { success: false, message: error.message }
    }

    revalidatePath("/admin/trips")
    revalidatePath("/trips") // Revalidate the main trips page
    return { success: true, message: "Trip deleted successfully!" }
  } catch (error: any) {
    console.error("Unexpected error deleting trip:", error)
    return { success: false, message: error.message || "An unexpected error occurred." }
  }
}
