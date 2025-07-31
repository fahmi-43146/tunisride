export interface Profile {
  id: string
  email: string
  full_name?: string
  phone?: string
  user_type: "passenger" | "driver"
  created_at: string
  updated_at: string
  is_subscribed?: boolean
  subscription_ends_at?: string
  role?: "user" | "admin"
  is_approved?: boolean // New field for admin approval
}

export interface Governorate {
  id: number
  name_en: string
  name_ar: string
  name_fr: string
}

export interface City {
  id: number
  governorate_id: number
  name_en: string
  name_ar: string
  name_fr: string
  governorate?: Governorate
}

export interface Trip {
  id: string
  passenger_id: string
  from_city_id: number
  to_city_id: number
  departure_date: string
  departure_time?: string
  fare_offered: number
  passenger_count: number
  notes?: string
  status: "pending" | "accepted" | "completed" | "cancelled"
  driver_id?: string
  created_at: string
  updated_at: string
  from_city?: City
  to_city?: City
  passenger?: Profile
  driver?: Profile
  payment_status?: "unpaid" | "paid" | "refunded"
}

export interface DriverConfirmation {
  id: string
  trip_id: string
  driver_id: string
  pickup_time: string
  whatsapp_number?: string
  vehicle_make: string
  vehicle_model: string
  vehicle_color: string
  license_plate: string
  message?: string
  terms_accepted: boolean
  created_at: string
  driver_phone: string // Ensure this is always present
}

export interface PlatformSetting {
  key: string
  value: string
  description?: string
  created_at: string
  updated_at: string
}
