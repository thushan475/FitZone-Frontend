
import { useEffect, useMemo, useState } from "react";
import {
    Activity,
    CalendarDays,
    Check,
    ChevronDown,
    ClipboardList,
    Eye,
    Loader2,
    Pencil,
    Plus,
    Search,
    Trash2,
    Users,
    X
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import {
    createWorkoutPlan,
    deleteWorkoutPlan,
    getAllWorkoutPlans,
    updateWorkoutPlan
} from "../services/workout-plan.service";
import type {
    WorkoutPlan,
    WorkoutGoal,
    WorkoutExercise,
    CreateWorkoutPlanInput
} from "../services/workout-plan.service";
import { getAllMembers } from "../services/member.service";
import type { Member } from "../services/member.service";
import { getAllTrainers } from "../services/trainer.service";
import type { Trainer } from "../services/trainer.service";

type FilterStatus = "ALL" | "ACTIVE" | "INACTIVE";
type ModalMode = "CREATE" | "EDIT" | "VIEW";

const goals: { value: WorkoutGoal; label: string }[] = [
    { value: "WEIGHT_LOSS", label: "Weight Loss" },
    { value: "MUSCLE_GAIN", label: "Muscle Gain" },
    { value: "GENERAL_FITNESS", label: "General Fitness" },
    { value: "STRENGTH", label: "Strength" },
    { value: "FLEXIBILITY", label: "Flexibility" }
];

const emptyExercise: WorkoutExercise = {
    name: "",
    description: "",
    sets: 3,
    reps: 12,
    durationMinutes: undefined
};

const initialForm: CreateWorkoutPlanInput = {
    title: "",
    description: "",
    memberId: "",
    trainerId: "",
    goal: "GENERAL_FITNESS",
    startDate: "",
    endDate: "",
    exercises: [{ ...emptyExercise }],
    notes: ""
};

function WorkoutPlanManagementPage() {
    const [plans, setPlans] = useState<WorkoutPlan[]>([]);
    const [members, setMembers] = useState<Member[]>([]);
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<FilterStatus>("ALL");
    const [modal, setModal] = useState<ModalMode | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null);
    const [form, setForm] = useState<CreateWorkoutPlanInput>(initialForm);

    const loadData = async () => {
        setLoading(true);
        setError("");

        try {
            const [planData, memberData, trainerData] = await Promise.all([
                getAllWorkoutPlans(),
                getAllMembers("ACTIVE"),
                getAllTrainers("ACTIVE")
            ]);

            setPlans(planData);
            setMembers(memberData);
            setTrainers(trainerData);
        } catch {
            setError("Unable to load workout plans. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadData();
    }, []);

    const filteredPlans = useMemo(() => {
        return plans.filter((plan) => {
            const matchesStatus =
                filter === "ALL" ||
                (filter === "ACTIVE" && plan.isActive) ||
                (filter === "INACTIVE" && !plan.isActive);

            const searchValue = search.toLowerCase();

            const matchesSearch =
                plan.title.toLowerCase().includes(searchValue) ||
                plan.member?.name?.toLowerCase().includes(searchValue) ||
                plan.trainer?.name?.toLowerCase().includes(searchValue) ||
                plan.goal.toLowerCase().includes(searchValue);

            return matchesStatus && matchesSearch;
        });
    }, [plans, filter, search]);

    const activeCount = plans.filter((plan) => plan.isActive).length;
    const inactiveCount = plans.length - activeCount;

    const openCreate = () => {
        setSelectedPlan(null);
        setForm({
            ...initialForm,
            exercises: [{ ...emptyExercise }]
        });
        setError("");
        setSuccess("");
        setModal("CREATE");
    };

    const openEdit = (plan: WorkoutPlan) => {
        setSelectedPlan(plan);
        setForm({
            title: plan.title,
            description: plan.description || "",
            memberId: plan.member?._id || "",
            trainerId: plan.trainer?._id || "",
            goal: plan.goal,
            startDate: plan.startDate.slice(0, 10),
            endDate: plan.endDate.slice(0, 10),
            exercises: plan.exercises.map((exercise) => ({ ...exercise })),
            notes: plan.notes || ""
        });
        setError("");
        setSuccess("");
        setModal("EDIT");
    };

    const openView = (plan: WorkoutPlan) => {
        setSelectedPlan(plan);
        setError("");
        setModal("VIEW");
    };

    const closeModal = () => {
        if (saving) return;
        setModal(null);
        setSelectedPlan(null);
        setError("");
    };

    const updateForm = (
        field: keyof CreateWorkoutPlanInput,
        value: string
    ) => {
        setForm((previous) => ({
            ...previous,
            [field]: value
        }));
    };

    const updateExercise = (
        index: number,
        field: keyof WorkoutExercise,
        value: string | number
    ) => {
        setForm((previous) => ({
            ...previous,
            exercises: previous.exercises.map((exercise, currentIndex) =>
                currentIndex === index
                    ? { ...exercise, [field]: value }
                    : exercise
            )
        }));
    };

    const addExercise = () => {
        setForm((previous) => ({
            ...previous,
            exercises: [...previous.exercises, { ...emptyExercise }]
        }));
    };

    const removeExercise = (index: number) => {
        setForm((previous) => ({
            ...previous,
            exercises: previous.exercises.filter(
                (_, currentIndex) => currentIndex !== index
            )
        }));
    };

    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        if (!form.title.trim()) {
            setError("Workout plan title is required.");
            return;
        }

        if (!form.memberId || !form.trainerId) {
            setError("Please select a member and a trainer.");
            return;
        }

        if (!form.startDate || !form.endDate) {
            setError("Please select both start and end dates.");
            return;
        }

        if (new Date(form.endDate) <= new Date(form.startDate)) {
            setError("End date must be after start date.");
            return;
        }

        if (
            form.exercises.length === 0 ||
            form.exercises.some(
                (exercise) =>
                    !exercise.name.trim() ||
                    !Number.isInteger(Number(exercise.sets)) ||
                    Number(exercise.sets) < 1 ||
                    !Number.isInteger(Number(exercise.reps)) ||
                    Number(exercise.reps) < 1
            )
        ) {
            setError("Add at least one valid exercise with sets and reps.");
            return;
        }

        const payload: CreateWorkoutPlanInput = {
            ...form,
            title: form.title.trim(),
            description: form.description?.trim(),
            notes: form.notes?.trim(),
            exercises: form.exercises.map((exercise) => ({
                ...exercise,
                name: exercise.name.trim(),
                sets: Number(exercise.sets),
                reps: Number(exercise.reps),
                durationMinutes:
                    exercise.durationMinutes === undefined ||
                    exercise.durationMinutes === null ||
                    Number(exercise.durationMinutes) === 0
                        ? undefined
                        : Number(exercise.durationMinutes)
            }))
        };

        setSaving(true);

        try {
            if (modal === "CREATE") {
                await createWorkoutPlan(payload);
                setSuccess("Workout plan created successfully.");
            } else if (modal === "EDIT" && selectedPlan) {
                await updateWorkoutPlan(selectedPlan._id, {
                    title: payload.title,
                    description: payload.description,
                    goal: payload.goal,
                    startDate: payload.startDate,
                    endDate: payload.endDate,
                    exercises: payload.exercises,
                    notes: payload.notes,
                    isActive: selectedPlan.isActive
                });
                setSuccess("Workout plan updated successfully.");
            }

            setModal(null);
            setSelectedPlan(null);
            await loadData();
        } catch (requestError: unknown) {
            const message =
                requestError &&
                typeof requestError === "object" &&
                "response" in requestError
                    ? (
                        requestError as {
                            response?: {
                                data?: { message?: string };
                            };
                        }
                    ).response?.data?.message
                    : undefined;

            setError(message || "Unable to save workout plan.");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (plan: WorkoutPlan) => {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${plan.title}"?`
        );

        if (!confirmed) return;

        setError("");
        setSuccess("");

        try {
            await deleteWorkoutPlan(plan._id);
            setSuccess("Workout plan deleted successfully.");
            await loadData();
        } catch {
            setError("Unable to delete workout plan.");
        }
    };

    const handleStatusChange = async (plan: WorkoutPlan) => {
        setError("");
        setSuccess("");

        try {
            await updateWorkoutPlan(plan._id, {
                isActive: !plan.isActive
            });

            setSuccess(
                plan.isActive
                    ? "Workout plan deactivated."
                    : "Workout plan activated."
            );

            await loadData();
        } catch {
            setError("Unable to update workout plan status.");
        }
    };

    const inputClass =
        "mt-2 w-full rounded-xl border border-white/10 bg-[#17191f] px-4 py-3 text-sm text-white outline-none transition focus:border-orange-500";

    const labelClass = "text-xs font-semibold text-gray-400";

    return (
        <DashboardLayout
            activeItem="Workout Plans"
            subtitle="FITZONE / WORKOUT PLAN MANAGEMENT"
        >
            <div className="space-y-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white">
                            Workout Plans
                        </h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Create and manage personalized member workout plans.
                        </p>
                    </div>

                    <button
                        onClick={openCreate}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:bg-orange-600"
                    >
                        <Plus size={18} />
                        Create Workout Plan
                    </button>
                </div>

                {error && !modal && (
                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                        {success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {[
                        {
                            label: "Total Plans",
                            value: plans.length,
                            icon: ClipboardList
                        },
                        {
                            label: "Active Plans",
                            value: activeCount,
                            icon: Activity
                        },
                        {
                            label: "Inactive Plans",
                            value: inactiveCount,
                            icon: CalendarDays
                        },
                        {
                            label: "Available Members",
                            value: members.length,
                            icon: Users
                        }
                    ].map((card) => {
                        const Icon = card.icon;

                        return (
                            <div
                                key={card.label}
                                className="rounded-2xl border border-white/5 bg-[#20232c] p-5"
                            >
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-400">
                                        {card.label}
                                    </p>
                                    <div className="rounded-xl bg-orange-500/10 p-3 text-orange-400">
                                        <Icon size={20} />
                                    </div>
                                </div>
                                <p className="mt-4 text-3xl font-extrabold text-white">
                                    {card.value}
                                </p>
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-2xl border border-white/5 bg-[#20232c] p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search plans, members or trainers..."
                                className="w-full rounded-xl border border-white/10 bg-[#17191f] py-3 pl-11 pr-4 text-sm text-white outline-none focus:border-orange-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(["ALL", "ACTIVE", "INACTIVE"] as FilterStatus[]).map(
                                (status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                                            filter === status
                                                ? "bg-orange-500 text-white"
                                                : "bg-[#17191f] text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        {status}
                                    </button>
                                )
                            )}
                        </div>
                    </div>

                    <div className="mt-6 overflow-x-auto">
                        <table className="w-full min-w-[900px] text-left">
                            <thead>
                                <tr className="border-b border-white/5 text-[11px] uppercase tracking-wider text-gray-500">
                                    <th className="px-4 py-4">Workout Plan</th>
                                    <th className="px-4 py-4">Member</th>
                                    <th className="px-4 py-4">Trainer</th>
                                    <th className="px-4 py-4">Goal</th>
                                    <th className="px-4 py-4">Duration</th>
                                    <th className="px-4 py-4">Status</th>
                                    <th className="px-4 py-4 text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="py-14 text-center text-gray-400">
                                            <Loader2 className="mx-auto mb-3 animate-spin" />
                                            Loading workout plans...
                                        </td>
                                    </tr>
                                ) : filteredPlans.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-14 text-center text-gray-500">
                                            No workout plans found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlans.map((plan) => (
                                        <tr key={plan._id} className="transition hover:bg-white/[0.02]">
                                            <td className="px-4 py-4">
                                                <p className="font-semibold text-white">
                                                    {plan.title}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {plan.exercises.length} exercises
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-gray-200">
                                                    {plan.member?.name || "Unknown"}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {plan.member?.email || ""}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <p className="text-sm text-gray-200">
                                                    {plan.trainer?.name || "Unknown"}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {plan.trainer?.specialization || ""}
                                                </p>
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className="rounded-lg bg-blue-500/10 px-3 py-1.5 text-xs font-semibold text-blue-400">
                                                    {goals.find((goal) => goal.value === plan.goal)?.label || plan.goal}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4 text-xs text-gray-400">
                                                {new Date(plan.startDate).toLocaleDateString()} -{" "}
                                                {new Date(plan.endDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                                                    plan.isActive
                                                        ? "bg-green-500/10 text-green-400"
                                                        : "bg-red-500/10 text-red-400"
                                                }`}>
                                                    {plan.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        title="View"
                                                        onClick={() => openView(plan)}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400"
                                                    >
                                                        <Eye size={17} />
                                                    </button>
                                                    <button
                                                        title="Edit"
                                                        onClick={() => openEdit(plan)}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-orange-500/10 hover:text-orange-400"
                                                    >
                                                        <Pencil size={17} />
                                                    </button>
                                                    <button
                                                        title={plan.isActive ? "Deactivate" : "Activate"}
                                                        onClick={() => void handleStatusChange(plan)}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-green-500/10 hover:text-green-400"
                                                    >
                                                        {plan.isActive ? <X size={17} /> : <Check size={17} />}
                                                    </button>
                                                    <button
                                                        title="Delete"
                                                        onClick={() => void handleDelete(plan)}
                                                        className="rounded-lg p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                                                    >
                                                        <Trash2 size={17} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm">
                    <div className="my-auto max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-white/10 bg-[#20232c] shadow-2xl">
                        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-white/5 bg-[#20232c] px-6 py-5">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    {modal === "CREATE"
                                        ? "Create Workout Plan"
                                        : modal === "EDIT"
                                            ? "Edit Workout Plan"
                                            : "Workout Plan Details"}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    FITZONE / WORKOUT PLAN
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="rounded-lg p-2 text-gray-400 hover:bg-white/5 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {modal === "VIEW" && selectedPlan ? (
                            <div className="space-y-6 p-6">
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className={labelClass}>Plan Title</p>
                                        <p className="mt-2 font-semibold text-white">{selectedPlan.title}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>Goal</p>
                                        <p className="mt-2 font-semibold text-white">
                                            {goals.find((goal) => goal.value === selectedPlan.goal)?.label}
                                        </p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>Member</p>
                                        <p className="mt-2 text-white">{selectedPlan.member?.name}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>Trainer</p>
                                        <p className="mt-2 text-white">{selectedPlan.trainer?.name}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>Start Date</p>
                                        <p className="mt-2 text-white">{new Date(selectedPlan.startDate).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className={labelClass}>End Date</p>
                                        <p className="mt-2 text-white">{new Date(selectedPlan.endDate).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className={labelClass}>Description</p>
                                    <p className="mt-2 text-sm text-gray-300">{selectedPlan.description || "No description"}</p>
                                </div>

                                <div>
                                    <p className="mb-3 text-sm font-bold text-white">Exercises</p>
                                    <div className="space-y-3">
                                        {selectedPlan.exercises.map((exercise, index) => (
                                            <div key={index} className="rounded-xl border border-white/5 bg-[#17191f] p-4">
                                                <p className="font-semibold text-white">{exercise.name}</p>
                                                <p className="mt-2 text-xs text-gray-400">
                                                    {exercise.sets} sets · {exercise.reps} reps
                                                    {exercise.durationMinutes ? ` · ${exercise.durationMinutes} minutes` : ""}
                                                </p>
                                                {exercise.description && (
                                                    <p className="mt-2 text-sm text-gray-500">{exercise.description}</p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <p className={labelClass}>Notes</p>
                                    <p className="mt-2 text-sm text-gray-300">{selectedPlan.notes || "No notes"}</p>
                                </div>

                                <button
                                    onClick={closeModal}
                                    className="w-full rounded-xl bg-orange-500 py-3 text-sm font-bold text-white hover:bg-orange-600"
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6 p-6">
                                {error && (
                                    <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                        {error}
                                    </div>
                                )}

                                <div className="grid gap-5 sm:grid-cols-2">
                                    <label className={labelClass}>
                                        Workout Plan Title *
                                        <input
                                            required
                                            value={form.title}
                                            onChange={(event) => updateForm("title", event.target.value)}
                                            className={inputClass}
                                            placeholder="e.g. Beginner Strength Program"
                                        />
                                    </label>

                                    <label className={labelClass}>
                                        Workout Goal *
                                        <span className="relative block">
                                            <select
                                                value={form.goal}
                                                onChange={(event) => updateForm("goal", event.target.value)}
                                                className={inputClass}
                                            >
                                                {goals.map((goal) => (
                                                    <option key={goal.value} value={goal.value}>
                                                        {goal.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                        </span>
                                    </label>

                                    {modal === "CREATE" && (
                                        <>
                                            <label className={labelClass}>
                                                Select Member *
                                                <span className="relative block">
                                                    <select
                                                        required
                                                        value={form.memberId}
                                                        onChange={(event) => updateForm("memberId", event.target.value)}
                                                        className={inputClass}
                                                    >
                                                        <option value="">Choose a member</option>
                                                        {members.map((member) => (
                                                            <option key={member._id} value={member._id}>
                                                                {member.name} ({member.email})
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                                </span>
                                            </label>

                                            <label className={labelClass}>
                                                Select Trainer *
                                                <span className="relative block">
                                                    <select
                                                        required
                                                        value={form.trainerId}
                                                        onChange={(event) => updateForm("trainerId", event.target.value)}
                                                        className={inputClass}
                                                    >
                                                        <option value="">Choose a trainer</option>
                                                        {trainers.map((trainer) => (
                                                            <option key={trainer._id} value={trainer._id}>
                                                                {trainer.name} - {trainer.specialization}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown size={16} className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                                                </span>
                                            </label>
                                        </>
                                    )}

                                    <label className={labelClass}>
                                        Start Date *
                                        <input
                                            type="date"
                                            required
                                            value={form.startDate}
                                            onChange={(event) => updateForm("startDate", event.target.value)}
                                            className={inputClass}
                                        />
                                    </label>

                                    <label className={labelClass}>
                                        End Date *
                                        <input
                                            type="date"
                                            required
                                            value={form.endDate}
                                            min={form.startDate || undefined}
                                            onChange={(event) => updateForm("endDate", event.target.value)}
                                            className={inputClass}
                                        />
                                    </label>
                                </div>

                                <label className={`${labelClass} block`}>
                                    Description
                                    <textarea
                                        rows={2}
                                        value={form.description}
                                        onChange={(event) => updateForm("description", event.target.value)}
                                        className={inputClass}
                                        placeholder="Describe the workout plan..."
                                    />
                                </label>

                                <div>
                                    <div className="mb-4 flex items-center justify-between">
                                        <div>
                                            <h3 className="text-sm font-bold text-white">Workout Exercises</h3>
                                            <p className="mt-1 text-xs text-gray-500">Add exercises with sets and repetitions.</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={addExercise}
                                            className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-bold text-orange-400 hover:bg-orange-500/20"
                                        >
                                            <Plus size={15} />
                                            Add Exercise
                                        </button>
                                    </div>

                                    <div className="space-y-4">
                                        {form.exercises.map((exercise, index) => (
                                            <div key={index} className="rounded-xl border border-white/10 bg-[#17191f] p-4">
                                                <div className="mb-4 flex items-center justify-between">
                                                    <p className="text-sm font-bold text-white">
                                                        Exercise {index + 1}
                                                    </p>
                                                    {form.exercises.length > 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeExercise(index)}
                                                            className="rounded-lg p-2 text-red-400 hover:bg-red-500/10"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <label className={labelClass}>
                                                        Exercise Name *
                                                        <input
                                                            required
                                                            value={exercise.name}
                                                            onChange={(event) => updateExercise(index, "name", event.target.value)}
                                                            className={inputClass}
                                                            placeholder="e.g. Push Ups"
                                                        />
                                                    </label>

                                                    <label className={labelClass}>
                                                        Description
                                                        <input
                                                            value={exercise.description || ""}
                                                            onChange={(event) => updateExercise(index, "description", event.target.value)}
                                                            className={inputClass}
                                                            placeholder="Exercise instructions"
                                                        />
                                                    </label>

                                                    <label className={labelClass}>
                                                        Sets *
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            required
                                                            value={exercise.sets}
                                                            onChange={(event) => updateExercise(index, "sets", Number(event.target.value))}
                                                            className={inputClass}
                                                        />
                                                    </label>

                                                    <label className={labelClass}>
                                                        Reps *
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            required
                                                            value={exercise.reps}
                                                            onChange={(event) => updateExercise(index, "reps", Number(event.target.value))}
                                                            className={inputClass}
                                                        />
                                                    </label>

                                                    <label className={labelClass}>
                                                        Duration (Minutes)
                                                        <input
                                                            type="number"
                                                            min="1"
                                                            value={exercise.durationMinutes ?? ""}
                                                            onChange={(event) => updateExercise(index, "durationMinutes", event.target.value === "" ? 0 : Number(event.target.value))}
                                                            className={inputClass}
                                                            placeholder="Optional"
                                                        />
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <label className={`${labelClass} block`}>
                                    Additional Notes
                                    <textarea
                                        rows={3}
                                        value={form.notes}
                                        onChange={(event) => updateForm("notes", event.target.value)}
                                        className={inputClass}
                                        placeholder="Additional instructions..."
                                    />
                                </label>

                                <div className="flex flex-col-reverse gap-3 border-t border-white/5 pt-5 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="rounded-xl border border-white/10 px-6 py-3 text-sm font-semibold text-gray-300 hover:bg-white/5 disabled:opacity-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-bold text-white hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {saving ? (
                                            <Loader2 size={17} className="animate-spin" />
                                        ) : (
                                            <Check size={17} />
                                        )}
                                        {saving
                                            ? "Saving..."
                                            : modal === "CREATE"
                                                ? "Create Workout Plan"
                                                : "Save Changes"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}

export default WorkoutPlanManagementPage;
