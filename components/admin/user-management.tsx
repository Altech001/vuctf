"use client"

import type { User } from "@/lib/types"
import { updateUserRole } from "@/lib/admin-utils"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trophy } from "lucide-react"

interface UserManagementProps {
  users: User[]
  onUpdate: () => void
}

const roleColors = {
  admin: "bg-red-500/10 text-red-500 border-red-500/20",
  challenge_creator: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  user: "bg-blue-500/10 text-blue-500 border-blue-500/20",
}

export function UserManagement({ users, onUpdate }: UserManagementProps) {
  const handleRoleChange = (userId: string, role: User["role"]) => {
    updateUserRole(userId, role)
    onUpdate()
  }

  const sortedUsers = [...users].sort((a, b) => b.score - a.score)

  return (
    <div className="space-y-3">
      {sortedUsers.map((user) => (
        <Card key={user.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{user.username}</p>
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{user.score}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Badge className={roleColors[user.role]} variant="outline">
                  {user.role.replace("_", " ")}
                </Badge>
                <Select value={user.role} onValueChange={(value) => handleRoleChange(user.id, value as User["role"])}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="challenge_creator">Challenge Creator</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
