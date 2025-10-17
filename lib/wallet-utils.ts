import type { Transaction, User } from "./types"

const CONVERSION_RATE = 100 // 100 points = $1
const MIN_WITHDRAWAL = 1000 // Minimum 1000 points ($10)

export function getConversionRate() {
  return CONVERSION_RATE
}

export function getMinWithdrawal() {
  return MIN_WITHDRAWAL
}

export function pointsToUSD(points: number): number {
  return points / CONVERSION_RATE
}

export function getUserTransactions(userId: string): Transaction[] {
  const transactions = localStorage.getItem("ctf_transactions")
  if (!transactions) return []

  const allTransactions: Transaction[] = JSON.parse(transactions)
  return allTransactions
    .filter((t) => t.userId === userId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

export function createWithdrawal(
  userId: string,
  amount: number,
  method: Transaction["method"],
): { success: boolean; message: string; transaction?: Transaction } {
  // Validate amount
  if (amount < MIN_WITHDRAWAL) {
    return {
      success: false,
      message: `Minimum withdrawal is ${MIN_WITHDRAWAL} points ($${pointsToUSD(MIN_WITHDRAWAL)})`,
    }
  }

  // Get user
  const users = JSON.parse(localStorage.getItem("ctf_users") || "[]")
  const userIndex = users.findIndex((u: User) => u.id === userId)

  if (userIndex === -1) {
    return { success: false, message: "User not found" }
  }

  const user = users[userIndex]

  // Check if user has enough points
  if (user.score < amount) {
    return {
      success: false,
      message: `Insufficient balance. You have ${user.score} points available.`,
    }
  }

  // Create transaction
  const transaction: Transaction = {
    id: Math.random().toString(36).substring(2, 15),
    userId,
    amount,
    method,
    status: "pending",
    createdAt: new Date().toISOString(),
  }

  // Deduct points from user
  users[userIndex].score -= amount

  // Save transaction
  const transactions = JSON.parse(localStorage.getItem("ctf_transactions") || "[]")
  transactions.push(transaction)

  localStorage.setItem("ctf_transactions", JSON.stringify(transactions))
  localStorage.setItem("ctf_users", JSON.stringify(users))

  // Update current user in localStorage
  const currentUser = JSON.parse(localStorage.getItem("ctf_user") || "{}")
  if (currentUser.id === userId) {
    currentUser.score = users[userIndex].score
    localStorage.setItem("ctf_user", JSON.stringify(currentUser))
  }

  return {
    success: true,
    message: "Withdrawal request submitted successfully!",
    transaction,
  }
}

export function getTotalWithdrawn(userId: string): number {
  const transactions = getUserTransactions(userId)
  return transactions
    .filter((t) => t.status === "completed" || t.status === "pending")
    .reduce((sum, t) => sum + t.amount, 0)
}
