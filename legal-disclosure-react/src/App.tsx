import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AdminLogin from './pages/AdminLogin'
import Dashboard from './pages/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/HomePage/Footer'
import Header from './components/HomePage/Header'

export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        {/* PUBLIC ROUTES  */}
        <Route path="/" element={<HomePage />} />
        <Route path="/admin-login" element={<AdminLogin />} />


        {/* PRIVATE ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>

      <Footer />
    </BrowserRouter>
  )
}