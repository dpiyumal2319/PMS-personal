'use server';

import { prisma } from "@/app/lib/prisma";
import {revalidatePath} from "next/cache";

export async function addQueue() {
    const activeQueuesCount = await prisma.queue.count(
        {
            where: {
                status: 'IN_PROGRESS'
            }
        }
    )

    if (activeQueuesCount !== 0) {
        return { status: 'error', message: 'There is already an active queue' }
    }

    await prisma.queue.create({
        data: {
        }
    })

    revalidatePath('/queue');
    return { status: 'success', message: 'Queue added successfully' }
}