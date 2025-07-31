"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { supabase } from "@/lib/supabase/client"
import type { Profile } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch" // Import Switch
import { useToast } from "@/hooks/use-toast" // Import useToast
import { fetchUsersForAdmin, toggleUserApproval } from "@/app/actions/admin-users"
import { useI18n } from "@/lib/i18n" // Import useI18n

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast() // Initialize toast
  const t = useI18n() // Initialize useI18n

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true)
      setError(null)
      try {
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (authError || !authData.user) {
          router.push("/login")
          return
        }

        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", authData.user.id)
          .maybeSingle()

        if (profileError || !profileData || profileData.role !== "admin") {
          router.push("/dashboard")
          return
        }

        const result = await fetchUsersForAdmin()

        if (!result.success) {
          throw new Error(result.error || t("failedToFetchUsers"))
        }

        setUsers(result.users || [])
      } catch (err: any) {
        console.error("Error loading admin users:", err)
        setError(err.message || t("unexpectedErrorLoadingUsers"))
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [router, t])

  const handleToggleApproval = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus
    const originalUsers = [...users] // Save current state for rollback

    // Optimistic UI update
    setUsers(users.map((user) => (user.id === userId ? { ...user, is_approved: newStatus } : user)))

    const result = await toggleUserApproval(userId, newStatus)

    if (!result.success) {
      toast({
        title: t("error"),
        description: result.error || t("failedToUpdateApprovalStatus"),
        variant: "destructive",
      })
      setUsers(originalUsers) // Rollback on error
    } else {
      toast({
        title: t("success"),
        description: t(newStatus ? "userApprovedSuccess" : "userDisapprovedSuccess"),
      })
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">{t("manageUsers")}</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">← {t("backToAdminDashboard")}</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("allRegisteredUsers")}</CardTitle>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">{t("noUsersFound")}</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("fullName")}</TableHead>
                    <TableHead>{t("email")}</TableHead>
                    <TableHead>{t("phone")}</TableHead>
                    <TableHead>{t("userType")}</TableHead>
                    <TableHead>{t("role")}</TableHead>
                    <TableHead>{t("subscription")}</TableHead>
                    <TableHead>{t("approved")}</TableHead>
                    <TableHead className="text-right">{t("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.full_name || t("na")}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phone || t("na")}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {user.user_type || t("na")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.role === "admin" ? "default" : "secondary"} className="capitalize">
                          {user.role || t("user")}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.user_type === "driver" ? (
                          user.is_subscribed ? (
                            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                              {t("subscribed")}
                            </Badge>
                          ) : (
                            <Badge variant="destructive">{t("notSubscribed")}</Badge>
                          )
                        ) : (
                          t("na")
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={user.is_approved}
                          onCheckedChange={() => handleToggleApproval(user.id, user.is_approved || false)}
                          disabled={user.role === "admin"}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" disabled>
                          {t("viewEdit")}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
