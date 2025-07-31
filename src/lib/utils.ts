import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { City, Governorate, Language } from "./types" // Import types for City and Governorate

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCityName(city: City | null | undefined, language: Language): string {
  if (!city) return ""
  switch (language) {
    case "ar":
      return city.name_ar
    case "fr":
      return city.name_fr
    default:
      return city.name_en
  }
}

export function getGovernorateName(governorate: Governorate | null | undefined, language: Language): string {
  if (!governorate) return ""
  switch (language) {
    case "ar":
      return governorate.name_ar
    case "fr":
      return governorate.name_fr
    default:
      return governorate.name_en
  }
}
