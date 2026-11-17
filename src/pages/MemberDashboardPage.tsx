import { useEffect, useState } from 'react'
import {
  Activity,
  CalendarCheck,
  CreditCard,
  Dumbbell,
  RefreshCw,
  TrendingUp,
  Wallet
} from 'lucide-react'
import api from '../services/api'
import DashboardLayout from '../components/dashboard/DashboardLayout'

interface ApiListResponse<T> {
  success: boolean
  data: T[]
}

interface ProgressData {
  attendance: {
    totalVisits: number
    visitsThisMonth: number
  }
  workoutPlans: {
    total: number
    currentlyActive: number
    completed: number
  }
  subscriptions: {
    activeCount: number
    activeSubscriptions: unknown[]
  }
  payments: {
    totalPaid: number
    paidTransactions: number
  }
  generatedAt: string
}

interface ProgressResponse {
  success: boolean
  data: ProgressData
}

function MemberDashboardPage() {
  const [workouts, setWorkouts] = useState<unknown[]>([])
  const [subscriptions, setSubscriptions] = useState<unknown[]>([])
  const [attendance, setAttendance] = useState<unknown[]>([])
  const [payments, setPayments] = useState<unknown[]>([])
  const [progress, setProgress] = useState<ProgressData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadMemberDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const results = await Promise.allSettled([
        api.get<ApiListResponse<unknown>>('/workout-plans/my'),
        api.get<ApiListResponse<unknown>>('/member/subscriptions'),
        api.get<ApiListResponse<unknown>>('/member/attendance'),
        api.get<ApiListResponse<unknown>>('/member/payments'),
        api.get<ProgressResponse>('/member/progress')
      ])

      if (results[0].status === 'fulfilled') {
        setWorkouts(results[0].value.data.data || [])
      }

      if (results[1].status === 'fulfilled') {
        setSubscriptions(results[1].value.data.data || [])
      }

      if (results[2].status === 'fulfilled') {
        setAttendance(results[2].value.data.data || [])
      }

      if (results[3].status === 'fulfilled') {
        setPayments(results[3].value.data.data || [])
      }

      if (results[4].status === 'fulfilled') {
        setProgress(results[4].value.data.data)
      }

      if (results.every((result) => result.status === 'rejected')) {
        setError('Unable to load your fitness information.')
      }
    } catch {
      setError('Unable to load your fitness information.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadMemberDashboard()
  }, [])

  const stats = [
    {
      title: 'My Workout Plans',
      value: progress?.workoutPlans.total ?? workouts.length,
      description: 'Assigned workout plans',
      icon: Dumbbell,
      color: 'text-orange-400 bg-orange-500/15'
    },
    {
      title: 'Active Subscription',
      value: progress?.subscriptions.activeCount ?? subscriptions.length,
      description: 'Current active subscriptions',
      icon: CreditCard,
      color: 'text-green-400 bg-green-500/15'
    },
    {
      title: 'Total Attendance',
      value: progress?.attendance.totalVisits ?? attendance.length,
      description: 'Total gym visits',
      icon: CalendarCheck,
      color: 'text-blue-400 bg-blue-500/15'
    },
    {
      title: 'Total Payments',
      value: `Rs. ${(progress?.payments.totalPaid ?? 0).toLocaleString('en-US')}`,
      description: 'Total amount paid',
      icon: Wallet,
      color: 'text-purple-400 bg-purple-500/15'
    }
  ]

  return (
    <DashboardLayout
      activeItem="Dashboard"
      subtitle="FITZONE / MEMBER PORTAL"
    >
      {loading ? (
        <div className="flex min-h-96 items-center justify-center gap-3 text-gray-400">
          <RefreshCw size={22} className="animate-spin" />
          Loading your fitness dashboard...
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => void loadMemberDashboard()}
            className="mt-4 rounded-lg bg-orange-500 px-5 py-2 text-sm font-bold"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <section className="mb-7 rounded-2xl border border-white/5 bg-gradient-to-r from-[#342b2a] to-[#252832] p-7 md:p-9">
            <span className="rounded-full bg-orange-500/15 px-3 py-1.5 text-xs font-bold text-orange-400">
              YOUR FITNESS JOURNEY
            </span>
            <h2 className="mt-5 text-3xl font-extrabold md:text-4xl">
              Stay Strong.
              <span className="block text-orange-500">
                Keep Moving Forward.
              </span>
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-gray-400">
              Track your workouts, membership, attendance and payment
              information from your personal FitZone dashboard.
            </p>
            <button
              onClick={() => void loadMemberDashboard()}
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold hover:bg-orange-600"
            >
              <RefreshCw size={16} />
              Refresh My Dashboard
            </button>
          </section>

          <section className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-white/5 bg-[#22252e] p-5 transition hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{stat.title}</p>
                      <h3 className="mt-3 text-2xl font-extrabold">
                        {stat.value}
                      </h3>
                    </div>
                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>
                  <p className="mt-5 text-xs text-gray-500">
                    {stat.description}
                  </p>
                </div>
              )
            })}
          </section>

          <section className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-orange-500/15 p-3 text-orange-400">
                  <Activity size={22} />
                </div>
                <div>
                  <h3 className="font-bold">Attendance Progress</h3>
                  <p className="text-xs text-gray-500">
                    Your gym visit summary
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-[#2b2f3a] p-5">
                  <p className="text-xs text-gray-500">Total Visits</p>
                  <p className="mt-2 text-3xl font-extrabold">
                    {progress?.attendance.totalVisits ?? attendance.length}
                  </p>
                </div>
                <div className="rounded-xl bg-[#2b2f3a] p-5">
                  <p className="text-xs text-gray-500">This Month</p>
                  <p className="mt-2 text-3xl font-extrabold text-orange-400">
                    {progress?.attendance.visitsThisMonth ?? 0}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-500/15 p-3 text-green-400">
                  <TrendingUp size={22} />
                </div>
                <div>
                  <h3 className="font-bold">Workout Progress</h3>
                  <p className="text-xs text-gray-500">
                    Your workout plan summary
                  </p>
                </div>
              </div>

              <div className="mt-7 grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-[#2b2f3a] p-4">
                  <p className="text-xs text-gray-500">Total</p>
                  <p className="mt-2 text-2xl font-extrabold">
                    {progress?.workoutPlans.total ?? workouts.length}
                  </p>
                </div>
                <div className="rounded-xl bg-[#2b2f3a] p-4">
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="mt-2 text-2xl font-extrabold text-green-400">
                    {progress?.workoutPlans.currentlyActive ?? 0}
                  </p>
                </div>
                <div className="rounded-xl bg-[#2b2f3a] p-4">
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="mt-2 text-2xl font-extrabold text-orange-400">
                    {progress?.workoutPlans.completed ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="mt-7 rounded-2xl border border-white/5 bg-[#22252e] p-6">
            <h3 className="text-lg font-bold">My Account Summary</h3>
            <p className="mt-1 text-xs text-gray-500">
              Your personal FitZone records
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-[#2b2f3a] p-5">
                <p className="text-sm text-gray-400">Workout Plans</p>
                <p className="mt-2 text-2xl font-extrabold">
                  {workouts.length}
                </p>
              </div>
              <div className="rounded-xl bg-[#2b2f3a] p-5">
                <p className="text-sm text-gray-400">Subscriptions</p>
                <p className="mt-2 text-2xl font-extrabold">
                  {subscriptions.length}
                </p>
              </div>
              <div className="rounded-xl bg-[#2b2f3a] p-5">
                <p className="text-sm text-gray-400">Payment Records</p>
                <p className="mt-2 text-2xl font-extrabold">
                  {payments.length}
                </p>
              </div>
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  )
}

export default MemberDashboardPage