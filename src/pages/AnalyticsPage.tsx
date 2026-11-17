import { useEffect, useState } from "react";
import {
    Activity,
    Users,
    Wallet,
    CalendarDays,
    RefreshCw
} from "lucide-react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";
import api from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";

interface AnalyticsData {
    members: {
        totalMembers: number;
        activeMembers: number;
        inactiveMembers: number;
        newMembersThisMonth: number;
    };
    revenue: {
        totalRevenue: number;
        dailyRevenue: number;
        monthlyRevenue: number;
        yearlyRevenue: number;
    };
    attendance: {
        totalAttendance: number;
        todayAttendance: number;
        monthlyAttendance: number;
    };
    memberships: {
        activeMemberships: number;
        expiredMemberships: number;
        cancelledMemberships: number;
    };
}

interface AnalyticsResponse {
    success: boolean;
    data: AnalyticsData;
}

const formatCurrency = (amount: number) =>
    `Rs. ${amount.toLocaleString("en-US", {
        maximumFractionDigits: 0
    })}`;

function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadAnalytics = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get<AnalyticsResponse>("/analytics");
            setAnalytics(response.data.data);
        } catch {
            setError("Analytics data could not be loaded. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadAnalytics();
    }, []);

    const revenueData = analytics
        ? [
            { period: "Daily", revenue: analytics.revenue.dailyRevenue },
            { period: "Monthly", revenue: analytics.revenue.monthlyRevenue },
            { period: "Yearly", revenue: analytics.revenue.yearlyRevenue },
            { period: "Total", revenue: analytics.revenue.totalRevenue }
        ]
        : [];

    const membershipData = analytics
        ? [
            { name: "Active", value: analytics.memberships.activeMemberships, color: "#f97316" },
            { name: "Expired", value: analytics.memberships.expiredMemberships, color: "#eab308" },
            { name: "Cancelled", value: analytics.memberships.cancelledMemberships, color: "#ef4444" }
        ]
        : [];

    const statCards = [
        {
            title: "Total Members",
            value: analytics?.members.totalMembers ?? 0,
            description: `${analytics?.members.newMembersThisMonth ?? 0} new members this month`,
            icon: Users,
            color: "text-orange-400",
            background: "bg-orange-500/15"
        },
        {
            title: "Total Revenue",
            value: formatCurrency(analytics?.revenue.totalRevenue ?? 0),
            description: "All paid transactions",
            icon: Wallet,
            color: "text-purple-400",
            background: "bg-purple-500/15"
        },
        {
            title: "Today's Attendance",
            value: analytics?.attendance.todayAttendance ?? 0,
            description: `${analytics?.attendance.monthlyAttendance ?? 0} this month`,
            icon: CalendarDays,
            color: "text-green-400",
            background: "bg-green-500/15"
        },
        {
            title: "Active Memberships",
            value: analytics?.memberships.activeMemberships ?? 0,
            description: "Currently active subscriptions",
            icon: Activity,
            color: "text-blue-400",
            background: "bg-blue-500/15"
        }
    ];

    return (
        <DashboardLayout activeItem="Analytics" subtitle="FITZONE / ADMINISTRATION">
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold">Analytics Overview</h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Monitor gym performance and business statistics
                        </p>
                    </div>

                    <button
                        onClick={() => void loadAnalytics()}
                        disabled={loading}
                        className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                    >
                        <RefreshCw size={17} />
                        Refresh Data
                    </button>
                </div>

                {loading ? (
                    <div className="rounded-2xl border border-white/5 bg-[#22252e] p-12 text-center text-gray-400">
                        Loading analytics...
                    </div>
                ) : error ? (
                    <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center">
                        <p className="text-red-400">{error}</p>
                        <button
                            onClick={() => void loadAnalytics()}
                            className="mt-4 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white"
                        >
                            Try Again
                        </button>
                    </div>
                ) : analytics && (
                    <>
                        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            {statCards.map((card) => {
                                const Icon = card.icon;

                                return (
                                    <div
                                        key={card.title}
                                        className="rounded-2xl border border-white/5 bg-[#22252e] p-5"
                                    >
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm text-gray-400">{card.title}</p>
                                            <div className={`rounded-xl p-3 ${card.background} ${card.color}`}>
                                                <Icon size={21} />
                                            </div>
                                        </div>
                                        <h3 className="mt-5 text-2xl font-extrabold">
                                            {card.value}
                                        </h3>
                                        <p className="mt-2 text-xs text-gray-500">
                                            {card.description}
                                        </p>
                                    </div>
                                );
                            })}
                        </section>

                        <section className="grid gap-5 xl:grid-cols-2">
                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <h3 className="text-lg font-bold">Revenue Overview</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Revenue from paid transactions
                                </p>

                                <div className="mt-6 h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={revenueData}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#373a44" />
                                            <XAxis dataKey="period" stroke="#9ca3af" />
                                            <YAxis
                                                stroke="#9ca3af"
                                                tickFormatter={(value) => `${Number(value).toLocaleString()}`}
                                            />
                                            <Tooltip
                                                formatter={(value) => formatCurrency(Number(value))}
                                                contentStyle={{
                                                    backgroundColor: "#20232c",
                                                    border: "1px solid #373a44",
                                                    borderRadius: "10px"
                                                }}
                                            />
                                            <Bar dataKey="revenue" fill="#f97316" radius={[6, 6, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <h3 className="text-lg font-bold">Membership Overview</h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    Current membership status distribution
                                </p>

                                <div className="mt-6 h-[300px]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={membershipData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={95}
                                                innerRadius={55}
                                                paddingAngle={4}
                                            >
                                                {membershipData.map((entry) => (
                                                    <Cell key={entry.name} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: "#20232c",
                                                    border: "1px solid #373a44",
                                                    borderRadius: "10px"
                                                }}
                                            />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </section>

                        <section className="grid gap-5 md:grid-cols-2">
                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <h3 className="text-lg font-bold">Member Statistics</h3>
                                <div className="mt-6 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Total Members</span>
                                        <span className="font-bold">{analytics.members.totalMembers}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Active Members</span>
                                        <span className="font-bold text-green-400">{analytics.members.activeMembers}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Inactive Members</span>
                                        <span className="font-bold text-red-400">{analytics.members.inactiveMembers}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">New This Month</span>
                                        <span className="font-bold text-orange-400">{analytics.members.newMembersThisMonth}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <h3 className="text-lg font-bold">Attendance Statistics</h3>
                                <div className="mt-6 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Total Attendance</span>
                                        <span className="font-bold">{analytics.attendance.totalAttendance}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Today's Attendance</span>
                                        <span className="font-bold text-green-400">{analytics.attendance.todayAttendance}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">Monthly Attendance</span>
                                        <span className="font-bold text-orange-400">{analytics.attendance.monthlyAttendance}</span>
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                            <h3 className="text-lg font-bold">Membership Status Details</h3>
                            <div className="mt-6 grid gap-5 sm:grid-cols-3">
                                <div className="rounded-xl bg-[#2b2f3a] p-5">
                                    <p className="text-sm text-gray-400">Active</p>
                                    <p className="mt-2 text-2xl font-bold text-green-400">
                                        {analytics.memberships.activeMemberships}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#2b2f3a] p-5">
                                    <p className="text-sm text-gray-400">Expired</p>
                                    <p className="mt-2 text-2xl font-bold text-yellow-400">
                                        {analytics.memberships.expiredMemberships}
                                    </p>
                                </div>
                                <div className="rounded-xl bg-[#2b2f3a] p-5">
                                    <p className="text-sm text-gray-400">Cancelled</p>
                                    <p className="mt-2 text-2xl font-bold text-red-400">
                                        {analytics.memberships.cancelledMemberships}
                                    </p>
                                </div>
                            </div>
                        </section>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
}

export default AnalyticsPage;
