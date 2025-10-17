"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { getChallenge, submitFlag, hasSolved, getChallengeSolves } from "@/lib/challenge-utils"
import type { Challenge } from "@/lib/types"
import { Navbar } from "@/components/navbar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ArrowLeft, Users, CheckCircle2, XCircle, Trophy, Flag, Sparkles, Calendar } from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"

const categoryColors = {
  Web: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Crypto: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Pwn: "bg-red-500/10 text-red-500 border-red-500/20",
  Forensics: "bg-green-500/10 text-green-500 border-green-500/20",
  "Reverse Engineering": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Misc: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

const difficultyColors = {
  Easy: "bg-green-500/10 text-green-400 border-green-500/30",
  Medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/30",
  Hard: "bg-red-500/10 text-red-400 border-red-500/30",
}

export default function ChallengePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [challenge, setChallenge] = useState<Challenge | null>(null)
  const [flagInput, setFlagInput] = useState("")
  const [submissionResult, setSubmissionResult] = useState<"correct" | "incorrect" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSolved, setIsSolved] = useState(false)
  const [solves, setSolves] = useState<Array<{ username: string; solvedAt: string; userId: string }>>([])

  useEffect(() => {
    const id = params.id as string
    const loadedChallenge = getChallenge(id)
    setChallenge(loadedChallenge)

    if (user && loadedChallenge) {
      setIsSolved(hasSolved(user.id, loadedChallenge.id))
      setSolves(getChallengeSolves(loadedChallenge.id))
    }
  }, [params.id, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !challenge) return

    setIsSubmitting(true)
    setSubmissionResult(null)

    await new Promise((resolve) => setTimeout(resolve, 500))

    const correct = submitFlag(user.id, challenge.id, flagInput)
    setSubmissionResult(correct ? "correct" : "incorrect")

    if (correct) {
      setIsSolved(true)
      const updatedChallenge = getChallenge(challenge.id)
      if (updatedChallenge) {
        setChallenge(updatedChallenge)
      }
      setSolves(getChallengeSolves(challenge.id))
    }

    setIsSubmitting(false)
  }

  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  }

  if (!user) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Please log in to view this challenge</h1>
        </div>
      </>
    )
  }

  if (!challenge) {
    return (
      <>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Challenge not found</h1>
          <Link href="/challenges">
            <Button>Back to Challenges</Button>
          </Link>
        </div>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Link
          href="/challenges"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Challenges
        </Link>

        <div className="space-y-6">
          <Card className="border-2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

            <CardHeader className="relative space-y-4 pb-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <Badge className={categoryColors[challenge.category]} variant="outline">
                    {challenge.category}
                  </Badge>
                  <Badge className={difficultyColors[challenge.difficulty]} variant="outline">
                    {challenge.difficulty}
                  </Badge>
                </div>
                {isSolved && (
                  <Badge className="bg-green-500/10 text-green-400 border-green-500/30 gap-1.5" variant="outline">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Solved
                  </Badge>
                )}
              </div>

              <CardTitle className="text-4xl font-bold text-balance leading-tight">{challenge.title}</CardTitle>

              <div className="flex items-center gap-6 text-base pt-2">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg border border-primary/20">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-primary">{challenge.points} pts</span>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer">
                      <Users className="h-4 w-4" />
                      <span>
                        {challenge.solves} {challenge.solves === 1 ? "solve" : "solves"}
                      </span>
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-2xl flex items-center gap-2">
                        <Trophy className="h-6 w-6 text-primary" />
                        Challenge Solves
                      </DialogTitle>
                      <DialogDescription>
                        {solves.length} {solves.length === 1 ? "user has" : "users have"} solved this challenge
                      </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                      {solves.length > 0 ? (
                        <div className="space-y-2">
                          {solves.map((solve, index) => (
                            <div
                              key={solve.userId}
                              className={`flex items-center justify-between p-4 rounded-lg border transition-colors ${
                                solve.userId === user?.id
                                  ? "bg-primary/10 border-primary/30"
                                  : "bg-muted/30 border-border hover:bg-muted/50"
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div
                                  className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                                    index === 0
                                      ? "bg-yellow-500/20 text-yellow-400 border-2 border-yellow-500/30"
                                      : index === 1
                                        ? "bg-gray-400/20 text-gray-300 border-2 border-gray-400/30"
                                        : index === 2
                                          ? "bg-orange-500/20 text-orange-400 border-2 border-orange-500/30"
                                          : "bg-muted text-muted-foreground"
                                  }`}
                                >
                                  {index + 1}
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground">
                                    {solve.username}
                                    {solve.userId === user?.id && (
                                      <span className="ml-2 text-xs text-primary font-normal">(You)</span>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDateTime(solve.solvedAt)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-muted-foreground">
                          <Trophy className="h-12 w-12 mx-auto mb-3 opacity-50" />
                          <p className="text-lg font-medium">No solves yet</p>
                          <p className="text-sm">Be the first to solve this challenge!</p>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>

            <CardContent className="relative pt-0">
              <div
                className="prose prose-invert max-w-none 
                prose-headings:text-foreground prose-headings:font-bold prose-headings:tracking-tight
                prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-border prose-h2:pb-2
                prose-p:text-muted-foreground prose-p:leading-relaxed prose-p:my-4
                prose-strong:text-foreground prose-strong:font-bold
                prose-code:text-foreground
                prose-ul:my-4 prose-ul:list-disc prose-ul:list-outside prose-ul:pl-6
                prose-ol:my-4 prose-ol:list-decimal prose-ol:list-outside prose-ol:pl-6
                prose-li:text-muted-foreground prose-li:my-2 prose-li:leading-relaxed
                prose-li:marker:text-primary"
              >
                <ReactMarkdown
                  components={{
                    pre({ node, children, ...props }: any) {
                      return (
                        <pre
                          className="bg-muted/50 border border-border rounded-xl p-5 overflow-x-auto my-6 backdrop-blur-sm"
                          {...props}
                        >
                          {children}
                        </pre>
                      )
                    },
                    code({ node, inline, className, children, ...props }: any) {
                      return inline ? (
                        <code
                          className="bg-muted/70 px-2 py-1 rounded-md text-sm font-mono text-primary border border-border/50"
                          {...props}
                        >
                          {children}
                        </code>
                      ) : (
                        <code
                          className={`${className} text-sm font-mono text-foreground block leading-relaxed`}
                          {...props}
                        >
                          {children}
                        </code>
                      )
                    },
                    ul({ node, children, ...props }: any) {
                      return (
                        <ul className="space-y-2 my-4 list-disc list-outside pl-6" {...props}>
                          {children}
                        </ul>
                      )
                    },
                    ol({ node, children, ...props }: any) {
                      return (
                        <ol className="space-y-2 my-4 list-decimal list-outside pl-6" {...props}>
                          {children}
                        </ol>
                      )
                    },
                    li({ node, children, ...props }: any) {
                      return (
                        <li className="text-muted-foreground leading-relaxed marker:text-primary" {...props}>
                          {children}
                        </li>
                      )
                    },
                    strong({ node, children, ...props }: any) {
                      return (
                        <strong className="font-bold text-foreground" {...props}>
                          {children}
                        </strong>
                      )
                    },
                  }}
                >
                  {challenge.description}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-primary/20 bg-gradient-to-br from-background to-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Flag className="h-5 w-5 text-primary" />
                <CardTitle className="text-2xl">Submit Flag</CardTitle>
              </div>
              <CardDescription className="text-base">
                {isSolved
                  ? "You've already solved this challenge!"
                  : "Enter the flag you discovered to earn points and climb the leaderboard"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-3">
                  <Label htmlFor="flag" className="text-base font-semibold">
                    Flag
                  </Label>
                  <Input
                    id="flag"
                    placeholder="VUCtf{...}"
                    value={flagInput}
                    onChange={(e) => setFlagInput(e.target.value)}
                    disabled={isSubmitting || isSolved}
                    className="font-mono text-base h-12 bg-background/50 border-2 focus:border-primary transition-colors"
                  />
                </div>

                {submissionResult === "correct" && (
                  <div className="flex items-center gap-3 text-green-400 bg-green-500/10 p-4 rounded-xl border-2 border-green-500/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-500/20">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Correct!</p>
                      <p className="text-sm text-green-400/80">You earned {challenge.points} points!</p>
                    </div>
                  </div>
                )}

                {submissionResult === "incorrect" && (
                  <div className="flex items-center gap-3 text-red-400 bg-red-500/10 p-4 rounded-xl border-2 border-red-500/30 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500/20">
                      <XCircle className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-lg">Incorrect flag</p>
                      <p className="text-sm text-red-400/80">Double-check your solution and try again</p>
                    </div>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || isSolved || !flagInput.trim()}
                  className="w-full h-12 text-base font-semibold gap-2"
                  size="lg"
                >
                  {isSubmitting ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : isSolved ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      Already Solved
                    </>
                  ) : (
                    <>
                      <Flag className="h-4 w-4" />
                      Submit Flag
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
