import { Route, Routes } from 'react-router'
import { AppLayout } from './components/layouts/app-layout'
import { AuthLayout } from './components/layouts/auth-layout'
import Login from './pages/auth/login'
import SignUp from './pages/auth/signup'
import Home from './pages/home'

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Home />} />
      </Route>

      <Route path="auth" element={<AuthLayout />}>
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
      </Route>
    </Routes>
  )
}

export default App
