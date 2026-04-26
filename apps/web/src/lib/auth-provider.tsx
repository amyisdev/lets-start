import { createContext, useContext } from "react"
import { authClient } from "./auth-client"

type AuthContextValue = {
  isPending: boolean
  session: typeof authClient.$Infer.Session | null
  user: typeof authClient.$Infer.Session.user | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, isPending } = authClient.useSession()

  const signOut = async () => {
    await authClient.signOut()
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        isPending,
        user: session?.user ?? null,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return ctx
}
