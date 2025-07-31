import { NextResponse } from "next/server"
import { supabaseServer } from "@/lib/supabase/server"

export async function GET() {
  try {
    const today = new Date().toISOString().split("T")[0] // Get today's date in YYYY-MM-DD format

    // Select trips that are pending and have a departure date in the past
    const { data: expiredTrips, error: selectError } = await supabaseServer
      .from("trips")
      .select("id, departure_date, status")
      .lt("departure_date", today) // Less than today's date
      .eq("status", "pending") // Only pending trips

    if (selectError) {
      console.error("Error selecting expired trips:", selectError)
      return NextResponse.json({ success: false, error: selectError.message }, { status: 500 })
    }

    if (!expiredTrips || expiredTrips.length === 0) {
      return NextResponse.json({ success: true, message: "No expired pending trips found to delete." }, { status: 200 })
    }

    const tripIdsToDelete = expiredTrips.map((trip) => trip.id)

    // Delete the identified trips
    const { error: deleteError } = await supabaseServer.from("trips").delete().in("id", tripIdsToDelete)

    if (deleteError) {
      console.error("Error deleting expired trips:", deleteError)
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 })
    }

    return NextResponse.json(
      { success: true, message: `Successfully deleted ${expiredTrips.length} expired pending trips.` },
      { status: 200 },
    )
  } catch (error: any) {
    console.error("Cleanup process failed:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
