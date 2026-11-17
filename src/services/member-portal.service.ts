
import api from "./api";
import type { Subscription } from "./subscription.service";
import type { Payment } from "./payment.service";

export interface MemberAttendance {
    _id: string;
    member: string;
    attendanceDate: string;
    checkIn: string;
    checkOut?: string;
    status: "PRESENT" | "LATE";
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface MemberProgress {
    attendance: {
        totalVisits: number;
        visitsThisMonth: number;
    };
    workoutPlans: {
        total: number;
        currentlyActive: number;
        completed: number;
    };
    subscriptions: {
        activeCount: number;
        activeSubscriptions: {
            planName: string;
            startDate: string;
            endDate: string;
            status: string;
        }[];
    };
    payments: {
        totalPaid: number;
        paidTransactions: number;
    };
    generatedAt: string;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const getMySubscriptions = async (): Promise<Subscription[]> => {
    const response = await api.get<ApiResponse<Subscription[]>>(
        "/member/subscriptions"
    );
    return response.data.data;
};

export const getMyAttendance = async (): Promise<MemberAttendance[]> => {
    const response = await api.get<ApiResponse<MemberAttendance[]>>(
        "/member/attendance"
    );
    return response.data.data;
};

export const getMyPayments = async (): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>(
        "/member/payments"
    );
    return response.data.data;
};

export const getMyProgress = async (): Promise<MemberProgress> => {
    const response = await api.get<ApiResponse<MemberProgress>>(
        "/member/progress"
    );
    return response.data.data;
};
