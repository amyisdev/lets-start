import { HomeIcon } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { AppSidebar, NavGroup, SiteHeader } from '@/components/app-sidebar'
import { PageLoader } from '@/components/loader'
import { NavUser } from '@/components/nav-user'
import { SidebarContent, SidebarFooter, SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { authClient } from '@/lib/auth-client'

const navMain = [
  {
    title: 'Home',
    icon: HomeIcon,
    to: '/',
  },
]

export function AppLayout() {
  const currentPath = useLocation().pathname
  const title = navMain.find((item) => item.to === currentPath)?.title

  const { data: session, isPending } = authClient.useSession()
  if (isPending) {
    return <PageLoader />
  }

  if (!session) {
    return <Navigate to="/auth/login" />
  }

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': 'calc(var(--spacing) * 72)',
          '--header-height': 'calc(var(--spacing) * 12)',
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset">
        <SidebarContent>
          <NavGroup label="Main Menu" items={navMain} />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </AppSidebar>

      <SidebarInset>
        <SiteHeader title={title || "Let's Start"} />

        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 p-4 md:gap-6 md:py-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
