import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { AppDispatch, RootState } from '../store/store'
import { logout } from '../store/authSlice'

function AdminDashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const modules = [
    {
      title: 'Member Management',
      description: 'Manage gym members and registrations',
    },
    {
      title: 'Trainer Management',
      description: 'Manage gym trainers and coaches',
    },
    {
      title: 'Workout Plans',
      description: 'Create and assign workout plans',
    },
    {
      title: 'Membership Plans',
      description: 'Manage membership plans and subscriptions',
    },
    {
      title: 'Payments',
      description: 'Manage member payments',
    },
    {
      title: 'Attendance',
      description: 'Manage member attendance',
    },
    {
      title: 'Reports & Analytics',
      description: 'View gym reports and analytics',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between bg-gray-900 px-6 py-5 text-white">
        <div>
          <h1 className="text-2xl font-bold">FitZone Admin</h1>
          <p className="text-sm text-gray-300">Gym Management System</p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-lg bg-red-600 px-5 py-2 font-semibold hover:bg-red-700"
        >
          Logout
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 rounded-xl bg-white p-6 shadow">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome, {user?.name}
          </h2>

          <p className="mt-2 text-gray-600">
            You are logged in as an Administrator.
          </p>

          <span className="mt-4 inline-block rounded-full bg-blue-100 px-4 py-1 text-sm font-semibold text-blue-700">
            ADMIN
          </span>
        </div>

        <h2 className="mb-5 text-xl font-bold text-gray-900">
          Management Modules
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <div
              key={module.title}
              className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                {module.title}
              </h3>

              <p className="text-sm text-gray-600">
                {module.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default AdminDashboardPage