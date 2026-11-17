
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
    Activity,
    BarChart3,
    Bell,
    CalendarDays,
    CreditCard,
    Dumbbell,
    LayoutDashboard,
    LogOut,
    Menu,
    Settings,
    Sparkles,
    UserRound,
    Users,
    Wallet,
    X
} from "lucide-react";
import { logout } from "../../store/authSlice";
import type { RootState } from "../../store/store";

interface DashboardLayoutProps {
    children: React.ReactNode;
    activeItem: string;
    subtitle?: string;
}

interface NavigationItem {
    label: string;
    icon: React.ElementType;
}

function DashboardLayout({
    children,
    activeItem,
    subtitle = "FITZONE / DASHBOARD"
}: DashboardLayoutProps) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.auth.user);
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const isAdmin = user?.role === "ADMIN";

    const adminNavigation: NavigationItem[] = [
        { label: "Dashboard", icon: LayoutDashboard },
        { label: "Members", icon: Users },
        { label: "Trainers", icon: UserRound },
        { label: "Workout Plans", icon: Dumbbell },
        { label: "Membership Plans", icon: CreditCard },
        { label: "Attendance", icon: CalendarDays },
        { label: "Subscriptions", icon: CreditCard },
        { label: "Payments", icon: Wallet },
        { label: "Analytics", icon: BarChart3 },
        { label: "Settings", icon: Settings }
    ];

    const memberNavigation: NavigationItem[] = [
        { label: "Dashboard", icon: LayoutDashboard },
        { label: "My Workout Plans", icon: Dumbbell },
        { label: "My Subscription", icon: CreditCard },
        { label: "My Attendance", icon: CalendarDays },
        { label: "My Payments", icon: Wallet },
        { label: "My Progress", icon: Activity }
    ];

    const navigation = isAdmin ? adminNavigation : memberNavigation;

    const navigationRoutes: Record<string, string> = {
        Dashboard: isAdmin ? "/admin/dashboard" : "/member/dashboard",
        Members: "/admin/members",
        Trainers: "/admin/trainers",
        "Workout Plans": "/admin/workout-plans",
        "Membership Plans": "/admin/membership-plans",
        Attendance: "/admin/attendance",
        Subscriptions: "/admin/subscriptions",
        Payments: "/admin/payments",
        "My Workout Plans": "/member/workout-plans",
        "My Subscription": "/member/subscriptions",
        "My Payments": "/member/payments"
    };

    const availableItems = isAdmin
        ? [
            "Dashboard",
            "Members",
            "Trainers",
            "Workout Plans",
            "Membership Plans",
            "Attendance",
            "Subscriptions",
            "Payments"
        ]
        : [
            "Dashboard",
            "My Workout Plans",
            "My Subscription",
            "My Payments"
        ];

    const handleNavigation = (label: string) => {
        const route = navigationRoutes[label];

        if (route && availableItems.includes(label)) {
            navigate(route);
        }

        setSidebarOpen(false);
    };

    const handleLogout = () => {
        dispatch(logout());
        navigate("/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-[#17191f] text-white">
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col border-r border-white/5 bg-[#20232c] transition-transform duration-300 lg:translate-x-0 ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`}
            >
                <div className="flex h-20 items-center justify-between border-b border-white/5 px-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500">
                            <Dumbbell size={23} className="text-white" />
                        </div>

                        <div>
                            <h1 className="text-xl font-extrabold tracking-wide">
                                FIT<span className="text-orange-500">ZONE</span>
                            </h1>
                            <p className="text-[10px] tracking-[3px] text-gray-500">
                                FITNESS MANAGEMENT
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="rounded-lg p-2 text-gray-400 hover:bg-white/5 lg:hidden"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="px-5 pt-7">
                    <p className="mb-4 px-2 text-[10px] font-bold uppercase tracking-[2px] text-gray-500">
                        Main Menu
                    </p>

                    <nav className="space-y-2">
                        {navigation.map((item) => {
                            const Icon = item.icon;
                            const isActive = activeItem === item.label;
                            const available = availableItems.includes(item.label);

                            return (
                                <button
                                    key={item.label}
                                    onClick={() => handleNavigation(item.label)}
                                    disabled={!available}
                                    className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition ${
                                        isActive
                                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                                            : available
                                                ? "text-gray-400 hover:bg-white/5 hover:text-white"
                                                : "cursor-not-allowed text-gray-600"
                                    }`}
                                >
                                    <span className="flex items-center gap-3">
                                        <Icon size={19} />
                                        {item.label}
                                    </span>

                                    {!available && (
                                        <span className="rounded-md bg-white/5 px-2 py-1 text-[9px] font-semibold text-gray-500">
                                            Soon
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                <div className="mt-auto p-5">
                    <div className="mb-4 rounded-2xl border border-orange-500/10 bg-orange-500/5 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <Sparkles size={17} className="text-orange-400" />
                            <p className="text-xs font-bold text-orange-400">
                                FITZONE FITNESS
                            </p>
                        </div>

                        <p className="text-xs leading-5 text-gray-400">
                            Build your strength. Improve your lifestyle.
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-gray-400 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                        <LogOut size={19} />
                        Logout
                    </button>
                </div>
            </aside>

            <div className="min-h-screen lg:ml-[260px]">
                <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/5 bg-[#17191f]/95 px-5 backdrop-blur-xl md:px-8">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="rounded-lg p-2 text-gray-400 hover:bg-white/5 lg:hidden"
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <p className="text-[10px] font-bold tracking-[2px] text-orange-500">
                                {subtitle}
                            </p>
                            <h2 className="mt-1 text-lg font-bold md:text-xl">
                                {activeItem}
                            </h2>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="relative rounded-xl border border-white/5 bg-[#22252e] p-3 text-gray-400 transition hover:text-orange-400">
                            <Bell size={19} />
                            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
                        </button>

                        <div className="hidden items-center gap-3 border-l border-white/10 pl-4 sm:flex">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-500/15 font-bold text-orange-400">
                                {user?.name?.charAt(0).toUpperCase() || "U"}
                            </div>

                            <div>
                                <p className="max-w-[130px] truncate text-sm font-semibold">
                                    {user?.name || "User"}
                                </p>
                                <p className="text-[11px] text-gray-500">
                                    {isAdmin ? "Administrator" : "Gym Member"}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="p-5 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
