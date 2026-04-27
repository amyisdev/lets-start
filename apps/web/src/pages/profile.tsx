import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import type { UpdateProfileInput } from "@workspace/shared/schemas/profile"
import { Button } from "@workspace/ui/components/button"
import { useState } from "react"
import { Link } from "react-router"
import { toast } from "sonner"
import { api } from "@/api/client"
import { useAuth } from "@/lib/auth-provider"

export function ProfilePage() {
  const { user, signOut } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { data: profile, isPending } = useQuery({
    queryKey: ["profile"],
    queryFn: ({ signal }) => api.profile.get(signal),
  })

  const updateMutation = useMutation({
    mutationFn: (input: UpdateProfileInput) => api.profile.update(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] })
      setIsEditing(false)
      toast.success("Profile updated")
    },
    onError: (err: Error) => {
      toast.error(err.message)
    },
  })

  const [editDisplayName, setEditDisplayName] = useState("")
  const [editBio, setEditBio] = useState("")

  const handleEdit = () => {
    setEditDisplayName(profile?.displayName ?? "")
    setEditBio(profile?.bio ?? "")
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const input: UpdateProfileInput = {}
    if (editDisplayName.trim()) input.displayName = editDisplayName.trim()
    if (editBio.trim()) input.bio = editBio.trim()
    updateMutation.mutate(input)
  }

  const displayName = profile?.displayName ?? user?.name ?? user?.email

  return (
    <div className="relative min-h-svh">
      <header className="absolute right-4 top-4">
        <div className="flex items-center gap-3">
          <Link
            to="/todos"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Todos
          </Link>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </header>

      <div className="flex min-h-svh flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <div>
            <h1 className="text-2xl font-medium">Profile</h1>
            <p className="text-muted-foreground text-sm">
              Manage your personal information.
            </p>
          </div>

          {isPending ? (
            <p className="text-muted-foreground text-sm">Loading...</p>
          ) : isEditing ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="Your name"
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  placeholder="A short bio about yourself"
                  rows={3}
                  maxLength={160}
                  className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                />
                <p className="text-muted-foreground text-xs mt-1">
                  {editBio.length}/160
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-card p-4 space-y-3">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Display name
                  </p>
                  <p className="text-sm mt-0.5">{displayName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Bio
                  </p>
                  <p className="text-sm mt-0.5">
                    {profile?.bio ?? (
                      <span className="text-muted-foreground italic">
                        No bio yet.
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
                    Email
                  </p>
                  <p className="text-sm mt-0.5">{user?.email}</p>
                </div>
              </div>

              <Button onClick={handleEdit} className="w-full">
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
