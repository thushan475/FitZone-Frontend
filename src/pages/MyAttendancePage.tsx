
import { useEffect, useMemo, useState } from "react";
import {
    CalendarDays,
    Clock,
    CheckCircle,
    AlertCircle,
    Search,
    RefreshCw
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import {
    getMyAttendance
} from "../services/member-portal.service";
import type {
    MemberAttendance
} from "../services/member-portal.service";

function MyAttendancePage() {
    const [attendance, setAttendance] = useState<MemberAttendance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("ALL");

    const loadAttendance = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await getMyAttendance();
            setAttendance(data);
        } catch {
            setError("Failed to load attendance records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAttendance();
    }, []);

    const filteredAttendance = useMemo(() => {
        return attendance.filter((item) => {
            const matchesSearch = new Date(item.attendanceDate)
                .toLocaleDateString()
                .toLowerCase()
                .includes(search.toLowerCase());

            const matchesStatus =
                statusFilter === "ALL" || item.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [attendance, search, statusFilter]);

    const totalVisits = attendance.length;

    const presentCount = attendance.filter(
        (item) => item.status === "PRESENT"
    ).length;

    const lateCount = attendance.filter(
        (item) => item.status === "LATE"
    ).length;

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const formatTime = (date?: string) => {
        if (!date) return "Not checked out";

        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (
        <DashboardLayout
            activeItem="My Attendance"
            subtitle="FITZONE / MY ATTENDANCE"
        >
            <div className="space-y-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Attendance History
                        </h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Track your gym visits and attendance records.
                        </p>
                    </div>

                    <button
                        onClick={loadAttendance}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                    >
                        <RefreshCw size={17} />
                        Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Total Visits</p>
                            <CalendarDays className="text-orange-400" size={22} />
                        </div>
                        <h2 className="mt-4 text-3xl font-bold text-white">
                            {totalVisits}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Present</p>
                            <CheckCircle className="text-green-400" size={22} />
                        </div>
                        <h2 className="mt-4 text-3xl font-bold text-white">
                            {presentCount}
                        </h2>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#22252e] p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Late</p>
                            <AlertCircle className="text-yellow-400" size={22} />
                        </div>
                        <h2 className="mt-4 text-3xl font-bold text-white">
                            {lateCount}
                        </h2>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#22252e] p-5">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div className="relative w-full md:max-w-sm">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                size={18}
                            />
                            <input
                                type="text"
                                placeholder="Search by date..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full rounded-xl border border-white/10 bg-[#17191f] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-orange-500"
                            />
                        </div>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                        >
                            <option value="ALL">All Status</option>
                            <option value="PRESENT">Present</option>
                            <option value="LATE">Late</option>
                        </select>
                    </div>

                    {error && (
                        <div className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[700px] text-left">
                            <thead>
                                <tr className="border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-4">Date</th>
                                    <th className="px-4 py-4">Check In</th>
                                    <th className="px-4 py-4">Check Out</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4">Notes</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-12 text-center text-gray-400"
                                        >
                                            Loading attendance...
                                        </td>
                                    </tr>
                                ) : filteredAttendance.length === 0 ? (
                                    <tr>
                                        <td
                                            colSpan={5}
                                            className="py-12 text-center text-gray-400"
                                        >
                                            No attendance records found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAttendance.map((item) => (
                                        <tr
                                            key={item._id}
                                            className="border-b border-white/5 transition hover:bg-white/[0.02]"
                                        >
                                            <td className="px-4 py-5 text-sm font-medium text-white">
                                                {formatDate(item.attendanceDate)}
                                            </td>

                                            <td className="px-4 py-5 text-sm text-gray-300">
                                                <span className="flex items-center gap-2">
                                                    <Clock size={15} className="text-green-400" />
                                                    {formatTime(item.checkIn)}
                                                </span>
                                            </td>

                                            <td className="px-4 py-5 text-sm text-gray-300">
                                                {formatTime(item.checkOut)}
                                            </td>

                                            <td className="px-4 py-5">
                                                <span
                                                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                                        item.status === "PRESENT"
                                                            ? "bg-green-500/10 text-green-400"
                                                            : "bg-yellow-500/10 text-yellow-400"
                                                    }`}
                                                >
                                                    {item.status}
                                                </span>
                                            </td>

                                            <td className="px-4 py-5 text-sm text-gray-400">
                                                {item.notes || "-"}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {!loading && filteredAttendance.length > 0 && (
                        <p className="mt-4 text-xs text-gray-500">
                            Showing {filteredAttendance.length} of {totalVisits} records
                        </p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}

export default MyAttendancePage;
