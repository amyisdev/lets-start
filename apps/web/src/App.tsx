import { BrowserRouter, Navigate, Route, Routes } from "react-router"
import { AuthGuard } from "@/components/auth-guard"
import { AuthProvider } from "@/lib/auth-provider"
import { LoginPage } from "@/pages/login"
import { NotFoundPage } from "@/pages/not-found"
import { TodosPage } from "@/pages/todos"

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/todos"
            element={
              <AuthGuard>
                <TodosPage />
              </AuthGuard>
            }
          />
          <Route path="/" element={<Navigate to="/todos" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
