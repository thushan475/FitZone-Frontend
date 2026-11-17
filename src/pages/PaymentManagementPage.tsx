
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Eye,
    Pencil,
    X,
    Wallet,
    CheckCircle,
    Clock,
    AlertCircle,
    Trash2
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getAllMembers } from "../services/member.service";
import type { Member } from "../services/member.service";
import {
    getAllSubscriptions
} from "../services/subscription.service";
import type { Subscription } from "../services/subscription.service";
import {
    getAllPayments,
    createPayment,
    updatePayment,
    deletePayment
} from "../services/payment.service";
import type {
    Payment,
    CreatePaymentInput,
    PaymentMethod,
    PaymentStatus
} from "../services/payment.service";

type ModalMode = "CREATE" | "EDIT" | "VIEW";

const emptyForm: CreatePaymentInput = {
    member: "",
    subscription: "",
    amount: 0,
    paymentMethod: "CASH",
    paymentStatus: "PAID",
    paymentDate: new Date().toISOString().split("T")[0],
    referenceNumber: "",
    notes: ""
};

function PaymentManagementPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | PaymentStatus>("ALL");
    const [modalMode, setModalMode] = useState<ModalMode | null>(null);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [form, setForm] = useState<CreatePaymentInput>(emptyForm);
    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);

            const [paymentData, memberData, subscriptionData] = await Promise.all([
                getAllPayments(),
                getAllMembers("ACTIVE"),
                getAllSubscriptions()
            ]);

            setPayments(paymentData);
            setMembers(memberData);
            setSubscriptions(subscriptionData);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load payment information.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const filteredPayments = useMemo(() => {
        return payments.filter((payment) => {
            const memberName =
                typeof payment.member === "object"
                    ? payment.member?.name || ""
                    : "";

            const planName =
                typeof payment.subscription === "object"
                    ? payment.subscription?.planName || ""
                    : "";

            const matchesSearch =
                memberName.toLowerCase().includes(search.toLowerCase()) ||
                planName.toLowerCase().includes(search.toLowerCase()) ||
                (payment.referenceNumber || "").toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" || payment.paymentStatus === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [payments, search, statusFilter]);

    const paidCount = payments.filter(
        (item) => item.paymentStatus === "PAID"
    ).length;

    const pendingCount = payments.filter(
        (item) => item.paymentStatus === "PENDING"
    ).length;

    const failedCount = payments.filter(
        (item) => item.paymentStatus === "FAILED"
    ).length;

    const totalPaid = payments
        .filter((item) => item.paymentStatus === "PAID")
        .reduce((total, item) => total + item.amount, 0);

    const formatPrice = (amount: number) =>
        `LKR ${amount.toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-LK");

    const getMemberName = (payment: Payment) =>
        typeof payment.member === "object"
            ? payment.member?.name || "Unknown Member"
            : "Unknown Member";

    const getPlanName = (payment: Payment) =>
        typeof payment.subscription === "object"
            ? payment.subscription?.planName || "Unknown Plan"
            : "Unknown Plan";

    const getStatusStyle = (status: PaymentStatus) => {
        if (status === "PAID") return "bg-green-500/10 text-green-400";
        if (status === "PENDING") return "bg-yellow-500/10 text-yellow-400";
        return "bg-red-500/10 text-red-400";
    };

    const openCreateModal = () => {
        setSelectedPayment(null);
        setForm({
            ...emptyForm,
            paymentDate: new Date().toISOString().split("T")[0]
        });
        setError("");
        setModalMode("CREATE");
    };

    const openViewModal = (payment: Payment) => {
        setSelectedPayment(payment);
        setError("");
        setModalMode("VIEW");
    };

    const openEditModal = (payment: Payment) => {
        setSelectedPayment(payment);

        setForm({
            member: typeof payment.member === "object"
                ? payment.member._id
                : payment.member,
            subscription: typeof payment.subscription === "object"
                ? payment.subscription._id
                : payment.subscription,
            amount: payment.amount,
            paymentMethod: payment.paymentMethod,
            paymentStatus: payment.paymentStatus,
            paymentDate: payment.paymentDate
                ? new Date(payment.paymentDate).toISOString().split("T")[0]
                : "",
            referenceNumber: payment.referenceNumber || "",
            notes: payment.notes || ""
        });

        setError("");
        setModalMode("EDIT");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedPayment(null);
        setError("");
    };

    const handleMemberChange = (memberId: string) => {
        setForm((current) => ({
            ...current,
            member: memberId,
            subscription: ""
        }));
    };

    const memberSubscriptions = subscriptions.filter((subscription) => {
        const memberId =
            typeof subscription.member === "object"
                ? subscription.member?._id
                : subscription.member;

        return memberId === form.member;
    });

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!form.member || !form.subscription) {
            setError("Please select a member and subscription.");
            return;
        }

        if (Number(form.amount) <= 0) {
            setError("Payment amount must be greater than zero.");
            return;
        }

        try {
            setSaving(true);

            await createPayment({
                member: form.member,
                subscription: form.subscription,
                amount: Number(form.amount),
                paymentMethod: form.paymentMethod,
                paymentStatus: form.paymentStatus,
                paymentDate: form.paymentDate,
                referenceNumber: form.referenceNumber?.trim() || undefined,
                notes: form.notes?.trim() || undefined
            });

            closeModal();
            await loadData();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to create payment."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedPayment) return;

        if (Number(form.amount) <= 0) {
            setError("Payment amount must be greater than zero.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await updatePayment(selectedPayment._id, {
                amount: Number(form.amount),
                paymentMethod: form.paymentMethod,
                paymentStatus: form.paymentStatus,
                paymentDate: form.paymentDate,
                referenceNumber: form.referenceNumber?.trim() || undefined,
                notes: form.notes?.trim() || undefined
            });

            closeModal();
            await loadData();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to update payment."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (payment: Payment) => {
        if (!window.confirm(
            `Are you sure you want to delete this payment of ${formatPrice(payment.amount)}?`
        )) {
            return;
        }

        try {
            await deletePayment(payment._id);
            await loadData();
        } catch (err: any) {
            window.alert(
                err.response?.data?.message ||
                "Failed to delete payment."
            );
        }
    };

    return (
        <DashboardLayout
            activeItem="Payments"
            subtitle="FITZONE / PAYMENT MANAGEMENT"
        >
            <div className="space-y-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Payments</h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Manage member payments and transaction records.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold hover:bg-orange-600"
                    >
                        <Plus size={18} />
                        Add Payment
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: "Total Payments", value: payments.length, icon: Wallet },
                        { label: "Paid", value: paidCount, icon: CheckCircle },
                        { label: "Pending", value: pendingCount, icon: Clock },
                        { label: "Failed", value: failedCount, icon: AlertCircle }
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-white/5 bg-[#20232c] p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400">{item.label}</p>
                                    <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
                                        <Icon size={20} />
                                    </div>
                                </div>
                                <h3 className="mt-4 text-2xl font-bold">{item.value}</h3>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                    <div className="mb-5 rounded-xl bg-[#17191f] p-5">
                        <p className="text-sm text-gray-400">Total Successful Payments</p>
                        <h3 className="mt-2 text-2xl font-bold text-green-400">
                            {formatPrice(totalPaid)}
                        </h3>
                    </div>

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search member, plan or reference..."
                                className="w-full rounded-xl border border-white/10 bg-[#17191f] py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(["ALL", "PAID", "PENDING", "FAILED"] as const).map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status)}
                                    className={`rounded-lg px-4 py-2 text-xs font-semibold ${
                                        statusFilter === status
                                            ? "bg-orange-500 text-white"
                                            : "bg-[#17191f] text-gray-400 hover:text-white"
                                    }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && !modalMode && (
                        <p className="mt-4 rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[1100px] text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-4">Member</th>
                                    <th className="px-4 py-4">Subscription</th>
                                    <th className="px-4 py-4">Amount</th>
                                    <th className="px-4 py-4">Method</th>
                                    <th className="px-4 py-4">Payment Date</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-400">
                                            Loading payments...
                                        </td>
                                    </tr>
                                ) : filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-400">
                                            No payments found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((payment) => (
                                        <tr
                                            key={payment._id}
                                            className="border-b border-white/5 hover:bg-white/[0.02]"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="font-semibold">
                                                    {getMemberName(payment)}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-300">
                                                {getPlanName(payment)}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold">
                                                {formatPrice(payment.amount)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-300">
                                                {payment.paymentMethod.replace("_", " ")}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-300">
                                                {formatDate(payment.paymentDate)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(payment.paymentStatus)}`}>
                                                    {payment.paymentStatus}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        title="View"
                                                        onClick={() => openViewModal(payment)}
                                                        className="rounded-lg bg-blue-500/10 p-2 text-blue-400 hover:bg-blue-500/20"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <button
                                                        title="Edit"
                                                        onClick={() => openEditModal(payment)}
                                                        className="rounded-lg bg-orange-500/10 p-2 text-orange-400 hover:bg-orange-500/20"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    <button
                                                        title="Delete"
                                                        onClick={() => void handleDelete(payment)}
                                                        className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {modalMode && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4">
                    <div className="my-8 w-full max-w-xl rounded-2xl border border-white/10 bg-[#20232c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div>
                                <h3 className="text-lg font-bold">
                                    {modalMode === "CREATE"
                                        ? "Create Payment"
                                        : modalMode === "EDIT"
                                            ? "Edit Payment"
                                            : "Payment Details"}
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    FITZONE / PAYMENTS
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-white/5"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {modalMode === "VIEW" && selectedPayment ? (
                            <div className="space-y-5 p-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-gray-500">Member</p>
                                        <p className="mt-1 font-semibold">
                                            {getMemberName(selectedPayment)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Subscription</p>
                                        <p className="mt-1 font-semibold">
                                            {getPlanName(selectedPayment)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Amount</p>
                                        <p className="mt-1 font-bold text-orange-400">
                                            {formatPrice(selectedPayment.amount)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Payment Method</p>
                                        <p className="mt-1 font-semibold">
                                            {selectedPayment.paymentMethod.replace("_", " ")}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Payment Date</p>
                                        <p className="mt-1 font-semibold">
                                            {formatDate(selectedPayment.paymentDate)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Reference Number</p>
                                        <p className="mt-1 font-semibold">
                                            {selectedPayment.referenceNumber || "N/A"}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(selectedPayment.paymentStatus)}`}>
                                        {selectedPayment.paymentStatus}
                                    </span>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Notes</p>
                                    <p className="mt-1 text-sm text-gray-300">
                                        {selectedPayment.notes || "No notes"}
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={closeModal}
                                        className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold hover:bg-orange-600"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <form
                                onSubmit={modalMode === "CREATE" ? handleCreate : handleUpdate}
                                className="space-y-5 p-6"
                            >
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Select Member *
                                    </label>
                                    <select
                                        required
                                        disabled={modalMode === "EDIT"}
                                        value={form.member}
                                        onChange={(event) => handleMemberChange(event.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500 disabled:opacity-60"
                                    >
                                        <option value="">Choose a member</option>
                                        {members.map((member) => (
                                            <option key={member._id} value={member._id}>
                                                {member.name} - {member.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Select Subscription *
                                    </label>
                                    <select
                                        required
                                        disabled={modalMode === "EDIT"}
                                        value={form.subscription}
                                        onChange={(event) => setForm({
                                            ...form,
                                            subscription: event.target.value
                                        })}
                                        className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500 disabled:opacity-60"
                                    >
                                        <option value="">Choose a subscription</option>
                                        {(modalMode === "EDIT" ? subscriptions : memberSubscriptions).map((subscription) => (
                                            <option key={subscription._id} value={subscription._id}>
                                                {subscription.planName} - {formatPrice(subscription.planPrice)} ({subscription.status})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Amount (LKR) *
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            min="0.01"
                                            step="0.01"
                                            value={form.amount}
                                            onChange={(event) => setForm({
                                                ...form,
                                                amount: Number(event.target.value)
                                            })}
                                            className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Payment Date *
                                        </label>
                                        <input
                                            required
                                            type="date"
                                            value={form.paymentDate}
                                            onChange={(event) => setForm({
                                                ...form,
                                                paymentDate: event.target.value
                                            })}
                                            className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Payment Method *
                                        </label>
                                        <select
                                            required
                                            value={form.paymentMethod}
                                            onChange={(event) => setForm({
                                                ...form,
                                                paymentMethod: event.target.value as PaymentMethod
                                            })}
                                            className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                        >
                                            <option value="CASH">Cash</option>
                                            <option value="CARD">Card</option>
                                            <option value="BANK_TRANSFER">Bank Transfer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Payment Status *
                                        </label>
                                        <select
                                            required
                                            value={form.paymentStatus}
                                            onChange={(event) => setForm({
                                                ...form,
                                                paymentStatus: event.target.value as PaymentStatus
                                            })}
                                            className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                        >
                                            <option value="PAID">Paid</option>
                                            <option value="PENDING">Pending</option>
                                            <option value="FAILED">Failed</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Reference Number
                                    </label>
                                    <input
                                        value={form.referenceNumber || ""}
                                        onChange={(event) => setForm({
                                            ...form,
                                            referenceNumber: event.target.value
                                        })}
                                        placeholder="Enter transaction reference"
                                        className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.notes || ""}
                                        onChange={(event) => setForm({
                                            ...form,
                                            notes: event.target.value
                                        })}
                                        placeholder="Optional payment notes..."
                                        className="w-full resize-none rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    />
                                </div>

                                {error && (
                                    <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                        {error}
                                    </p>
                                )}

                                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving || (modalMode === "CREATE" && (members.length === 0 || subscriptions.length === 0))}
                                        className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : modalMode === "CREATE"
                                                ? "Create Payment"
                                                : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default PaymentManagementPage;
