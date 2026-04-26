import { Button } from "@workspace/ui/components/button"
import { AuthForms } from "@/components/auth-forms"
import { Todos } from "@/components/todos"
import { AuthProvider, useAuth } from "@/lib/auth-provider"

function AppContent() {
  const { user, isPending, signOut } = useAuth()

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <AuthForms />
  }

  return (
    <div className="relative min-h-svh">
      <header className="absolute right-4 top-4">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {user.name ?? user.email}
          </span>
          <Button variant="outline" size="sm" onClick={() => signOut()}>
            Sign out
          </Button>
        </div>
      </header>
      <Todos />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
