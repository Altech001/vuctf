"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Target, Users, Award } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function HomePage() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight text-balance">Compete. Learn. Conquer.</h1>
            <p className="text-xl text-muted-foreground text-balance">
              Test your cybersecurity skills with challenging CTF competitions across multiple categories
            </p>
          </div>

          <div className="flex justify-center gap-4">
            {user ? (
              <>
                <Link href="/challenges">
                  <Button size="lg" className="gap-2">
                    Browse Challenges
                    <Trophy className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/leaderboard">
                  <Button size="lg" variant="outline">
                    View Leaderboard
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/signup">
                  <Button size="lg" className="gap-2">
                    Get Started
                    <Trophy className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/challenges">
                  <Button size="lg" variant="outline">
                    Browse Challenges
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="grid md:grid-cols-3 gap-6 pt-12">
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border">
              <Target className="h-10 w-10 text-primary" />
              <h3 className="font-semibold text-lg">Multiple Categories</h3>
              <p className="text-sm text-muted-foreground text-center">
                Web, Crypto, Pwn, Forensics, Reverse Engineering, and more
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border">
              <Users className="h-10 w-10 text-primary" />
              <h3 className="font-semibold text-lg">Live Leaderboard</h3>
              <p className="text-sm text-muted-foreground text-center">
                Compete with others and track your progress in real-time
              </p>
            </div>
            <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-card border border-border">
              <Award className="h-10 w-10 text-primary" />
              <h3 className="font-semibold text-lg">Earn Points</h3>
              <p className="text-sm text-muted-foreground text-center">
                Solve challenges to earn points and climb the rankings
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
