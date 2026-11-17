
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Eye,
    Pencil,
    X,
    RotateCcw,
    CreditCard,
    CheckCircle,
    Clock,
    Ban
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getAllMembers } from "../services/member.service";
import type { Member } from "../services/member.service";
import { getAllMembershipPlans } from "../services/membership-plan.service";
import type { MembershipPlan } from "../services/membership-plan.service";
import {
    getAllSubscriptions,
    createSubscription,
    updateSubscription,
    renewSubscription,
    cancelSubscription
} from "../services/subscription.service";
import type {
    Subscription,
    CreateSubscriptionInput,
    SubscriptionStatus
} from "../services/subscription.service";

type ModalMode = "CREATE" | "EDIT" | "VIEW";

const emptyForm: CreateSubscriptionInput = {
    memberId: "",
    planId: "",
    startDate: new Date().toISOString().split("T")[0],
    amountPaid: 0
};

function SubscriptionManagementPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<"ALL" | SubscriptionStatus>("ALL");
    const [modalMode, setModalMode] = useState<ModalMode | null>(null);
    const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
    const [form, setForm] = useState<CreateSubscriptionInput>(emptyForm);
    const [editAmount, setEditAmount] = useState(0);
    const [editStatus, setEditStatus] = useState<SubscriptionStatus>("ACTIVE");
    const [error, setError] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);

            const [subscriptionData, memberData, planData] = await Promise.all([
                getAllSubscriptions(),
                getAllMembers("ACTIVE"),
                getAllMembershipPlans("ACTIVE")
            ]);

            setSubscriptions(subscriptionData);
            setMembers(memberData);
            setPlans(planData);
            setError("");
        } catch (err) {
            console.error(err);
            setError("Failed to load subscription information.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter((subscription) => {
            const memberName =
                typeof subscription.member === "object"
                    ? subscription.member?.name || ""
                    : "";

            const matchesSearch =
                memberName.toLowerCase().includes(search.toLowerCase()) ||
                subscription.planName.toLowerCase().includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" || subscription.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [subscriptions, search, statusFilter]);

    const activeCount = subscriptions.filter((item) => item.status === "ACTIVE").length;
    const expiredCount = subscriptions.filter((item) => item.status === "EXPIRED").length;
    const cancelledCount = subscriptions.filter((item) => item.status === "CANCELLED").length;

    const formatPrice = (amount: number) =>
        `LKR ${amount.toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    const formatDate = (date: string) =>
        new Date(date).toLocaleDateString("en-LK");

    const openCreateModal = () => {
        setSelectedSubscription(null);
        setForm({
            ...emptyForm,
            startDate: new Date().toISOString().split("T")[0]
        });
        setError("");
        setModalMode("CREATE");
    };

    const openViewModal = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setError("");
        setModalMode("VIEW");
    };

    const openEditModal = (subscription: Subscription) => {
        setSelectedSubscription(subscription);
        setEditAmount(subscription.amountPaid);
        setEditStatus(subscription.status);
        setError("");
        setModalMode("EDIT");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedSubscription(null);
        setError("");
    };

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!form.memberId || !form.planId) {
            setError("Please select a member and membership plan.");
            return;
        }

        if (Number(form.amountPaid) < 0) {
            setError("Amount paid cannot be negative.");
            return;
        }

        try {
            setSaving(true);

            await createSubscription({
                memberId: form.memberId,
                planId: form.planId,
                startDate: form.startDate,
                amountPaid: Number(form.amountPaid)
            });

            closeModal();
            await loadData();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to create subscription."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedSubscription) return;

        if (editAmount < 0) {
            setError("Amount paid cannot be negative.");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await updateSubscription(selectedSubscription._id, {
                amountPaid: Number(editAmount),
                status: editStatus
            });

            closeModal();
            await loadData();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Failed to update subscription."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleRenew = async (subscription: Subscription) => {
        if (!window.confirm(`Renew subscription for ${subscription.planName}?`)) {
            return;
        }

        try {
            await renewSubscription(subscription._id);
            await loadData();
        } catch (err: any) {
            window.alert(
                err.response?.data?.message ||
                "Failed to renew subscription."
            );
        }
    };

    const handleCancel = async (subscription: Subscription) => {
        if (!window.confirm("Are you sure you want to cancel this subscription?")) {
            return;
        }

        try {
            await cancelSubscription(subscription._id);
            await loadData();
        } catch (err: any) {
            window.alert(
                err.response?.data?.message ||
                "Failed to cancel subscription."
            );
        }
    };

    const getMemberName = (subscription: Subscription) =>
        typeof subscription.member === "object"
            ? subscription.member?.name || "Unknown Member"
            : "Unknown Member";

    const getStatusStyle = (status: SubscriptionStatus) => {
        if (status === "ACTIVE") return "bg-green-500/10 text-green-400";
        if (status === "EXPIRED") return "bg-yellow-500/10 text-yellow-400";
        return "bg-red-500/10 text-red-400";
    };

    return (
        <DashboardLayout
            activeItem="Subscriptions"
            subtitle="FITZONE / SUBSCRIPTION MANAGEMENT"
        >
            <div className="space-y-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Subscriptions</h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Manage member subscriptions and renewals.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold hover:bg-orange-600"
                    >
                        <Plus size={18} />
                        Add Subscription
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: "Total Subscriptions", value: subscriptions.length, icon: CreditCard },
                        { label: "Active", value: activeCount, icon: CheckCircle },
                        { label: "Expired", value: expiredCount, icon: Clock },
                        { label: "Cancelled", value: cancelledCount, icon: Ban }
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <div key={item.label} className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
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
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search member or plan..."
                                className="w-full rounded-xl border border-white/10 bg-[#17191f] py-3 pl-11 pr-4 text-sm outline-none focus:border-orange-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(["ALL", "ACTIVE", "EXPIRED", "CANCELLED"] as const).map((status) => (
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
                        <table className="w-full min-w-[1050px] text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-4">Member</th>
                                    <th className="px-4 py-4">Plan</th>
                                    <th className="px-4 py-4">Start Date</th>
                                    <th className="px-4 py-4">End Date</th>
                                    <th className="px-4 py-4">Amount Paid</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-400">
                                            Loading subscriptions...
                                        </td>
                                    </tr>
                                ) : filteredSubscriptions.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-gray-400">
                                            No subscriptions found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredSubscriptions.map((subscription) => (
                                        <tr key={subscription._id} className="border-b border-white/5 hover:bg-white/[0.02]">
                                            <td className="px-4 py-4">
                                                <p className="font-semibold">{getMemberName(subscription)}</p>
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-300">
                                                {subscription.planName}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-300">
                                                {formatDate(subscription.startDate)}
                                            </td>
                                            <td className="px-4 py-4 text-sm text-gray-300">
                                                {formatDate(subscription.endDate)}
                                            </td>
                                            <td className="px-4 py-4 text-sm font-semibold">
                                                {formatPrice(subscription.amountPaid)}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(subscription.status)}`}>
                                                    {subscription.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        title="View"
                                                        onClick={() => openViewModal(subscription)}
                                                        className="rounded-lg bg-blue-500/10 p-2 text-blue-400 hover:bg-blue-500/20"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    <button
                                                        title="Edit"
                                                        onClick={() => openEditModal(subscription)}
                                                        className="rounded-lg bg-orange-500/10 p-2 text-orange-400 hover:bg-orange-500/20"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>

                                                    {subscription.status !== "ACTIVE" && (
                                                        <button
                                                            title="Renew"
                                                            onClick={() => void handleRenew(subscription)}
                                                            className="rounded-lg bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20"
                                                        >
                                                            <RotateCcw size={16} />
                                                        </button>
                                                    )}

                                                    {subscription.status === "ACTIVE" && (
                                                        <button
                                                            title="Cancel"
                                                            onClick={() => void handleCancel(subscription)}
                                                            className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    )}
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
                                        ? "Create Subscription"
                                        : modalMode === "EDIT"
                                            ? "Edit Subscription"
                                            : "Subscription Details"}
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    FITZONE / SUBSCRIPTIONS
                                </p>
                            </div>
                            <button onClick={closeModal} className="rounded-lg p-2 text-gray-400 hover:bg-white/5">
                                <X size={20} />
                            </button>
                        </div>

                        {modalMode === "VIEW" && selectedSubscription ? (
                            <div className="space-y-5 p-6">
                                <div>
                                    <p className="text-xs text-gray-500">Member</p>
                                    <p className="mt-1 font-semibold">{getMemberName(selectedSubscription)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Membership Plan</p>
                                    <p className="mt-1 font-semibold">{selectedSubscription.planName}</p>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <p className="text-xs text-gray-500">Start Date</p>
                                        <p className="mt-2 font-bold">{formatDate(selectedSubscription.startDate)}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <p className="text-xs text-gray-500">End Date</p>
                                        <p className="mt-2 font-bold">{formatDate(selectedSubscription.endDate)}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <p className="text-xs text-gray-500">Plan Price</p>
                                        <p className="mt-2 font-bold">{formatPrice(selectedSubscription.planPrice)}</p>
                                    </div>
                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <p className="text-xs text-gray-500">Amount Paid</p>
                                        <p className="mt-2 font-bold text-orange-400">{formatPrice(selectedSubscription.amountPaid)}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Status</p>
                                    <span className={`mt-2 inline-block rounded-full px-3 py-1 text-xs font-semibold ${getStatusStyle(selectedSubscription.status)}`}>
                                        {selectedSubscription.status}
                                    </span>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={closeModal} className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold hover:bg-orange-600">
                                        Close
                                    </button>
                                </div>
                            </div>
                        ) : modalMode === "CREATE" ? (
                            <form onSubmit={handleCreate} className="space-y-5 p-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Select Member *</label>
                                    <select
                                        required
                                        value={form.memberId}
                                        onChange={(event) => setForm({ ...form, memberId: event.target.value })}
                                        className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
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
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Membership Plan *</label>
                                    <select
                                        required
                                        value={form.planId}
                                        onChange={(event) => setForm({ ...form, planId: event.target.value })}
                                        className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    >
                                        <option value="">Choose a plan</option>
                                        {plans.map((plan) => (
                                            <option key={plan._id} value={plan._id}>
                                                {plan.name} - {formatPrice(plan.price)}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">Start Date *</label>
                                        <input
                                            required
                                            type="date"
                                            value={form.startDate}
                                            onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                                            className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">Initial Amount Paid (LKR)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.amountPaid}
                                            onChange={(event) => setForm({ ...form, amountPaid: Number(event.target.value) })}
                                            className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

                                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                                    <button type="button" onClick={closeModal} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-white/5">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving || members.length === 0 || plans.length === 0} className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
                                        {saving ? "Creating..." : "Create Subscription"}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-5 p-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Amount Paid (LKR)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={editAmount}
                                        onChange={(event) => setEditAmount(Number(event.target.value))}
                                        className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    />
                                </div>
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">Subscription Status</label>
                                    <select
                                        value={editStatus}
                                        onChange={(event) => setEditStatus(event.target.value as SubscriptionStatus)}
                                        className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="EXPIRED">Expired</option>
                                        <option value="CANCELLED">Cancelled</option>
                                    </select>
                                </div>

                                {error && <p className="rounded-lg bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>}

                                <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-5 sm:flex-row sm:justify-end">
                                    <button type="button" onClick={closeModal} className="rounded-xl border border-white/10 px-5 py-3 text-sm font-semibold text-gray-300 hover:bg-white/5">
                                        Cancel
                                    </button>
                                    <button type="submit" disabled={saving} className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold hover:bg-orange-600 disabled:opacity-50">
                                        {saving ? "Saving..." : "Save Changes"}
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

export default SubscriptionManagementPage;
