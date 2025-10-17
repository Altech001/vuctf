"use client"

import { useState, useEffect } from "react"
import { getChallenges } from "@/lib/challenge-utils"
import { getAllUsers } from "@/lib/admin-utils"
import type { Challenge, User } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { AdminGuard } from "@/components/admin-guard"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Users, Target, Trophy, Activity } from "lucide-react"
import Link from "next/link"
import { ChallengeManagement } from "@/components/admin/challenge-management"
import { UserManagement } from "@/components/admin/user-management"

export default function AdminPage() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [stats, setStats] = useState({
    totalChallenges: 0,
    totalUsers: 0,
    totalSolves: 0,
    avgScore: 0,
  })

  const loadData = () => {
    const loadedChallenges = getChallenges()
    const loadedUsers = getAllUsers()

    setChallenges(loadedChallenges)
    setUsers(loadedUsers)

    const totalSolves = loadedChallenges.reduce((sum, c) => sum + c.solves, 0)
    const avgScore = loadedUsers.length > 0 ? loadedUsers.reduce((sum, u) => sum + u.score, 0) / loadedUsers.length : 0

    setStats({
      totalChallenges: loadedChallenges.length,
      totalUsers: loadedUsers.length,
      totalSolves,
      avgScore: Math.round(avgScore),
    })
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <AdminGuard>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">Manage challenges, users, and platform settings</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{stats.totalChallenges}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-accent" />
                <span className="text-3xl font-bold">{stats.totalUsers}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Solves</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">{stats.totalSolves}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Average Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{stats.avgScore}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="challenges" className="space-y-6">
          <TabsList>
            <TabsTrigger value="challenges">Challenges</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="challenges" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Challenge Management</h2>
                <p className="text-muted-foreground">Create, edit, and delete challenges</p>
              </div>
              <Link href="/admin/challenges/new">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  New Challenge
                </Button>
              </Link>
            </div>
            <ChallengeManagement challenges={challenges} onUpdate={loadData} />
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">User Management</h2>
              <p className="text-muted-foreground">Manage user roles and permissions</p>
            </div>
            <UserManagement users={users} onUpdate={loadData} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminGuard>
  )
}
