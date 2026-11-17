import { useEffect, useState } from "react";
import {
    Building2,
    Clock,
    UserRound,
    LockKeyhole,
    Save,
    Settings,
    CheckCircle2
} from "lucide-react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../store/store";
import { updateUser } from "../store/authSlice";
import type { User } from "../types/auth.types";
import api from "../services/api";
import DashboardLayout from "../components/dashboard/DashboardLayout";

interface GymSettings {
    gymName: string;
    email: string;
    phone: string;
    address: string;
    openingTime: string;
    closingTime: string;
    operatingDays: string[];
}

interface SettingsResponse {
    success: boolean;
    data: {
        gym: GymSettings;
        admin: User;
    };
}

const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday"
];

const emptyGym: GymSettings = {
    gymName: "",
    email: "",
    phone: "",
    address: "",
    openingTime: "06:00",
    closingTime: "22:00",
    operatingDays: []
};

const inputClass =
    "w-full rounded-xl border border-white/10 bg-[#25272e] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500";

const labelClass = "mb-2 block text-sm font-medium text-gray-300";

const SettingsPage = () => {
    const dispatch = useDispatch<AppDispatch>();

    const [gym, setGym] = useState<GymSettings>(emptyGym);
    const [admin, setAdmin] = useState({
        name: "",
        email: "",
        phone: ""
    });
    const [password, setPassword] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(true);
    const [gymSaving, setGymSaving] = useState(false);
    const [profileSaving, setProfileSaving] = useState(false);
    const [passwordSaving, setPasswordSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const getErrorMessage = (err: unknown, fallback: string) => {
        if (
            typeof err === "object" &&
            err !== null &&
            "response" in err
        ) {
            const responseError = err as {
                response?: { data?: { message?: string } };
            };

            return responseError.response?.data?.message || fallback;
        }

        return err instanceof Error ? err.message : fallback;
    };

    const loadSettings = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get<SettingsResponse>("/settings");

            setGym({
                ...emptyGym,
                ...response.data.data.gym
            });

            setAdmin({
                name: response.data.data.admin.name || "",
                email: response.data.data.admin.email || "",
                phone: response.data.data.admin.phone || ""
            });
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to load settings"));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSettings();
    }, []);

    const showSuccess = (message: string) => {
        setSuccess(message);
        setError("");
    };

    const handleGymSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setGymSaving(true);
            setError("");
            setSuccess("");

            await api.put("/settings/gym", {
                ...gym,
                gymName: gym.gymName.trim(),
                email: gym.email.trim(),
                phone: gym.phone.trim(),
                address: gym.address.trim()
            });

            showSuccess("Gym profile and operating hours updated successfully");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to update gym settings"));
        } finally {
            setGymSaving(false);
        }
    };

    const handleProfileSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            setProfileSaving(true);
            setError("");
            setSuccess("");

            const response = await api.put<{ data: User }>("/settings/profile", {
                name: admin.name.trim(),
                email: admin.email.trim(),
                phone: admin.phone.trim()
            });

            dispatch(updateUser(response.data.data));
            setAdmin({
                name: response.data.data.name,
                email: response.data.data.email,
                phone: response.data.data.phone
            });

            showSuccess("Admin profile updated successfully");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to update admin profile"));
        } finally {
            setProfileSaving(false);
        }
    };

    const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (password.newPassword !== password.confirmPassword) {
            setError("New password and confirmation do not match");
            setSuccess("");
            return;
        }

        if (password.newPassword.length < 8) {
            setError("New password must contain at least 8 characters");
            setSuccess("");
            return;
        }

        try {
            setPasswordSaving(true);
            setError("");
            setSuccess("");

            await api.put("/settings/change-password", {
                currentPassword: password.currentPassword,
                newPassword: password.newPassword
            });

            setPassword({
                currentPassword: "",
                newPassword: "",
                confirmPassword: ""
            });

            showSuccess("Password changed successfully");
        } catch (err: unknown) {
            setError(getErrorMessage(err, "Failed to change password"));
        } finally {
            setPasswordSaving(false);
        }
    };

    const toggleDay = (day: string) => {
        setGym((previous) => ({
            ...previous,
            operatingDays: previous.operatingDays.includes(day)
                ? previous.operatingDays.filter((item) => item !== day)
                : [...previous.operatingDays, day]
        }));
    };

    const sectionHeading = (icon: React.ReactNode, title: string, description: string) => (
        <div className="mb-6 flex items-start gap-3">
            <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
                {icon}
            </div>
            <div>
                <h2 className="text-lg font-bold text-white">{title}</h2>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
        </div>
    );

    if (loading) {
        return (
            <DashboardLayout activeItem="Settings" subtitle="FITZONE / SETTINGS">
                <div className="rounded-2xl border border-white/10 bg-[#17191e] p-12 text-center text-sm text-gray-400">
                    Loading settings...
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeItem="Settings" subtitle="FITZONE / SETTINGS">
            <div className="space-y-7">
                <div>
                    <p className="text-sm font-medium text-orange-500">
                        SYSTEM CONFIGURATION
                    </p>
                    <h1 className="mt-1 text-3xl font-bold text-white">
                        Settings
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                        Manage gym information, operating hours and administrator account.
                    </p>
                </div>

                {error && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
                        <CheckCircle2 size={18} />
                        {success}
                    </div>
                )}

                <form onSubmit={handleGymSubmit} className="rounded-2xl border border-white/10 bg-[#17191e] p-5 sm:p-7">
                    {sectionHeading(
                        <Building2 size={21} />,
                        "Gym Profile",
                        "Update your gym's basic contact information."
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Gym Name *</label>
                            <input
                                required
                                value={gym.gymName}
                                onChange={(event) => setGym({ ...gym, gymName: event.target.value })}
                                className={inputClass}
                                placeholder="FitZone Fitness Center"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Gym Email *</label>
                            <input
                                required
                                type="email"
                                value={gym.email}
                                onChange={(event) => setGym({ ...gym, email: event.target.value })}
                                className={inputClass}
                                placeholder="info@fitzone.com"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Phone Number *</label>
                            <input
                                required
                                value={gym.phone}
                                onChange={(event) => setGym({ ...gym, phone: event.target.value })}
                                className={inputClass}
                                placeholder="07XXXXXXXX"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Address *</label>
                            <input
                                required
                                value={gym.address}
                                onChange={(event) => setGym({ ...gym, address: event.target.value })}
                                className={inputClass}
                                placeholder="Gym address"
                            />
                        </div>
                    </div>

                    <div className="mb-6 mt-8 border-t border-white/10 pt-6">
                        {sectionHeading(
                            <Clock size={21} />,
                            "Operating Hours",
                            "Set the gym's opening hours and operating days."
                        )}

                        <div className="grid gap-5 sm:grid-cols-2">
                            <div>
                                <label className={labelClass}>Opening Time *</label>
                                <input
                                    required
                                    type="time"
                                    value={gym.openingTime}
                                    onChange={(event) => setGym({ ...gym, openingTime: event.target.value })}
                                    className={inputClass}
                                />
                            </div>

                            <div>
                                <label className={labelClass}>Closing Time *</label>
                                <input
                                    required
                                    type="time"
                                    value={gym.closingTime}
                                    onChange={(event) => setGym({ ...gym, closingTime: event.target.value })}
                                    className={inputClass}
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className={labelClass}>Operating Days *</label>
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                                {days.map((day) => (
                                    <label
                                        key={day}
                                        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 text-sm transition ${
                                            gym.operatingDays.includes(day)
                                                ? "border-orange-500/50 bg-orange-500/10 text-orange-400"
                                                : "border-white/10 bg-[#25272e] text-gray-400"
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={gym.operatingDays.includes(day)}
                                            onChange={() => toggleDay(day)}
                                            className="accent-orange-500"
                                        />
                                        {day}
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end border-t border-white/10 pt-5">
                        <button
                            type="submit"
                            disabled={gymSaving || gym.operatingDays.length === 0}
                            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <Save size={17} />
                            {gymSaving ? "Saving..." : "Save Gym Settings"}
                        </button>
                    </div>
                </form>

                <form onSubmit={handleProfileSubmit} className="rounded-2xl border border-white/10 bg-[#17191e] p-5 sm:p-7">
                    {sectionHeading(
                        <UserRound size={21} />,
                        "Admin Profile",
                        "Update the administrator's personal account information."
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                            <label className={labelClass}>Full Name *</label>
                            <input
                                required
                                value={admin.name}
                                onChange={(event) => setAdmin({ ...admin, name: event.target.value })}
                                className={inputClass}
                                placeholder="Admin name"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Email Address *</label>
                            <input
                                required
                                type="email"
                                value={admin.email}
                                onChange={(event) => setAdmin({ ...admin, email: event.target.value })}
                                className={inputClass}
                                placeholder="admin@example.com"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Phone Number *</label>
                            <input
                                required
                                value={admin.phone}
                                onChange={(event) => setAdmin({ ...admin, phone: event.target.value })}
                                className={inputClass}
                                placeholder="07XXXXXXXX"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end border-t border-white/10 pt-5">
                        <button
                            type="submit"
                            disabled={profileSaving}
                            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                        >
                            <Save size={17} />
                            {profileSaving ? "Saving..." : "Update Admin Profile"}
                        </button>
                    </div>
                </form>

                <form onSubmit={handlePasswordSubmit} className="rounded-2xl border border-white/10 bg-[#17191e] p-5 sm:p-7">
                    {sectionHeading(
                        <LockKeyhole size={21} />,
                        "Change Password",
                        "Change your administrator account password securely."
                    )}

                    <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label className={labelClass}>Current Password *</label>
                            <input
                                required
                                type="password"
                                value={password.currentPassword}
                                onChange={(event) => setPassword({ ...password, currentPassword: event.target.value })}
                                className={inputClass}
                                placeholder="Enter current password"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>New Password *</label>
                            <input
                                required
                                type="password"
                                minLength={8}
                                value={password.newPassword}
                                onChange={(event) => setPassword({ ...password, newPassword: event.target.value })}
                                className={inputClass}
                                placeholder="Minimum 8 characters"
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Confirm New Password *</label>
                            <input
                                required
                                type="password"
                                minLength={8}
                                value={password.confirmPassword}
                                onChange={(event) => setPassword({ ...password, confirmPassword: event.target.value })}
                                className={inputClass}
                                placeholder="Confirm new password"
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end border-t border-white/10 pt-5">
                        <button
                            type="submit"
                            disabled={passwordSaving}
                            className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 disabled:opacity-50"
                        >
                            <LockKeyhole size={17} />
                            {passwordSaving ? "Updating..." : "Change Password"}
                        </button>
                    </div>
                </form>

                <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#17191e] p-5">
                    <Settings className="text-orange-400" size={20} />
                    <p className="text-sm text-gray-400">
                        Settings changes are saved to the FitZone system database.
                    </p>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SettingsPage;
