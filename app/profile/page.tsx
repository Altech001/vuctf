"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { getUserSubmissions, getChallenges } from "@/lib/challenge-utils"
import {
  getUserTransactions,
  createWithdrawal,
  pointsToUSD,
  getMinWithdrawal,
  getTotalWithdrawn,
} from "@/lib/wallet-utils"
import type { Submission, Challenge, Transaction } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useGeolocation } from "@/hooks/use-geolocation"
import {
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Globe,
  Info,
  BarChart3,
  List,
  MapPin,
  Loader2,
  Wallet,
  DollarSign,
  ArrowDownToLine,
} from "lucide-react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

const categoryColors = {
  Web: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Crypto: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Pwn: "bg-red-500/10 text-red-500 border-red-500/20",
  Forensics: "bg-green-500/10 text-green-500 border-green-500/20",
  "Reverse Engineering": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Misc: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

export default function ProfilePage() {
  const { user } = useAuth()
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [showAllSubmissions, setShowAllSubmissions] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [withdrawalAmount, setWithdrawalAmount] = useState("")
  const [withdrawalMethod, setWithdrawalMethod] = useState<Transaction["method"]>("PayPal")
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [walletDialogOpen, setWalletDialogOpen] = useState(false)
  const { toast } = useToast()
  const [stats, setStats] = useState({
    totalSolved: 0,
    totalAttempts: 0,
    successRate: 0,
    categoriesBreakdown: {} as Record<string, number>,
  })
  const { geoLoading, geoError } = useGeolocation()

  useEffect(() => {
    if (!user) {
      router.push("/login")
    }
  }, [user, router])

  useEffect(() => {
    if (!user) return

    const userSubmissions = getUserSubmissions(user.id)
    const allChallenges = getChallenges()

    setSubmissions(
      userSubmissions.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()),
    )
    setChallenges(allChallenges)

    // Calculate stats
    const solvedChallengeIds = new Set<string>()
    const categoriesBreakdown: Record<string, number> = {}

    userSubmissions.forEach((sub) => {
      if (sub.correct) {
        solvedChallengeIds.add(sub.challengeId)
        const challenge = allChallenges.find((c) => c.id === sub.challengeId)
        if (challenge) {
          categoriesBreakdown[challenge.category] = (categoriesBreakdown[challenge.category] || 0) + 1
        }
      }
    })

    const totalSolved = solvedChallengeIds.size
    const totalAttempts = userSubmissions.length
    const successRate = totalAttempts > 0 ? (totalSolved / totalAttempts) * 100 : 0

    setStats({
      totalSolved,
      totalAttempts,
      successRate,
      categoriesBreakdown,
    })

    const userTransactions = getUserTransactions(user.id)
    setTransactions(userTransactions)
  }, [user])

  const handleWithdrawal = async () => {
    if (!user) return

    const amount = Number.parseInt(withdrawalAmount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid withdrawal amount",
        variant: "destructive",
      })
      return
    }

    setIsWithdrawing(true)

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const result = createWithdrawal(user.id, amount, withdrawalMethod)

    if (result.success) {
      toast({
        title: "Withdrawal Requested",
        description: result.message,
      })
      setWithdrawalAmount("")
      // Refresh transactions
      const updatedTransactions = getUserTransactions(user.id)
      setTransactions(updatedTransactions)
      // Force re-render to update user score
      window.location.reload()
    } else {
      toast({
        title: "Withdrawal Failed",
        description: result.message,
        variant: "destructive",
      })
    }

    setIsWithdrawing(false)
  }

  const displayedSubmissions = submissions.slice(0, 5)
  const totalWithdrawn = getTotalWithdrawn(user?.id || "")
  const availableBalance = (user?.score || 0) - totalWithdrawn
  const minWithdrawal = getMinWithdrawal()

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading profile...</p>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">{user.username}</h1>
          <p className="text-muted-foreground">{user.email}</p>
          {user.affiliation && (
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-semibold">Affiliation:</span> {user.affiliation}
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Score</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-primary" />
                  <span className="text-3xl font-bold">{user.score}</span>
                </div>
                <Dialog open={walletDialogOpen} onOpenChange={setWalletDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-2 bg-transparent">
                      <Wallet className="h-4 w-4" />
                      Wallet
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5 text-primary" />
                        Wallet & Withdrawals
                      </DialogTitle>
                      <DialogDescription>Manage your points and withdraw earnings</DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 mt-4">
                      {/* Balance Overview */}
                      <div className="grid md:grid-cols-3 gap-4">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardDescription className="text-xs">Available Balance</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-primary">{user.score} pts</p>
                              <p className="text-sm text-muted-foreground">≈ ${pointsToUSD(user.score).toFixed(2)}</p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardDescription className="text-xs">Total Withdrawn</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold">{totalWithdrawn} pts</p>
                              <p className="text-sm text-muted-foreground">
                                ≈ ${pointsToUSD(totalWithdrawn).toFixed(2)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardDescription className="text-xs">Conversion Rate</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold">100:1</p>
                              <p className="text-sm text-muted-foreground">100 pts = $1</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Withdrawal Form */}
                      <Card className="border-primary/20">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center gap-2">
                            <ArrowDownToLine className="h-5 w-5" />
                            Request Withdrawal
                          </CardTitle>
                          <CardDescription>
                            Minimum withdrawal: {minWithdrawal} points (${pointsToUSD(minWithdrawal)})
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount (points)</Label>
                            <div className="relative">
                              <Input
                                id="amount"
                                type="number"
                                placeholder={`Min. ${minWithdrawal}`}
                                value={withdrawalAmount}
                                onChange={(e) => setWithdrawalAmount(e.target.value)}
                                min={minWithdrawal}
                                max={user.score}
                              />
                              {withdrawalAmount && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  ≈ ${pointsToUSD(Number.parseInt(withdrawalAmount) || 0).toFixed(2)} USD
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="method">Payment Method</Label>
                            <Select value={withdrawalMethod} onValueChange={(v) => setWithdrawalMethod(v as any)}>
                              <SelectTrigger id="method">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PayPal">PayPal</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Crypto">Cryptocurrency</SelectItem>
                                <SelectItem value="Gift Card">Gift Card</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <Button
                            onClick={handleWithdrawal}
                            disabled={
                              isWithdrawing || !withdrawalAmount || Number.parseInt(withdrawalAmount) < minWithdrawal
                            }
                            className="w-full"
                          >
                            {isWithdrawing ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <DollarSign className="h-4 w-4 mr-2" />
                                Request Withdrawal
                              </>
                            )}
                          </Button>
                        </CardContent>
                      </Card>

                      {/* Transaction History */}
                      <div>
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <List className="h-5 w-5" />
                          Transaction History
                        </h3>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                              <div
                                key={transaction.id}
                                className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
                              >
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <Badge
                                      variant={
                                        transaction.status === "completed"
                                          ? "default"
                                          : transaction.status === "pending"
                                            ? "secondary"
                                            : "destructive"
                                      }
                                    >
                                      {transaction.status}
                                    </Badge>
                                    <span className="text-sm text-muted-foreground">{transaction.method}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(transaction.createdAt).toLocaleString()}
                                  </p>
                                </div>
                                <div className="text-right text-sm text-muted-foreground flex-shrink-0 ml-4">
                                  <p>{new Date(transaction.createdAt).toLocaleDateString()}</p>
                                  <p className="text-xs">{new Date(transaction.createdAt).toLocaleTimeString()}</p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="text-muted-foreground text-sm text-center py-8">No transactions yet</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Challenges Solved</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-3xl font-bold">{stats.totalSolved}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Total Attempts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-accent" />
                <span className="text-3xl font-bold">{stats.totalAttempts}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardDescription>Success Rate</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-3xl font-bold">{stats.successRate.toFixed(0)}%</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  IP & Session Details
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Info className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>IP & Session Information</DialogTitle>
                      <DialogDescription>
                        Detailed information about your connection and login activity
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-6 mt-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-muted-foreground">IP Address</p>
                          <p className="font-mono text-lg font-bold">{user.ipAddress || "N/A"}</p>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm font-semibold text-muted-foreground">Registered Location</p>
                          <p className="text-lg font-bold">{user.location || "Unknown"}</p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3 flex items-center gap-2">
                          <MapPin className="h-5 w-5 text-primary" />
                          Real-Time Geolocation
                        </h3>
                        <div className="bg-muted/50 rounded-lg p-4">
                          {geoLoading ? (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Getting your location...</span>
                            </div>
                          ) : geoError ? (
                            <div className="space-y-2">
                              <p className="text-sm text-red-500">Error: {geoError.message}</p>
                              <p className="text-xs text-muted-foreground">
                                Please allow location permission in your browser to see real-time coordinates.
                              </p>
                            </div>
                          ) : (
                            <div className="grid md:grid-cols-2 gap-4">
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Latitude</p>
                                <p className="font-mono text-lg font-bold text-primary">{user.latitude?.toFixed(6)}°</p>
                              </div>
                              <div className="space-y-1">
                                <p className="text-xs text-muted-foreground">Longitude</p>
                                <p className="font-mono text-lg font-bold text-primary">
                                  {user.longitude?.toFixed(6)}°
                                </p>
                              </div>
                            </div>
                          )}
                          <p className="text-xs text-muted-foreground mt-3">
                            This shows your current browser location using the Geolocation API.
                          </p>
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <h3 className="font-semibold mb-3">Login Activity</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Last Login</p>
                            <p className="font-semibold">
                              {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "N/A"}
                            </p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Total Logins</p>
                            <p className="font-semibold text-2xl">{user.loginCount || 0}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Account Created</p>
                            <p className="font-semibold">{new Date(user.createdAt).toLocaleString()}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">User ID</p>
                            <p className="font-mono text-xs break-all">{user.id}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Connection and login information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">IP Address</span>
                <span className="font-mono font-semibold">{user.ipAddress || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Location</span>
                <span className="font-semibold">{user.location || "Unknown"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Live Coordinates
                </span>
                <span className="font-mono text-xs">
                  {user.latitude && user.longitude ? (
                    <span className="text-primary font-semibold">
                      {user.latitude.toFixed(2)}°, {user.longitude.toFixed(2)}°
                    </span>
                  ) : (
                    <span className="text-red-500">Unavailable</span>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Logins</span>
                <span className="font-semibold">{user.loginCount || 0}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  Category Breakdown
                </span>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Info className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Category Statistics</DialogTitle>
                      <DialogDescription>Detailed breakdown of challenges solved by category</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      {Object.keys(stats.categoriesBreakdown).length > 0 ? (
                        <>
                          {Object.entries(stats.categoriesBreakdown).map(([category, count]) => {
                            const totalInCategory = challenges.filter((c) => c.category === category).length
                            const percentage = totalInCategory > 0 ? (count / totalInCategory) * 100 : 0
                            return (
                              <div key={category} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Badge
                                    className={categoryColors[category as keyof typeof categoryColors]}
                                    variant="outline"
                                  >
                                    {category}
                                  </Badge>
                                  <span className="font-semibold">
                                    {count} / {totalInCategory} solved
                                  </span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full transition-all"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground text-right">
                                  {percentage.toFixed(1)}% complete
                                </p>
                              </div>
                            )
                          })}
                        </>
                      ) : (
                        <p className="text-muted-foreground text-center py-8">No challenges solved yet</p>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Challenges solved by category</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(stats.categoriesBreakdown).length > 0 ? (
                <div className="space-y-2">
                  {Object.entries(stats.categoriesBreakdown)
                    .slice(0, 3)
                    .map(([category, count]) => (
                      <div key={category} className="flex items-center justify-between">
                        <Badge className={categoryColors[category as keyof typeof categoryColors]} variant="outline">
                          {category}
                        </Badge>
                        <span className="font-semibold text-sm">{count} solved</span>
                      </div>
                    ))}
                  {Object.keys(stats.categoriesBreakdown).length > 3 && (
                    <p className="text-xs text-muted-foreground text-center pt-2">
                      +{Object.keys(stats.categoriesBreakdown).length - 3} more categories
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No challenges solved yet</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Recent Submissions
                </CardTitle>
                <CardDescription>Your latest flag submission attempts</CardDescription>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Info className="h-4 w-4 mr-2" />
                    View All ({submissions.length})
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>All Submissions</DialogTitle>
                    <DialogDescription>Complete history of your flag submission attempts</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-3 mt-4">
                    {submissions.length > 0 ? (
                      submissions.map((submission) => {
                        const challenge = challenges.find((c) => c.id === submission.challengeId)
                        return (
                          <div
                            key={submission.id}
                            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
                          >
                            <div className="flex items-center gap-3 flex-1">
                              {submission.correct ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                              ) : (
                                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                              )}
                              <div className="flex-1 min-w-0">
                                {challenge ? (
                                  <Link href={`/challenges/${challenge.id}`} className="hover:text-primary">
                                    <p className="font-semibold truncate">{challenge.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {challenge.category} • {challenge.points} points
                                    </p>
                                  </Link>
                                ) : (
                                  <p className="font-semibold">Unknown Challenge</p>
                                )}
                              </div>
                            </div>
                            <div className="text-right text-sm text-muted-foreground flex-shrink-0 ml-4">
                              <p>{new Date(submission.submittedAt).toLocaleDateString()}</p>
                              <p className="text-xs">{new Date(submission.submittedAt).toLocaleTimeString()}</p>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <p className="text-muted-foreground text-center py-8">No submissions yet</p>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {submissions.length > 0 ? (
              <div className="space-y-3">
                {displayedSubmissions.map((submission) => {
                  const challenge = challenges.find((c) => c.id === submission.challengeId)
                  return (
                    <div
                      key={submission.id}
                      className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 hover:bg-card/80 transition-colors"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        {submission.correct ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          {challenge ? (
                            <Link href={`/challenges/${challenge.id}`} className="hover:text-primary">
                              <p className="font-semibold truncate">{challenge.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {challenge.category} • {challenge.points} points
                              </p>
                            </Link>
                          ) : (
                            <p className="font-semibold">Unknown Challenge</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right text-sm text-muted-foreground flex-shrink-0 ml-4">
                        <p>{new Date(submission.submittedAt).toLocaleDateString()}</p>
                        <p className="text-xs">{new Date(submission.submittedAt).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">No submissions yet. Start solving challenges!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}
