import api from "./api";
import type { Subscription } from "./subscription.service";
import type { Payment } from "./payment.service";

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

export const getMyPayments = async (): Promise<Payment[]> => {
    const response = await api.get<ApiResponse<Payment[]>>(
        "/member/payments"
    );
    return response.data.data;
};
