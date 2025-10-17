"use client"

import { useState, useEffect } from "react"
import { getAllUsers } from "@/lib/admin-utils"
import { getUserSubmissions, getChallenges } from "@/lib/challenge-utils"
import type { User } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Medal, Award, Users, Target, BarChart3 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import { ChartContainer, ChartTooltip } from "@/components/ui/chart"
import { Progress } from "@/components/ui/progress"

interface LeaderboardEntry extends User {
  rank: number
  solvedCount: number
  progress: number
}

export default function LeaderboardPage() {
  const { user: currentUser } = useAuth()
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [totalChallenges, setTotalChallenges] = useState(0)

  useEffect(() => {
    const users = getAllUsers()
    const challenges = getChallenges()
    setTotalChallenges(challenges.length)

    // Calculate solved count for each user
    const usersWithStats = users.map((user) => {
      const submissions = getUserSubmissions(user.id)
      const solvedChallengeIds = new Set<string>()

      submissions.forEach((sub) => {
        if (sub.correct) {
          solvedChallengeIds.add(sub.challengeId)
        }
      })

      const solvedCount = solvedChallengeIds.size
      const progress = challenges.length > 0 ? (solvedCount / challenges.length) * 100 : 0

      return {
        ...user,
        solvedCount,
        progress,
      }
    })

    // Sort by score (descending)
    const sorted = usersWithStats.sort((a, b) => b.score - a.score)

    // Add ranks
    const withRanks: LeaderboardEntry[] = sorted.map((user, index) => ({
      ...user,
      rank: index + 1,
    }))

    setLeaderboard(withRanks)
  }, [currentUser])

  const getPlaceBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return (
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-bold text-yellow-500">1st</span>
          </div>
        )
      case 2:
        return (
          <div className="flex items-center gap-2">
            <Medal className="h-5 w-5 text-gray-400" />
            <span className="font-bold text-gray-400">2nd</span>
          </div>
        )
      case 3:
        return (
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-amber-700" />
            <span className="font-bold text-amber-700">3rd</span>
          </div>
        )
      default:
        return <span className="font-semibold text-muted-foreground">{rank}th</span>
    }
  }

  const totalUsers = leaderboard.length
  const averageScore = totalUsers > 0 ? Math.round(leaderboard.reduce((sum, u) => sum + u.score, 0) / totalUsers) : 0
  const highestScore = leaderboard.length > 0 ? leaderboard[0].score : 0
  const totalSolves = leaderboard.reduce((sum, u) => sum + u.solvedCount, 0)

  const chartData = leaderboard.slice(0, 20).map((entry) => ({
    username: entry.username.length > 10 ? entry.username.substring(0, 10) + "..." : entry.username,
    fullUsername: entry.username,
    score: entry.score,
    rank: entry.rank,
    solved: entry.solvedCount,
  }))

  const barColors = [
    "hsl(var(--chart-1))",
    "hsl(var(--chart-2))",
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
  ]

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-muted-foreground">Top performers in the competition</p>
        </div>

        {leaderboard.length > 0 ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Rankings</CardTitle>
              <CardDescription>Complete leaderboard standings with progress tracking</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Place</TableHead>
                    <TableHead>Username</TableHead>
                    <TableHead>Affiliation</TableHead>
                    <TableHead className="text-right">Score</TableHead>
                    <TableHead className="text-right">Solved</TableHead>
                    <TableHead className="w-[200px]">Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry) => (
                    <TableRow
                      key={entry.id}
                      className={`${
                        currentUser?.id === entry.id ? "bg-primary/5 hover:bg-primary/10" : ""
                      } ${entry.rank <= 3 ? "font-semibold" : ""}`}
                    >
                      <TableCell>{getPlaceBadge(entry.rank)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{entry.username}</span>
                          {currentUser?.id === entry.id && (
                            <Badge variant="outline" className="text-xs">
                              You
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">{entry.affiliation || "Independent"}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-lg font-bold text-primary">{entry.score}</span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="secondary">
                          {entry.solvedCount}/{totalChallenges}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <Progress value={entry.progress} className="h-2" />
                          <p className="text-xs text-muted-foreground text-right">{entry.progress.toFixed(1)}%</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8">
            <CardContent className="p-12 text-center">
              <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No users on the leaderboard yet. Be the first to solve challenges!
              </p>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Competitors</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highestScore}</div>
              <p className="text-xs text-muted-foreground">
                {leaderboard.length > 0 ? `by ${leaderboard[0].username}` : "No scores yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Score</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{averageScore}</div>
              <p className="text-xs text-muted-foreground">Across all users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Solves</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSolves}</div>
              <p className="text-xs text-muted-foreground">Challenges completed</p>
            </CardContent>
          </Card>
        </div>

        {leaderboard.length > 0 && (
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Score Distribution</CardTitle>
              <CardDescription>Top 20 competitors by score with detailed breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  score: {
                    label: "Score",
                    color: "hsl(var(--primary))",
                  },
                }}
                className="h-[500px] w-full"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis
                      dataKey="username"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                    />
                    <YAxis
                      className="text-xs"
                      tick={{ fill: "hsl(var(--muted-foreground))" }}
                      label={{ value: "Score", angle: -90, position: "insideLeft" }}
                    />
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-3 shadow-lg">
                              <div className="space-y-1">
                                <p className="font-semibold text-sm">{data.fullUsername}</p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Trophy className="h-3 w-3" />
                                  <span>Rank: #{data.rank}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <span className="font-semibold text-primary">Score: {data.score}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Target className="h-3 w-3" />
                                  <span>Solved: {data.solved}</span>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={barColors[index % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  )
}
