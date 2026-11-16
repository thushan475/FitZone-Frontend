
import api from "./api";

export interface Trainer {
    _id: string;
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience?: number;
    qualifications?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateTrainerInput {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience?: number;
    qualifications?: string;
}

export interface UpdateTrainerInput {
    name: string;
    email: string;
    phone: string;
    specialization: string;
    experience?: number;
    qualifications?: string;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const getAllTrainers = async (
    status: "ACTIVE" | "INACTIVE" | "ALL" = "ALL"
): Promise<Trainer[]> => {
    const response = await api.get<ApiResponse<Trainer[]>>(
        `/trainers?status=${status}`
    );

    return response.data.data;
};

export const getTrainerById = async (id: string): Promise<Trainer> => {
    const response = await api.get<ApiResponse<Trainer>>(`/trainers/${id}`);

    return response.data.data;
};

export const createTrainer = async (
    data: CreateTrainerInput
): Promise<Trainer> => {
    const response = await api.post<ApiResponse<Trainer>>("/trainers", data);

    return response.data.data;
};

export const updateTrainer = async (
    id: string,
    data: UpdateTrainerInput
): Promise<Trainer> => {
    const response = await api.put<ApiResponse<Trainer>>(
        `/trainers/${id}`,
        data
    );

    return response.data.data;
};

export const deactivateTrainer = async (id: string): Promise<Trainer> => {
    const response = await api.delete<ApiResponse<Trainer>>(`/trainers/${id}`);

    return response.data.data;
};

export const activateTrainer = async (id: string): Promise<Trainer> => {
    const response = await api.patch<ApiResponse<Trainer>>(
        `/trainers/${id}/activate`
    );

    return response.data.data;
};
