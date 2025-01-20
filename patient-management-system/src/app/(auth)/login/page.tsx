"use client";
import { useActionState } from "react";
import { login } from "@/app/lib/auth";

export default function LoginPage() {
    const [errorMessage, formAction, Pending] = useActionState(login, '');

    return (
        <form action={formAction} className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl mb-4">Select Your Role</h1>

            {/* Role Selection */}
            <select name="role" className="p-2 border mb-4">
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
            </select>

            {/* User ID Input */}
            <input
                name="id"
                placeholder="User ID"
                className="p-2 border mb-4"
                required
            />

            {/* Error Message Display */}
            {errorMessage && <p className="text-red-500 mb-4">{errorMessage}</p>}

            {/* Submit Button */}
            <button type="submit" className="bg-primary text-white p-2 rounded" disabled={Pending}>
                {Pending ? 'Loading...' : 'Login'}
            </button>
        </form>
    );
}
