"use client"

import type { Challenge } from "@/lib/types"
import { deleteChallenge } from "@/lib/admin-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Users } from "lucide-react"
import Link from "next/link"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const categoryColors = {
  Web: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  Crypto: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  Pwn: "bg-red-500/10 text-red-500 border-red-500/20",
  Forensics: "bg-green-500/10 text-green-500 border-green-500/20",
  "Reverse Engineering": "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  Misc: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

interface ChallengeManagementProps {
  challenges: Challenge[]
  onUpdate: () => void
}

export function ChallengeManagement({ challenges, onUpdate }: ChallengeManagementProps) {
  const handleDelete = (id: string) => {
    deleteChallenge(id)
    onUpdate()
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {challenges.map((challenge) => (
        <Card key={challenge.id}>
          <CardHeader>
            <div className="flex items-start justify-between gap-2 mb-2">
              <Badge className={categoryColors[challenge.category]} variant="outline">
                {challenge.category}
              </Badge>
              <div className="flex gap-2">
                <Link href={`/admin/challenges/${challenge.id}/edit`}>
                  <Button size="sm" variant="ghost">
                    <Pencil className="h-4 w-4" />
                  </Button>
                </Link>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{challenge.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(challenge.id)} className="bg-destructive">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
            <CardTitle className="text-xl">{challenge.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {challenge.description.split("\n").find((line) => line.trim() && !line.startsWith("#"))}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">{challenge.points} points</span>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{challenge.solves} solves</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
