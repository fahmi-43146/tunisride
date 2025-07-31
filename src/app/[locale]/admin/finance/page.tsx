import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getFinancialOverview } from "@/app/actions/admin-finance"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { getTotalUsers } from "@/app/actions/admin-users" // Import getTotalUsers function

export default async function AdminFinancePage() {
  const t = useTranslations()
  const financialOverview = await getFinancialOverview()
  const totalUsersResult = await getTotalUsers() // Declare totalUsers variable

  const {
    totalRevenue,
    totalPassengers,
    totalDrivers,
    subscribedDrivers,
    unsubscribedDrivers,
    totalTrips,
    completedTrips,
    pendingTrips,
    acceptedTrips,
    cancelledTrips,
    error,
  } = financialOverview

  const totalUsers = totalUsersResult.success ? totalUsersResult.count || 0 : 0

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center text-red-600">
              {t("errorLoadingFinancialData")}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">{error}</p>
            <Link href="/admin/dashboard">
              <Button>{t("backToAdminDashboard")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">{t("financialOverview")}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Overall Metrics */}
          <Card className="col-span-full bg-primary text-primary-foreground">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("totalRevenue")}</CardTitle>
              <DollarSignIcon className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {totalRevenue} {t("tnd")}
              </div>
              <p className="text-xs text-primary-foreground/80">{t("revenueFromTrips")}</p>
            </CardContent>
          </Card>

          {/* User Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("userStatistics")}</CardTitle>
              <UsersIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">{t("totalUsers")}</p>
              <div className="mt-2 text-sm">
                <p>
                  {t("totalPassengers")}: {totalPassengers}
                </p>
                <p>
                  {t("totalDrivers")}: {totalDrivers}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Driver Subscription Status */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("driverSubscriptionStatus")}</CardTitle>
              <CreditCardIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscribedDrivers}</div>
              <p className="text-xs text-muted-foreground">{t("subscribedDrivers")}</p>
              <div className="mt-2 text-sm">
                <p>
                  {t("unsubscribedDrivers")}: {unsubscribedDrivers}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Trip Statistics */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("tripStatistics")}</CardTitle>
              <CarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalTrips}</div>
              <p className="text-xs text-muted-foreground">{t("totalTrips")}</p>
              <div className="mt-2 text-sm">
                <p>
                  {t("completedTrips")}: {completedTrips}
                </p>
                <p>
                  {t("pendingTrips")}: {pendingTrips}
                </p>
                <p>
                  {t("acceptedTrips")}: {acceptedTrips}
                </p>
                <p>
                  {t("cancelledTrips")}: {cancelledTrips}
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
        <div className="flex justify-center p-6">
          <Link href="/admin/dashboard">
            <Button variant="outline">{t("backToAdminDashboard")}</Button>
          </Link>
        </div>
      </Card>
    </div>
  )
}

function CarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 17H5a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2Z" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  )
}

function CreditCardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  )
}

function DollarSignIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}
