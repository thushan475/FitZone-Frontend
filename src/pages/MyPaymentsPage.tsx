
import { useEffect, useState } from "react";
import {
    Wallet,
    CheckCircle,
    Clock,
    AlertCircle,
    CreditCard,
    CalendarDays,
    Receipt,
    XCircle
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getMyPayments } from "../services/member-portal.service";
import type {
    Payment,
    PaymentMethod,
    PaymentStatus
} from "../services/payment.service";

function MyPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadPayments = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyPayments();
                setPayments(data);
            } catch (err: any) {
                console.error(err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load your payments."
                );
            } finally {
                setLoading(false);
            }
        };

        void loadPayments();
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-LK", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const totalPaid = payments
        .filter((payment) => payment.paymentStatus === "PAID")
        .reduce((total, payment) => total + payment.amount, 0);

    const paidCount = payments.filter(
        (payment) => payment.paymentStatus === "PAID"
    ).length;

    const pendingCount = payments.filter(
        (payment) => payment.paymentStatus === "PENDING"
    ).length;

    const failedCount = payments.filter(
        (payment) => payment.paymentStatus === "FAILED"
    ).length;

    const getStatusStyle = (status: PaymentStatus) => {
        switch (status) {
            case "PAID":
                return "bg-green-500/10 text-green-400";
            case "PENDING":
                return "bg-yellow-500/10 text-yellow-400";
            case "FAILED":
                return "bg-red-500/10 text-red-400";
            default:
                return "bg-gray-500/10 text-gray-400";
        }
    };

    const getStatusIcon = (status: PaymentStatus) => {
        switch (status) {
            case "PAID":
                return <CheckCircle size={15} />;
            case "PENDING":
                return <Clock size={15} />;
            case "FAILED":
                return <XCircle size={15} />;
            default:
                return <AlertCircle size={15} />;
        }
    };

    const getMethodLabel = (method: PaymentMethod) => {
        const methods: Record<PaymentMethod, string> = {
            CASH: "Cash",
            CARD: "Card",
            BANK_TRANSFER: "Bank Transfer"
        };

        return methods[method] || method;
    };

    return (
        <DashboardLayout
            activeItem="My Payments"
            subtitle="FITZONE / MY PAYMENTS"
        >
            <div className="space-y-7">
                <div>
                    <h2 className="text-2xl font-bold">
                        My Payments
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        View your payment history, payment methods and transaction details.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Total Payments</p>
                            <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
                                <Receipt size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">
                            {payments.length}
                        </h3>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Successful</p>
                            <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                                <CheckCircle size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">{paidCount}</h3>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Pending</p>
                            <div className="rounded-xl bg-yellow-500/10 p-3 text-yellow-400">
                                <Clock size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">{pendingCount}</h3>
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
                            Loading your payments...
                        </p>
                    </div>
                ) : payments.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-[#20232c] px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                            <CreditCard size={30} />
                        </div>
                        <h3 className="mt-5 text-lg font-bold">
                            No Payments Yet
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                            You do not have any payment records yet.
                            Your payment history will appear here once payments are recorded.
                        </p>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#20232c]">
                        <div className="border-b border-white/5 p-5">
                            <h3 className="font-bold">Payment History</h3>
                            <p className="mt-1 text-sm text-gray-400">
                                {payments.length} payment records
                            </p>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[750px] text-left">
                                <thead className="bg-[#17191f] text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-5 py-4">Payment</th>
                                        <th className="px-5 py-4">Date</th>
                                        <th className="px-5 py-4">Method</th>
                                        <th className="px-5 py-4">Reference</th>
                                        <th className="px-5 py-4">Amount</th>
                                        <th className="px-5 py-4">Status</th>
                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-white/5">
                                    {payments.map((payment) => {
                                        const subscription =
                                            typeof payment.subscription === "string"
                                                ? null
                                                : payment.subscription;

                                        return (
                                            <tr
                                                key={payment._id}
                                                className="text-sm transition hover:bg-white/[0.02]"
                                            >
                                                <td className="px-5 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                                                            <Wallet size={18} />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">
                                                                {subscription?.planName || "Membership Payment"}
                                                            </p>
                                                            <p className="mt-1 text-xs text-gray-500">
                                                                {payment.notes || "Gym membership"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td className="px-5 py-4 text-gray-400">
                                                    <span className="flex items-center gap-2">
                                                        <CalendarDays size={14} />
                                                        {formatDate(payment.paymentDate)}
                                                    </span>
                                                </td>

                                                <td className="px-5 py-4 text-gray-300">
                                                    {getMethodLabel(payment.paymentMethod)}
                                                </td>

                                                <td className="px-5 py-4 text-gray-400">
                                                    {payment.referenceNumber || "—"}
                                                </td>

                                                <td className="px-5 py-4 font-semibold text-white">
                                                    Rs. {payment.amount.toLocaleString("en-LK")}
                                                </td>

                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold ${getStatusStyle(payment.paymentStatus)}`}>
                                                        {getStatusIcon(payment.paymentStatus)}
                                                        {payment.paymentStatus}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        <div className="flex justify-between border-t border-white/5 px-5 py-4 text-sm">
                            <span className="text-gray-400">Failed Payments</span>
                            <span className="font-semibold text-red-400">
                                {failedCount}
                            </span>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default MyPaymentsPage;
