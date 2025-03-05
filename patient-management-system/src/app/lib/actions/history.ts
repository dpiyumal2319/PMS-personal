'use server';

import {Prisma} from "@prisma/client";
import type {PatientHistoryType} from "@prisma/client";
import {prisma} from "@/app/lib/prisma";
import {verifySession} from "@/app/lib/sessions";
import {redirect} from "next/navigation";
import {myError} from "@/app/lib/definitions";
import {revalidatePath} from "next/cache";

export async function getHistory({
                                     filter = "all",
                                     query = "",
                                     patientID,
                                     limit
                                 }: {
    filter?: string;
    query?: string;
    patientID: number;
    limit?: number;
}) {
    const session = await verifySession();

    if (session.role !== 'DOCTOR') redirect('/unauthorized');
    if (!patientID) throw new Error('No patient ID');

    const baseSearchCriteria: Prisma.PatientHistoryWhereInput = {
        OR: [
            {name: {contains: query, mode: "insensitive"}},
            {description: {contains: query, mode: "insensitive"}}
        ]
    };

    let typeFilter: object;

    switch (filter) {
        case 'medical':
            typeFilter = {type: 'MEDICAL'};
            break;
        case 'social':
            typeFilter = {type: 'SOCIAL'};
            break;
        case 'family':
            typeFilter = {type: 'FAMILY'};
            break;
        case 'allergy':
            typeFilter = {type: 'ALLERGY'};
            break;
        case 'all':
        default:
            typeFilter = {};
            break;
    }

    const findManyOptions: Prisma.PatientHistoryFindManyArgs = {
        where: {
            patientId: patientID,
            ...typeFilter,
            ...baseSearchCriteria
        },
        orderBy: {
            time: 'desc'
        }
    };

    // Only add limit if it's explicitly passed
    if (limit !== undefined) {
        findManyOptions.take = limit;
    }

    return await prisma.patientHistory.findMany(findManyOptions);
}


export async function addHistory({
                                     patientID,
                                     name,
                                     description,
                                     type,
                                     time
                                 }: {
    patientID: number;
    name: string;
    description?: string;
    type: PatientHistoryType;
    time?: Date;
}): Promise<myError> {
    const session = await verifySession();
    if (session.role !== 'DOCTOR') {
        return {success: false, message: 'Unauthorized'};
    }

    try {
        await prisma.patientHistory.create({
            data: {
                patientId: patientID,
                name,
                description,
                type,
                time: time || new Date() // Use provided time or default to current time
            }
        });

        revalidatePath(`/patients/${patientID}/history`);
        revalidatePath(`/patients/${patientID}/prescriptions/add`);
        return {success: true, message: 'History added successfully'};
    } catch (error) {
        console.log(error);
        return {success: false, message: 'Error adding history'};
    }
}

export async function deleteHistory({id}: { id: number }) {
    const session = await verifySession();
    if (session.role !== 'DOCTOR') {
        return {success: false, message: 'Unauthorized'};
    }

    try {
        await prisma.patientHistory.delete({
            where: {
                id
            }
        });

        revalidatePath(`/patients/[id]/history`);
        revalidatePath(`/patients/[id]/prescriptions/add`);
        return {success: true, message: 'History deleted successfully'};
    } catch (error) {
        console.log(error);
        return {success: false, message: 'Error deleting history'};
    }
}

export async function getHistoryCount({patientID}: { patientID: number }) {
    return await prisma.patientHistory.count({
        where: {
            patientId: patientID
        }
    });
}