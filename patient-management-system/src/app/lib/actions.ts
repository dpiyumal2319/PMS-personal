'use server';

import {prisma} from "@/app/lib/prisma";
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
        throw new Error('There is already an active queue')
    }

    await prisma.queue.create({
        data: {}
    })

    revalidatePath('/queue');
    revalidatePath('/queue/_components/Pagination')
    return { status: 'success', message: 'Queue added successfully' }
}

export async function getQueues(offset: number, limit: number) {

    return prisma.queue.findMany({
        skip: offset,
        take: limit,
        orderBy: {
            id: 'desc'
        },
        include: {
            _count: {
                select: { entries: true }
            }
        }
    });
}

export async function getQueue(queueId: number) {
    return prisma.queue.findUnique({
        where: {
            id: queueId
        }
    });
}

export async function getTotalQueueCount() {
    return prisma.queue.count();
}

export async function stopQueue(id: number) {
    const queue = await prisma.queue.findUnique(
        {
            where: {
                id : id
            }
        }
    )


}