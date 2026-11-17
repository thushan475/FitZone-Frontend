import api from "./api";

export type PaymentMethod = "CASH" | "CARD" | "BANK_TRANSFER";
export type PaymentStatus = "PAID" | "PENDING" | "FAILED";

export interface PaymentMember {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface PaymentSubscription {
    _id: string;
    planName: string;
    planPrice: number;
    status: string;
}

export interface Payment {
    _id: string;
    member: string | PaymentMember;
    subscription: string | PaymentSubscription;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    paymentDate: string;
    referenceNumber?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreatePaymentInput {
    member: string;
    subscription: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    paymentDate?: string;
    referenceNumber?: string;
    notes?: string;
}

export type UpdatePaymentInput = Partial<CreatePaymentInput>;

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const getAllPayments = async (): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>("/payments");
    return response.data.data;
};

export const getPaymentById = async (id: string): Promise<Payment> => {
    const response = await api.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
};

export const createPayment = async (
    data: CreatePaymentInput
): Promise<Payment> => {
    const response = await api.post<ApiResponse<Payment>>("/payments", data);
    return response.data.data;
};

export const updatePayment = async (
    id: string,
    data: UpdatePaymentInput
): Promise<Payment> => {
    const response = await api.put<ApiResponse<Payment>>(`/payments/${id}`, data);
    return response.data.data;
};

export const deletePayment = async (id: string): Promise<Payment> => {
    const response = await api.delete<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
};
