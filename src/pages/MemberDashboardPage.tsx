import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import type { AppDispatch, RootState } from '../store/store'
import { logout } from '../store/authSlice'

function MemberDashboardPage() {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const user = useSelector((state: RootState) => state.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate('/login', { replace: true })
  }

  const sections = [
    {
      title: 'My Workout Plans',
      description: 'View your assigned workout plans',
    },
    {
      title: 'My Subscription',
      description: 'View your membership subscription',
    },
    {
      title: 'My Attendance',
      description: 'View your gym attendance records',
    },
    {
      title: 'My Payments',
      description: 'View your payment history',
    },
    {
      title: 'My Progress',
      description: 'View your fitness progress report',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="flex items-center justify-between bg-gray-900 px-6 py-5 text-white">
        <div>
          <h1 className="text-2xl font-bold">FitZone</h1>
          <p className="text-sm text-gray-300">Member Portal</p>
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
            Welcome to your personal fitness dashboard.
          </p>

          <span className="mt-4 inline-block rounded-full bg-green-100 px-4 py-1 text-sm font-semibold text-green-700">
            MEMBER
          </span>
        </div>

        <h2 className="mb-5 text-xl font-bold text-gray-900">
          My Fitness Portal
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div
              key={section.title}
              className="rounded-xl bg-white p-6 shadow transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h3 className="mb-3 text-lg font-bold text-gray-900">
                {section.title}
              </h3>

              <p className="text-sm text-gray-600">
                {section.description}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default MemberDashboardPage