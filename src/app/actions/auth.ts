"use server"

import { supabaseServer } from "@/lib/supabase/server"

export async function registerUser(formData: {
  email: string
  password: string
  fullName: string
  phone: string
  userType: "passenger" | "driver"
}) {
  try {
    // Create user WITHOUT auto-confirming email
    const { data: authData, error: authError } = await supabaseServer.auth.admin.createUser({
      email: formData.email,
      password: formData.password,
      email_confirm: false, // User must confirm email
      user_metadata: {
        full_name: formData.fullName,
        phone: formData.phone,
        user_type: formData.userType,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error("No user data returned from signup")
    }

    // Create profile using service role (bypasses RLS)
    const { data: profileData, error: profileError } = await supabaseServer
      .from("profiles")
      .insert({
        id: authData.user.id,
        email: authData.user.email, // Use email from auth.user
        full_name: formData.fullName,
        phone: formData.phone,
        user_type: formData.userType,
        is_approved: formData.userType === "driver" ? true : false, // Changed: Default to approved for drivers
      })
      .select()

    if (profileError) {
      console.error("Profile creation error:", profileError)
      // Clean up the user if profile creation fails
      await supabaseServer.auth.admin.deleteUser(authData.user.id)
      throw new Error(`Failed to create profile: ${profileError.message}`)
    }

    return {
      success: true,
      user: authData.user,
      profile: profileData[0],
      needsEmailConfirmation: true,
    }
  } catch (error: any) {
    console.error("Registration error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function resendConfirmationEmail(email: string) {
  try {
    const { error } = await supabaseServer.auth.resend({
      type: "signup",
      email: email,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
