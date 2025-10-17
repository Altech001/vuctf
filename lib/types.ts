export type UserRole = "user" | "admin" | "challenge_creator"

export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  score: number
  affiliation?: string
  createdAt: string
  ipAddress?: string
  location?: string
  lastLogin?: string
  loginCount?: number
}

export interface Challenge {
  id: string
  title: string
  description: string
  category: "Web" | "Crypto" | "Pwn" | "Forensics" | "Reverse Engineering" | "Misc"
  points: number
  flag: string
  solves: number
  createdBy: string
  createdAt: string
}

export interface Submission {
  id: string
  userId: string
  challengeId: string
  flag: string
  correct: boolean
  submittedAt: string
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  method: "PayPal" | "Bank Transfer" | "Crypto" | "Gift Card"
  status: "pending" | "completed" | "failed"
  createdAt: string
  completedAt?: string
}
