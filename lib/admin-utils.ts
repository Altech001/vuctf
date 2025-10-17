import type { Challenge, User } from "./types"

export function createChallenge(challenge: Omit<Challenge, "id" | "solves" | "createdAt">): Challenge {
  const newChallenge: Challenge = {
    ...challenge,
    id: crypto.randomUUID(),
    solves: 0,
    createdAt: new Date().toISOString(),
  }

  const stored = localStorage.getItem("ctf_challenges")
  const challenges: Challenge[] = stored ? JSON.parse(stored) : []
  challenges.push(newChallenge)
  localStorage.setItem("ctf_challenges", JSON.stringify(challenges))

  return newChallenge
}

export function updateChallenge(id: string, updates: Partial<Challenge>): boolean {
  const stored = localStorage.getItem("ctf_challenges")
  const challenges: Challenge[] = stored ? JSON.parse(stored) : []

  const index = challenges.findIndex((c) => c.id === id)
  if (index === -1) return false

  challenges[index] = { ...challenges[index], ...updates }
  localStorage.setItem("ctf_challenges", JSON.stringify(challenges))
  return true
}

export function deleteChallenge(id: string): boolean {
  const stored = localStorage.getItem("ctf_challenges")
  const challenges: Challenge[] = stored ? JSON.parse(stored) : []

  const filtered = challenges.filter((c) => c.id !== id)
  if (filtered.length === challenges.length) return false

  localStorage.setItem("ctf_challenges", JSON.stringify(filtered))
  return true
}

export function getAllUsers(): User[] {
  if (typeof window === "undefined") return []
  const stored = localStorage.getItem("ctf_users")
  return stored ? JSON.parse(stored) : []
}

export function updateUserRole(userId: string, role: User["role"]): boolean {
  const stored = localStorage.getItem("ctf_users")
  const users: User[] = stored ? JSON.parse(stored) : []

  const index = users.findIndex((u) => u.id === userId)
  if (index === -1) return false

  users[index].role = role
  localStorage.setItem("ctf_users", JSON.stringify(users))

  // Update current user if it's them
  const currentUser = localStorage.getItem("ctf_user")
  if (currentUser) {
    const user = JSON.parse(currentUser)
    if (user.id === userId) {
      user.role = role
      localStorage.setItem("ctf_user", JSON.stringify(user))
    }
  }

  return true
}
