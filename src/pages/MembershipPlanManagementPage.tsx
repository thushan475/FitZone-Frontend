
import { useEffect, useMemo, useState } from "react";
import {
    Plus,
    Search,
    Eye,
    Pencil,
    Trash2,
    X,
    Check,
    RotateCcw,
    CreditCard,
    Clock,
    Users,
    DollarSign
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import {
    getAllMembershipPlans,
    createMembershipPlan,
    updateMembershipPlan,
    deactivateMembershipPlan,
    activateMembershipPlan
} from "../services/membership-plan.service";
import type {
    MembershipPlan,
    CreateMembershipPlanInput
} from "../services/membership-plan.service";

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";
type ModalMode = "CREATE" | "EDIT" | "VIEW";

const emptyForm: CreateMembershipPlanInput = {
    name: "",
    description: "",
    durationDays: 30,
    price: 0,
    features: []
};

function MembershipPlanManagementPage() {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
    const [modalMode, setModalMode] = useState<ModalMode | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
    const [form, setForm] = useState<CreateMembershipPlanInput>(emptyForm);
    const [featureInput, setFeatureInput] = useState("");
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const loadPlans = async () => {
        try {
            setLoading(true);
            const data = await getAllMembershipPlans();
            setPlans(data);
        } catch (err) {
            console.error(err);
            setError("Failed to load membership plans.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadPlans();
    }, []);

    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            const matchesStatus =
                statusFilter === "ALL" ||
                (statusFilter === "ACTIVE" && plan.isActive) ||
                (statusFilter === "INACTIVE" && !plan.isActive);

            const searchText = search.toLowerCase();

            const matchesSearch =
                plan.name.toLowerCase().includes(searchText) ||
                (plan.description || "").toLowerCase().includes(searchText) ||
                plan.features.some((feature) =>
                    feature.toLowerCase().includes(searchText)
                );

            return matchesStatus && matchesSearch;
        });
    }, [plans, search, statusFilter]);

    const totalPlans = plans.length;
    const activePlans = plans.filter((plan) => plan.isActive).length;
    const inactivePlans = totalPlans - activePlans;
    const averagePrice = totalPlans > 0
        ? plans.reduce((total, plan) => total + plan.price, 0) / totalPlans
        : 0;

    const openCreateModal = () => {
        setSelectedPlan(null);
        setForm(emptyForm);
        setFeatureInput("");
        setError("");
        setModalMode("CREATE");
    };

    const openEditModal = (plan: MembershipPlan) => {
        setSelectedPlan(plan);
        setForm({
            name: plan.name,
            description: plan.description || "",
            durationDays: plan.durationDays,
            price: plan.price,
            features: [...plan.features]
        });
        setFeatureInput("");
        setError("");
        setModalMode("EDIT");
    };

    const openViewModal = (plan: MembershipPlan) => {
        setSelectedPlan(plan);
        setError("");
        setModalMode("VIEW");
    };

    const closeModal = () => {
        setModalMode(null);
        setSelectedPlan(null);
        setError("");
    };

    const addFeature = () => {
        const feature = featureInput.trim();

        if (!feature) return;

        if (form.features.includes(feature)) {
            setError("This feature has already been added.");
            return;
        }

        setForm((previous) => ({
            ...previous,
            features: [...previous.features, feature]
        }));

        setFeatureInput("");
        setError("");
    };

    const removeFeature = (index: number) => {
        setForm((previous) => ({
            ...previous,
            features: previous.features.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Please enter a membership plan name.");
            return;
        }

        if (!Number.isInteger(form.durationDays) || form.durationDays < 1) {
            setError("Duration must be at least 1 day.");
            return;
        }

        if (!Number.isFinite(form.price) || form.price < 0) {
            setError("Please enter a valid price.");
            return;
        }

        try {
            setSaving(true);

            const payload: CreateMembershipPlanInput = {
                name: form.name.trim(),
                description: form.description?.trim(),
                durationDays: Number(form.durationDays),
                price: Number(form.price),
                features: form.features
            };

            if (modalMode === "CREATE") {
                await createMembershipPlan(payload);
            } else if (modalMode === "EDIT" && selectedPlan) {
                await updateMembershipPlan(selectedPlan._id, payload);
            }

            closeModal();
            await loadPlans();
        } catch (err: any) {
            setError(
                err.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeactivate = async (plan: MembershipPlan) => {
        const confirmed = window.confirm(
            `Are you sure you want to deactivate "${plan.name}"?`
        );

        if (!confirmed) return;

        try {
            await deactivateMembershipPlan(plan._id);
            await loadPlans();
        } catch (err: any) {
            window.alert(
                err.response?.data?.message ||
                "Failed to deactivate membership plan."
            );
        }
    };

    const handleActivate = async (plan: MembershipPlan) => {
        try {
            await activateMembershipPlan(plan._id);
            await loadPlans();
        } catch (err: any) {
            window.alert(
                err.response?.data?.message ||
                "Failed to activate membership plan."
            );
        }
    };

    const formatPrice = (price: number) =>
        `LKR ${price.toLocaleString("en-LK", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;

    return (
        <DashboardLayout
            activeItem="Membership Plans"
            subtitle="FITZONE / MEMBERSHIP PLAN MANAGEMENT"
        >
            <div className="space-y-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-2xl font-bold">Membership Plans</h2>
                        <p className="mt-1 text-sm text-gray-400">
                            Create and manage gym membership packages.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                        <Plus size={18} />
                        Add Membership Plan
                    </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: "Total Plans",
                            value: totalPlans,
                            icon: CreditCard
                        },
                        {
                            label: "Active Plans",
                            value: activePlans,
                            icon: Check
                        },
                        {
                            label: "Inactive Plans",
                            value: inactivePlans,
                            icon: Users
                        },
                        {
                            label: "Average Price",
                            value: formatPrice(averagePrice),
                            icon: DollarSign
                        }
                    ].map((item) => {
                        const Icon = item.icon;

                        return (
                            <div
                                key={item.label}
                                className="rounded-2xl border border-white/5 bg-[#20232c] p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400">
                                        {item.label}
                                    </p>
                                    <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
                                        <Icon size={20} />
                                    </div>
                                </div>

                                <h3 className="mt-4 break-words text-2xl font-bold">
                                    {item.value}
                                </h3>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search membership plans..."
                                className="w-full rounded-xl border border-white/10 bg-[#17191f] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-orange-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(["ALL", "ACTIVE", "INACTIVE"] as FilterStatus[]).map(
                                (status) => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`rounded-lg px-4 py-2 text-xs font-semibold transition ${
                                            statusFilter === status
                                                ? "bg-orange-500 text-white"
                                                : "bg-[#17191f] text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        {status}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[850px] text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-4">Plan</th>
                                    <th className="px-4 py-4">Duration</th>
                                    <th className="px-4 py-4">Price</th>
                                    <th className="px-4 py-4">Features</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            Loading membership plans...
                                        </td>
                                    </tr>
                                ) : filteredPlans.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="py-12 text-center text-gray-400">
                                            No membership plans found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlans.map((plan) => (
                                        <tr
                                            key={plan._id}
                                            className="border-b border-white/5 transition hover:bg-white/[0.02]"
                                        >
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-white">
                                                    {plan.name}
                                                </p>
                                                <p className="mt-1 max-w-[220px] truncate text-xs text-gray-500">
                                                    {plan.description || "No description"}
                                                </p>
                                            </td>

                                            <td className="px-4 py-4">
                                                <span className="flex items-center gap-2 text-sm text-gray-300">
                                                    <Clock size={15} className="text-orange-400" />
                                                    {plan.durationDays} days
                                                </span>
                                            </td>

                                            <td className="px-4 py-4 text-sm font-semibold text-white">
                                                {formatPrice(plan.price)}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-400">
                                                {plan.features.length} features
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        plan.isActive
                                                            ? "bg-green-500/10 text-green-400"
                                                            : "bg-red-500/10 text-red-400"
                                                    }`}
                                                >
                                                    {plan.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        title="View"
                                                        onClick={() => openViewModal(plan)}
                                                        className="rounded-lg bg-blue-500/10 p-2 text-blue-400 hover:bg-blue-500/20"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {plan.isActive ? (
                                                        <>
                                                            <button
                                                                title="Edit"
                                                                onClick={() => openEditModal(plan)}
                                                                className="rounded-lg bg-orange-500/10 p-2 text-orange-400 hover:bg-orange-500/20"
                                                            >
                                                                <Pencil size={16} />
                                                            </button>

                                                            <button
                                                                title="Deactivate"
                                                                onClick={() => void handleDeactivate(plan)}
                                                                className="rounded-lg bg-red-500/10 p-2 text-red-400 hover:bg-red-500/20"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <button
                                                            title="Activate"
                                                            onClick={() => void handleActivate(plan)}
                                                            className="rounded-lg bg-green-500/10 p-2 text-green-400 hover:bg-green-500/20"
                                                        >
                                                            <RotateCcw size={16} />
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
                    <div className="my-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#20232c] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div>
                                <h3 className="text-lg font-bold">
                                    {modalMode === "CREATE"
                                        ? "Create Membership Plan"
                                        : modalMode === "EDIT"
                                            ? "Edit Membership Plan"
                                            : "Membership Plan Details"}
                                </h3>
                                <p className="mt-1 text-xs text-gray-500">
                                    FITZONE / MEMBERSHIP PLANS
                                </p>
                            </div>

                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {modalMode === "VIEW" && selectedPlan ? (
                            <div className="space-y-5 p-6">
                                <div>
                                    <p className="text-xs text-gray-500">Plan Name</p>
                                    <h4 className="mt-1 text-xl font-bold">
                                        {selectedPlan.name}
                                    </h4>
                                </div>

                                <div>
                                    <p className="text-xs text-gray-500">Description</p>
                                    <p className="mt-1 text-sm text-gray-300">
                                        {selectedPlan.description || "No description provided"}
                                    </p>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <p className="text-xs text-gray-500">Duration</p>
                                        <p className="mt-2 font-bold">
                                            {selectedPlan.durationDays} days
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <p className="text-xs text-gray-500">Price</p>
                                        <p className="mt-2 font-bold text-orange-400">
                                            {formatPrice(selectedPlan.price)}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-3 text-xs text-gray-500">Included Features</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedPlan.features.length > 0 ? (
                                            selectedPlan.features.map((feature, index) => (
                                                <span
                                                    key={`${feature}-${index}`}
                                                    className="rounded-lg bg-orange-500/10 px-3 py-2 text-xs text-orange-300"
                                                >
                                                    {feature}
                                                </span>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500">
                                                No features added.
                                            </p>
                                        )}
                                    </div>
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
                            <form onSubmit={handleSubmit} className="space-y-5 p-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Plan Name *
                                    </label>
                                    <input
                                        required
                                        value={form.name}
                                        onChange={(event) =>
                                            setForm({ ...form, name: event.target.value })
                                        }
                                        placeholder="e.g. Premium Monthly"
                                        className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Description
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={form.description}
                                        onChange={(event) =>
                                            setForm({ ...form, description: event.target.value })
                                        }
                                        placeholder="Describe this membership plan..."
                                        className="w-full resize-none rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                    />
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Duration (Days) *
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            min="1"
                                            step="1"
                                            value={form.durationDays}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    durationDays: Number(event.target.value)
                                                })
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-300">
                                            Price (LKR) *
                                        </label>
                                        <input
                                            required
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={form.price}
                                            onChange={(event) =>
                                                setForm({
                                                    ...form,
                                                    price: Number(event.target.value)
                                                })
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Plan Features
                                    </label>

                                    <div className="flex gap-2">
                                        <input
                                            value={featureInput}
                                            onChange={(event) =>
                                                setFeatureInput(event.target.value)
                                            }
                                            onKeyDown={(event) => {
                                                if (event.key === "Enter") {
                                                    event.preventDefault();
                                                    addFeature();
                                                }
                                            }}
                                            placeholder="Enter a feature..."
                                            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm outline-none focus:border-orange-500"
                                        />

                                        <button
                                            type="button"
                                            onClick={addFeature}
                                            className="rounded-xl bg-orange-500 px-4 text-sm font-semibold hover:bg-orange-600"
                                        >
                                            Add
                                        </button>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {form.features.map((feature, index) => (
                                            <span
                                                key={`${feature}-${index}`}
                                                className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-xs text-orange-300"
                                            >
                                                {feature}
                                                <button
                                                    type="button"
                                                    onClick={() => removeFeature(index)}
                                                    className="text-orange-300 hover:text-white"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
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
                                        disabled={saving}
                                        className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : modalMode === "CREATE"
                                                ? "Create Plan"
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

export default MembershipPlanManagementPage;
