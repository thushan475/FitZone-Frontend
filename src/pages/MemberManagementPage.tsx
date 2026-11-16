
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Users,
    UserCheck,
    UserX,
    Pencil,
    Eye,
    RefreshCw,
    X,
    CheckCircle,
    AlertCircle,
    RotateCcw
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import {
    getAllMembers,
    createMember,
    updateMember,
    deactivateMember,
    activateMember
} from "../services/member.service";
import type {
    Member,
    CreateMemberInput,
    UpdateMemberInput
} from "../services/member.service";

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";

const emptyForm: CreateMemberInput = {
    name: "",
    email: "",
    password: "",
    phone: ""
};

function MemberManagementPage() {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("ALL");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<Member | null>(null);
    const [selectedMember, setSelectedMember] = useState<Member | null>(null);
    const [form, setForm] = useState<CreateMemberInput>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadMembers = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getAllMembers(filter);
            setMembers(data);
        } catch {
            setError("Unable to load members. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadMembers();
    }, [filter]);

    const filteredMembers = useMemo(() => {
        const keyword = search.toLowerCase().trim();

        return members.filter((member) =>
            member.name.toLowerCase().includes(keyword) ||
            member.email.toLowerCase().includes(keyword) ||
            member.phone.includes(keyword)
        );
    }, [members, search]);

    const activeCount = members.filter((member) => member.isActive).length;
    const inactiveCount = members.filter((member) => !member.isActive).length;

    const openCreateModal = () => {
        setEditingMember(null);
        setForm(emptyForm);
        setError("");
        setModalOpen(true);
    };

    const openEditModal = (member: Member) => {
        setEditingMember(member);
        setForm({
            name: member.name,
            email: member.email,
            phone: member.phone,
            password: ""
        });
        setError("");
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingMember(null);
        setForm(emptyForm);
        setError("");
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setSaving(true);
            setError("");
            setSuccess("");

            if (editingMember) {
                const updateData: UpdateMemberInput = {
                    name: form.name,
                    email: form.email,
                    phone: form.phone
                };

                await updateMember(editingMember._id, updateData);
                setSuccess("Member updated successfully.");
            } else {
                await createMember(form);
                setSuccess("New member created successfully.");
            }

            closeModal();
            await loadMembers();
        } catch (err: unknown) {
            const message = (
                err as { response?: { data?: { message?: string } } }
            ).response?.data?.message;

            setError(message || "Something went wrong. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (member: Member) => {
        const confirmed = window.confirm(
            member.isActive
                ? `Deactivate ${member.name}?`
                : `Activate ${member.name}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            setSuccess("");

            if (member.isActive) {
                await deactivateMember(member._id);
                setSuccess("Member deactivated successfully.");
            } else {
                await activateMember(member._id);
                setSuccess("Member activated successfully.");
            }

            await loadMembers();
        } catch {
            setError("Unable to update member status.");
        }
    };

    return (
        <DashboardLayout
            activeItem="Members"
            subtitle="FITZONE / MEMBER MANAGEMENT"
        >
            <div className="space-y-6">
                {success && (
                    <div className="flex items-center gap-3 rounded-xl border border-green-500/20 bg-green-500/10 p-4 text-sm text-green-400">
                        <CheckCircle size={18} />
                        {success}
                        <button
                            onClick={() => setSuccess("")}
                            className="ml-auto"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {error && !modalOpen && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        <AlertCircle size={18} />
                        {error}
                        <button
                            onClick={() => setError("")}
                            className="ml-auto"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-[#22252e] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Total Members</p>
                            <div className="rounded-xl bg-orange-500/15 p-3 text-orange-400">
                                <Users size={21} />
                            </div>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold">
                            {members.length}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Members in selected filter
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#22252e] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Active Members</p>
                            <div className="rounded-xl bg-green-500/15 p-3 text-green-400">
                                <UserCheck size={21} />
                            </div>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold">
                            {activeCount}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Active in selected results
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#22252e] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Inactive Members</p>
                            <div className="rounded-xl bg-red-500/15 p-3 text-red-400">
                                <UserX size={21} />
                            </div>
                        </div>
                        <p className="mt-4 text-3xl font-extrabold">
                            {inactiveCount}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                            Deactivated accounts
                        </p>
                    </div>
                </section>

                <section className="rounded-2xl border border-white/5 bg-[#22252e] p-5 md:p-6">
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                        <div>
                            <h3 className="text-lg font-bold">Member Directory</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                Manage your gym members and their accounts.
                            </p>
                        </div>

                        <button
                            onClick={openCreateModal}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600"
                        >
                            <Plus size={18} />
                            Add New Member
                        </button>
                    </div>

                    <div className="mt-6 flex flex-col gap-3 md:flex-row">
                        <div className="relative flex-1">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search by name, email or phone..."
                                className="w-full rounded-xl border border-white/10 bg-[#17191f] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-gray-600 focus:border-orange-500"
                            />
                        </div>

                        <select
                            value={filter}
                            onChange={(event) =>
                                setFilter(event.target.value as FilterStatus)
                            }
                            className="rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm text-gray-300 outline-none focus:border-orange-500"
                        >
                            <option value="ALL">All Members</option>
                            <option value="ACTIVE">Active Members</option>
                            <option value="INACTIVE">Inactive Members</option>
                        </select>

                        <button
                            onClick={() => void loadMembers()}
                            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-semibold text-gray-300 transition hover:bg-white/5"
                        >
                            <RefreshCw size={16} />
                            Refresh
                        </button>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[760px] text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-4">Member</th>
                                    <th className="px-4 py-4">Phone</th>
                                    <th className="px-4 py-4">Joined Date</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-400">
                                            <RefreshCw className="mx-auto mb-3 animate-spin" size={23} />
                                            Loading members...
                                        </td>
                                    </tr>
                                ) : filteredMembers.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="py-16 text-center text-gray-500">
                                            <Users className="mx-auto mb-3" size={30} />
                                            No members found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <tr
                                            key={member._id}
                                            className="border-b border-white/5 transition hover:bg-white/[0.02]"
                                        >
                                            <td className="px-4 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-500/15 font-bold text-orange-400">
                                                        {member.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-white">
                                                            {member.name}
                                                        </p>
                                                        <p className="mt-1 text-xs text-gray-500">
                                                            {member.email}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-400">
                                                {member.phone}
                                            </td>

                                            <td className="px-4 py-4 text-sm text-gray-400">
                                                {new Date(member.createdAt).toLocaleDateString()}
                                            </td>

                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                                                        member.isActive
                                                            ? "bg-green-500/10 text-green-400"
                                                            : "bg-red-500/10 text-red-400"
                                                    }`}
                                                >
                                                    {member.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>

                                            <td className="px-4 py-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        title="View details"
                                                        onClick={() => setSelectedMember(member)}
                                                        className="rounded-lg p-2 text-gray-400 transition hover:bg-blue-500/10 hover:text-blue-400"
                                                    >
                                                        <Eye size={17} />
                                                    </button>

                                                    {member.isActive && (
                                                        <button
                                                            title="Edit member"
                                                            onClick={() => openEditModal(member)}
                                                            className="rounded-lg p-2 text-gray-400 transition hover:bg-orange-500/10 hover:text-orange-400"
                                                        >
                                                            <Pencil size={17} />
                                                        </button>
                                                    )}

                                                    <button
                                                        title={member.isActive ? "Deactivate member" : "Activate member"}
                                                        onClick={() => void handleStatusChange(member)}
                                                        className={`rounded-lg p-2 transition ${
                                                            member.isActive
                                                                ? "text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                                                                : "text-gray-400 hover:bg-green-500/10 hover:text-green-400"
                                                        }`}
                                                    >
                                                        {member.isActive ? <UserX size={17} /> : <RotateCcw size={17} />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && (
                        <div className="mt-4 border-t border-white/5 pt-4 text-xs text-gray-500">
                            Showing {filteredMembers.length} of {members.length} members
                        </div>
                    )}
                </section>
            </div>

            {modalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
                    <div className="my-auto w-full max-w-lg rounded-2xl border border-white/10 bg-[#22252e] p-6 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold">
                                    {editingMember ? "Edit Member" : "Add New Member"}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500">
                                    {editingMember
                                        ? "Update member information."
                                        : "Create a new gym member account."}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Full Name
                                </label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(event) =>
                                        setForm({ ...form, name: event.target.value })
                                    }
                                    placeholder="Enter full name"
                                    className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Email Address
                                </label>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(event) =>
                                        setForm({ ...form, email: event.target.value })
                                    }
                                    placeholder="member@example.com"
                                    className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-gray-300">
                                    Phone Number
                                </label>
                                <input
                                    required
                                    value={form.phone}
                                    onChange={(event) =>
                                        setForm({ ...form, phone: event.target.value })
                                    }
                                    placeholder="07XXXXXXXX"
                                    maxLength={10}
                                    className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                />
                            </div>

                            {!editingMember && (
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-300">
                                        Password
                                    </label>
                                    <input
                                        required
                                        type="password"
                                        minLength={8}
                                        value={form.password}
                                        onChange={(event) =>
                                            setForm({ ...form, password: event.target.value })
                                        }
                                        placeholder="Minimum 8 characters"
                                        className="w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                    />
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-3">
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
                                    className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving && <RefreshCw size={16} className="animate-spin" />}
                                    {saving
                                        ? "Saving..."
                                        : editingMember
                                            ? "Save Changes"
                                            : "Create Member"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#22252e] p-6 shadow-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold">Member Details</h3>
                            <button
                                onClick={() => setSelectedMember(null)}
                                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="mt-6 flex flex-col items-center border-b border-white/5 pb-6">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange-500/15 text-3xl font-extrabold text-orange-400">
                                {selectedMember.name.charAt(0).toUpperCase()}
                            </div>
                            <h4 className="mt-4 text-xl font-bold">
                                {selectedMember.name}
                            </h4>
                            <span className={`mt-2 rounded-full px-3 py-1 text-xs font-semibold ${
                                selectedMember.isActive
                                    ? "bg-green-500/10 text-green-400"
                                    : "bg-red-500/10 text-red-400"
                            }`}>
                                {selectedMember.isActive ? "Active Member" : "Inactive Member"}
                            </span>
                        </div>

                        <div className="mt-5 space-y-4 text-sm">
                            <div>
                                <p className="text-xs text-gray-500">Email</p>
                                <p className="mt-1 text-gray-200">{selectedMember.email}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Phone</p>
                                <p className="mt-1 text-gray-200">{selectedMember.phone}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Joined Date</p>
                                <p className="mt-1 text-gray-200">
                                    {new Date(selectedMember.createdAt).toLocaleString()}
                                </p>
                            </div>
                        </div>

                        <button
                            onClick={() => setSelectedMember(null)}
                            className="mt-7 w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default MemberManagementPage;
