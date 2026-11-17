
import { useEffect, useState } from "react";
import {
    CreditCard,
    CalendarDays,
    Clock,
    CheckCircle,
    AlertCircle,
    XCircle,
    ClipboardList,
    Wallet
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getMySubscriptions } from "../services/member-portal.service";
import type { Subscription } from "../services/subscription.service";

function MySubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadSubscriptions = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMySubscriptions();
                setSubscriptions(data);
            } catch (err: any) {
                console.error(err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load your subscriptions."
                );
            } finally {
                setLoading(false);
            }
        };

        void loadSubscriptions();
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-LK", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const activeCount = subscriptions.filter(
        (subscription) => subscription.status === "ACTIVE"
    ).length;

    const expiredCount = subscriptions.filter(
        (subscription) => subscription.status === "EXPIRED"
    ).length;

    const totalPaid = subscriptions.reduce(
        (total, subscription) => total + subscription.amountPaid,
        0
    );

    const getStatusStyle = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-green-500/10 text-green-400";
            case "EXPIRED":
                return "bg-red-500/10 text-red-400";
            case "CANCELLED":
                return "bg-gray-500/10 text-gray-400";
            default:
                return "bg-yellow-500/10 text-yellow-400";
        }
    };

    return (
        <DashboardLayout
            activeItem="My Subscription"
            subtitle="FITZONE / MY SUBSCRIPTION"
        >
            <div className="space-y-7">
                <div>
                    <h2 className="text-2xl font-bold">
                        My Subscription
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        View your membership plans, subscription periods and payment progress.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Total Subscriptions</p>
                            <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
                                <ClipboardList size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">
                            {subscriptions.length}
                        </h3>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Active</p>
                            <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">{activeCount}</h3>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Expired</p>
                            <div className="rounded-xl bg-red-500/10 p-3 text-red-400">
                                <XCircle size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">{expiredCount}</h3>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Total Paid</p>
                            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                                <Wallet size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">
                            Rs. {totalPaid.toLocaleString("en-LK")}
                        </h3>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-white/5 bg-[#20232c] py-16 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-500/20 border-t-orange-500" />
                        <p className="mt-4 text-sm text-gray-400">
                            Loading your subscriptions...
                        </p>
                    </div>
                ) : subscriptions.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-[#20232c] px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                            <CreditCard size={30} />
                        </div>
                        <h3 className="mt-5 text-lg font-bold">
                            No Subscriptions Yet
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                            You do not have any membership subscriptions yet.
                            Your subscriptions will appear here once they are created.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 xl:grid-cols-2">
                        {subscriptions.map((subscription) => (
                            <div
                                key={subscription._id}
                                className="overflow-hidden rounded-2xl border border-white/5 bg-[#20232c]"
                            >
                                <div className="border-b border-white/5 p-5">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                        <div>
                                            <h3 className="text-lg font-bold">
                                                {subscription.planName}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-400">
                                                Membership Subscription
                                            </p>
                                        </div>

                                        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(subscription.status)}`}>
                                            {subscription.status}
                                        </span>
                                    </div>

                                    <div className="mt-5 flex flex-wrap gap-2">
                                        <span className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-400">
                                            <CreditCard size={15} />
                                            Rs. {subscription.planPrice.toLocaleString("en-LK")}
                                        </span>

                                        <span className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-300">
                                            <Clock size={15} />
                                            {subscription.durationDays} Days
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-3 p-5 sm:grid-cols-2">
                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <CalendarDays size={15} />
                                            Start Date
                                        </div>
                                        <p className="mt-2 text-sm font-semibold">
                                            {formatDate(subscription.startDate)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <CalendarDays size={15} />
                                            End Date
                                        </div>
                                        <p className="mt-2 text-sm font-semibold">
                                            {formatDate(subscription.endDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-5 pb-5">
                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400">Amount Paid</span>
                                            <span className="font-semibold text-green-400">
                                                Rs. {subscription.amountPaid.toLocaleString("en-LK")}
                                            </span>
                                        </div>

                                        <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                                            <div
                                                className="h-full rounded-full bg-orange-500"
                                                style={{
                                                    width: `${subscription.planPrice > 0
                                                        ? Math.min((subscription.amountPaid / subscription.planPrice) * 100, 100)
                                                        : 0}%`
                                                }}
                                            />
                                        </div>

                                        <div className="mt-2 flex justify-between text-xs text-gray-500">
                                            <span>Payment Progress</span>
                                            <span>
                                                {subscription.planPrice > 0
                                                    ? Math.round((subscription.amountPaid / subscription.planPrice) * 100)
                                                    : 0}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default MySubscriptionPage;
