"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [role, setRole] = useState("doctor");
    const router = useRouter();

    async function handleLogin() {
        await fetch("/api/auth/login", {
            method: "POST",
            body: JSON.stringify({ role }),
        });
        router.push("/dashboard"); // Redirect to home/dashboard
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-2xl mb-4">Select Your Role</h1>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="p-2 border mb-4">
                <option value="doctor">Doctor</option>
                <option value="nurse">Nurse</option>
            </select>
            <button onClick={handleLogin} className="bg-primary text-white p-2 rounded">
                Login
            </button>
        </div>
    );
}
