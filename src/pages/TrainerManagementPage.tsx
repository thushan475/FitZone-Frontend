
import { useEffect, useMemo, useState } from "react";
import {
    Search,
    Plus,
    Pencil,
    Eye,
    UserCheck,
    UserX,
    X,
    Users,
    Dumbbell,
    Mail,
    Phone,
    Award,
    Briefcase
} from "lucide-react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import {
    activateTrainer,
    createTrainer,
    deactivateTrainer,
    getAllTrainers,
    updateTrainer,
    type Trainer,
    type CreateTrainerInput
} from "../services/trainer.service";

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";
type ModalMode = "ADD" | "EDIT" | "VIEW" | null;

const emptyForm: CreateTrainerInput = {
    name: "",
    email: "",
    phone: "",
    specialization: "",
    experience: 0,
    qualifications: ""
};

const TrainerManagementPage = () => {
    const [trainers, setTrainers] = useState<Trainer[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState<StatusFilter>("ALL");
    const [modal, setModal] = useState<ModalMode>(null);
    const [selectedTrainer, setSelectedTrainer] = useState<Trainer | null>(null);
    const [form, setForm] = useState<CreateTrainerInput>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const loadTrainers = async () => {
        try {
            setLoading(true);
            const data = await getAllTrainers(status);
            setTrainers(data);
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Failed to load trainers"
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadTrainers();
    }, [status]);

    const filteredTrainers = useMemo(() => {
        const value = search.toLowerCase().trim();

        return trainers.filter((trainer) =>
            [
                trainer.name,
                trainer.email,
                trainer.phone,
                trainer.specialization
            ].some((field) => field.toLowerCase().includes(value))
        );
    }, [trainers, search]);

    const activeCount = trainers.filter((trainer) => trainer.isActive).length;
    const inactiveCount = trainers.filter((trainer) => !trainer.isActive).length;

    const openAddModal = () => {
        setSelectedTrainer(null);
        setForm(emptyForm);
        setError("");
        setSuccess("");
        setModal("ADD");
    };

    const openEditModal = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setForm({
            name: trainer.name,
            email: trainer.email,
            phone: trainer.phone,
            specialization: trainer.specialization,
            experience: trainer.experience ?? 0,
            qualifications: trainer.qualifications ?? ""
        });
        setError("");
        setModal("EDIT");
    };

    const openViewModal = (trainer: Trainer) => {
        setSelectedTrainer(trainer);
        setModal("VIEW");
    };

    const closeModal = () => {
        if (saving) return;
        setModal(null);
        setSelectedTrainer(null);
        setError("");
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError("");
        setSuccess("");

        try {
            setSaving(true);

            const payload = {
                ...form,
                name: form.name.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                specialization: form.specialization.trim(),
                qualifications: form.qualifications?.trim()
            };

            if (modal === "ADD") {
                await createTrainer(payload);
                setSuccess("Trainer created successfully");
            } else if (modal === "EDIT" && selectedTrainer) {
                await updateTrainer(selectedTrainer._id, payload);
                setSuccess("Trainer updated successfully");
            }

            setModal(null);
            setSelectedTrainer(null);
            await loadTrainers();
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Something went wrong"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleStatusChange = async (trainer: Trainer) => {
        const action = trainer.isActive ? deactivateTrainer : activateTrainer;

        try {
            setError("");
            setSuccess("");
            await action(trainer._id);
            setSuccess(
                trainer.isActive
                    ? "Trainer deactivated successfully"
                    : "Trainer activated successfully"
            );
            await loadTrainers();
        } catch (err: unknown) {
            setError(
                err instanceof Error ? err.message : "Failed to update status"
            );
        }
    };

    return (
        <DashboardLayout
            activeItem="Trainers"
            subtitle="FITZONE / TRAINER MANAGEMENT"
        >
            <div className="space-y-7">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <p className="text-sm font-medium text-orange-500">
                            PEOPLE MANAGEMENT
                        </p>
                        <h1 className="mt-1 text-3xl font-bold text-white">
                            Trainers
                        </h1>
                        <p className="mt-2 text-sm text-gray-400">
                            Manage your gym trainers and their professional details.
                        </p>
                    </div>

                    <button
                        onClick={openAddModal}
                        className="flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                    >
                        <Plus size={18} />
                        Add Trainer
                    </button>
                </div>

                {error && !modal && (
                    <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                        {error}
                        <button
                            onClick={() => setError("")}
                            className="float-right"
                        >
                            <X size={17} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-sm text-green-400">
                        {success}
                    </div>
                )}

                <div className="grid gap-4 sm:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-[#17191e] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Total Trainers</p>
                            <Users className="text-orange-500" size={21} />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-white">
                            {trainers.length}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#17191e] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Active Trainers</p>
                            <UserCheck className="text-green-400" size={21} />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-white">
                            {activeCount}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-[#17191e] p-5">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-400">Inactive Trainers</p>
                            <UserX className="text-red-400" size={21} />
                        </div>
                        <p className="mt-3 text-3xl font-bold text-white">
                            {inactiveCount}
                        </p>
                    </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#17191e] p-4 sm:p-5">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                        <div className="relative w-full lg:max-w-md">
                            <Search
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                            />
                            <input
                                value={search}
                                onChange={(event) => setSearch(event.target.value)}
                                placeholder="Search trainers..."
                                className="w-full rounded-xl border border-white/10 bg-[#202228] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-500 focus:border-orange-500"
                            />
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {(["ALL", "ACTIVE", "INACTIVE"] as StatusFilter[]).map(
                                (item) => (
                                    <button
                                        key={item}
                                        onClick={() => setStatus(item)}
                                        className={`rounded-lg px-4 py-2.5 text-xs font-semibold transition ${
                                            status === item
                                                ? "bg-orange-500 text-white"
                                                : "bg-[#25272e] text-gray-400 hover:text-white"
                                        }`}
                                    >
                                        {item}
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#17191e]">
                    <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                        <div>
                            <h2 className="font-semibold text-white">
                                Trainer Directory
                            </h2>
                            <p className="mt-1 text-xs text-gray-500">
                                {filteredTrainers.length} trainers found
                            </p>
                        </div>
                        <Dumbbell className="text-orange-500" size={21} />
                    </div>

                    {loading ? (
                        <div className="p-12 text-center text-sm text-gray-400">
                            Loading trainers...
                        </div>
                    ) : filteredTrainers.length === 0 ? (
                        <div className="p-12 text-center">
                            <Users className="mx-auto text-gray-600" size={35} />
                            <p className="mt-3 font-medium text-white">
                                No trainers found
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                                Add a trainer or change your search/filter.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[850px] text-left">
                                <thead className="bg-[#202228] text-xs uppercase text-gray-500">
                                    <tr>
                                        <th className="px-5 py-4">Trainer</th>
                                        <th className="px-5 py-4">Contact</th>
                                        <th className="px-5 py-4">Specialization</th>
                                        <th className="px-5 py-4">Experience</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {filteredTrainers.map((trainer) => (
                                        <tr
                                            key={trainer._id}
                                            className="transition hover:bg-white/[0.02]"
                                        >
                                            <td className="px-5 py-4">
                                                <p className="font-medium text-white">
                                                    {trainer.name}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {trainer.qualifications || "No qualifications added"}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4">
                                                <p className="text-sm text-gray-300">
                                                    {trainer.email}
                                                </p>
                                                <p className="mt-1 text-xs text-gray-500">
                                                    {trainer.phone}
                                                </p>
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-300">
                                                {trainer.specialization}
                                            </td>
                                            <td className="px-5 py-4 text-sm text-gray-300">
                                                {trainer.experience ?? 0} years
                                            </td>
                                            <td className="px-5 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                                        trainer.isActive
                                                            ? "bg-green-500/10 text-green-400"
                                                            : "bg-red-500/10 text-red-400"
                                                    }`}
                                                >
                                                    {trainer.isActive ? "ACTIVE" : "INACTIVE"}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => openViewModal(trainer)}
                                                        title="View"
                                                        className="rounded-lg bg-[#292c33] p-2 text-gray-300 hover:text-white"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => openEditModal(trainer)}
                                                        title="Edit"
                                                        className="rounded-lg bg-[#292c33] p-2 text-blue-400 hover:text-blue-300"
                                                    >
                                                        <Pencil size={16} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusChange(trainer)}
                                                        title={trainer.isActive ? "Deactivate" : "Activate"}
                                                        className="rounded-lg bg-[#292c33] p-2 text-orange-400 hover:text-orange-300"
                                                    >
                                                        {trainer.isActive ? (
                                                            <UserX size={16} />
                                                        ) : (
                                                            <UserCheck size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
                    <div className="my-8 w-full max-w-2xl rounded-2xl border border-white/10 bg-[#191b20] shadow-2xl">
                        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
                            <div>
                                <h2 className="text-xl font-bold text-white">
                                    {modal === "ADD"
                                        ? "Add New Trainer"
                                        : modal === "EDIT"
                                            ? "Edit Trainer"
                                            : "Trainer Details"}
                                </h2>
                                <p className="mt-1 text-xs text-gray-500">
                                    {modal === "VIEW"
                                        ? "Professional trainer information"
                                        : "Enter the trainer information below"}
                                </p>
                            </div>
                            <button
                                onClick={closeModal}
                                className="rounded-lg bg-[#292c33] p-2 text-gray-400 hover:text-white"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {modal === "VIEW" && selectedTrainer ? (
                            <div className="grid gap-5 p-6 sm:grid-cols-2">
                                {[
                                    { label: "Full Name", value: selectedTrainer.name, icon: Users },
                                    { label: "Email", value: selectedTrainer.email, icon: Mail },
                                    { label: "Phone", value: selectedTrainer.phone, icon: Phone },
                                    { label: "Specialization", value: selectedTrainer.specialization, icon: Award },
                                    { label: "Experience", value: `${selectedTrainer.experience ?? 0} years`, icon: Briefcase },
                                    { label: "Qualifications", value: selectedTrainer.qualifications || "Not provided", icon: Award }
                                ].map((item) => (
                                    <div key={item.label} className="rounded-xl bg-[#25272e] p-4">
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <item.icon size={15} />
                                            {item.label}
                                        </div>
                                        <p className="mt-2 text-sm font-medium text-white">
                                            {item.value}
                                        </p>
                                    </div>
                                ))}
                                <div className="sm:col-span-2">
                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${selectedTrainer.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                                        {selectedTrainer.isActive ? "ACTIVE" : "INACTIVE"}
                                    </span>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-5 p-6">
                                {error && (
                                    <div className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                                        {error}
                                    </div>
                                )}

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <label className="mb-2 block text-sm text-gray-300">
                                            Full Name *
                                        </label>
                                        <input
                                            required
                                            value={form.name}
                                            onChange={(event) => setForm({ ...form, name: event.target.value })}
                                            placeholder="Trainer name"
                                            className="w-full rounded-xl border border-white/10 bg-[#25272e] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm text-gray-300">
                                            Email *
                                        </label>
                                        <input
                                            required
                                            type="email"
                                            value={form.email}
                                            onChange={(event) => setForm({ ...form, email: event.target.value })}
                                            placeholder="trainer@example.com"
                                            className="w-full rounded-xl border border-white/10 bg-[#25272e] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm text-gray-300">
                                            Phone *
                                        </label>
                                        <input
                                            required
                                            pattern="0[0-9]{9}"
                                            value={form.phone}
                                            onChange={(event) => setForm({ ...form, phone: event.target.value })}
                                            placeholder="07XXXXXXXX"
                                            className="w-full rounded-xl border border-white/10 bg-[#25272e] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm text-gray-300">
                                            Specialization *
                                        </label>
                                        <input
                                            required
                                            value={form.specialization}
                                            onChange={(event) => setForm({ ...form, specialization: event.target.value })}
                                            placeholder="Strength Training"
                                            className="w-full rounded-xl border border-white/10 bg-[#25272e] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm text-gray-300">
                                            Experience (Years)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={form.experience ?? 0}
                                            onChange={(event) => setForm({ ...form, experience: Number(event.target.value) })}
                                            className="w-full rounded-xl border border-white/10 bg-[#25272e] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-2 block text-sm text-gray-300">
                                            Qualifications
                                        </label>
                                        <input
                                            value={form.qualifications ?? ""}
                                            onChange={(event) => setForm({ ...form, qualifications: event.target.value })}
                                            placeholder="Certified Personal Trainer"
                                            className="w-full rounded-xl border border-white/10 bg-[#25272e] px-4 py-3 text-sm text-white outline-none focus:border-orange-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 border-t border-white/10 pt-5">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        disabled={saving}
                                        className="rounded-xl bg-[#292c33] px-5 py-3 text-sm font-semibold text-gray-300 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50"
                                    >
                                        {saving
                                            ? "Saving..."
                                            : modal === "ADD"
                                                ? "Create Trainer"
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
};

export default TrainerManagementPage;
