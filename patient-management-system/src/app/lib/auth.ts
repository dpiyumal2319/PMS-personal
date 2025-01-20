'use server';

import {redirect} from "next/navigation";
import {createSession, deleteSession} from "@/app/lib/sessions";

export async function login(message: string, formData: FormData) {
    const role = formData.get("role") as string;
    const id = formData.get("id") as string;

    if (!role || !id) {
        return "Please select a role and enter a valid ID";
    }

    // Check if id is a number
    if (isNaN(parseInt(id))) {
        return "Please enter a valid ID";
    }

    await createSession({ role, id: parseInt(id) });
    redirect("/dashboard"); // Redirect only if valid
}

export async function logout() {
    await deleteSession();
    redirect("/");
}