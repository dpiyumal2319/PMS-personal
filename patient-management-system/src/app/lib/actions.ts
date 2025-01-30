'use server';

import { prisma } from "./prisma";
import { verifySession } from "./sessions";
import bcrypt from "bcryptjs";

export async function changePassword({ currentPassword, newPassword, confirmPassword }: { currentPassword: string, newPassword: string, confirmPassword: string }) {

    const session = await verifySession();

    const user = await prisma.user.findUnique({
        where: { id: session.id }
    });

    if (!session) {
        throw new Error("Unauthorized");
    }

    if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
    }

    if (!bcrypt.compareSync(currentPassword, user.password)) {
        throw new Error("Current password is incorrect");
    }

    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.user.update({
        where: { id: session.id },
        data: { password: hashedPassword }
    });

    return { success: true };
}

// changePassword({ currentPassword, newPassword, confirmPassword }),