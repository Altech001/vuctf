"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { getChallenges, hasSolved } from "@/lib/challenge-utils"
import type { Challenge } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { CheckCircle2, Users, Globe, Lock, Bug, SearchIcon, Code, Puzzle } from "lucide-react"

const categoryConfig = {
  Web: {
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: Globe,
    gradient: "from-blue-500/20 to-transparent",
  },
  Crypto: {
    color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    icon: Lock,
    gradient: "from-purple-500/20 to-transparent",
  },
  Pwn: {
    color: "bg-red-500/10 text-red-500 border-red-500/20",
    icon: Bug,
    gradient: "from-red-500/20 to-transparent",
  },
  Forensics: {
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: SearchIcon,
    gradient: "from-green-500/20 to-transparent",
  },
  "Reverse Engineering": {
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: Code,
    gradient: "from-yellow-500/20 to-transparent",
  },
  Misc: {
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    icon: Puzzle,
    gradient: "from-gray-500/20 to-transparent",
  },
}

export default function ChallengesPage() {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [solvedChallenges, setSolvedChallenges] = useState<Set<string>>(new Set())

  useEffect(() => {
    const loadedChallenges = getChallenges()
    setChallenges(loadedChallenges)

    if (user) {
      const solved = new Set<string>()
      loadedChallenges.forEach((challenge) => {
        if (hasSolved(user.id, challenge.id)) {
          solved.add(challenge.id)
        }
      })
      setSolvedChallenges(solved)
    }
  }, [user])

  const groupedChallenges = challenges.reduce(
    (acc, challenge) => {
      if (
        !searchQuery ||
        challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        challenge.description.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        if (!acc[challenge.category]) {
          acc[challenge.category] = []
        }
        acc[challenge.category].push(challenge)
      }
      return acc
    },
    {} as Record<string, Challenge[]>,
  )

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Please log in to view challenges</h1>
          <p className="text-muted-foreground">You need to be authenticated to access the challenges.</p>
        </div>
      </>
    )
  }

  const totalChallenges = challenges.length
  const solvedCount = solvedChallenges.size

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 text-balance">Challenges</h1>
          <p className="text-muted-foreground mb-4">Test your skills across multiple categories</p>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Total:</span>
              <span className="font-semibold">{totalChallenges}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Solved:</span>
              <span className="font-semibold text-green-500">{solvedCount}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Progress:</span>
              <span className="font-semibold">
                {totalChallenges > 0 ? Math.round((solvedCount / totalChallenges) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <Input
            placeholder="Search challenges..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-md"
          />
        </div>

        <div className="space-y-12">
          {Object.entries(groupedChallenges).map(([category, categoryChallenges]) => {
            const config = categoryConfig[category as keyof typeof categoryConfig]
            const Icon = config.icon
            const solvedInCategory = categoryChallenges.filter((c) => solvedChallenges.has(c.id)).length

            return (
              <div key={category} className="space-y-4">
                {/* Category Header */}
                <div className={`relative overflow-hidden rounded-lg border bg-gradient-to-r ${config.gradient} p-6`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${config.color} border`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold">{category}</h2>
                        <p className="text-sm text-muted-foreground">
                          {categoryChallenges.length} challenge{categoryChallenges.length !== 1 ? "s" : ""} •{" "}
                          {solvedInCategory} solved
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className={config.color}>
                      {solvedInCategory}/{categoryChallenges.length}
                    </Badge>
                  </div>
                </div>

                {/* Category Challenges Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryChallenges.map((challenge) => {
                    const isSolved = solvedChallenges.has(challenge.id)
                    return (
                      <Link key={challenge.id} href={`/challenges/${challenge.id}`}>
                        <Card className="h-full hover:border-primary transition-all hover:shadow-lg cursor-pointer relative group">
                          {isSolved && (
                            <div className="absolute top-4 right-4 z-10">
                              <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                          )}
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <Badge className={config.color} variant="outline">
                                {challenge.category}
                              </Badge>
                            </div>
                            <CardTitle className="text-xl group-hover:text-primary transition-colors">
                              {challenge.title}
                            </CardTitle>
                            <CardDescription className="line-clamp-2">
                              {challenge.description.split("\n").find((line) => line.trim() && !line.startsWith("#"))}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="flex items-center justify-between text-sm">
                              <span className="font-semibold text-primary">{challenge.points} pts</span>
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-4 w-4" />
                                <span>{challenge.solves}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {Object.keys(groupedChallenges).length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No challenges found matching your search.</p>
          </div>
        )}
      </div>
    </>
  )
}
