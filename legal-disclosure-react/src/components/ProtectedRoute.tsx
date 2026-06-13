import { Navigate, Outlet } from 'react-router-dom'

export default function ProtectedRoute() {
    const isAdminAuthenticated = localStorage.getItem('token')

    if (!isAdminAuthenticated) {
        return <Navigate to="/admin-login" replace />
    }

    return <Outlet />
}