import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import type { RootState } from '../store/store'

function DashboardPage() {
  const user = useSelector((state: RootState) => state.auth.user)

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Navigate to="/member/dashboard" replace />
}

export default DashboardPage