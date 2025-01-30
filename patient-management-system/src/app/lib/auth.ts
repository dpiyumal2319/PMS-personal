'use server';

import {redirect} from "next/navigation";
import {createSession, deleteSession} from "@/app/lib/sessions";
import {prisma} from "@/app/lib/prisma";
import bcrypt from 'bcryptjs';

export async function login(message: string, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    console.log(formData);

    if (!email || !password ) {
        return "Please fill in all fields";
    }

    const user = await prisma.user.findUnique({
        where: {
            email
        }
    });

    if (!user) {
        return "Invalid credentials";
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
        return "Invalid credentials";
    }

    console.log(user);

    await createSession({role: user.role, id:user.id, email: user.email, name: user.name});


    // await createSession({ role, id: parseInt(id) });
    redirect("/dashboard"); // Redirect only if valid
}

export async function logout() {
    await deleteSession();
    redirect("/");
}