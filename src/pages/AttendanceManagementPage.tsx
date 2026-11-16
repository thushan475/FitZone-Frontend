
import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Clock,
    Search,
    Plus,
    Eye,
    Trash2,
    LogOut,
    Users,
    CheckCircle2,
    AlertCircle,
    X,
    RefreshCw
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { getAllMembers } from "../services/member.service";
import type { Member } from "../services/member.service";
import {
    getAllAttendance,
    createAttendance,
    updateAttendance,
    deleteAttendance
} from "../services/attendance.service";
import type {
    Attendance,
    AttendanceStatus
} from "../services/attendance.service";

type ModalType = "create" | "view" | "checkout" | null;

const formatDate = (value: string) => {
    return new Date(value).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const formatTime = (value?: string) => {
    if (!value) return "-";

    return new Date(value).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit"
    });
};

const getErrorMessage = (error: unknown) => {
    const response = error as {
        response?: {
            data?: {
                message?: string;
            };
        };
    };

    return response.response?.data?.message || "Something went wrong";
};

export default function AttendanceManagementPage() {
    const [attendance, setAttendance] = useState<Attendance[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

    const [modal, setModal] = useState<ModalType>(null);
    const [selected, setSelected] = useState<Attendance | null>(null);

    const [memberId, setMemberId] = useState("");
    const [checkIn, setCheckIn] = useState("");
    const [status, setStatus] = useState<AttendanceStatus>("PRESENT");
    const [notes, setNotes] = useState("");
    const [checkOut, setCheckOut] = useState("");

    const loadData = async () => {
        try {
            setLoading(true);
            setError("");

            const [attendanceData, memberData] = await Promise.all([
                getAllAttendance(),
                getAllMembers("ACTIVE")
            ]);

            setAttendance(attendanceData);
            setMembers(memberData);
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const filteredAttendance = useMemo(() => {
        return attendance.filter(record => {
            const memberName = record.member?.name?.toLowerCase() || "";
            const memberEmail = record.member?.email?.toLowerCase() || "";
            const searchValue = search.toLowerCase();

            const matchesSearch =
                memberName.includes(searchValue) ||
                memberEmail.includes(searchValue);

            const recordDate = new Date(record.attendanceDate)
                .toISOString()
                .split("T")[0];

            const matchesStatus =
                statusFilter === "ALL" || record.status === statusFilter;

            const matchesFrom = !fromDate || recordDate >= fromDate;
            const matchesTo = !toDate || recordDate <= toDate;

            return matchesSearch && matchesStatus && matchesFrom && matchesTo;
        });
    }, [attendance, search, statusFilter, fromDate, toDate]);

    const presentCount = attendance.filter(
        item => item.status === "PRESENT"
    ).length;

    const lateCount = attendance.filter(
        item => item.status === "LATE"
    ).length;

    const openCreateModal = () => {
        setMemberId("");
        setCheckIn("");
        setStatus("PRESENT");
        setNotes("");
        setModal("create");
        setError("");
    };

    const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!memberId) {
            setError("Please select a member");
            return;
        }

        try {
            setSaving(true);
            setError("");

            await createAttendance({
                memberId,
                checkIn: checkIn ? new Date(checkIn).toISOString() : undefined,
                status,
                notes
            });

            setSuccess("Attendance recorded successfully");
            setModal(null);
            await loadData();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const openCheckoutModal = (record: Attendance) => {
        setSelected(record);
        setCheckOut(new Date().toISOString().slice(0, 16));
        setModal("checkout");
        setError("");
    };

    const handleCheckout = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selected || !checkOut) return;

        try {
            setSaving(true);
            setError("");

            await updateAttendance(selected._id, {
                checkOut: new Date(checkOut).toISOString()
            });

            setSuccess("Check-out recorded successfully");
            setModal(null);
            await loadData();
        } catch (err) {
            setError(getErrorMessage(err));
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (record: Attendance) => {
        const confirmed = window.confirm(
            `Delete attendance record for ${record.member?.name || "this member"}?`
        );

        if (!confirmed) return;

        try {
            setError("");
            await deleteAttendance(record._id);
            setSuccess("Attendance deleted successfully");
            await loadData();
        } catch (err) {
            setError(getErrorMessage(err));
        }
    };

    const closeModal = () => {
        setModal(null);
        setSelected(null);
        setError("");
    };

    return (
        <DashboardLayout
            activeItem="Attendance"
            subtitle="FITZONE / ATTENDANCE MANAGEMENT"
        >
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Attendance Management
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Monitor member check-ins and gym attendance.
                        </p>
                    </div>

                    <button
                        onClick={openCreateModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
                    >
                        <Plus size={18} />
                        Record Attendance
                    </button>
                </div>

                {success && (
                    <div className="flex items-center justify-between rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                        <span>{success}</span>
                        <button onClick={() => setSuccess("")}>
                            <X size={17} />
                        </button>
                    </div>
                )}

                {error && (
                    <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                        <span>{error}</span>
                        <button onClick={() => setError("")}>
                            <X size={17} />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="rounded-xl bg-orange-50 p-3 text-orange-500">
                                <CalendarDays size={22} />
                            </div>
                            <span className="text-xs font-medium text-gray-400">
                                ALL RECORDS
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-gray-900">
                            {attendance.length}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Total Attendance
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="rounded-xl bg-green-50 p-3 text-green-600">
                                <CheckCircle2 size={22} />
                            </div>
                            <span className="text-xs font-medium text-gray-400">
                                PRESENT
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-gray-900">
                            {presentCount}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Present Records
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="rounded-xl bg-yellow-50 p-3 text-yellow-600">
                                <AlertCircle size={22} />
                            </div>
                            <span className="text-xs font-medium text-gray-400">
                                LATE
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-gray-900">
                            {lateCount}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Late Records
                        </p>
                    </div>

                    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                        <div className="flex items-center justify-between">
                            <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                                <Users size={22} />
                            </div>
                            <span className="text-xs font-medium text-gray-400">
                                MEMBERS
                            </span>
                        </div>
                        <p className="mt-4 text-3xl font-bold text-gray-900">
                            {members.length}
                        </p>
                        <p className="mt-1 text-sm text-gray-500">
                            Active Members
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="relative">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                                size={18}
                            />
                            <input
                                value={search}
                                onChange={event => setSearch(event.target.value)}
                                placeholder="Search member..."
                                className="w-full rounded-xl border border-gray-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={event => setStatusFilter(event.target.value)}
                            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late</option>
                        </select>

                        <input
                            type="date"
                            value={fromDate}
                            onChange={event => setFromDate(event.target.value)}
                            className="rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                        />

                        <div className="flex gap-2">
                            <input
                                type="date"
                                value={toDate}
                                min={fromDate || undefined}
                                onChange={event => setToDate(event.target.value)}
                                className="min-w-0 flex-1 rounded-xl border border-gray-200 px-3 py-3 text-sm outline-none focus:border-orange-400"
                            />
                            <button
                                onClick={() => {
                                    setSearch("");
                                    setStatusFilter("ALL");
                                    setFromDate("");
                                    setToDate("");
                                }}
                                className="rounded-xl border border-gray-200 px-3 text-gray-500 transition hover:bg-gray-50"
                                title="Clear filters"
                            >
                                <RefreshCw size={17} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                        <div>
                            <h2 className="font-bold text-gray-900">
                                Attendance Records
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                {filteredAttendance.length} records found
                            </p>
                        </div>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-16">
                            <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
                        </div>
                    ) : filteredAttendance.length === 0 ? (
                        <div className="px-5 py-16 text-center">
                            <CalendarDays
                                size={40}
                                className="mx-auto text-gray-300"
                            />
                            <h3 className="mt-3 font-semibold text-gray-700">
                                No attendance records found
                            </h3>
                            <p className="mt-1 text-sm text-gray-400">
                                Record attendance or change your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left">
                                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                                    <tr>
                                        <th className="px-5 py-4">Member</th>
                                        <th className="px-5 py-4">Date</th>
                                        <th className="px-5 py-4">Check In</th>
                                        <th className="px-5 py-4">Check Out</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredAttendance.map(record => (
                                        <tr
                                            key={record._id}
                                            className="transition hover:bg-gray-50"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-gray-800">
                                                    {record.member?.name || "Unknown"}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-400">
                                                    {record.member?.email || "-"}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {formatDate(record.attendanceDate)}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                <span className="flex items-center gap-2">
                                                    <Clock size={15} />
                                                    {formatTime(record.checkIn)}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-600">
                                                {formatTime(record.checkOut)}
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        record.status === "PRESENT"
                                                            ? "bg-green-50 text-green-700"
                                                            : "bg-yellow-50 text-yellow-700"
                                                    }`}
                                                >
                                                    {record.status}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => {
                                                            setSelected(record);
                                                            setModal("view");
                                                        }}
                                                        title="View"
                                                        className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-100"
                                                    >
                                                        <Eye size={16} />
                                                    </button>

                                                    {!record.checkOut && (
                                                        <button
                                                            onClick={() => openCheckoutModal(record)}
                                                            title="Check out"
                                                            className="rounded-lg border border-blue-100 p-2 text-blue-600 hover:bg-blue-50"
                                                        >
                                                            <LogOut size={16} />
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => void handleDelete(record)}
                                                        title="Delete"
                                                        className="rounded-lg border border-red-100 p-2 text-red-500 hover:bg-red-50"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
                    <div className="my-8 w-full max-w-xl rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">
                                    {modal === "create"
                                        ? "Record Attendance"
                                        : modal === "checkout"
                                            ? "Member Check-out"
                                            : "Attendance Details"}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    FitZone Attendance Management
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {modal === "create" && (
                            <form onSubmit={handleCreate} className="space-y-5 p-6">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Select Member *
                                    </label>
                                    <select
                                        required
                                        value={memberId}
                                        onChange={event => setMemberId(event.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                    >
                                        <option value="">Choose a member</option>
                                        {members.map(member => (
                                            <option key={member._id} value={member._id}>
                                                {member.name} - {member.email}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Check-in Date & Time
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={checkIn}
                                        onChange={event => setCheckIn(event.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Attendance Status
                                    </label>
                                    <select
                                        value={status}
                                        onChange={event => setStatus(event.target.value as AttendanceStatus)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                    >
                                        <option value="PRESENT">Present</option>
                                        <option value="LATE">Late</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Notes
                                    </label>
                                    <textarea
                                        rows={3}
                                        value={notes}
                                        onChange={event => setNotes(event.target.value)}
                                        placeholder="Optional notes..."
                                        className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Record Attendance"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modal === "checkout" && selected && (
                            <form onSubmit={handleCheckout} className="space-y-5 p-6">
                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-sm font-semibold text-gray-800">
                                        {selected.member?.name}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Check-in: {formatTime(selected.checkIn)}
                                    </p>
                                </div>

                                <div>
                                    <label className="mb-2 block text-sm font-medium text-gray-700">
                                        Check-out Date & Time *
                                    </label>
                                    <input
                                        type="datetime-local"
                                        required
                                        value={checkOut}
                                        onChange={event => setCheckOut(event.target.value)}
                                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange-400"
                                    />
                                </div>

                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {saving ? "Saving..." : "Confirm Check-out"}
                                    </button>
                                </div>
                            </form>
                        )}

                        {modal === "view" && selected && (
                            <div className="space-y-4 p-6">
                                <div className="rounded-xl bg-gray-50 p-4">
                                    <p className="text-xs font-medium uppercase text-gray-400">
                                        Member
                                    </p>
                                    <p className="mt-1 font-semibold text-gray-900">
                                        {selected.member?.name || "Unknown"}
                                    </p>
                                    <p className="mt-1 text-sm text-gray-500">
                                        {selected.member?.email || "-"}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="rounded-xl border border-gray-100 p-4">
                                        <p className="text-xs text-gray-400">Date</p>
                                        <p className="mt-2 text-sm font-semibold text-gray-800">
                                            {formatDate(selected.attendanceDate)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 p-4">
                                        <p className="text-xs text-gray-400">Status</p>
                                        <p className="mt-2 text-sm font-semibold text-gray-800">
                                            {selected.status}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 p-4">
                                        <p className="text-xs text-gray-400">Check In</p>
                                        <p className="mt-2 text-sm font-semibold text-gray-800">
                                            {formatTime(selected.checkIn)}
                                        </p>
                                    </div>
                                    <div className="rounded-xl border border-gray-100 p-4">
                                        <p className="text-xs text-gray-400">Check Out</p>
                                        <p className="mt-2 text-sm font-semibold text-gray-800">
                                            {formatTime(selected.checkOut)}
                                        </p>
                                    </div>
                                </div>

                                <div className="rounded-xl border border-gray-100 p-4">
                                    <p className="text-xs text-gray-400">Notes</p>
                                    <p className="mt-2 text-sm text-gray-700">
                                        {selected.notes || "No notes added"}
                                    </p>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={closeModal}
                                        className="rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
