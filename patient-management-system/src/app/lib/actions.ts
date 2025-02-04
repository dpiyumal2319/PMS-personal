'use server';

import {revalidatePath} from "next/cache";
import type {myError} from "@/app/lib/definitions";
import {prisma} from "./prisma";
import {verifySession} from "./sessions";
import bcrypt from "bcryptjs";

export async function changePassword({currentPassword, newPassword, confirmPassword}: {
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
}): Promise<myError> {
    try {
        if (newPassword !== confirmPassword) {
            return {success: false, message: 'Passwords do not match'};
        }

        const session = await verifySession();

        const user = await prisma.user.findUnique({
            where: {id: session.id}
        });

        if (!session || !user) {
            return {success: false, message: 'User not found'};
        }

        if (!bcrypt.compareSync(currentPassword, user.password)) {
            return {success: false, message: 'Current password is incorrect'};
        }

        const hashedPassword = bcrypt.hashSync(newPassword, 10);

        await prisma.user.update({
            where: {id: session.id},
            data: {password: hashedPassword}
        });

        return {success: true, message: 'Password changed successfully'};

    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while changing password'};
    }
}

// For admin changing nurse passwords
export async function changeUserPassword({
                                             nurseId,
                                             newPassword,
                                             confirmPassword
                                         }: {
    nurseId: number,  // Add nurse ID parameter
    newPassword: string,
    confirmPassword: string
}): Promise<myError> {

    try {
    if (newPassword !== confirmPassword) {
        return {success: false, message: 'Passwords do not match'};
    }

    const session = await verifySession();

    //  Verify admin role
    const admin = await prisma.user.findUnique({
        where: {id: session.id},
        select: {role: true}
    });

    if (admin?.role !== 'DOCTOR') {
        return {success: false, message: 'Unauthorized'};
    }

    // Verify target user exists and is a nurse
    const nurse = await prisma.user.findUnique({
        where: {id: nurseId},
        select: {role: true}
    });

    if (!nurse) {
        return {success: false, message: 'Nurse not found'};
    }

    if (nurse.role !== 'NURSE') {
        return {success: false, message: 'User is not a nurse'};
    }


    const hashedPassword = bcrypt.hashSync(newPassword, 10);

    await prisma.user.update({
        where: {id: nurseId},  // Use nurse ID here
        data: {password: hashedPassword}
    });

    return {success: true, message: 'Password changed successfully'}; }
    catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while changing password'}
    }
}

export async function addQueue(): Promise<myError> {
    try {
        const activeQueuesCount = await prisma.queue.count(
            {
                where: {
                    status: 'IN_PROGRESS'
                }
            }
        );

        if (activeQueuesCount !== 0) {
            return {success: false, message: 'There is already an active queue'}
        }

        await prisma.queue.create({
            data: {}
        })
        revalidatePath('/queues')
        return {success: true, message: 'Queue created successfully'}
    } catch (e) {
        console.error(e)
        return {success: false, message: 'An error occurred while creating queue'}
    }
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

const PAGE_SIZE = 10;

export async function getTotalPages(query = "", filter = "name") {
    const whereClause = query
      ? {
          [filter]: { contains: query },
        }
      : {};
  
    const totalPatients = await prisma.patient.count({ where: whereClause });
    return Math.ceil(totalPatients / PAGE_SIZE);
  }

export async function getFilteredPatients(query: string = "", page: number = 1, filter: string = "name") {

    console.log(`Filtering patients by ${filter} containing ${query}`);
    const whereCondition = query
        ? {
              [filter]: { contains: query },
          }
        : {};

    return prisma.patient.findMany({
        where: whereCondition,
        take: PAGE_SIZE,
        skip: (page - 1) * PAGE_SIZE,
        orderBy: {name: "asc"},
    });
}



export async function stopQueue(id: string | null): Promise<myError> {
    try {

        if (!id) {
            return {success: false, message: 'Queue ID not provided'}
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
            return {success: false, message: 'Queue not found'}
        }

        if (queue.status === 'COMPLETED') {
            return {success: false, message: 'Queue is already stopped'}
        }

        const UncompletedQueueEntries = await prisma.queueEntry.findMany({
            where: {
                queueId: numberId,
                status: {
                    not: 'COMPLETED'
                }
            }
        })

        if (UncompletedQueueEntries.length > 0) {
            return {success: false, message: 'Queue has uncompleted entries'}
        }

        await prisma.queue.update({
            where: {
                id: numberId
            },
            data: {
                status: 'COMPLETED'
            }
        })
        return {success: true, message: 'Queue stopped successfully'}
    } catch (e) {
        console.error(e)
        return {success: false, message: 'An error occurred while stopping queue'}
    }
}

export async function getQueueStatus(id: number) {
    return prisma.queue.findUnique({
        where: {
            id
        },
        select: {
            status: true
        }
    });
}

export async function getQueueStatusesCount(id: number) {
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

export async function removePatientFromQueue(queueId: number, token: number): Promise<myError> {
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
        return {success: true, message: 'Patient removed successfully'}
    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while removing patient from queue'}
    }
}

export async function searchPatients(query: string, searchBy: "name" | "telephone" | "NIC") {
    if (!query) return [];

    console.log(`Searching for patients with ${searchBy} containing ${query}`);

    return prisma.patient.findMany({
        where: {
            [searchBy]: {
                contains: query
            },
        },
        take: 10, // Limit results
    });
}

export async function addPatientToQueue(queueId: number, patientId: number): Promise<myError> {

    try {
        const queue = await prisma.queue.findUnique({
            where: {
                id: queueId
            }
        });

        if (!queue) {
            return {success: false, message: 'Queue not found'}
        }

        const patient = await prisma.patient.findUnique({
            where: {
                id: patientId
            }
        });

        if (!patient) {
            return {success: false, message: 'Patient not found'}
        }

        if (queue.status === 'COMPLETED') {
            return {success: false, message: 'Queue is stopped'}
        }

        const lastToken = await prisma.queueEntry.findFirst({
            where: {
                queueId
            },
            orderBy: {
                token: 'desc'
            }
        });

        const token = lastToken ? lastToken.token + 1 : 1;

        await prisma.queueEntry.create({
            data: {
                queueId,
                patientId,
                token
            }
        });

        revalidatePath(`/queue/${queueId}`);
        return {success: true, message: 'Patient added to queue successfully'}
    } catch (e) {
        console.error(e);
        return {success: false, message: 'An error occurred while adding patient to queue'}
    }
}

export async function getPatientDetails(id: number) {
    return prisma.patient.findUnique({
        where: {
            id
        }
    });
}

export async function getFilteredReports(pageNu: number, query: string, filter: string) {

    const whereClause = query
        ? {
            [filter]: {contains: query},
        }
        : {};


    return prisma.reportType.findMany({
        where: whereClause,
        take: PAGE_SIZE,
        skip: (pageNu - 1) * PAGE_SIZE,
        orderBy: {name: "asc"},
        include: {
            parameters: true
        }
    });
}

export async function getReportPages(query: string, filter: string) {
    const whereClause = query
        ? {
            [filter]: {contains: query},
        }
        : {};

    const totalReports = await prisma.reportType.count({where: whereClause});
    return Math.ceil(totalReports / PAGE_SIZE);
}