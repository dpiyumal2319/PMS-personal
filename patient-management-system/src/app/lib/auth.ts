'use server';

import {redirect} from "next/navigation";
import {createSession, deleteSession} from "@/app/lib/sessions";

// export async function login(message: string, formData: FormData) {
//     const email = formData.get("email") as string;
//     const password = formData.get("password") as string;
//
//
//
//     // await createSession({ role, id: parseInt(id) });
//     redirect("/dashboard"); // Redirect only if valid
// }

export async function logout() {
    await deleteSession();
    redirect("/");
}