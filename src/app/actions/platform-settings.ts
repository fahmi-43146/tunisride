"use server"

import { supabaseServer } from "@/lib/supabase/server"
import type { PlatformSetting } from "@/lib/types"

// Helper function to check admin role
async function checkAdminRole() {
  const { data: authData, error: authError } = await supabaseServer.auth.getUser()

  if (authError || !authData.user) {
    throw new Error("Authentication required.")
  }

  const { data: adminProfile, error: profileError } = await supabaseServer
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle()

  if (profileError || !adminProfile || adminProfile.role !== "admin") {
    throw new Error("Unauthorized: Admin access required.")
  }
}

export async function fetchPlatformSettings(): Promise<{
  success: boolean
  settings?: PlatformSetting[]
  error?: string
}> {
  try {
    await checkAdminRole()

    const { data: settings, error: fetchError } = await supabaseServer
      .from("platform_settings")
      .select("*")
      .order("key", { ascending: true })

    if (fetchError) {
      console.error("Error fetching platform settings:", fetchError)
      return { success: false, error: fetchError.message }
    }

    return { success: true, settings: settings as PlatformSetting[] }
  } catch (error: any) {
    console.error("Server action error (fetchPlatformSettings):", error)
    return { success: false, error: error.message || "An unexpected error occurred." }
  }
}

export async function updatePlatformSetting(key: string, value: string): Promise<{ success: boolean; error?: string }> {
  try {
    await checkAdminRole()

    const { error: updateError } = await supabaseServer
      .from("platform_settings")
      .update({ value, updated_at: new Date().toISOString() })
      .eq("key", key)

    if (updateError) {
      console.error(`Error updating setting '${key}':`, updateError)
      return { success: false, error: updateError.message }
    }

    return { success: true }
  } catch (error: any) {
    console.error("Server action error (updatePlatformSetting):", error)
    return { success: false, error: error.message || "An unexpected error occurred." }
  }
}
