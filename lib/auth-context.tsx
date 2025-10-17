"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { User } from "./types"
import { initializeChallenges } from "./challenge-utils"

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  signup: (username: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function generateMockIPData() {
  const mockIPs = [
    { ip: "192.168.1.100", location: "San Francisco, CA, USA" },
    { ip: "10.0.0.45", location: "New York, NY, USA" },
    { ip: "172.16.0.23", location: "London, UK" },
    { ip: "192.168.2.88", location: "Tokyo, Japan" },
    { ip: "10.1.1.150", location: "Berlin, Germany" },
    { ip: "172.20.0.67", location: "Sydney, Australia" },
    { ip: "192.168.5.42", location: "Toronto, Canada" },
    { ip: "10.5.5.99", location: "Singapore" },
  ]
  return mockIPs[Math.floor(Math.random() * mockIPs.length)]
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    initializeChallenges()

    // Check for existing session
    const storedUser = localStorage.getItem("ctf_user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    // Mock login - check localStorage for users
    const usersData = localStorage.getItem("ctf_users")
    const users: User[] = usersData ? JSON.parse(usersData) : []

    const foundUser = users.find((u) => u.email === email)
    if (foundUser) {
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString(),
        loginCount: (foundUser.loginCount || 0) + 1,
      }

      // Update in users array
      const userIndex = users.findIndex((u) => u.email === email)
      users[userIndex] = updatedUser
      localStorage.setItem("ctf_users", JSON.stringify(users))

      setUser(updatedUser)
      localStorage.setItem("ctf_user", JSON.stringify(updatedUser))
      return true
    }
    return false
  }

  const signup = async (username: string, email: string, password: string): Promise<boolean> => {
    // Mock signup - store in localStorage
    const usersData = localStorage.getItem("ctf_users")
    const users: User[] = usersData ? JSON.parse(usersData) : []

    // Check if user already exists
    if (users.some((u) => u.email === email || u.username === username)) {
      return false
    }

    const isFirstUser = users.length === 0

    const mockAffiliations = [
      "MIT",
      "Stanford University",
      "UC Berkeley",
      "Carnegie Mellon",
      "Georgia Tech",
      "Independent",
      "Harvard University",
      "Caltech",
      "Princeton",
      "Yale University",
    ]

    const ipData = generateMockIPData()

    const newUser: User = {
      id: crypto.randomUUID(),
      username,
      email,
      role: isFirstUser ? "admin" : "user",
      score: 0,
      affiliation: mockAffiliations[Math.floor(Math.random() * mockAffiliations.length)],
      createdAt: new Date().toISOString(),
      ipAddress: ipData.ip,
      location: ipData.location,
      lastLogin: new Date().toISOString(),
      loginCount: 1,
    }

    users.push(newUser)
    localStorage.setItem("ctf_users", JSON.stringify(users))
    setUser(newUser)
    localStorage.setItem("ctf_user", JSON.stringify(newUser))
    return true
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("ctf_user")
  }

  return <AuthContext.Provider value={{ user, login, signup, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
