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

//get user details from session

export async function getUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        role: true,
        name: true,
        email: true,
        mobile: true,
      },
    });

    return users.map(user => ({
      ...user,
      role: user.role.toLowerCase() as "doctor" | "nurse",
      telephone: user.mobile,
      profilePic: getDefaultAvatar(user.role)
    }));
  } catch (error) {
    console.error("Failed to fetch users:", error);
    throw new Error("Failed to fetch users");
  }
}

// Helper function for default avatars
  function getDefaultAvatar(role: "DOCTOR" | "NURSE") {
    return role === "DOCTOR" ? "/doctor-avatar.jpg" : "/nurse-avatar.jpg";
  }
//To get Nurse Details
export async function getNurses() {
  try {
    const nurses = await prisma.user.findMany({
      where: {
        role: 'NURSE' 
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    return nurses;
  } catch (error) {
    console.error("Failed to fetch nurses:", error);
    throw new Error("Failed to fetch nurses");
  }
}