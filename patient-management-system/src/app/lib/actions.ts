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

    revalidatePath('/queues')
    return {status: 'success', message: 'Queue added successfully'}
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
                select: {entries: true}
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

export async function stopQueue(id: string | null) {

    if (!id) {
        throw new Error('Queue ID is required')
    }

    const numberId = parseInt(id)

    const queue = await prisma.queue.findUnique(
        {
            where: {
                id: numberId
            }
        }
    )

    if (!queue) {
        throw new Error('Queue not found')
    }

    if (queue.status === 'COMPLETED') {
        throw new Error('Queue already stopped')
    }

    await prisma.queue.update({
        where: {
            id: numberId
        },
        data: {
            status: 'COMPLETED'
        }
    })

    return {status: 'success', message: 'queue stopped successfully'}
}

export async function getQueueStatusesCount(id: number) {
    console.log('Getting queue statuses count for queue', id);

    try {

        const result = await prisma.queueEntry.groupBy({
            by: ['status'],
            where: {
                queueId: id
            },
            _count: {
                status: true
            }
        })

        const statuses = {
            PENDING: 0,
            PRESCRIBED: 0,
            COMPLETED: 0
        }

        result.forEach((item) => {
            statuses[item.status] = item._count.status
        })

        return statuses;
    } catch (e) {
        console.error(e);
        throw new Error('An error occurred while getting queue statuses count')
    }
}

export async function queuePatients(id: number) {
    try {
        return await prisma.queueEntry.findMany({
            where: {
                queueId: id
            },
            include: {
                patient: true,
                queue: true
            },
            orderBy: {
                token: 'asc'
            }
        });
    } catch (e) {
        console.error(e);
        throw new Error('An error occurred while getting queue patients')
    }
}

export async function removePatientFromQueue(queueId: number, token: number): Promise<{
    status: string;
    message: string
}> {
    try {
        await prisma.queueEntry.delete({
            where: {
                queueId_token: {
                    queueId,
                    token
                }
            }
        });

        revalidatePath(`/queue/${queueId}`);
        return {status: 'success', message: 'Patient removed successfully'}
    } catch (e) {
        console.error(e);
        throw new Error("An error occurred while removing patient from queue")
    }
}

