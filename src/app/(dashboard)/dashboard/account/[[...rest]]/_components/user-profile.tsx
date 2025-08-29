"use client"

import * as React from "react"
import { useAuth } from "@/lib/hooks/use-auth-axios"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

export function UserProfile() {
  const { user, signOut } = useAuth()

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No user data available</p>
        </CardContent>
      </Card>
    )
  }

  const initials = user.name ? 
    user.name.split(' ').map(n => n[0]).join('').toUpperCase() : 
    user.username?.charAt(0).toUpperCase() ?? user.email.charAt(0).toUpperCase()

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Manage your account profile and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar} alt={user.name || user.username} />
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold">
                {user.name || user.username}
              </h3>
              <p className="text-sm text-muted-foreground">
                @{user.username}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid gap-2">
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <p className="text-sm text-muted-foreground">{user.username}</p>
            </div>
            {user.name && (
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <p className="text-sm text-muted-foreground">{user.name}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium">Verified</label>
              <p className="text-sm text-muted-foreground">
                {user.verified ? "✅ Verified" : "❌ Not verified"}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Edit Profile (Coming soon)
            </Button>
            <Button variant="destructive" size="sm" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
