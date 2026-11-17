
import api from "./api";

export type WorkoutGoal =
    | "WEIGHT_LOSS"
    | "MUSCLE_GAIN"
    | "GENERAL_FITNESS"
    | "STRENGTH"
    | "FLEXIBILITY";

export interface WorkoutExercise {
    name: string;
    description?: string;
    sets: number;
    reps: number;
    durationMinutes?: number;
}

export interface WorkoutPlan {
    _id: string;
    title: string;
    description?: string;
    member: {
        _id: string;
        name: string;
        email: string;
        phone: string;
    };
    trainer: {
        _id: string;
        name: string;
        email: string;
        phone: string;
        specialization: string;
        experience?: number;
        qualifications?: string;
    };
    goal: WorkoutGoal;
    startDate: string;
    endDate: string;
    exercises: WorkoutExercise[];
    notes?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateWorkoutPlanInput {
    title: string;
    description?: string;
    memberId: string;
    trainerId: string;
    goal: WorkoutGoal;
    startDate: string;
    endDate: string;
    exercises: WorkoutExercise[];
    notes?: string;
}

export type UpdateWorkoutPlanInput = Partial<
    Omit<CreateWorkoutPlanInput, "memberId" | "trainerId">
> & {
    isActive?: boolean;
};

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export const getAllWorkoutPlans = async (): Promise<WorkoutPlan[]> => {
    const response = await api.get<ApiResponse<WorkoutPlan[]>>(
        "/workout-plans"
    );

    return response.data.data;
};

export const getWorkoutPlanById = async (
    id: string
): Promise<WorkoutPlan> => {
    const response = await api.get<ApiResponse<WorkoutPlan>>(
        `/workout-plans/${id}`
    );

    return response.data.data;
};

export const createWorkoutPlan = async (
    data: CreateWorkoutPlanInput
): Promise<WorkoutPlan> => {
    const response = await api.post<ApiResponse<WorkoutPlan>>(
        "/workout-plans",
        data
    );

    return response.data.data;
};

export const updateWorkoutPlan = async (
    id: string,
    data: UpdateWorkoutPlanInput
): Promise<WorkoutPlan> => {
    const response = await api.put<ApiResponse<WorkoutPlan>>(
        `/workout-plans/${id}`,
        data
    );

    return response.data.data;
};

export const deleteWorkoutPlan = async (
    id: string
): Promise<WorkoutPlan> => {
    const response = await api.delete<ApiResponse<WorkoutPlan>>(
        `/workout-plans/${id}`
    );

    return response.data.data;
};

export const getMyWorkoutPlans = async (): Promise<WorkoutPlan[]> => {
    const response = await api.get<ApiResponse<WorkoutPlan[]>>(
        "/workout-plans/my"
    );

    return response.data.data;
};