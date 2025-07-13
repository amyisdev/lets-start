import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function PageLoader() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
        <p className="text-lg text-muted-foreground">Loading, please wait...</p>
      </div>
    </div>
  )
}

export function ContainerLoader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex min-h-full items-center justify-center flex-col', className)} {...props}>
      <Loader2 className="h-16 w-16 animate-spin text-muted-foreground" />
    </div>
  )
}
