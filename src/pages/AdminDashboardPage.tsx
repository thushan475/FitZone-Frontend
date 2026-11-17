import { useEffect, useState } from 'react'
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck,
  CreditCard,
  RefreshCw,
  Users,
  UserRound,
  Wallet
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import api from '../services/api'
import DashboardLayout from '../components/dashboard/DashboardLayout'

interface DashboardSummary {
  totalMembers: number
  totalTrainers: number
  activeMemberships: number
  totalRevenue: number
  todayAttendance: number
}

interface AnalyticsData {
  members: {
    totalMembers: number
    activeMembers: number
    inactiveMembers: number
    newMembersThisMonth: number
  }
  revenue: {
    totalRevenue: number
    dailyRevenue: number
    monthlyRevenue: number
    yearlyRevenue: number
  }
  attendance: {
    totalAttendance: number
    todayAttendance: number
    monthlyAttendance: number
  }
  memberships: {
    activeMemberships: number
    expiredMemberships: number
    cancelledMemberships: number
  }
}

interface DashboardResponse {
  success: boolean
  data: {
    summary: DashboardSummary
  }
}

interface AnalyticsResponse {
  success: boolean
  data: AnalyticsData
}

const formatCurrency = (amount: number) =>
  `Rs. ${amount.toLocaleString('en-US', {
    maximumFractionDigits: 0
  })}`

function AdminDashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadDashboard = async () => {
    try {
      setLoading(true)
      setError('')

      const [dashboardResponse, analyticsResponse] = await Promise.all([
        api.get<DashboardResponse>('/dashboard'),
        api.get<AnalyticsResponse>('/analytics')
      ])

      setSummary(dashboardResponse.data.data.summary)
      setAnalytics(analyticsResponse.data.data)
    } catch {
      setError('Dashboard data could not be loaded. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [])

  const stats = [
    {
      title: 'Total Members',
      value: summary?.totalMembers ?? 0,
      icon: Users,
      color: 'bg-orange-500/15 text-orange-400',
      change: analytics?.members.newMembersThisMonth ?? 0,
      description: 'New members this month'
    },
    {
      title: 'Total Trainers',
      value: summary?.totalTrainers ?? 0,
      icon: UserRound,
      color: 'bg-blue-500/15 text-blue-400',
      change: null,
      description: 'Registered trainers'
    },
    {
      title: 'Active Memberships',
      value: summary?.activeMemberships ?? 0,
      icon: CreditCard,
      color: 'bg-green-500/15 text-green-400',
      change: null,
      description: 'Currently active'
    },
    {
      title: 'Total Revenue',
      value: formatCurrency(summary?.totalRevenue ?? 0),
      icon: Wallet,
      color: 'bg-purple-500/15 text-purple-400',
      change: null,
      description: 'All paid transactions'
    }
  ]

  const revenueData = analytics
    ? [
        { period: 'Daily', revenue: analytics.revenue.dailyRevenue },
        { period: 'Monthly', revenue: analytics.revenue.monthlyRevenue },
        { period: 'Yearly', revenue: analytics.revenue.yearlyRevenue },
        { period: 'Total', revenue: analytics.revenue.totalRevenue }
      ]
    : []

  const membershipData = analytics
    ? [
        {
          name: 'Active',
          value: analytics.memberships.activeMemberships,
          color: '#f97316'
        },
        {
          name: 'Expired',
          value: analytics.memberships.expiredMemberships,
          color: '#eab308'
        },
        {
          name: 'Cancelled',
          value: analytics.memberships.cancelledMemberships,
          color: '#22c55e'
        }
      ]
    : []

  return (
    <DashboardLayout
      activeItem="Dashboard"
      subtitle="FITZONE / ADMINISTRATION"
    >
      {loading ? (
        <div className="flex min-h-96 items-center justify-center">
          <div className="flex items-center gap-3 text-gray-400">
            <RefreshCw className="animate-spin" size={22} />
            Loading dashboard...
          </div>
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => void loadDashboard()}
            className="mt-4 rounded-lg bg-orange-500 px-5 py-2 text-sm font-bold text-white hover:bg-orange-600"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          <section className="mb-7 grid gap-5 xl:grid-cols-[1.8fr_1fr]">
            <div className="relative min-h-64 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#34303a] via-[#29252c] to-[#242731] p-7 md:p-9">
              <div className="relative z-10 max-w-lg">
                <span className="inline-flex items-center gap-2 rounded-full border border-orange-400/20 bg-orange-500/10 px-3 py-1.5 text-xs font-semibold text-orange-400">
                  <Activity size={14} />
                  ADMIN CONTROL CENTER
                </span>

                <p className="mt-6 text-sm text-gray-400">
                  Welcome back, Administrator
                </p>

                <h2 className="mt-2 text-3xl font-extrabold leading-tight md:text-4xl">
                  Manage Your Gym.
                  <span className="block text-orange-500">
                    Build Stronger Members.
                  </span>
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-gray-400">
                  Monitor your gym performance, memberships, attendance and
                  revenue from one place.
                </p>

                <button
                  onClick={() => void loadDashboard()}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                >
                  <RefreshCw size={16} />
                  Refresh Dashboard
                </button>
              </div>

              <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full border-[35px] border-orange-500/10" />
              <div className="pointer-events-none absolute -bottom-28 right-20 h-64 w-64 rounded-full border-[30px] border-orange-500/10" />
              <div className="pointer-events-none absolute right-10 top-10 hidden h-48 w-48 items-center justify-center rounded-full bg-orange-500/10 md:flex">
                <Activity size={90} className="text-orange-500/40" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Member Activity</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Membership status overview
                  </p>
                </div>
                <Users className="text-orange-400" size={21} />
              </div>

              <div className="relative mt-3 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={membershipData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={48}
                      outerRadius={83}
                      paddingAngle={4}
                      stroke="none"
                    >
                      {membershipData.map((item) => (
                        <Cell key={item.name} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: '#22252e',
                        border: '1px solid #3b3e49',
                        borderRadius: 12,
                        color: '#fff'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>

                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-extrabold">
                    {summary?.activeMemberships ?? 0}
                  </span>
                  <span className="text-xs text-gray-500">Active</span>
                </div>
              </div>

              <div className="mt-2 grid grid-cols-3 gap-2">
                {membershipData.map((item) => (
                  <div key={item.name} className="text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-xs text-gray-400">
                        {item.name}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-bold">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mb-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon

              return (
                <div
                  key={stat.title}
                  className="rounded-2xl border border-white/5 bg-[#22252e] p-5 transition hover:-translate-y-1 hover:border-orange-500/20"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-gray-400">{stat.title}</p>
                      <h3 className="mt-3 text-2xl font-extrabold tracking-tight">
                        {stat.value}
                      </h3>
                    </div>

                    <div className={`rounded-xl p-3 ${stat.color}`}>
                      <Icon size={22} />
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-2 text-xs">
                    {stat.change !== null && (
                      <span className="flex items-center gap-1 text-green-400">
                        <ArrowUpRight size={14} />
                        {stat.change}
                      </span>
                    )}
                    <span className="text-gray-500">{stat.description}</span>
                  </div>
                </div>
              )
            })}
          </section>

          <section className="mb-7 grid gap-5 xl:grid-cols-[1.8fr_1fr]">
            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-5 md:p-7">
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold">Revenue Overview</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Paid revenue summary
                  </p>
                </div>

                <span className="rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-400">
                  LKR
                </span>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={revenueData}>
                    <defs>
                      <linearGradient
                        id="revenueGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#f97316"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f97316"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      stroke="#373a44"
                      strokeDasharray="4 5"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="period"
                      stroke="#777"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 12 }}
                    />

                    <YAxis
                      stroke="#777"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 11 }}
                      tickFormatter={(value: number) =>
                        value >= 1000000
                          ? `${(value / 1000000).toFixed(1)}M`
                          : value >= 1000
                            ? `${(value / 1000).toFixed(0)}K`
                            : String(value)
                      }
                    />

                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        'Revenue'
                      ]}
                      contentStyle={{
                        background: '#22252e',
                        border: '1px solid #3b3e49',
                        borderRadius: 12,
                        color: '#fff'
                      }}
                    />

                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#f97316"
                      strokeWidth={3}
                      fill="url(#revenueGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold">Today's Overview</h3>
                  <p className="mt-1 text-xs text-gray-500">
                    Daily gym performance
                  </p>
                </div>
                <CalendarCheck className="text-orange-400" size={22} />
              </div>

              <div className="mt-7 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Today's Attendance
                    </span>
                    <span className="text-lg font-bold">
                      {summary?.todayAttendance ?? 0}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#373a44]">
                    <div className="h-full w-2/3 rounded-full bg-orange-500" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      New Members This Month
                    </span>
                    <span className="text-lg font-bold">
                      {analytics?.members.newMembersThisMonth ?? 0}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#373a44]">
                    <div className="h-full w-1/2 rounded-full bg-blue-500" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Monthly Attendance
                    </span>
                    <span className="text-lg font-bold">
                      {analytics?.attendance.monthlyAttendance ?? 0}
                    </span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-[#373a44]">
                    <div className="h-full w-3/4 rounded-full bg-green-500" />
                  </div>
                </div>
              </div>

              <div className="mt-8 rounded-xl bg-[#2b2f3a] p-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-orange-500/15 p-2 text-orange-400">
                    <Wallet size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Monthly Revenue</p>
                    <p className="mt-1 text-lg font-bold">
                      {formatCurrency(
                        analytics?.revenue.monthlyRevenue ?? 0
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-green-500/15 p-3 text-green-400">
                  <ArrowUpRight size={22} />
                </div>
                <div>
                  <h3 className="font-bold">Active Members</h3>
                  <p className="text-xs text-gray-500">
                    Currently active gym accounts
                  </p>
                </div>
              </div>
              <p className="mt-6 text-3xl font-extrabold">
                {analytics?.members.activeMembers ?? 0}
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Inactive Members:{' '}
                <span className="font-semibold text-gray-300">
                  {analytics?.members.inactiveMembers ?? 0}
                </span>
              </p>
            </div>

            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-500/15 p-3 text-red-400">
                  <ArrowDownRight size={22} />
                </div>
                <div>
                  <h3 className="font-bold">Membership Status</h3>
                  <p className="text-xs text-gray-500">
                    Expired and cancelled memberships
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500">Expired</p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {analytics?.memberships.expiredMemberships ?? 0}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Cancelled</p>
                  <p className="mt-1 text-2xl font-extrabold">
                    {analytics?.memberships.cancelledMemberships ?? 0}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </>
      )}
    </DashboardLayout>
  )
}

export default AdminDashboardPage