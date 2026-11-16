
import api from "./api";

export interface MembershipPlan {
    _id: string;
    name: string;
    description?: string;
    durationDays: number;
    price: number;
    features: string[];
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateMembershipPlanInput {
    name: string;
    description?: string;
    durationDays: number;
    price: number;
    features: string[];
}

export type UpdateMembershipPlanInput = Partial<CreateMembershipPlanInput>;

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const getAllMembershipPlans = async (
    status: "ACTIVE" | "INACTIVE" | "ALL" = "ALL"
): Promise<MembershipPlan[]> => {
    const response = await api.get<ApiResponse<MembershipPlan[]>>(
        `/membership-plans?status=${status}`
    );

    return response.data.data;
};

export const getMembershipPlanById = async (
    id: string
): Promise<MembershipPlan> => {
    const response = await api.get<ApiResponse<MembershipPlan>>(
        `/membership-plans/${id}`
    );

    return response.data.data;
};

export const createMembershipPlan = async (
    data: CreateMembershipPlanInput
): Promise<MembershipPlan> => {
    const response = await api.post<ApiResponse<MembershipPlan>>(
        "/membership-plans",
        data
    );

    return response.data.data;
};

export const updateMembershipPlan = async (
    id: string,
    data: UpdateMembershipPlanInput
): Promise<MembershipPlan> => {
    const response = await api.put<ApiResponse<MembershipPlan>>(
        `/membership-plans/${id}`,
        data
    );

    return response.data.data;
};

export const deactivateMembershipPlan = async (
    id: string
): Promise<MembershipPlan> => {
    const response = await api.delete<ApiResponse<MembershipPlan>>(
        `/membership-plans/${id}`
    );

    return response.data.data;
};

export const activateMembershipPlan = async (
    id: string
): Promise<MembershipPlan> => {
    const response = await api.patch<ApiResponse<MembershipPlan>>(
        `/membership-plans/${id}/activate`
    );

    return response.data.data;
};
