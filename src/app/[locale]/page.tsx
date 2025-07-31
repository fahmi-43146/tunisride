"use client"

import Link from "next/link"
import { Car, Users, MapPin, Shield, Clock, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useTranslations } from "next-intl"

export default function HomePage() {
  const t = useTranslations()

  // Check if Supabase is configured
  const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const features = [
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: t("connectPassengersDrivers"),
      description: t("connectPassengersDriversDesc"),
    },
    {
      icon: <MapPin className="h-8 w-8 text-primary" />,
      title: t("cityToCityTravel"),
      description: t("cityToCityTravelDesc"),
    },
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      title: t("setYourOwnFare"),
      description: t("setYourOwnFareDesc"),
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: t("secureVerified"),
      description: t("secureVerifiedDesc"),
    },
    {
      icon: <Clock className="h-8 w-8 text-primary" />,
      title: t("realtimeUpdates"),
      description: t("realtimeUpdatesDesc"),
    },
    {
      icon: <Car className="h-8 w-8 text-primary" />,
      title: t("vehicleInformation"),
      description: t("vehicleInformationDesc"),
    },
  ]

  // If Supabase isn't configured, show a setup message
  if (!isSupabaseConfigured) {
    return (
      <div className="flex flex-col min-h-screen">
        <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("welcomeToTunisRide")}</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              {t("platformDescription")}
            </p>
            <div className="bg-yellow-100 dark:bg-yellow-900 border border-yellow-300 dark:border-yellow-700 rounded-lg p-6 max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-2">Setup Required</h3>
              <p className="text-sm">
                Please add the Supabase integration to enable full functionality. Click the "Add Integration" button
                above to get started.
              </p>
            </div>
          </div>
        </section>

        {/* Keep the rest of the homepage content */}
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whyChooseTunisRide")}</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("whyChooseTunisRideDescription")}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center">
                  <CardHeader>
                    <div className="flex justify-center mb-4">{feature.icon}</div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary/10 via-primary/5 to-background py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">{t("welcomeToTunisRide")}</h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">{t("platformDescription")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">
                {t("getStartedAs")} {t("passenger")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                {t("joinAs")} {t("driver")}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("whyChooseTunisRide")}</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">{t("whyChooseTunisRideDescription")}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">{feature.icon}</div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-muted/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("howItWorks")}</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* For Passengers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">{t("forPassengers")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("registerLogin")}</h3>
                    <p className="text-muted-foreground">{t("registerLoginDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("postYourTrip")}</h3>
                    <p className="text-muted-foreground">{t("postYourTripDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("getMatched")}</h3>
                    <p className="text-muted-foreground">{t("getMatchedDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("travelSafely")}</h3>
                    <p className="text-muted-foreground">{t("travelSafelyDesc")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* For Drivers */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-center">{t("forDrivers")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("registerVerify")}</h3>
                    <p className="text-muted-foreground">{t("registerVerifyDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("browseTrips")}</h3>
                    <p className="text-muted-foreground">{t("browseTripsDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("acceptTrips")}</h3>
                    <p className="text-muted-foreground">{t("acceptTripsDesc")}</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center font-bold">
                    4
                  </div>
                  <div>
                    <h3 className="font-semibold">{t("completeTrip")}</h3>
                    <p className="text-muted-foreground">{t("completeTripDesc")}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">{t("readyToStartJourney")}</h2>
          <p className="text-xl text-muted-foreground mb-8">{t("readyToStartJourneyDesc")}</p>
          <Link href="/register">
            <Button size="lg" className="text-lg px-8 py-3">
              {t("joinTunisRideToday")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}
