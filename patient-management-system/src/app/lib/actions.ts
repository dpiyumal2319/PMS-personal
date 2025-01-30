'use server';

import { prisma } from "./prisma";

export async function changePassword(formData: FormData) {
    console.log(`formData`, formData);
}