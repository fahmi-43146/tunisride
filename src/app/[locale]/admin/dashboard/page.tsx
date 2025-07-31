"use client"

import type React from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useTranslations } from 'next-intl'

export default function AdminDashboardPage() {
  const t = useTranslations()

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] p-4">
      <Card className="w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">{t('adminDashboard')}</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link href="/admin/users">
            <Card className="flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-shadow duration-200">
              <UsersIcon className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-semibold mb-1">{t('manageUsers')}</h3>
              <p className="text-sm text-muted-foreground">{t('viewManageAllUsers')}</p>
              <Button variant="link" className="mt-3">
                {t('goToUserManagement')}
              </Button>
            </Card>
          </Link>

          <Link href="/admin/trips">
            <Card className="flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-shadow duration-200">
              <CarIcon className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-semibold mb-1">{t('manageTrips')}</h3>
              <p className="text-sm text-muted-foreground">{t('overseeAllTrips')}</p>
              <Button variant="link" className="mt-3">
                {t('goToTripManagement')}
              </Button>
            </Card>
          </Link>

          <Link href="/admin/finance">
            <Card className="flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-shadow duration-200">
              <DollarSignIcon className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-semibold mb-1">{t('financialOverview')}</h3>
              <p className="text-sm text-muted-foreground">{t('viewPlatformEarnings')}</p>
              <Button variant="link" className="mt-3">
                {t('goToFinance')}
              </Button>
            </Card>
          </Link>

          <Link href="/admin/settings">
            <Card className="flex flex-col items-center justify-center p-6 text-center hover:shadow-lg transition-shadow duration-200">
              <SettingsIcon className="h-12 w-12 text-primary mb-3" />
              <h3 className="text-xl font-semibold mb-1">{t('platformSettings')}</h3>
              <p className="text-sm text-muted-foreground">{t('configureGlobalSettings')}</p>
              <Button variant="link" className="mt-3">
                {t('goToSettings')}
              </Button>
            </Card>
          </Link>
        </CardContent>
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

function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
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
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.78 1.28a2 2 0 0 0 .73 2.73l.09.09a2 2 0 0 1 0 2.83l-.09.09a2 2 0 0 0-.73 2.73l.78 1.28a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43-.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.78-1.28a2 2 0 0 0-.73-2.73l-.09-.09a2 2 0 0 1 0-2.83l.09-.09a2 2 0 0 0 .73-2.73l-.78-1.28a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
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