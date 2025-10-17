import type { Challenge, Submission, User } from "./types"
import { mockChallenges } from "./mock-data"

export function initializeChallenges(): void {
  if (typeof window === "undefined") return
  const stored = localStorage.getItem("ctf_challenges")
  if (!stored) {
    localStorage.setItem("ctf_challenges", JSON.stringify(mockChallenges))
  }
}

export function getChallenges(): Challenge[] {
  if (typeof window === "undefined") return []
  initializeChallenges()
  const stored = localStorage.getItem("ctf_challenges")
  return stored ? JSON.parse(stored) : []
}

export function getChallenge(id: string): Challenge | null {
  const challenges = getChallenges()
  return challenges.find((c) => c.id === id) || null
}

export function submitFlag(userId: string, challengeId: string, flag: string): boolean {
  const challenge = getChallenge(challengeId)
  if (!challenge) return false

  const correct = challenge.flag === flag.trim()

  // Store submission
  const submission: Submission = {
    id: crypto.randomUUID(),
    userId,
    challengeId,
    flag: flag.trim(),
    correct,
    submittedAt: new Date().toISOString(),
  }

  const stored = localStorage.getItem("ctf_submissions")
  const submissions: Submission[] = stored ? JSON.parse(stored) : []
  submissions.push(submission)
  localStorage.setItem("ctf_submissions", JSON.stringify(submissions))

  // Update user score if correct
  if (correct) {
    const usersData = localStorage.getItem("ctf_users")
    const users: User[] = usersData ? JSON.parse(usersData) : []
    const userIndex = users.findIndex((u) => u.id === userId)

    if (userIndex !== -1) {
      // Check if user already solved this challenge
      const alreadySolved = submissions.some(
        (s) => s.userId === userId && s.challengeId === challengeId && s.correct && s.id !== submission.id,
      )

      if (!alreadySolved) {
        users[userIndex].score += challenge.points
        localStorage.setItem("ctf_users", JSON.stringify(users))

        // Update current user in localStorage
        const currentUser = localStorage.getItem("ctf_user")
        if (currentUser) {
          const user = JSON.parse(currentUser)
          if (user.id === userId) {
            user.score = users[userIndex].score
            localStorage.setItem("ctf_user", JSON.stringify(user))
          }
        }

        // Update challenge solves count
        const challenges = getChallenges()
        const challengeIndex = challenges.findIndex((c) => c.id === challengeId)
        if (challengeIndex !== -1) {
          challenges[challengeIndex].solves += 1
          localStorage.setItem("ctf_challenges", JSON.stringify(challenges))
        }
      }
    }
  }

  return correct
}

export function getUserSubmissions(userId: string): Submission[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("ctf_submissions")
  const submissions: Submission[] = stored ? JSON.parse(stored) : []
  return submissions.filter((s) => s.userId === userId)
}

export function hasSolved(userId: string, challengeId: string): boolean {
  const submissions = getUserSubmissions(userId)
  return submissions.some((s) => s.challengeId === challengeId && s.correct)
}

export function getChallengeSolves(challengeId: string): Array<{ username: string; solvedAt: string; userId: string }> {
  if (typeof window === "undefined") return []

  const stored = localStorage.getItem("ctf_submissions")
  const submissions: Submission[] = stored ? JSON.parse(stored) : []

  const usersData = localStorage.getItem("ctf_users")
  const users: User[] = usersData ? JSON.parse(usersData) : []

  // Get all correct submissions for this challenge
  const correctSubmissions = submissions.filter((s) => s.challengeId === challengeId && s.correct)

  // Group by user to get first solve time for each user
  const userSolves = new Map<string, string>()
  correctSubmissions.forEach((submission) => {
    if (!userSolves.has(submission.userId)) {
      userSolves.set(submission.userId, submission.submittedAt)
    }
  })

  // Map to user details and sort by solve time
  const solves = Array.from(userSolves.entries())
    .map(([userId, solvedAt]) => {
      const user = users.find((u) => u.id === userId)
      return {
        userId,
        username: user?.username || "Unknown User",
        solvedAt,
      }
    })
    .sort((a, b) => new Date(a.solvedAt).getTime() - new Date(b.solvedAt).getTime())

  return solves
}
