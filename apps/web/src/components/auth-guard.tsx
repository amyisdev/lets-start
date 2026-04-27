import { Navigate } from "react-router"
import { useAuth } from "@/lib/auth-provider"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isPending } = useAuth()

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return children
}
