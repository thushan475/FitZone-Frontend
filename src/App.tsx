
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

import DashboardPage from "./pages/DashboardPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MemberDashboardPage from "./pages/MemberDashboardPage";

import MemberManagementPage from "./pages/MemberManagementPage";
import TrainerManagementPage from "./pages/TrainerManagementPage";
import WorkoutPlanManagementPage from "./pages/WorkoutPlanManagementPage";
import MembershipPlanManagementPage from "./pages/MembershipPlanManagementPage";
import AttendanceManagementPage from "./pages/AttendanceManagementPage";
import SubscriptionManagementPage from "./pages/SubscriptionManagementPage";
import PaymentManagementPage from "./pages/PaymentManagementPage";

import MemberWorkoutPlansPage from "./pages/MemberWorkoutPlansPage";
import MySubscriptionPage from "./pages/MySubscriptionPage";
import MyAttendancePage from "./pages/MyAttendancePage";
import MyPaymentsPage from "./pages/MyPaymentsPage";
import MyProgressPage from "./pages/MyProgressPage";

import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/login" replace />} />

                <Route path="/login" element={<LoginPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <DashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/members"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <MemberManagementPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/trainers"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <TrainerManagementPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/workout-plans"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <WorkoutPlanManagementPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/membership-plans"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <MembershipPlanManagementPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <AttendanceManagementPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/subscriptions"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <SubscriptionManagementPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin/payments"
                    element={
                        <ProtectedRoute allowedRoles={["ADMIN"]}>
                            <PaymentManagementPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/member/dashboard"
                    element={
                        <ProtectedRoute allowedRoles={["MEMBER"]}>
                            <MemberDashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/member/workout-plans"
                    element={
                        <ProtectedRoute allowedRoles={["MEMBER"]}>
                            <MemberWorkoutPlansPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/member/subscriptions"
                    element={
                        <ProtectedRoute allowedRoles={["MEMBER"]}>
                            <MySubscriptionPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/member/attendance"
                    element={
                        <ProtectedRoute allowedRoles={["MEMBER"]}>
                            <MyAttendancePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/member/payments"
                    element={
                        <ProtectedRoute allowedRoles={["MEMBER"]}>
                            <MyPaymentsPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/member/progress"
                    element={
                        <ProtectedRoute allowedRoles={["MEMBER"]}>
                            <MyProgressPage />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
