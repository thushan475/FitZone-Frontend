
import api from "./api";

export interface Member {
    _id: string;
    name: string;
    email: string;
    phone: string;
    role: "MEMBER";
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateMemberInput {
    name: string;
    email: string;
    password: string;
    phone: string;
}

export interface UpdateMemberInput {
    name: string;
    email: string;
    phone: string;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const getAllMembers = async (
    status: "ACTIVE" | "INACTIVE" | "ALL" = "ALL"
): Promise<Member[]> => {
    const response = await api.get<ApiResponse<Member[]>>(
        `/members?status=${status}`
    );

    return response.data.data;
};

export const getMemberById = async (id: string): Promise<Member> => {
    const response = await api.get<ApiResponse<Member>>(`/members/${id}`);

    return response.data.data;
};

export const createMember = async (
    data: CreateMemberInput
): Promise<Member> => {
    const response = await api.post<ApiResponse<Member>>("/members", data);

    return response.data.data;
};

export const updateMember = async (
    id: string,
    data: UpdateMemberInput
): Promise<Member> => {
    const response = await api.put<ApiResponse<Member>>(
        `/members/${id}`,
        data
    );

    return response.data.data;
};

export const deactivateMember = async (id: string): Promise<Member> => {
    const response = await api.delete<ApiResponse<Member>>(`/members/${id}`);

    return response.data.data;
};

export const activateMember = async (id: string): Promise<Member> => {
    const response = await api.patch<ApiResponse<Member>>(
        `/members/${id}/activate`
    );

    return response.data.data;
};
