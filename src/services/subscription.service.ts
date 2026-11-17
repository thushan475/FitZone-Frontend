import api from "./api";

export type SubscriptionStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface SubscriptionMember {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface SubscriptionPlan {
    _id: string;
    name: string;
    durationDays: number;
    price: number;
}

export interface Subscription {
    _id: string;
    member: string | SubscriptionMember;
    plan: string | SubscriptionPlan;
    planName: string;
    planPrice: number;
    durationDays: number;
    startDate: string;
    endDate: string;
    amountPaid: number;
    status: SubscriptionStatus;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateSubscriptionInput {
    memberId: string;
    planId: string;
    startDate?: string;
    amountPaid?: number;
}

export interface UpdateSubscriptionInput {
    startDate?: string;
    amountPaid?: number;
    status?: SubscriptionStatus;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const getAllSubscriptions = async (): Promise<Subscription[]> => {
    const response = await api.get<ApiResponse<Subscription[]>>("/subscriptions");
    return response.data.data;
};

export const getSubscriptionById = async (id: string): Promise<Subscription> => {
    const response = await api.get<ApiResponse<Subscription>>(`/subscriptions/${id}`);
    return response.data.data;
};

export const createSubscription = async (
    data: CreateSubscriptionInput
): Promise<Subscription> => {
    const response = await api.post<ApiResponse<Subscription>>("/subscriptions", data);
    return response.data.data;
};

export const updateSubscription = async (
    id: string,
    data: UpdateSubscriptionInput
): Promise<Subscription> => {
    const response = await api.put<ApiResponse<Subscription>>(
        `/subscriptions/${id}`,
        data
    );
    return response.data.data;
};

export const renewSubscription = async (id: string): Promise<Subscription> => {
    const response = await api.patch<ApiResponse<Subscription>>(
        `/subscriptions/${id}/renew`
    );
    return response.data.data;
};

export const cancelSubscription = async (id: string): Promise<Subscription> => {
    const response = await api.delete<ApiResponse<Subscription>>(
        `/subscriptions/${id}`
    );
    return response.data.data;
};
