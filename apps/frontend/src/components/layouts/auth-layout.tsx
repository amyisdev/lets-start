import { Navigate, Outlet } from 'react-router'
import { PageLoader } from '@/components/loader'
import { authClient } from '@/lib/auth-client'

export function AuthLayout() {
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return <PageLoader />
  }

  if (session) {
    return <Navigate to="/" />
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-sm">
        <Outlet />
      </div>
    </div>
  )
}
