"use server"

import { supabaseServer } from "@/lib/supabase/server"

export async function createProfile(formData: {
  fullName: string
  phone: string
  userType: "passenger" | "driver"
}) {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabaseServer.auth.getUser()

    if (userError || !user) {
      throw new Error("User not authenticated.")
    }

    const { data: profileData, error: profileError } = await supabaseServer
      .from("profiles")
      .insert({
        id: user.id,
        email: user.email, // Use email from auth.user
        full_name: formData.fullName,
        phone: formData.phone,
        user_type: formData.userType,
        is_approved: formData.userType === "driver" ? true : false, // Changed: Default to approved for drivers
      })
      .select()

    if (profileError) {
      console.error("Profile creation error:", profileError)
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    return {
      success: true,
      profile: profileData[0],
    }
  } catch (error: any) {
    console.error("Create profile action error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}
