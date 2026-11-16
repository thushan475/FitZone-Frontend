
import api from "./api";

export type AttendanceStatus = "PRESENT" | "LATE";

export interface AttendanceMember {
    _id: string;
    name: string;
    email: string;
    phone?: string;
}

export interface Attendance {
    _id: string;
    member: AttendanceMember;
    attendanceDate: string;
    checkIn: string;
    checkOut?: string;
    status: AttendanceStatus;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface CreateAttendanceInput {
    memberId: string;
    checkIn?: string;
    status?: AttendanceStatus;
    notes?: string;
}

export interface UpdateAttendanceInput {
    checkOut?: string;
    status?: AttendanceStatus;
    notes?: string;
}

export interface AttendanceFilters {
    memberId?: string;
    from?: string;
    to?: string;
    status?: AttendanceStatus;
}

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const getAllAttendance = async (
    filters: AttendanceFilters = {}
): Promise<Attendance[]> => {
    const response = await api.get<ApiResponse<Attendance[]>>(
        "/attendance",
        { params: filters }
    );

    return response.data.data;
};

export const getAttendanceById = async (
    id: string
): Promise<Attendance> => {
    const response = await api.get<ApiResponse<Attendance>>(
        `/attendance/${id}`
    );

    return response.data.data;
};

export const createAttendance = async (
    data: CreateAttendanceInput
): Promise<Attendance> => {
    const response = await api.post<ApiResponse<Attendance>>(
        "/attendance",
        data
    );

    return response.data.data;
};

export const updateAttendance = async (
    id: string,
    data: UpdateAttendanceInput
): Promise<Attendance> => {
    const response = await api.put<ApiResponse<Attendance>>(
        `/attendance/${id}`,
        data
    );

    return response.data.data;
};

export const deleteAttendance = async (
    id: string
): Promise<void> => {
    await api.delete(`/attendance/${id}`);
};
