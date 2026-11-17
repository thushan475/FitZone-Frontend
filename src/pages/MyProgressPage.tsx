
import { useEffect, useState } from "react";
import {
    Activity,
    CalendarDays,
    CheckCircle,
    CreditCard,
    Dumbbell,
    RefreshCw,
    TrendingUp,
    Wallet
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import {
    getMyProgress
} from "../services/member-portal.service";
import type {
    MemberProgress
} from "../services/member-portal.service";

function MyProgressPage() {
    const [progress, setProgress] = useState<MemberProgress | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadProgress = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyProgress();
            setProgress(data);
        } catch {
            setError("Failed to load your progress report.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProgress();
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const formatCurrency = (amount: number) => {
        return `Rs. ${amount.toLocaleString("en-LK", {
            maximumFractionDigits: 2
        })}`;
    };

    return (
        <DashboardLayout
            activeItem="My Progress"
            subtitle="FITZONE / MY PROGRESS"
        >
            <div className="space-y-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            My Fitness Progress
                        </h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Monitor your attendance, workouts, membership and payments.
                        </p>
                    </div>

                    <button
                        onClick={loadProgress}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-white/5 bg-[#22252e] py-16 text-center text-gray-400">
                        Loading your progress...
                    </div>
                ) : progress ? (
                    <>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400">Total Visits</p>
                                    <CalendarDays className="text-orange-400" size={23} />
                                </div>
                                <h2 className="mt-4 text-3xl font-bold text-white">
                                    {progress.attendance.totalVisits}
                                </h2>
                                <p className="mt-2 text-xs text-gray-500">
                                    {progress.attendance.visitsThisMonth} visits this month
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400">Workout Plans</p>
                                    <Dumbbell className="text-blue-400" size={23} />
                                </div>
                                <h2 className="mt-4 text-3xl font-bold text-white">
                                    {progress.workoutPlans.total}
                                </h2>
                                <p className="mt-2 text-xs text-gray-500">
                                    {progress.workoutPlans.currentlyActive} currently active
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400">Active Memberships</p>
                                    <CreditCard className="text-green-400" size={23} />
                                </div>
                                <h2 className="mt-4 text-3xl font-bold text-white">
                                    {progress.subscriptions.activeCount}
                                </h2>
                                <p className="mt-2 text-xs text-gray-500">
                                    Currently active subscriptions
                                </p>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400">Total Paid</p>
                                    <Wallet className="text-yellow-400" size={23} />
                                </div>
                                <h2 className="mt-4 text-2xl font-bold text-white">
                                    {formatCurrency(progress.payments.totalPaid)}
                                </h2>
                                <p className="mt-2 text-xs text-gray-500">
                                    {progress.payments.paidTransactions} successful payments
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="rounded-xl bg-orange-500/10 p-3">
                                        <Activity className="text-orange-400" size={22} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-white">
                                            Attendance Overview
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Your gym visit summary
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">
                                            Total Gym Visits
                                        </span>
                                        <span className="font-bold text-white">
                                            {progress.attendance.totalVisits}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">
                                            Visits This Month
                                        </span>
                                        <span className="font-bold text-orange-400">
                                            {progress.attendance.visitsThisMonth}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                                <div className="mb-6 flex items-center gap-3">
                                    <div className="rounded-xl bg-green-500/10 p-3">
                                        <TrendingUp className="text-green-400" size={22} />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-white">
                                            Workout Overview
                                        </h2>
                                        <p className="text-xs text-gray-500">
                                            Your workout plan summary
                                        </p>
                                    </div>
                                </div>

                                <div className="space-y-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">
                                            Total Plans
                                        </span>
                                        <span className="font-bold text-white">
                                            {progress.workoutPlans.total}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">
                                            Currently Active
                                        </span>
                                        <span className="font-bold text-green-400">
                                            {progress.workoutPlans.currentlyActive}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-400">
                                            Completed
                                        </span>
                                        <span className="font-bold text-blue-400">
                                            {progress.workoutPlans.completed}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="rounded-xl bg-orange-500/10 p-3">
                                    <CheckCircle className="text-orange-400" size={22} />
                                </div>
                                <div>
                                    <h2 className="font-bold text-white">
                                        Active Memberships
                                    </h2>
                                    <p className="text-xs text-gray-500">
                                        Your currently active subscriptions
                                    </p>
                                </div>
                            </div>

                            {progress.subscriptions.activeSubscriptions.length === 0 ? (
                                <p className="py-8 text-center text-sm text-gray-500">
                                    No active memberships found.
                                </p>
                            ) : (
                                <div className="space-y-4">
                                    {progress.subscriptions.activeSubscriptions.map(
                                        (subscription, index) => (
                                            <div
                                                key={`${subscription.planName}-${index}`}
                                                className="flex flex-col justify-between gap-3 rounded-xl border border-white/5 bg-[#17191f] p-4 sm:flex-row sm:items-center"
                                            >
                                                <div>
                                                    <h3 className="font-semibold text-white">
                                                        {subscription.planName}
                                                    </h3>
                                                    <p className="mt-1 text-xs text-gray-500">
                                                        {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
                                                    </p>
                                                </div>

                                                <span className="w-fit rounded-lg bg-green-500/10 px-3 py-1.5 text-xs font-semibold text-green-400">
                                                    {subscription.status}
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            )}
                        </div>

                        <p className="text-right text-xs text-gray-500">
                            Report generated: {formatDate(progress.generatedAt)}
                        </p>
                    </>
                ) : null}
            </div>
        </DashboardLayout>
    );
}

export default MyProgressPage;
