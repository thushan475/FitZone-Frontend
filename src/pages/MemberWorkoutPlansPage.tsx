
import { useEffect, useState } from "react";
import {
    Dumbbell,
    CalendarDays,
    Target,
    Clock,
    Activity,
    ClipboardList,
    AlertCircle
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import {
    getMyWorkoutPlans
} from "../services/workout-plan.service";
import type {
    WorkoutPlan,
    WorkoutGoal
} from "../services/workout-plan.service";

function MemberWorkoutPlansPage() {
    const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadWorkoutPlans = async () => {
            try {
                setLoading(true);
                setError("");

                const data = await getMyWorkoutPlans();
                setWorkoutPlans(data);
            } catch (err: any) {
                console.error(err);
                setError(
                    err.response?.data?.message ||
                    "Failed to load workout plans."
                );
            } finally {
                setLoading(false);
            }
        };

        void loadWorkoutPlans();
    }, []);

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString("en-LK", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const getGoalLabel = (goal: WorkoutGoal) => {
        const goals: Record<WorkoutGoal, string> = {
            WEIGHT_LOSS: "Weight Loss",
            MUSCLE_GAIN: "Muscle Gain",
            GENERAL_FITNESS: "General Fitness",
            STRENGTH: "Strength",
            FLEXIBILITY: "Flexibility"
        };

        return goals[goal] || goal;
    };

    const activeCount = workoutPlans.filter(
        (plan) => plan.isActive
    ).length;

    const totalExercises = workoutPlans.reduce(
        (total, plan) => total + plan.exercises.length,
        0
    );

    return (
        <DashboardLayout
            activeItem="My Workout Plans"
            subtitle="FITZONE / MY WORKOUT PLANS"
        >
            <div className="space-y-7">
                <div>
                    <h2 className="text-2xl font-bold">
                        My Workout Plans
                    </h2>
                    <p className="mt-1 text-sm text-gray-400">
                        View your personalized workout plans assigned by trainers.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">
                                Total Plans
                            </p>
                            <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
                                <ClipboardList size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">
                            {workoutPlans.length}
                        </h3>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">
                                Active Plans
                            </p>
                            <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                                <Activity size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">
                            {activeCount}
                        </h3>
                    </div>

                    <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">
                                Total Exercises
                            </p>
                            <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                                <Dumbbell size={20} />
                            </div>
                        </div>
                        <h3 className="mt-4 text-2xl font-bold">
                            {totalExercises}
                        </h3>
                    </div>
                </div>

                {error && (
                    <div className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
                        <AlertCircle size={20} />
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="rounded-2xl border border-white/5 bg-[#20232c] py-16 text-center">
                        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-orange-500/20 border-t-orange-500" />
                        <p className="mt-4 text-sm text-gray-400">
                            Loading your workout plans...
                        </p>
                    </div>
                ) : workoutPlans.length === 0 ? (
                    <div className="rounded-2xl border border-white/5 bg-[#20232c] px-6 py-16 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-400">
                            <Dumbbell size={30} />
                        </div>
                        <h3 className="mt-5 text-lg font-bold">
                            No Workout Plans Yet
                        </h3>
                        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-400">
                            Your trainer has not assigned any workout plans yet.
                            Your plans will appear here once they are assigned.
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-5 xl:grid-cols-2">
                        {workoutPlans.map((plan) => (
                            <div
                                key={plan._id}
                                className="overflow-hidden rounded-2xl border border-white/5 bg-[#20232c]"
                            >
                                <div className="border-b border-white/5 p-5">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                        <div>
                                            <h3 className="text-lg font-bold">
                                                {plan.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-400">
                                                {plan.trainer?.name || "Trainer"}
                                            </p>
                                        </div>

                                        <span
                                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                                                plan.isActive
                                                    ? "bg-green-500/10 text-green-400"
                                                    : "bg-gray-500/10 text-gray-400"
                                            }`}
                                        >
                                            {plan.isActive ? "ACTIVE" : "INACTIVE"}
                                        </span>
                                    </div>

                                    {plan.description && (
                                        <p className="mt-4 text-sm leading-6 text-gray-400">
                                            {plan.description}
                                        </p>
                                    )}

                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <span className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-400">
                                            <Target size={15} />
                                            {getGoalLabel(plan.goal)}
                                        </span>

                                        <span className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-xs text-gray-300">
                                            <Dumbbell size={15} />
                                            {plan.exercises.length} Exercises
                                        </span>
                                    </div>
                                </div>

                                <div className="grid gap-3 p-5 sm:grid-cols-2">
                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <CalendarDays size={15} />
                                            Start Date
                                        </div>
                                        <p className="mt-2 text-sm font-semibold">
                                            {formatDate(plan.startDate)}
                                        </p>
                                    </div>

                                    <div className="rounded-xl bg-[#17191f] p-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <CalendarDays size={15} />
                                            End Date
                                        </div>
                                        <p className="mt-2 text-sm font-semibold">
                                            {formatDate(plan.endDate)}
                                        </p>
                                    </div>
                                </div>

                                <div className="px-5 pb-5">
                                    <div className="mb-3 flex items-center justify-between">
                                        <h4 className="font-semibold">
                                            Exercises
                                        </h4>
                                        <span className="text-xs text-gray-500">
                                            {plan.exercises.length} items
                                        </span>
                                    </div>

                                    {plan.exercises.length === 0 ? (
                                        <p className="rounded-xl bg-[#17191f] p-4 text-sm text-gray-500">
                                            No exercises added to this plan.
                                        </p>
                                    ) : (
                                        <div className="space-y-3">
                                            {plan.exercises.map((exercise, index) => (
                                                <div
                                                    key={`${plan._id}-${index}`}
                                                    className="rounded-xl bg-[#17191f] p-4"
                                                >
                                                    <div className="flex items-start justify-between gap-3">
                                                        <div>
                                                            <p className="text-sm font-semibold">
                                                                {index + 1}. {exercise.name}
                                                            </p>

                                                            {exercise.description && (
                                                                <p className="mt-1 text-xs leading-5 text-gray-500">
                                                                    {exercise.description}
                                                                </p>
                                                            )}
                                                        </div>

                                                        <Dumbbell
                                                            size={17}
                                                            className="shrink-0 text-orange-400"
                                                        />
                                                    </div>

                                                    <div className="mt-3 flex flex-wrap gap-3 text-xs text-gray-400">
                                                        <span>
                                                            Sets: {exercise.sets}
                                                        </span>
                                                        <span>
                                                            Reps: {exercise.reps}
                                                        </span>

                                                        {exercise.durationMinutes !== undefined && (
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={13} />
                                                                {exercise.durationMinutes} min
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {plan.notes && (
                                    <div className="border-t border-white/5 px-5 py-4">
                                        <p className="text-xs font-semibold text-orange-400">
                                            Trainer Notes
                                        </p>
                                        <p className="mt-2 text-sm leading-6 text-gray-400">
                                            {plan.notes}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default MemberWorkoutPlansPage;
