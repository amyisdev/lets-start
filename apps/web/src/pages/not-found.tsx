import { Button } from "@workspace/ui/components/button"
import { useNavigate } from "react-router"

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-medium">404 — Page not found</h1>
        <p className="text-muted-foreground text-sm">
          The page you are looking for does not exist.
        </p>
        <Button onClick={() => navigate("/todos")}>Go home</Button>
      </div>
    </div>
  )
}
