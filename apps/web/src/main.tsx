import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"

import "@workspace/ui/globals.css"
import { Toaster } from "@workspace/ui/components/sonner"
import { App } from "@/App.tsx"
import { ThemeProvider } from "@/components/theme-provider.tsx"

const queryClient = new QueryClient()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <App />
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
