"use client";
import React, {useState, useEffect} from "react";
import {PasswordInput} from "@/app/(dashboard)/_components/PasswordInput";
import {changeUserPassword} from "@/app/lib/actions";
import {getNurses} from "@/app/lib/auth";
import {handleServerAction} from "@/app/lib/utils";

export function UserPasswordForm() {
    const [nurses, setNurses] = useState<Array<{ id: number; name: string }>>([]);
    const [selectedNurseId, setSelectedNurseId] = useState<number | null>(null);
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNurses = async () => {
            try {
                const nursesData = await getNurses();
                setNurses(nursesData);
                if (nursesData.length > 0) {
                    setSelectedNurseId(nursesData[0].id);
                }
            } catch (error) {
                console.error(error);
                setError("Failed to load nurses");
            } finally {
                setLoading(false);
            }
        };

        fetchNurses().then(() => {
            console.log("Nurses fetched");
        });
    }, []);

    const validateForm = () => {
        if (!selectedNurseId) {
            setError("Please select a nurse");
            return false;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return false;
        }
        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!validateForm() || !selectedNurseId) return;

        const result = await handleServerAction(() => changeUserPassword({
            nurseId: selectedNurseId,
            newPassword: newPassword,
            confirmPassword: confirmPassword
        }), {
            loadingMessage: "Changing password...",
        });

        if (!result.success) {
            setError(result.message);
        }

        setNewPassword("");
        setConfirmPassword("");
    };

    if (loading) return <div>Loading nurses...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="max-w-md mx-auto p-6 rounded-xl shadow-lg bg-background-50">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Error/Success messages */}
                {error && (
                    <div className="p-3 rounded-md bg-red-100 text-red-700">{error}</div>
                )}

                {/* Nurse Selection Dropdown */}
                <div>
                    <label className="block text-sm font-medium text-primary-600 mb-2">
                        Select Nurse
                    </label>
                    <select
                        value={selectedNurseId || ""}
                        onChange={(e) => setSelectedNurseId(Number(e.target.value))}
                        className="w-full p-2 rounded-md border border-background-300 bg-background-100"
                    >
                        {nurses.map((nurse) => (
                            <option key={nurse.id} value={nurse.id}>
                                {nurse.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Password Inputs */}
                <div className="space-y-4">
                    <PasswordInput
                        label="New Password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        showPassword={showNew}
                        toggleShow={() => setShowNew(!showNew)}
                    />

                    <PasswordInput
                        label="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        showPassword={showConfirm}
                        toggleShow={() => setShowConfirm(!showConfirm)}
                    />
                </div>

                <button
                    type="submit"
                    className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-full transition-colors"
                >
                    Change Password
                </button>
            </form>
        </div>
    );
}
